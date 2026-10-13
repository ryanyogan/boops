import { relations } from "drizzle-orm"
import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import { nanoid } from "nanoid"

export const bots = pgTable(
  "bots",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    // Third-party user ID
    userId: text().notNull(),
    name: text().notNull(),
    // Seed for the bot's face
    avatar: text()
      .notNull()
      .$defaultFn(() => nanoid()),
    // What the bot is for, in a phrase
    job: text().notNull(),
    // How it should go about the job
    instructions: text(),
    // Third-party sandbox ID, created lazily
    sandboxId: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index().on(table.userId)]
)

export type Bot = typeof bots.$inferSelect
export type NewBot = typeof bots.$inferInsert

export const insertBotSchema = createInsertSchema(bots, {
  name: (schema) =>
    schema
      .trim()
      .min(1, "Give your bot a name.")
      .max(50, "Keep the name under 50 characters."),
  avatar: (schema) => schema.min(1).max(64),
  job: (schema) =>
    schema
      .trim()
      .min(1, "Tell your bot what its job is.")
      .max(100, "Keep the job under 100 characters."),
  instructions: (schema) =>
    schema.trim().max(4000, "Keep the instructions under 4,000 characters."),
})

export const chatKind = pgEnum("chat_kind", ["direct", "group"])

export const chats = pgTable(
  "chats",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    // Third-party user ID
    userId: text().notNull(),
    kind: chatKind().notNull().default("direct"),
    // Null for direct chats, which use the bot's name
    name: text(),
    lastMessagePreview: text(),
    lastMessageAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index().on(table.userId)]
)

export type Chat = typeof chats.$inferSelect
export type NewChat = typeof chats.$inferInsert

// Which bots are in which chats
export const chatMembers = pgTable(
  "chat_members",
  {
    chatId: text()
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    botId: text()
      .notNull()
      .references(() => bots.id, { onDelete: "cascade" }),
    joinedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.chatId, table.botId] }),
    index().on(table.botId),
  ]
)

export type ChatMember = typeof chatMembers.$inferSelect
export type NewChatMember = typeof chatMembers.$inferInsert

export const botsRelations = relations(bots, ({ many }) => ({
  memberships: many(chatMembers),
}))

export const chatsRelations = relations(chats, ({ many }) => ({
  members: many(chatMembers),
}))

export const chatMembersRelations = relations(chatMembers, ({ one }) => ({
  chat: one(chats, {
    fields: [chatMembers.chatId],
    references: [chats.id],
  }),
  bot: one(bots, {
    fields: [chatMembers.botId],
    references: [bots.id],
  }),
}))
