import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

// Reuse the pool across dev hot reloads so they don't exhaust connections.
const globalForDb = globalThis as unknown as { pool?: Pool }

const pool = globalForDb.pool ?? new Pool({ connectionString })

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool
}

export const db = drizzle({ client: pool, schema, casing: "snake_case" })
