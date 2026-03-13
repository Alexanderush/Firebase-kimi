/**
 * Static tool definitions for Kimi function calling
 */
export const TOOL_DEFINITIONS: Record<string, any> = {
    GMAIL: {
        type: "function",
        function: {
            name: "gmail_send_email",
            description: "Send an email via Gmail",
            parameters: {
                type: "object",
                properties: {
                    to: { type: "string", description: "Email address of the recipient" },
                    subject: { type: "string", description: "Subject of the email" },
                    body: { type: "string", description: "Content of the email" },
                },
                required: ["to", "subject", "body"],
            },
        },
    },
    GOOGLE_CALENDAR: {
        type: "function",
        function: {
            name: "google_calendar_create_event",
            description: "Create a new event on Google Calendar",
            parameters: {
                type: "object",
                properties: {
                    summary: { type: "string", description: "Event title" },
                    startTime: { type: "string", description: "Start time (ISO format)" },
                    endTime: { type: "string", description: "End time (ISO format)" },
                    description: { type: "string", description: "Event description" },
                },
                required: ["summary", "startTime", "endTime"],
            },
        },
    },
    GOOGLE_SHEETS: {
        type: "function",
        function: {
            name: "google_sheets_append_row",
            description: "Append a row of data to a Google Sheet",
            parameters: {
                type: "object",
                properties: {
                    spreadsheetId: { type: "string", description: "The ID of the spreadsheet" },
                    range: { type: "string", description: "A1 notation range (e.g. Sheet1!A:B)" },
                    values: { type: "array", items: { type: "string" }, description: "Array of values to append" },
                },
                required: ["range", "values"],
            },
        },
    },
    YAHOO_MAIL: {
        type: "function",
        function: {
            name: "yahoo_mail_send_email",
            description: "Send an email via Yahoo Mail",
            parameters: {
                type: "object",
                properties: {
                    to: { type: "string", description: "Recipient's email" },
                    subject: { type: "string", description: "Subject line" },
                    body: { type: "string", description: "Email body" },
                },
                required: ["to", "subject", "body"],
            },
        },
    },
}
