import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const TOKEN_URL = "https://oauth2.googleapis.com/token"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code || !state) {
        return new NextResponse("Missing code or state", { status: 400 })
    }

    try {
        const { subAccountId, toolId, userId } = JSON.parse(Buffer.from(state, 'base64').toString())

        // 1. Exchange code for tokens
        const response = await fetch(TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
                grant_type: "authorization-code",
            }),
        })

        const data = await response.json()
        if (data.error) throw new Error(data.error_description || data.error)

        // 2. Find or create ToolConnection
        // Find the Tool entry (GMAIL, etc)
        const tool = await prisma.tool.findFirst({
            where: { name: toolId }
        })

        if (!tool) throw new Error("Tool not found")

        await prisma.toolConnection.upsert({
            where: {
                subAccountId_toolId: {
                    subAccountId,
                    toolId: tool.id,
                },
            },
            update: {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresAt: new Date(Date.now() + data.expires_in * 1000),
            },
            create: {
                subAccountId,
                toolId: tool.id,
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresAt: new Date(Date.now() + data.expires_in * 1000),
            },
        })

        // 3. Redirect back to agent builder or a success page
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/sub-accounts`)

    } catch (error: any) {
        console.error("OAuth Callback Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
