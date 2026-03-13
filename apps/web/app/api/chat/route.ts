import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { KimiEngine, GoogleToolExecutor, YahooToolExecutor } from "@kimi/engine"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const { messages, agentId } = await req.json()

        // 1. Fetch agent and its canvas state to know which tools are connected
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            include: { subAccount: true },
        })

        if (!agent || agent.subAccount.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // 2. Parse canvas state to find active tools
        const canvasState = agent.canvasState as any
        const activeToolNames: string[] = []

        if (canvasState && canvasState.nodes && canvasState.edges) {
            // Find the agent node
            const agentNode = canvasState.nodes.find((n: any) => n.id === "agent-1" || n.type === "agent")
            if (agentNode) {
                // Find edges where this agent is the source
                const connectedEdges = canvasState.edges.filter((e: any) => e.source === agentNode.id)
                for (const edge of connectedEdges) {
                    const targetNode = canvasState.nodes.find((n: any) => n.id === edge.target)
                    if (targetNode && targetNode.type === "tool" && targetNode.data.type) {
                        activeToolNames.push(targetNode.data.type)
                    }
                }
            }
        }

        console.log(`Active tools for agent ${agent.name}:`, activeToolNames)

        // 3. Initialize engine
        const engine = new KimiEngine()

        // 4. Execute with tools
        const aiMessage = await engine.execute(
            [
                { role: "system", content: agent.systemPrompt || "You are a helpful assistant." },
                ...messages
            ],
            activeToolNames,
            async (name, args) => {
                // Map engine function names to DB tool names
                const toolNameMap: Record<string, string> = {
                    gmail_send_email: "GMAIL",
                    google_calendar_create_event: "GOOGLE_CALENDAR",
                    google_sheets_append_row: "GOOGLE_SHEETS",
                    yahoo_mail_send_email: "YAHOO_MAIL"
                }

                const toolName = toolNameMap[name]
                if (!toolName) return { error: `Tool mapping not found for ${name}` }

                // Fetch tokens for this sub-account and tool
                const tool = await prisma.tool.findFirst({ where: { name: toolName } })
                if (!tool) return { error: "Tool definition not found in database" }

                const connection = await prisma.toolConnection.findUnique({
                    where: {
                        subAccountId_toolId: {
                            subAccountId: agent.subAccountId,
                            toolId: tool.id,
                        }
                    }
                })

                if (!connection || !connection.accessToken) {
                    return { error: `${name} requires a connection. Please click "Connect API" in the Agent Builder.` }
                }

                try {
                    // Execute based on provider
                    if (toolName.startsWith("GOOGLE") || toolName === "GMAIL") {
                        const google = new GoogleToolExecutor(connection.accessToken)
                        if (name === "gmail_send_email") return await google.sendEmail(args.to, args.subject, args.body)
                        if (name === "google_calendar_create_event") return await google.createCalendarEvent(args.summary, args.startTime, args.endTime, args.description)
                        if (name === "google_sheets_append_row") return await google.appendSheetRow(args.spreadsheetId || '', args.range, args.values)
                    }

                    if (toolName === "YAHOO_MAIL") {
                        const yahoo = new YahooToolExecutor(connection.accessToken)
                        if (name === "yahoo_mail_send_email") return await yahoo.sendEmail(args.to, args.subject, args.body)
                    }

                    return { error: "Tool provider logic not implemented" }
                } catch (err: any) {
                    console.error(`Tool Execution Error [${name}]:`, err)
                    return { error: err.message || "Execution failed" }
                }
            }
        )

        return NextResponse.json(aiMessage)

    } catch (error: any) {
        console.error("Chat API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
