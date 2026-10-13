import { config } from "dotenv"
import type { NextConfig } from "next"

// Neon writes the branch's DATABASE_URL to the repo root, outside this app.
// Existing variables win, so deployed environments are unaffected.
config({ path: "../../.env.local", quiet: true })

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/db"],
}

export default nextConfig
