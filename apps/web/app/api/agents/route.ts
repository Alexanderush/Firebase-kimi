import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const subAccountId = searchParams.get("subAccountId")

    if (!subAccountId) {
        return new NextResponse("SubAccount ID is required", { status: 400 })
    }

    // Verify ownership
    const subAccount = await prisma.subAccount.findFirst({
        where: { id: subAccountId, userId: session.user.id },
    })

    if (!subAccount) {
        return new NextResponse("Forbidden", { status: 403 })
    }

    const agents = await prisma.agent.findMany({
        where: { subAccountId },
        orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(agents)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { name, description, systemPrompt, subAccountId } = await req.json()

    // Verify ownership
    const subAccount = await prisma.subAccount.findFirst({
        where: { id: subAccountId, userId: session.user.id },
    })

    if (!subAccount) {
        return new NextResponse("Forbidden", { status: 403 })
    }

    const agent = await prisma.agent.create({
        data: {
            name,
            description,
            systemPrompt: systemPrompt || "You are a helpful AI assistant.",
            subAccountId,
        },
    })

    return NextResponse.json(agent)
}
