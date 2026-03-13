import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { KimiEngine, GoogleToolExecutor } from "@kimi/engine"

/**
 * Web Widget Chat API
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ agentId: string }> }
) {
    const { agentId } = await params
    const { message, externalId, contactName } = await req.json()

    if (!message) return new NextResponse("Missing message", { status: 400 })

    try {
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            include: { subAccount: true }
        })

        if (!agent) return new NextResponse("Agent not found", { status: 404 })

        // Conversation logic (Cookie-based or storage-based externalId)
        let conversation = await prisma.conversation.findFirst({
            where: { agentId, externalId, channelType: "WIDGET" },
            include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } }
        })

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: { agentId, externalId, channelType: "WIDGET" },
                include: { messages: true }
            })
        }

        await prisma.message.create({
            data: { conversationId: conversation.id, role: "USER", content: message }
        })

        const engine = new KimiEngine()
        const history = conversation.messages.map(m => ({ role: m.role.toLowerCase() as any, content: m.content }))

        // Parse tools
        const canvasState = agent.canvasState as any
        const activeToolNames: string[] = []
        if (canvasState?.nodes) {
            const agentNode = canvasState.nodes.find((n: any) => n.id === "agent-1" || n.type === "agent")
            if (agentNode) {
                const connectedEdges = canvasState.edges.filter((e: any) => e.source === agentNode.id)
                for (const edge of connectedEdges) {
                    const targetNode = canvasState.nodes.find((n: any) => n.id === edge.target)
                    if (targetNode?.data.type) activeToolNames.push(targetNode.data.type)
                }
            }
        }

        const aiMessage = await engine.execute(
            [{ role: "system", content: agent.systemPrompt }, ...history, { role: "user", content: message }],
            activeToolNames,
            async (name, args) => {
                // Same tool logic as other channels
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
        }

        return NextResponse.json({
            content: aiMessage.content,
            conversationId: conversation.id
        })

    } catch (error: any) {
        console.error("Widget API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
