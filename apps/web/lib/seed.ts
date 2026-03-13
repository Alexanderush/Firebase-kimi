import { prisma } from "../lib/prisma"

const tools = [
    { name: "GMAIL", displayName: "GMail", description: "Read and send emails via Gmail" },
    { name: "GOOGLE_CALENDAR", displayName: "Google Calendar", description: "Manage calendar events" },
    { name: "GOOGLE_SHEETS", displayName: "Google Sheets", description: "Read and write to spreadsheets" },
    { name: "YAHOO_MAIL", displayName: "Yahoo Mail", description: "Send emails via Yahoo" },
]

async function main() {
    console.log("Seeding tools...")
    for (const tool of tools) {
        await prisma.tool.upsert({
            where: { name: tool.name },
            update: {},
            create: tool,
        })
    }
    console.log("Seeding complete.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
