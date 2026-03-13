import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const subAccountId = searchParams.get("subAccountId")
    const toolId = searchParams.get("toolId")

    // Define scopes based on toolId (GMAIL, CALENDAR, SHEETS)
    let scopes = [
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
    ]

    if (toolId?.includes("GMAIL")) scopes.push("https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.readonly")
    if (toolId?.includes("CALENDAR")) scopes.push("https://www.googleapis.com/auth/calendar")
    if (toolId?.includes("SHEETS")) scopes.push("https://www.googleapis.com/auth/spreadsheets")

    const state = JSON.stringify({ subAccountId, toolId, userId: session.user.id })
    const encodedState = Buffer.from(state).toString('base64')

    const authUrl = `${GOOGLE_AUTH_URL}?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXTAUTH_URL}/api/auth/google/callback&response_type=code&scope=${encodeURIComponent(scopes.join(" "))}&state=${encodedState}&access_type=offline&prompt=consent`

    return NextResponse.redirect(authUrl)
}
