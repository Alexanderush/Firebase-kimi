import OpenAI from "openai"
import { z } from "zod"
import { TOOL_DEFINITIONS } from "./tools"

export * from "./tools"
export * from "./executors"

/**
 * Message interface for the engine
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system" | "tool"
  content: string | null
  tool_calls?: any[]
  tool_call_id?: string
  name?: string
}

/**
 * KimiEngine handles communication with Kimi K2.5 via NVIDIA NIM
 * Supports thinking mode and tool calling.
 */
export class KimiEngine {
  private client: OpenAI
  private model: string

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: process.env.NVIDIA_BASE_URL,
    })
    this.model = process.env.KIMI_MODEL || "moonshotai/kimi-k2.5"
  }

  /**
   * Main execution loop with tool calling support
   */
  async execute(
    messages: ChatMessage[],
    activeToolNames: string[],
    onToolCall?: (name: string, args: any) => Promise<any>
  ): Promise<ChatMessage> {

    // Convert tool names (GMAIL, etc) to OpenAI tool schemas
    const tools = activeToolNames
      .map(name => TOOL_DEFINITIONS[name])
      .filter(Boolean)

    const payload: any = {
      model: this.model,
      messages: messages as any,
      max_tokens: 16384,
      temperature: 1.0,
      top_p: 1.0,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? "auto" : undefined,
      chat_template_kwargs: { thinking: true }
    }

    const response = await this.client.chat.completions.create(payload)
    const responseMessage = response.choices[0].message

    // If the LLM wants to call a tool
    if (responseMessage.tool_calls && onToolCall) {
      const updatedMessages = [...messages, responseMessage as any]

      for (const toolCall of responseMessage.tool_calls) {
        if (!('function' in toolCall)) continue

        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)

        console.log(`Executing tool: ${functionName}`, functionArgs)

        // Execute the tool (via the provided callback)
        const toolResult = await onToolCall(functionName, functionArgs)

        updatedMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: functionName,
          content: JSON.stringify(toolResult),
        })
      }

      // Recursively call the LLM with tool results
      return this.execute(updatedMessages, activeToolNames, onToolCall)
    }

    return responseMessage as any
  }
}
