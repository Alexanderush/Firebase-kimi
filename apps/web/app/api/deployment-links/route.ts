import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { agentId } = body

        if (!agentId) {
            return NextResponse.json({ error: "agentId is required" }, { status: 400 })
        }

        // Verify agent exists
        const agent = await prisma.agent.findUnique({
            where: { id: agentId },
        })

        if (!agent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 })
        }

        // Generate a random, cryptographically secure token using native crypto 
        // fallback to Math.random for environments where crypto is tricky, though node 20 supports it.
        const array = new Uint32Array(4);
        crypto.getRandomValues(array);
        const token = Array.from(array, dec => ('0' + dec.toString(16)).substr(-8)).join('');

        // Valid for 48 hours
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 48)

        const link = await prisma.deploymentLink.create({
            data: {
                token,
                agentId,
                expiresAt,
            }
        })

        if (typeof window !== "undefined") {
            return NextResponse.json({ url: `${window.location.origin}/deploy/${token}` })
        } else {
            // Relative path fallback for API
            return NextResponse.json({ url: `/deploy/${token}` })
        }

    } catch (error: any) {
        console.error("Failed to generate deployment link:", error)
        return NextResponse.json({ error: error.message || "Failed to generate link" }, { status: 500 })
    }
}
