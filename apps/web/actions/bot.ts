"use server"

import { auth } from "@clerk/nextjs/server"
import { refresh } from "next/cache"
import { redirect } from "next/navigation"

import { and, db, eq, inArray } from "@boops/db"
import { bots, chatMembers, chats } from "@boops/db/schema"

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

export async function updateBot(botId: string, input: CreateBotInput) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error("Unauthorized")

  const { instructions, ...data } = createBotSchema.parse(input)

  // Scoped to the owner, so another user's bot id updates nothing
  const [bot] = await db
    .update(bots)
    .set({ ...data, instructions: instructions || null })
    .where(and(eq(bots.id, botId), eq(bots.userId, userId)))
    .returning()

  if (!bot) throw new Error("Bot not found")

  refresh()

  return bot
}

export async function deleteBot(botId: string) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error("Unauthorized")

  await db.transaction(async (tx) => {
    // Read before deleting; the bot's memberships cascade away with it
    const memberships = await tx
      .select({ chatId: chatMembers.chatId })
      .from(chatMembers)
      .where(eq(chatMembers.botId, botId))

    // Scoped to the owner, so another user's bot id deletes nothing
    const [bot] = await tx
      .delete(bots)
      .where(and(eq(bots.id, botId), eq(bots.userId, userId)))
      .returning({ id: bots.id })

    if (!bot) throw new Error("Bot not found")

    // A direct chat is nothing without its bot; group chats live on
    await tx.delete(chats).where(
      and(
        inArray(
          chats.id,
          memberships.map((membership) => membership.chatId)
        ),
        eq(chats.kind, "direct"),
        eq(chats.userId, userId)
      )
    )
  })

  refresh()

  // The chat this was opened from no longer exists
  redirect("/")
}
