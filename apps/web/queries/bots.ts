import { auth } from "@clerk/nextjs/server"

import { db } from "@boops/db"

export async function getChats() {
  // Redirects to sign-in when signed out; userId only ever comes from Clerk
  const { userId } = await auth.protect()

  const rows = await db.query.chats.findMany({
    where: (chats, { eq }) => eq(chats.userId, userId),
    orderBy: (chats, { desc }) => desc(chats.lastMessageAt),
    columns: {
      id: true,
      name: true,
      lastMessagePreview: true,
      lastMessageAt: true,
    },
    with: {
      // Group chats fall back to their first bot for now
      members: {
        orderBy: (members, { asc }) => asc(members.joinedAt),
        limit: 1,
        columns: {},
        with: { bot: { columns: { name: true, avatar: true } } },
      },
    },
  })

  return rows.flatMap(({ members, name, ...chat }) => {
    const bot = members[0]?.bot
    if (!bot) return []

    return { ...chat, name: name ?? bot.name, avatar: bot.avatar }
  })
}

export type ChatListItem = Awaited<ReturnType<typeof getChats>>[number]
