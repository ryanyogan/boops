import type { z } from "zod"

import { insertBotSchema } from "@workspace/db/schema"

// The fields a user fills in; everything else is set on the server.
export const createBotSchema = insertBotSchema
  .pick({ name: true, avatar: true, job: true, instructions: true })
  .required({ avatar: true })

export type CreateBotInput = z.infer<typeof createBotSchema>
