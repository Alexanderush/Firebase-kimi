import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { id } = await params

    // Verify ownership of the sub-account
    const subAccount = await prisma.subAccount.findUnique({
        where: { id },
    })

    if (!subAccount || subAccount.userId !== session.user.id) {
        return new NextResponse("Forbidden", { status: 403 })
    }

    const connections = await prisma.toolConnection.findMany({
        where: { subAccountId: id },
        include: { tool: true },
    })

    return NextResponse.json(connections)
}
