import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const tools = await prisma.tool.findMany({
        orderBy: { displayName: "asc" },
    })
    return NextResponse.json(tools)
}
