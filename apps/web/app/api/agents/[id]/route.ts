import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { id } = await params
    const { name, description, systemPrompt, canvasState } = await req.json()

    // Verify ownership via SubAccount
    const agent = await prisma.agent.findUnique({
        where: { id },
        include: { subAccount: true },
    })

    if (!agent || agent.subAccount.userId !== session.user.id) {
        return new NextResponse("Forbidden", { status: 403 })
    }

    const updatedAgent = await prisma.agent.update({
        where: { id },
        data: {
            name,
            description,
            systemPrompt,
            canvasState: canvasState || undefined,
        },
    })

    return NextResponse.json(updatedAgent)
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { id } = await params

    const agent = await prisma.agent.findUnique({
        where: { id },
        include: { subAccount: true },
    })

    if (!agent || agent.subAccount.userId !== session.user.id) {
        return new NextResponse("Forbidden", { status: 403 })
    }

    return NextResponse.json(agent)
}
