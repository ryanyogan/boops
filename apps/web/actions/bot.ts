"use server"

import { auth } from "@clerk/nextjs/server"
import { refresh } from "next/cache"

import { db } from "@workspace/db"
import { bots, chatMembers, chats } from "@workspace/db/schema"

import { createBotSchema, type CreateBotInput } from "@/lib/bot"

export async function createBot(input: CreateBotInput) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error("Unauthorized")

  const { instructions, ...data } = createBotSchema.parse(input)

  // A bot always comes with its direct chat, so create all three rows or none.
  const bot = await db.transaction(async (tx) => {
    const [bot] = await tx
      .insert(bots)
      .values({ ...data, instructions: instructions || null, userId })
      .returning()

    const [chat] = await tx
      .insert(chats)
      .values({ userId, kind: "direct" })
      .returning({ id: chats.id })

    await tx.insert(chatMembers).values({ chatId: chat!.id, botId: bot!.id })

    return bot!
  })

  refresh()

  return bot
}
