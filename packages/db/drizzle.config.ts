import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

// `neon checkout` / `neon env pull` write the branch's env to the repo root.
config({ path: "../../.env.local", quiet: true })

// Drizzle Kit needs the direct connection: schema changes fail through PgBouncer.
const url = process.env.DATABASE_URL_UNPOOLED

if (!url) {
  throw new Error(
    "DATABASE_URL_UNPOOLED is not set. Run `neon env pull` from the repo root."
  )
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  casing: "snake_case",
  dbCredentials: { url },
})
