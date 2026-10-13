import { auth } from "@clerk/nextjs/server"

import { db } from "@boops/db"

export async function getChat(chatId: string) {
  // Redirects to sign-in when signed out; userId only ever comes from Clerk
  const { userId } = await auth.protect()

  const chat = await db.query.chats.findFirst({
    // Scoped to the owner, so another user's chat id resolves to nothing
    where: (chats, { and, eq }) =>
      and(eq(chats.id, chatId), eq(chats.userId, userId)),
    columns: { id: true, name: true },
    with: {
      // Group chats fall back to their first bot for now
      members: {
        orderBy: (members, { asc }) => asc(members.joinedAt),
        limit: 1,
        columns: {},
        with: {
          bot: {
            columns: {
              id: true,
              name: true,
              avatar: true,
              job: true,
              instructions: true,
            },
          },
        },
      },
    },
  })

  const bot = chat?.members[0]?.bot
  if (!chat || !bot) return null

  return { id: chat.id, name: chat.name ?? bot.name, bot }
}

export type ChatDetail = NonNullable<Awaited<ReturnType<typeof getChat>>>
