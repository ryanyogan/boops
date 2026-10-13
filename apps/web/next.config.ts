import { config } from "dotenv"
import type { NextConfig } from "next"

// Neon writes the branch's DATABASE_URL to the repo root, outside this app.
// Existing variables win, so deployed environments are unaffected.
config({ path: "../../.env.local", quiet: true })

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: ["@boops/ui", "@boops/db"],
}

export default nextConfig
