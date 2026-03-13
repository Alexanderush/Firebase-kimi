import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * Fetch stats for the dashboard
 */
export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const subAccountId = searchParams.get("subAccountId")

    if (!subAccountId) {
        return new NextResponse("Missing subAccountId", { status: 400 })
    }

    try {
        const [
            agentCount,
            conversationCount,
            messageCount,
            channelCount,
            recentMessages
        ] = await Promise.all([
            prisma.agent.count({ where: { subAccountId } }),
            prisma.conversation.count({ where: { agentId: { in: (await prisma.agent.findMany({ where: { subAccountId }, select: { id: true } })).map(a => a.id) } } }),
            prisma.message.count({ where: { conversation: { agent: { subAccountId } } } }),
            prisma.channel.count({ where: { agent: { subAccountId } } }),
            prisma.message.findMany({
                where: { conversation: { agent: { subAccountId } } },
                orderBy: { createdAt: "desc" },
                take: 5,
                include: {
                    conversation: {
                        include: {
                            agent: { select: { name: true } }
                        }
                    }
                }
            })
        ])

        return NextResponse.json({
            agents: agentCount,
            conversations: conversationCount,
            messages: messageCount,
            channels: channelCount,
            recentActivity: recentMessages.map(m => ({
                id: m.id,
                agentName: m.conversation.agent.name,
                role: m.role,
                content: m.content.substring(0, 50) + (m.content.length > 50 ? "..." : ""),
                createdAt: m.createdAt
            }))
        })
    } catch (error: any) {
        console.error("Analytics Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
