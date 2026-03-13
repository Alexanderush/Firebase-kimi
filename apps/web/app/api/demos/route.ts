import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * Manage public demo links (GET, POST)
 */
export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const subAccountId = searchParams.get("subAccountId")

    const demos = await prisma.demoLink.findMany({
        where: {
            agent: {
                subAccountId: subAccountId || undefined
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

    return NextResponse.json(demos)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const { agentId, slug, title, description } = await req.json()

        // 1. Verify agent ownership
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
            include: { subAccount: true }
        })

        if (!agent || agent.subAccount.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // 2. Upsert Demo Link
        const demo = await prisma.demoLink.upsert({
            where: {
                slug: slug || `${agent.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 5)}`
            },
            update: {
                title,
                description,
                updatedAt: new Date()
            },
            create: {
                agentId,
                slug: slug || `${agent.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 5)}`,
                title,
                description
            }
        })

        return NextResponse.json(demo)
    } catch (error: any) {
        console.error("Demo API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
