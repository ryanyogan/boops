import { anthropic } from "@ai-sdk/anthropic"
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai"

import { getChat } from "@/queries/chats"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params
  // Scoped to the signed-in user, so this also guards the route
  const chat = await getChat(chatId)
  if (!chat) return new Response("Not found", { status: 404 })

  const { messages }: { messages: UIMessage[] } = await req.json()
  const { name, job, instructions } = chat.bot

  const result = streamText({
    model: anthropic("claude-sonnet-5-5"),
    instructions: [`You are ${name}. Your job: ${job}.`, instructions]
      .filter(Boolean)
      .join("\n\n"),
    messages: await convertToModelMessages(messages),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
