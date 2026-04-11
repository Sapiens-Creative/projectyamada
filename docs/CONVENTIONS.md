# Okei Agency — Conventions

Rules enforced for all agents. Read before writing any code.

## File Naming

| Context | Convention | Example |
|---|---|---|
| Pages/layouts | Next.js reserved names | `page.tsx`, `layout.tsx` |
| Components | kebab-case.tsx | `client-card.tsx` |
| Hooks | use-kebab-case.ts | `use-workspace.ts` |
| Server Actions | [entity].actions.ts | `client.actions.ts` |
| Zod schemas | [entity].schema.ts | `client.schema.ts` |
| DB migrations | NNNN_description.sql | `0002_clients.sql` |
| Type files | [context].types.ts | `app.types.ts` |

## TypeScript

- Domain types in `types/app.types.ts` — no prefix (`Client`, not `IClient`)
- All Server Actions return `Promise<ActionResult<T>>` = `{ data, error, success }`
- No `any`. Use `unknown` and narrow.
- Props interfaces co-located in component file

## Components

- `'use client'` as FIRST line, before imports
- Server components are default — add `'use client'` only when necessary
- One component per file
- `components/ui/` — shadcn files, DO NOT hand-edit
- Feature components import by path, no barrel exports

## Supabase / Data

- All DB calls in Server Actions or Route Handlers only — never in client components
- Always filter by `workspace_id` — never query without tenant scope
- `updated_at` updated via Postgres trigger, not application code
- Hard deletes (no soft delete in Phase 1)

## Routing

- Route groups `(auth)`, `(dashboard)`, `(onboarding)` — no URL impact
- Workspace context always at `[workspaceSlug]` URL segment
- Every route segment gets `loading.tsx` and `error.tsx`

## Styling

- Tailwind utility classes only
- `cva()` for component variants
- `cn()` from `lib/utils.ts` for class merging
- No inline `style` props except for dynamic values
- Brand CSS variables in `globals.css` under `:root`

## State

| Type | Tool |
|---|---|
| Server state | TanStack Query |
| Global UI state | React Context (minimal) |
| Form state | react-hook-form |
| URL state (filters) | nuqs |

## Git

- Conventional Commits: `feat(clients): add detail page`
- Branches: `feature/module-name`, `fix/description`
- No direct commits to `main` — PRs required always

## HARNESS Agent Rules

- Never write code outside the scope of the current phase plan
- Never modify `components/ui/*` (shadcn)
- Never modify `types/database.types.ts` manually — regenerate via CLI
- Always run `npm run build` before marking a task done
- Flag any deviation from these conventions before implementing
