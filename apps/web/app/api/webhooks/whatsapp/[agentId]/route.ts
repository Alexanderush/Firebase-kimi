import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { KimiEngine, GoogleToolExecutor, YahooToolExecutor } from "@kimi/engine"
import { sendWhatsAppMessage } from "@/lib/channels/whatsapp"

/**
 * Meta Webhook Verification (GET)
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

    if (mode && token) {
        if (mode === "subscribe") {
            const channel = await prisma.channel.findUnique({
                where: { agentId_type: { agentId, type: "WHATSAPP" } }
            })

            const config = channel?.config as any
            const verifyToken = config?.verifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

            if (token === verifyToken) {
                return new Response(challenge, { status: 200 })
            }
        }
    }

    return new NextResponse("Forbidden", { status: 403 })
}

/**
 * Receiving WhatsApp Messages (POST)
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ agentId: string }> }
) {
    const { agentId } = await params
    const body = await req.json()

    // 1. Validate WhatsApp Payload
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const message = value?.messages?.[0]

    if (!message || message.type !== "text") {
        return NextResponse.json({ status: "ignored" })
    }

    const from = message.from // User's phone number
    const text = message.text.body
    const contactName = value?.contacts?.[0]?.profile?.name || "User"

    try {
        // 2. Fetch Agent and Channel Config
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            include: {
                subAccount: true,
                channels: { where: { type: "WHATSAPP" } }
            }
        })

        if (!agent || agent.channels.length === 0) {
            console.error("Agent or WhatsApp channel not found for agentId:", agentId)
            return NextResponse.json({ error: "Configuration missing" }, { status: 404 })
        }

        const channel = agent.channels[0]
        const config = channel.config as any

        if (!config.accessToken || !config.phoneNumberId) {
            console.error("WhatsApp credentials missing in config")
            return NextResponse.json({ error: "Credentials missing" }, { status: 500 })
        }

        // 3. Find or Create Conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                agentId,
                externalId: from,
                channelType: "WHATSAPP"
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                    take: 20 // Last 20 messages for context
                }
            }
        })

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    agentId,
                    externalId: from,
                    channelType: "WHATSAPP",
                },
                include: { messages: true }
            })
        }

        // 4. Save User Message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: "USER",
                content: text
            }
        })

        // 5. Initialize KimiEngine and Tools
        const engine = new KimiEngine()

        // Parse active tools from canvas
        const canvasState = agent.canvasState as any
        const activeToolNames: string[] = []
        if (canvasState?.nodes && canvasState?.edges) {
            const agentNode = canvasState.nodes.find((n: any) => n.id === "agent-1" || n.type === "agent")
            if (agentNode) {
                const connectedEdges = canvasState.edges.filter((e: any) => e.source === agentNode.id)
                for (const edge of connectedEdges) {
                    const targetNode = canvasState.nodes.find((n: any) => n.id === edge.target)
                    if (targetNode?.type === "tool" && targetNode.data.type) {
                        activeToolNames.push(targetNode.data.type)
                    }
                }
            }
        }

        // 6. Execute AI
        const history = conversation.messages.map(m => ({
            role: m.role.toLowerCase() as any,
            content: m.content
        }))

        const aiMessage = await engine.execute(
            [
                { role: "system", content: agent.systemPrompt },
                ...history,
                { role: "user", content: text }
            ],
            activeToolNames,
            async (name, args) => {
                // Tool execution logic (reused from Chat API)
                const toolNameMap: Record<string, string> = {
                    gmail_send_email: "GMAIL",
                    google_calendar_create_event: "GOOGLE_CALENDAR",
                    google_sheets_append_row: "GOOGLE_SHEETS",
                    yahoo_mail_send_email: "YAHOO_MAIL"
                }
                const toolName = toolNameMap[name]
                if (!toolName) return { error: `Tool not found` }

                const tool = await prisma.tool.findFirst({ where: { name: toolName } })
                if (!tool) return { error: "Tool DB entry missing" }

                const conn = await prisma.toolConnection.findUnique({
                    where: { subAccountId_toolId: { subAccountId: agent.subAccountId, toolId: tool.id } }
                })
                if (!conn?.accessToken) return { error: "Tool not connected" }

                if (toolName.startsWith("GOOGLE") || toolName === "GMAIL") {
                    const google = new GoogleToolExecutor(conn.accessToken)
                    if (name === "gmail_send_email") return await google.sendEmail(args.to, args.subject, args.body)
                    if (name === "google_calendar_create_event") return await google.createCalendarEvent(args.summary, args.startTime, args.endTime, args.description)
                    if (name === "google_sheets_append_row") return await google.appendSheetRow(args.spreadsheetId || '', args.range, args.values)
                }
                return { error: "Provider not implemented" }
            }
        )

        // 7. Save Assistant Message
        if (aiMessage.content) {
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    role: "ASSISTANT",
                    content: aiMessage.content
                }
            })

            // 8. Send Reply via WhatsApp
            await sendWhatsAppMessage(
                config.phoneNumberId,
                from,
                aiMessage.content,
                config.accessToken
            )
        }

        return NextResponse.json({ status: "success" })

    } catch (error: any) {
        console.error("WhatsApp Webhook Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
