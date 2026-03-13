import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Get deployment link details for client page
export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params

        const link = await prisma.deploymentLink.findUnique({
            where: { token },
            include: {
                agent: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        subAccount: {
                            select: {
                                name: true,
                                user: {
                                    select: {
                                        agencyName: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!link) {
            return NextResponse.json({ error: "Invalid link" }, { status: 404 })
        }

        if (new Date() > link.expiresAt) {
            return NextResponse.json({ error: "Link expired" }, { status: 410 })
        }

        return NextResponse.json(link)
    } catch (error: any) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// Client saves their channel config using the token
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const body = await req.json()
        const { type, config } = body // e.g., "WHATSAPP", { phoneNumberId: "...", accessToken: "..." }

        if (!type || !config) {
            return NextResponse.json({ error: "Missing type or config payload" }, { status: 400 })
        }

        const link = await prisma.deploymentLink.findUnique({
            where: { token }
        })

        if (!link) {
            return NextResponse.json({ error: "Invalid link" }, { status: 404 })
        }

        if (new Date() > link.expiresAt) {
            return NextResponse.json({ error: "Link expired" }, { status: 410 })
        }

        // Upsert the channel: If it exists for this agent and type, update config, else create it.
        const channel = await prisma.channel.upsert({
            where: {
                agentId_type: {
                    agentId: link.agentId,
                    type: type as any
                }
            },
            update: {
                config,
            },
            create: {
                agentId: link.agentId,
                type: type as any,
                config,
            }
        })

        return NextResponse.json({ success: true, channel })

    } catch (error: any) {
        console.error("Failed to save client channel credentials:", error)
        return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 })
    }
}
