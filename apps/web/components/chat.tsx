"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState } from "react"

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@boops/ui/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@boops/ui/components/ai-elements/message"
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@boops/ui/components/ai-elements/prompt-input"

export function Chat({ chatId }: { chatId: string }) {
  const [input, setInput] = useState("")
  const { messages, sendMessage, status } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({ api: `/api/chats/${chatId}` }),
  })

  function onSubmit(message: PromptInputMessage) {
    if (!message.text.trim()) return

    sendMessage({ text: message.text })
    setInput("")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation>
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <MessageResponse key={`${message.id}-${index}`}>
                      {part.text}
                    </MessageResponse>
                  ) : null
                )}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput
        onSubmit={onSubmit}
        className="relative mx-auto mb-4 w-full max-w-3xl px-4"
      >
        <PromptInputTextarea
          value={input}
          placeholder="Say something..."
          onChange={(event) => setInput(event.currentTarget.value)}
          className="pr-12"
        />
        <PromptInputSubmit
          status={status}
          disabled={!input.trim() && status === "ready"}
          className="absolute right-5 bottom-1"
        />
      </PromptInput>
    </div>
  )
}
