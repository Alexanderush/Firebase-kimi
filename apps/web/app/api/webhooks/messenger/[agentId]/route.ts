import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { KimiEngine, GoogleToolExecutor, YahooToolExecutor } from "@kimi/engine"
import { sendMessengerMessage } from "@/lib/channels/messenger"

/**
 * Messenger Webhook Verification (GET)
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ agentId: string }> }
) {
    const { agentId } = await params
    const { searchParams } = new URL(req.url)

    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    if (mode === "subscribe" && token) {
        const channel = await prisma.channel.findUnique({
            where: { agentId_type: { agentId, type: "MESSENGER" } }
        })

        const config = channel?.config as any
        const verifyToken = config?.verifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

        if (token === verifyToken) {
            return new Response(challenge, { status: 200 })
        }
    }

    return new NextResponse("Forbidden", { status: 403 })
}

/**
 * Receiving Messenger Messages (POST)
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ agentId: string }> }
) {
    const { agentId } = await params
    const body = await req.json()

    if (body.object !== "page") return NextResponse.json({ status: "ignored" })

    const entry = body.entry?.[0]
    const messaging = entry?.messaging?.[0]
    const senderId = messaging?.sender?.id
    const message = messaging?.message

    if (!senderId || !message || !message.text) {
        return NextResponse.json({ status: "ignored" })
    }

    try {
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            include: {
                subAccount: true,
                channels: { where: { type: "MESSENGER" } }
            }
        })

        if (!agent || agent.channels.length === 0) return NextResponse.json({ error: "Agent or channel not found" }, { status: 404 })

        const channel = agent.channels[0]
        const config = channel.config as any

        // Conversation logic
        let conversation = await prisma.conversation.findFirst({
            where: { agentId, externalId: senderId, channelType: "MESSENGER" },
            include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } }
        })

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: { agentId, externalId: senderId, channelType: "MESSENGER" },
                include: { messages: true }
            })
        }

        await prisma.message.create({
            data: { conversationId: conversation.id, role: "USER", content: message.text }
        })

        const engine = new KimiEngine()
        const history = conversation.messages.map(m => ({ role: m.role.toLowerCase() as any, content: m.content }))

        // Parse tools (same as WhatsApp)
        const canvasState = agent.canvasState as any
        const activeToolNames: string[] = []
        if (canvasState?.nodes) {
            const agentNode = canvasState.nodes.find((n: any) => n.type === "agent")
            if (agentNode) {
                const connectedEdges = canvasState.edges.filter((e: any) => e.source === agentNode.id)
                for (const edge of connectedEdges) {
                    const targetNode = canvasState.nodes.find((n: any) => n.id === edge.target)
                    if (targetNode?.data.type) activeToolNames.push(targetNode.data.type)
                }
            }
        }

        const aiMessage = await engine.execute(
            [{ role: "system", content: agent.systemPrompt }, ...history, { role: "user", content: message.text }],
            activeToolNames,
            async (name, args) => {
                const toolNameMap: Record<string, string> = {
                    gmail_send_email: "GMAIL",
                    google_calendar_create_event: "GOOGLE_CALENDAR",
                    google_sheets_append_row: "GOOGLE_SHEETS"
                }
                const toolName = toolNameMap[name]
                if (!toolName) return { error: "Tool not found" }
                const tool = await prisma.tool.findFirst({ where: { name: toolName } })
                const conn = await prisma.toolConnection.findUnique({
                    where: { subAccountId_toolId: { subAccountId: agent.subAccountId, toolId: tool!.id } }
                })
                if (!conn?.accessToken) return { error: "Not connected" }
                const google = new GoogleToolExecutor(conn.accessToken)
                if (name === "gmail_send_email") return await google.sendEmail(args.to, args.subject, args.body)
                if (name === "google_calendar_create_event") return await google.createCalendarEvent(args.summary, args.startTime, args.endTime, args.description)
                if (name === "google_sheets_append_row") return await google.appendSheetRow(args.spreadsheetId || '', args.range, args.values)
                return { error: "Method not implemented" }
            }
        )

        if (aiMessage.content) {
            await prisma.message.create({
                data: { conversationId: conversation.id, role: "ASSISTANT", content: aiMessage.content }
            })
            await sendMessengerMessage(config.pageId, senderId, aiMessage.content!, config.accessToken)
        }

        return NextResponse.json({ status: "success" })
    } catch (error: any) {
        console.error("Messenger Webhook Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
