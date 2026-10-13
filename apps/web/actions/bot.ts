"use server"

import { auth } from "@clerk/nextjs/server"
import { refresh } from "next/cache"

import { db } from "@workspace/db"
import { bots } from "@workspace/db/schema"

import { createBotSchema, type CreateBotInput } from "@/lib/bot"

export async function createBot(input: CreateBotInput) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error("Unauthorized")

  const { instructions, ...data } = createBotSchema.parse(input)

  const [bot] = await db
    .insert(bots)
    .values({ ...data, instructions: instructions || null, userId })
    .returning()

  refresh()

  return bot!
}
