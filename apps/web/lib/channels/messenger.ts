/**
 * Facebook Messenger Send API Utilities
 */
export async function sendMessengerMessage(
    pageId: string,
    recipientId: string,
    text: string,
    accessToken: string
) {
    const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${accessToken}`

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: text },
            messaging_type: "RESPONSE"
        })
    })

    const data = await response.json()
    if (!response.ok) {
        console.error("Messenger API Error:", data)
        throw new Error(data.error?.message || "Failed to send Messenger message")
    }

    return data
}
