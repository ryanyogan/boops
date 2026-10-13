<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

## Git

- Never create branches, worktrees, or commits automatically. Only do do so when the user asks for that specific action in the current request.
- Leave changes uncommitted in the working tree on the current branch and let the user decide when and how to commit.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

## Database

- This is a dev project: there is no backwards compatibility and the data is worthless. Prefer data loss.
- Never backfill, migrate, or preserve rows, and never spend effort on keeping old data working. Every schema change means a clean slate.
- Apply schema changes only with `npm run db:push` (`drizzle-kit push`). Never generate or run migrations (`drizzle-kit generate` / `drizzle-kit migrate`), and never add migration files or migration scripts.

## Forms

Reference implementation: `apps/web/components/bot-dialog.tsx`, `apps/web/actions/bot.ts`, `apps/web/lib/bot.ts`.

### Validation schema

- Derive schemas from the Drizzle table with `createInsertSchema` from `drizzle-zod`, and export them from `packages/db/src/schema.ts` next to the table (`insertBotSchema`). Never hand-write a parallel `z.object` for a table. The installed `drizzle-orm` has no `drizzle-orm/zod` entry point; import from `drizzle-zod`.
- Put trimming, length limits, and user-facing error messages in the `createInsertSchema` refinement callbacks, so the client and the server share them.
- Narrow the table schema to the fields the user fills in with `.pick()` in `apps/web/lib/<entity>.ts`, and export the inferred input type from there. A `"use server"` file can only export async functions, so the schema cannot live in the action file.
- Never accept server-owned columns (`id`, `userId`, `createdAt`, third-party IDs) from the client.

### Server actions

- Actions live in `apps/web/actions/<entity>.ts` with `"use server"` at the top of the file, and take a typed object, not `FormData`.
- Start every action with `const { isAuthenticated, userId } = await auth()` from `@clerk/nextjs/server`, and throw if not authenticated. `userId` only ever comes from Clerk.
- Re-parse the input with the same schema on the server; the client check is for UX only.
- Normalize empty optional strings to `null` before inserting.
- Call `refresh()` from `next/cache` after the mutation, and return the created row.

### Form UI

- Use `react-hook-form` with `zodResolver` from `@hookform/resolvers/zod`, typed with the inferred input type, with `defaultValues` for every field.
- Compose with shadcn `FieldGroup` + `Field` + `FieldLabel` + `FieldError`, one `Controller` per field. Set `data-invalid` on `Field` and `aria-invalid` on the control. Never lay out a form with raw `div`s.
- Add missing components with `npx shadcn@latest add <name>` run from `apps/web`; they land in `packages/ui` and are imported from `@boops/ui/components/*`. This is the Base UI variant: triggers take `render={<Button />}`, not `asChild`.
- In a dialog, give the `<form>` an `id` and put the submit button in `DialogFooter` with the matching `form` attribute. Reset the form when the dialog opens.
- Generate random values (seeds, IDs) in event handlers, never during render.
- Pending state: disable the submit button and show `Spinner` while `formState.isSubmitting`.
- On failure, set a `root` error and render it with `FieldError`. On success, close the dialog and confirm with `toast` from `sonner`.

## DiceBear

Use DiceBear 10. Documentation: <https://www.dicebear.com/llms.txt>

There are seven native cores with identical output, not one library with
wrappers. Use the one matching this project's language. Do not reach for the
JavaScript core when the project is written in something else:

    JavaScript  @dicebear/core + @dicebear/styles
    PHP         dicebear/core + dicebear/styles
    Python      dicebear-core + dicebear-styles
    Rust        dicebear-core + dicebear-styles
    Go          github.com/dicebear/dicebear-go/v10 + github.com/dicebear/styles/v10
    Dart        dicebear_core + dicebear_styles
    C#          DiceBear.Core + DiceBear.Styles

Every style page carries a loading snippet for all seven, for example
<https://www.dicebear.com/styles/lorelei/index.md>

HTTP API: <https://api.dicebear.com/10.x/><style>/svg?seed=<seed> The seed is a
query parameter, not a path segment. Options are query parameters too; array
values are separated by commas.

Options named after a component end in Variant: eyesVariant, not eyes. This
holds in all seven cores and in the HTTP API. Look up the options of a style at
<https://api.dicebear.com/10.x/><style>/options.json

Write these forms, not the ones on the left. The left column is pre-10 and the
API does not reject it, so an outdated call runs and silently does the wrong
thing:

    avatars.dicebear.com/api/<style>/<seed>.svg  ->  api.dicebear.com/10.x/<style>/svg?seed=<seed>
    api.dicebear.com/9.x/<style>/svg             ->  api.dicebear.com/10.x/<style>/svg
    npm install @dicebear/collection             ->  npm install @dicebear/styles
    npm install @dicebear/lorelei                ->  npm install @dicebear/styles
    createAvatar(lorelei, { seed })              ->  new Avatar(new Style(definition), { seed })
    { eyes: ['variant01'] }                      ->  { eyesVariant: ['variant01'] }
    ?radius=50                                   ->  ?borderRadius=50

Only JavaScript and the HTTP API have a pre-10 form. The other six cores were
released in 2026 and never had one, so any older-looking PHP, Python, Rust, Go,
Dart or C# API attributed to DiceBear is invented rather than outdated.
