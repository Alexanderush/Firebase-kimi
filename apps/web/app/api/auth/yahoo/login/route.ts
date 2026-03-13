import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

const YAHOO_AUTH_URL = "https://api.login.yahoo.com/oauth2/request_auth"

export async function GET(
    req: Request
) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const subAccountId = searchParams.get("subAccountId")
    const toolId = "YAHOO_MAIL"

    const state = JSON.stringify({ subAccountId, toolId, userId: session.user.id })
    const encodedState = Buffer.from(state).toString('base64')

    const authUrl = `${YAHOO_AUTH_URL}?client_id=${process.env.YAHOO_CLIENT_ID}&redirect_uri=${process.env.NEXTAUTH_URL}/api/auth/yahoo/callback&response_type=code&state=${encodedState}`

    return NextResponse.redirect(authUrl)
}
