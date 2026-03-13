import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const subAccounts = await prisma.subAccount.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(subAccounts)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { name, description, clientEmail } = await req.json()

    // Check limit (Max 50)
    const count = await prisma.subAccount.count({
        where: { userId: session.user.id },
    })

    if (count >= 50) {
        return NextResponse.json(
            { error: "Maximum limit of 50 sub-accounts reached" },
            { status: 400 }
        )
    }

    const subAccount = await prisma.subAccount.create({
        data: {
            name,
            description,
            clientEmail,
            userId: session.user.id,
        },
    })

    return NextResponse.json(subAccount)
}
