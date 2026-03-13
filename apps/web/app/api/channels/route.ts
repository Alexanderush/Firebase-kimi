import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * Handle listing and creating deployment channels
 */
export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const subAccountId = searchParams.get("subAccountId")

    if (!subAccountId) {
        return new NextResponse("Missing subAccountId", { status: 400 })
    }

    const channels = await prisma.channel.findMany({
        where: {
            agent: {
                subAccountId: subAccountId
            }
        },
        include: {
            agent: {
                select: {
                    name: true
                }
            }
        }
    })

    return NextResponse.json(channels)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const { agentId, type, config } = await req.json()

        // Verify agent belongs to user
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            include: { subAccount: true }
        })

        if (!agent || agent.subAccount.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const channel = await prisma.channel.upsert({
            where: {
                agentId_type: {
                    agentId,
                    type
                }
            },
            update: {
                config
            },
            create: {
                agentId,
                type,
                config
            }
        })

        return NextResponse.json(channel)
    } catch (error: any) {
        console.error("Channel API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
