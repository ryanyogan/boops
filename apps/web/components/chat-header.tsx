import { MonitorIcon } from "lucide-react"

import { Button } from "@boops/ui/components/button"

import { BotDialog } from "@/components/bot-dialog"
import { ChatAvatar } from "@/components/chat-avatar"
import type { ChatDetail } from "@/queries/chats"

export function ChatHeader({ chat }: { chat: ChatDetail }) {
  return (
    <header className="flex h-10 shrink-0 items-center gap-2 border-b px-2">
      <BotDialog bot={chat.bot}>
        <Button variant="ghost" size="sm" className="min-w-0">
          <ChatAvatar seed={chat.bot.avatar} className="size-5" />
          <span className="truncate">{chat.name}</span>
        </Button>
      </BotDialog>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Desktop"
        className="ml-auto"
      >
        <MonitorIcon />
      </Button>
    </header>
  )
}
