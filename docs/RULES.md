# CLAUDE.md — CalmWork

> Put this file at the repo root. Copy the same content to `.github/copilot-instructions.md` (GitHub Copilot) and `.cursorrules` (Cursor) so every tool reads it.

CalmWork is a B2B employee-wellbeing app: anonymous weekly check-ins, personal productivity tools, aggregated team insights for businesses. Live: https://employee-micro-feedback-and-monitor-omega.vercel.app/

## Read first

Before any task read the docs in `docs/`: `01-PRD.md`, `02-USER-FLOWS.md`, `03-TECH-STACK.md`, `04-FRONTEND-GUIDELINES.md`, `05-BACKEND-DATA-MODEL.md`, `06-IMPLEMENTATION-PLAN.md`, `08-PROGRESS.md`. Work on **one plan step at a time** (`06`). When done, update `08-PROGRESS.md`.

## Stack (locked)

Next.js App Router + TypeScript (strict) + Tailwind + react-hook-form + zod + React Query + recharts at the repo root. Express + Mongoose + MongoDB + zod + JWT cookies + Nodemailer + Razorpay in `backend/`. Hosting on Vercel (two projects) + MongoDB Atlas. **Do not add, remove, or swap libraries or frameworks without asking me.** See `03-TECH-STACK.md`.

## Product rules you must never break

1. **Check-in answers are anonymous.** The `checkins` collection must never contain a `userId`, and nothing may join answers to identity.
2. **Minimum group size 5.** Any aggregate based on fewer than `minGroupSize` responses is suppressed in the service layer.
3. **Business roles never see individual check-in answers or free text.**
4. **Employees can only join with a valid invitation code** (bound to their email, single-use, 7-day expiry). No open employee sign-up.
5. **Business sign-up requires a business email.** Free providers are blocked.
6. **No screen surveillance.** No screenshots, keylogging, screen recording, or live view in the MVP.
7. **14-day free trial, no card.** After trial the org is read-only. Reports cost ₹99 each, marked paid only by the verified Razorpay webhook.
8. Never log passwords, OTPs, tokens, invite codes, or check-in text.

## Code style

- TypeScript strict. No `any` (if unavoidable, add a one-line comment why).
- Small, single-purpose functions and components. Prefer composition.
- Names: components `PascalCase.tsx`, hooks `useThing.ts`, utilities and folders `kebab-case`, constants `UPPER_SNAKE`.
- Validate **all** external input with zod, on both client and server (share schemas).
- Backend layers: `routes → controllers → services → models`. Controllers are thin; business logic lives in services. Every query is scoped by `orgId`.
- API response shapes: `{ data }` or `{ error: { code, message, fields? } }`. Use the error codes in `05`.
- Handle loading, empty, and error states in every UI that fetches data.
- Comment manual setup items (env vars, dashboard steps) directly in the code or `.env.example`.
- Write tests with each feature (Vitest; Supertest for API). Cover the failure paths, not just the happy one.
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`…). Small PRs.

## UI rules

- Use the design tokens only (`bg-cw-primary`, `text-cw-cream`…). **No raw hex values, no arbitrary-value colors.**
- Figtree font. Pill inputs, circular black arrow buttons, large rounded teal cards. Flat: no gradients, shadows, or glass.
- Headline pattern: one light line + one extra-bold line; optional single italic-light yellow word on teal only.
- Warm, calm microcopy. No red-alarm UI. Pair color with text/icons.
- Use the existing components in `components/ui/`. Create a new one only if none fits. Use the supplied brand SVG for the logo; never redraw it.
- Mobile first, accessible (4.5:1 contrast, visible focus, aria-labels on icon buttons).

## File structure

Follow the layout in `03-TECH-STACK.md` §1. Frontend API calls go only through `lib/api.ts`. Do not create files outside the structure without saying why.

## Don't touch (ask first)

- `.env`, `.env.*`, or any secret. Edit `.env.example` only.
- `vercel.json`, `package.json` dependencies, `tsconfig`, ESLint/Prettier config, GitHub Actions workflows.
- Existing database models and indexes (propose a migration instead).
- The brand assets in `public/brand/` and the design tokens.
- `backend/scripts/seed.ts` production guard (`SEED_DEMO` must never run in production).
- Anything on the "Not used" list in `03-TECH-STACK.md`.

## Demo and test data

Run `npm run seed` in `backend/` (dev only). Demo accounts and fixed dev invite codes are in `05-BACKEND-DATA-MODEL.md` §9. Dev mail goes to Mailpit (http://localhost:8025). Never use real email addresses in tests.

## How to work

1. Restate the step you are doing and list the files you'll touch.
2. If the task conflicts with these rules or the docs, stop and ask.
3. Implement only that step. Do not refactor unrelated code.
4. Run lint, typecheck, and tests. Fix failures before finishing.
5. Summarize: files changed, tests added, manual steps for me, and anything uncertain.
6. Append an entry to `docs/08-PROGRESS.md`.

If you are unsure, ask rather than guess. Prefer the simplest solution that meets the docs.