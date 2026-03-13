/**
 * WhatsApp Cloud API Utilities
 */
export async function sendWhatsAppMessage(
    phoneNumberId: string,
    to: string,
    text: string,
    accessToken: string
) {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: "text",
            text: {
                preview_url: false,
                body: text
            }
        })
    })

    const data = await response.json()
    if (!response.ok) {
        console.error("WhatsApp API Error:", data)
        throw new Error(data.error?.message || "Failed to send WhatsApp message")
    }

    return data
}
