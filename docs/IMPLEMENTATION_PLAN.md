# CalmWork — Implementation Plan

Build in small steps. **One step per prompt/PR.** Each step lists a goal, what to build, and a "done when" check. Do not start the next step until the current one passes. Read `CLAUDE.md` and the relevant docs before each step.

Starting point: the repository already contains a JavaScript Next.js frontend and an Express/Mongoose backend. The TypeScript migration is staged so each slice remains buildable.

---

## Milestone 0 — Foundation

**0.1 Repo hygiene.** Confirm the docs, commented `.env.example` files, `.gitignore`, Prettier/ESLint, strict TypeScript, and Conventional Commit conventions. The existing JavaScript application is migrated incrementally:

- **0.1a.1 Auth boundary:** migrate the login page and `AuthForm`; declare the auth API/context types. Done when the strict frontend typecheck, frontend lint, and production build pass.
- **0.1a.2 Remaining frontend:** migrate the remaining routes, components, hooks, and API modules in buildable slices. Keep strict checking enabled for migrated TypeScript.
- **0.1b Backend:** migrate backend source and tests to TypeScript and add strict backend typecheck/build scripts.
- **0.1c Completion:** ensure root lint/typecheck run both projects and pass alongside backend tests.

Do not begin milestone 0.2 until 0.1c passes.

**0.2 Design tokens.** Add the color/radius/font tokens from `04-FRONTEND-GUIDELINES.md` to `globals.css` and `tailwind.config`. Load Figtree.
Done when: a test page shows all tokens; no hex values elsewhere.

**0.3 UI primitives.** `Logo`, `Button`, `PillInput`, `TealCard`, `Heading`, `Eyebrow`.
Done when: a `/styleguide/` page renders every variant and state, matching the reference images.

**0.4 Backend skeleton.** Express app, env validation (zod), Mongo connection with serverless caching, `helmet`/`cors`/rate-limit, error handler, health route `GET /api/v1/health`.
Done when: health route returns 200 locally.

**0.5 Deploy pipeline.** `backend/vercel.json` + `backend/api/index.ts`; frontend and backend as two Vercel projects; env vars set.
Done when: deployed health route returns 200 and the frontend reads `NEXT_PUBLIC_API_URL`.

## Milestone 1 — Marketing site and demo

**1.1 Public pages restyle:** Home, Pricing, About, Contact, Privacy per the design system. CTAs: **Start free trial**, **View demo**. Pricing copy: 14-day trial, ₹99 per report.
**1.2 Demo sandbox** `/demo/` using static `demoData.json` (fictional company, 4 teams, 12 weeks). Read-only; trial banner.
**1.3 Contact / Book a demo form** → backend `POST /contact` → email to sales inbox (Mailpit in dev).
Done when: a visitor can reach the demo without signing in and no authenticated call is made.

## Milestone 2 — Auth (business)

**2.1** `User`, `Organization`, `Otp` models + indexes.
**2.2** `POST /auth/business/signup` with business-email validation (free-provider blocklist) and password rules. Unit tests for blocklist.
**2.3** Email sending service (Nodemailer + Mailpit) and the `verify-otp` template.
**2.4** `POST /auth/verify-email`, `/auth/resend-otp`; trial starts on verify.
**2.5** Login (password then OTP), refresh, logout, `/auth/me`, cookies, lockout.
**2.6** Forgot/reset password.
**2.7** Frontend: Sign-up, Verify, Login (business tab), Forgot/Reset, route guards, session handling. Replace mocks for these calls only.
Done when: a business can sign up with a work email, verify, sign in, reset a password; a gmail address is rejected.

## Milestone 3 — Teams and invitations

**3.1** `Team` model + CRUD endpoints, role middleware, org scoping helper.
**3.2** Frontend Teams page (list, create, edit, archive).
**3.3** `Invite` model, code generation/hashing, `POST /invites`, resend, revoke, list.
**3.4** `invite` email template (code + link + data-notice summary).
**3.5** `POST /auth/employee/join` with all failure states from `02-USER-FLOWS.md` §5; rate limiting.
**3.6** Frontend: Invites page, CSV bulk upload, Join page (code, notice, password), Employee tab.
**3.7** Seed script (`05-BACKEND-DATA-MODEL.md` §9) with the demo accounts and fixed dev codes.
Done when: `owner@acme-demo.example` invites a new address, the code appears in Mailpit, the employee activates with it, and every invalid/expired/used/revoked code shows the right message.

## Milestone 4 — Employee app

**4.1** Check-in endpoints with the anonymous write path (`checkins` + `checkin_participation` + `my_checkins`) and a test asserting no `userId` exists on `checkins`.
**4.2** Frontend check-in flow (one question per screen) and personal trend.
**4.3** Tasks, events, timer endpoints + Planner UI (calendar, reminders).
**4.4** "What my employer sees" page (`/app/privacy/`).
Done when: an employee can check in once per week, see their own trend, and the DB contains no link between identity and answers.

## Milestone 5 — Business insights and alerts

**5.1** Weekly stats job writing `team_weekly_stats` with k-threshold suppression (tests for sizes 3, 4, 5, 6).
**5.2** Insights endpoints (`overview`, `teams/:id`, `workload`).
**5.3** Alert rules engine (rules in PRD §7.8) + `evaluate-alerts` job + endpoints.
**5.4** Frontend dashboard, team scorecards, workload view, alerts (ack/snooze/note), People roster with time summaries.
**5.5** Reminder and alert-digest emails; Vercel Cron config.
Done when: seeded Acme data shows scorecards and 3 alerts, the 3-person team shows "Not enough responses", and no endpoint returns individual answers.

## Milestone 6 — Trial, billing, reports

**6.1** Trial lifecycle: `requireActiveOrg`, `expire-trials` job, trial emails, banner, read-only mode. Test with the Lumen (expired) and Northwind (ending) demo orgs.
**6.2** Razorpay order creation + webhook (signature verified, idempotent).
**6.3** Report generation (PDF/CSV, aggregated only) and signed downloads.
**6.4** Frontend Reports and Billing pages.
Done when: with Razorpay test keys, a report can be paid and downloaded, and a failed/cancelled payment gives no file.

## Milestone 7 — Platform admin and hardening

**7.1** Admin login + org list, suspend/extend trial, audit log.
**7.2** Security pass: CORS allow-list, cookie flags, rate limits, mongo-sanitize, dependency audit, secrets review.
**7.3** Accessibility pass (keyboard, contrast, focus), responsive QA on mobile widths.
**7.4** Playwright tests for: business sign-up, invite → join, check-in, report purchase.
**7.5** Legal pages (privacy, terms), data deletion and export for employees.

## Milestone 8 — Launch

**8.1** Production env vars, Atlas production cluster, Razorpay live keys, Resend domain verification, `SEED_DEMO` unset.
**8.2** Smoke test on production, rollback plan, monitoring (Vercel logs + uptime check).
**8.3** Soft launch to a few friendly companies; collect feedback.

## Later (not in this plan)

Opt-in screen-capture module, salary checker, document e-signature, leave application, SSO, HRIS/Slack integrations.

---

## How to prompt each step

> Read `CLAUDE.md`, `docs/03-TECH-STACK.md`, and the sections of the docs relevant to step **X.Y**. Implement only step **X.Y**. Follow the file structure and conventions. Add tests. List the files you changed and anything I must do manually (env vars, dashboard settings). Then update `docs/08-PROGRESS.md`.