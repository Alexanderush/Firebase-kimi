import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const TOKEN_URL = "https://api.login.yahoo.com/oauth2/get_token"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code || !state) {
        return new NextResponse("Missing code or state", { status: 400 })
    }

    try {
        const { subAccountId, toolId, userId } = JSON.parse(Buffer.from(state, 'base64').toString())

        const response = await fetch(TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(`${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`).toString('base64')
            },
            body: new URLSearchParams({
                code,
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/yahoo/callback`,
                grant_type: "authorization-code",
            }),
        })

        const data = await response.json()
        if (data.error) throw new Error(data.error_description || data.error)

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

        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/sub-accounts`)

    } catch (error: any) {
        console.error("Yahoo OAuth Callback Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
