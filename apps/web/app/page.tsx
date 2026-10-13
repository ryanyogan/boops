import { auth } from "@clerk/nextjs/server"
import { PlusIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"

import { ChatAvatar } from "@/components/chat-avatar"

export default async function Page() {
  await auth.protect()

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)]">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <ChatAvatar seed={crypto.randomUUID()} className="size-10" />
          </EmptyMedia>
          <EmptyTitle>Meet your first bot</EmptyTitle>
          <EmptyDescription>
            Every bot gets its own personality, memory, and face. Spin one up
            and start the conversation.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="secondary">
            <PlusIcon data-icon="inline-start" />
            Create a new bot
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
