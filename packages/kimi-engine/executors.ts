/**
 * Google API Utilities for tool execution
 */

export class GoogleToolExecutor {
    private accessToken: string

    constructor(accessToken: string) {
        this.accessToken = accessToken
    }

    private async fetchGoogle(url: string, options: any = {}) {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
            },
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error?.message || "Google API Error")
        }

        return res.json()
    }

    async sendEmail(to: string, subject: string, body: string) {
        // Gmail requires base64url encoded message
        const message = [
            `To: ${to}`,
            `Subject: ${subject}`,
            "",
            body,
        ].join("\r\n")

        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "")

        return this.fetchGoogle("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
            method: "POST",
            body: JSON.stringify({ raw: encodedMessage }),
        })
    }

    async createCalendarEvent(summary: string, startTime: string, endTime: string, description?: string) {
        return this.fetchGoogle("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
            method: "POST",
            body: JSON.stringify({
                summary,
                description,
                start: { dateTime: startTime },
                end: { dateTime: endTime },
            }),
        })
    }

    async appendSheetRow(spreadsheetId: string, range: string, values: any[]) {
        return this.fetchGoogle(
            `https://sheets.googleapis.com/v1/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
            {
                method: "POST",
                body: JSON.stringify({ values: [values] }),
            }
        )
    }
}

/**
 * Yahoo API Utilities for tool execution
 */
export class YahooToolExecutor {
    private accessToken: string

    constructor(accessToken: string) {
        this.accessToken = accessToken
    }

    async sendEmail(to: string, subject: string, body: string) {
        // Yahoo Mail API implementation would go here
        // Note: Yahoo Mail API often uses IMAP/SMTP or a specific REST API
        // For this boilerplate, we'll return a simulation
        console.log("Yahoo Send Email mock called")
        return { success: true, message: "Yahoo email sent (Simulated)" }
    }
}
