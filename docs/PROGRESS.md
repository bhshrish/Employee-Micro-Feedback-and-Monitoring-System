# CalmWork — Progress & Decision Log

Paste this file at the start of any new AI session. Update it at the end of every step. Newest entries first within each section.

Last updated: 2026-11-23

---

## 1. Current status

- **Phase:** Step **0.1 Repo hygiene** is complete.
- **Current substep:** Frontend, backend, and test source use JavaScript (`.js`/`.jsx`); TypeScript tooling and configuration have been removed.
- **Next step:** Continue with milestone **0.2 Design tokens**.
- **Repository note:** The application uses Next.js with JavaScript/JSX and an Express/Mongoose JavaScript backend. Validate changes with ESLint, production builds, and backend tests.
- **Live site:** https://employee-micro-feedback-and-monitor-omega.vercel.app/
- **Repo:** https://github.com/bhshrish/Employee-Micro-Feedback-and-Monitoring-System

## 2. Done

- [x] Frontend Next.js app deployed on Vercel with public pages (Home, Pricing, About, Contact, Privacy) and a login page.
- [x] Brand defined: CalmWork (teal `#177687`, yellow `#FFDD00`, cream `#FFFCF1`, Figtree).
- [x] 8 project docs written (PRD, user flows, tech stack, frontend guidelines, backend/data model, implementation plan, CLAUDE.md, this log).

## 3. In progress

- None recorded.

## 4. Known problems / broken

- OTP email code was not arriving on the live login page (backend email not wired). Fixed by milestone 2.3 and 2.5.
- No `vercel.json` for the backend yet (milestone 0.5).
- Push to the `bhshrish` repo from the `shrish731` account returned 403. Use a PR from `shrish731`, or add `shrish731` as a collaborator.
- The live site's pricing copy says "pay only per report (₹99)" and does not mention the 14-day trial yet (milestone 1.1).
- Live site currently describes "reports from submitted forms" and not the business/employee invite model (milestones 2–3).

## 5. Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-11-20 | Trial is **14 days**, no credit card (was 7 days) | Matches the "start for free" goal; longer than We360's 7-day trial |
| 2026-11-20 | Business sign-up requires a **business email**; employees may use any email | Product requirement; free-provider blocklist |
| 2026-11-20 | Employees join **only via emailed invitation code** (single-use, email-bound, 7-day expiry) | Product requirement |
| 2026-11-20 | Business sees roster, participation, time summaries, and **aggregated** wellbeing. **Never individual check-in answers** | Keeps "anonymous" promise honest; matches We360's own guidance (team level first, don't score individuals) |
| 2026-11-20 | Minimum group size for any aggregate = **5** | Protects anonymity |
| 2026-11-20 | Employee needs the code to **activate**; later sign-ins use email + password | Single-use codes can't be a repeat login method. Change if you want otherwise |
| 2026-11-20 | Public `/demo` is a static read-only sandbox; separate seeded demo accounts for developers | Demo needs no sign-up; dev accounts test real flows |
| 2026-11-20 | Demo emails use the reserved `.example` TLD; dev mail goes to Mailpit | Nothing can reach a real person |
| 2026-11-20 | Backend = separate Vercel project (Express as serverless), Render as pre-approved fallback | Keeps everything on Vercel as requested |
| 2026-11-20 | Screen monitoring, salary checker, e-signature, leave are **out of MVP** | Keeps the build small and the "no surveillance" positioning clean |
| earlier | Stack: Next.js + Express + MongoDB; Razorpay for payments; OTP login; separate admin access | From earlier project requirements |

## 3b. Open questions

1. Recurring plan price after the trial?
2. Should admins see participation **names** (default: counts only)?
3. Who keeps access after a trial expires (employees' personal tools)?
4. Which jurisdictions at launch (India DPDP, GDPR)? Needs legal review.

## 6. Demo credentials (dev only; see `05` §9)

Business: `owner@acme-demo.example`, `hr@northwind-demo.example`, `founder@lumen-demo.example`
Employees: `priya.demo@personalmail.example`, `sam.demo@personalmail.example`, `invite.pending@personalmail.example` (code `CALM-DEMO-7K4Q`)
Password for all: `Demo@12345`. Created only by `npm run seed` when `SEED_DEMO=true`.

## 7. Changelog

### 2026-11-23 — Employee and Business email sign-in
- Built: Added Employee/Business sign-in tabs, email verification code flow with password fallback, and account-type validation at OTP verification so an incorrect tab selection does not prevent delivery. Updated the sign-in card to follow the teal/cream auth design guidance.
- Files changed: `frontend/components/AuthForm.jsx`, `frontend/app/globals.css`, `backend/src/schemas.js`, `backend/src/services/otp.service.js`, and `backend/tests/api.test.js`.
- Tests: Focused API tests, frontend/backend lint, production build, and full backend suite.
- Manual steps for me: Ensure backend SMTP settings are configured for email codes, then deploy frontend and backend.
- Problems / follow-ups: None.
- Decisions: Employee sign-in maps to the existing `individual` role; Business maps to `business`. Password sign-in remains available.

### 2026-11-23 — JavaScript conversion
- Built: Converted all 135 frontend, backend, and test TypeScript/TSX source files to JavaScript/JSX; removed TypeScript configuration and direct tooling dependencies; updated runtime scripts, lint config, and project guidance.
- Files changed: Frontend and backend source/test extensions; package manifests and lockfile; JavaScript build/lint/test configuration; relevant stack, rules, implementation, and frontend/backend documentation.
- Tests: `npm run lint` passes with the same five existing frontend warnings; `npm run build` passes; `npm test` passes (51 tests); `git diff --check` passes.
- Manual steps for me: Reinstall dependencies from the updated lockfile.
- Problems / follow-ups: None.
- Decisions: Keep the production backend in native JavaScript; remove compile-time TypeScript checking as requested.

### 2026-11-21 — Step 0.1a.1 Auth boundary
- Built: Added a strict frontend TypeScript configuration, typed the sign-in/sign-up API and subscription context boundary, and converted the login route and `AuthForm`.
- Files changed: `frontend/app/login/page.tsx`, `frontend/components/AuthForm.tsx`, `frontend/lib/api.d.ts`, `frontend/lib/subscription.d.ts`, frontend TypeScript/ESLint configuration, and package scripts/dependencies.
- Tests: `npm run lint`, `npm run typecheck`, and `npm --workspace frontend run build` pass.
- Manual steps for me: None.
- Problems / follow-ups: Remaining frontend and backend JavaScript is not yet strict-typechecked; continue with steps 0.1a.2 and 0.1b.
- Decisions: Split the original 0.1 migration into frontend and backend stages; further stage the frontend conversion to avoid leaving the application with hundreds of unresolved strict-type errors.

### 2026-11-21 — Step 0.1a.2 Shared frontend primitives
- Built: Converted the icon, logo, shared UI, admin helper, idle detector, and local-storage hook modules to TypeScript. Fixed strict types and React lint findings without weakening the configured checks.
- Files changed: `frontend/components/Icon.tsx`, `Logo.tsx`, `UI.tsx`, `frontend/components/admin/adminHelpers.ts`, `frontend/hooks/useIdleDetector.ts`, and `useLocalStorage.ts`.
- Tests: `npm --workspace frontend run typecheck`, `npm --workspace frontend run lint`, `npm --workspace frontend run build`, and `git diff --check` pass.
- Manual steps for me: None.
- Problems / follow-ups: The API client and remaining frontend modules are still JavaScript and are not yet strict-typechecked; continue 0.1a.2 in small slices.
- Decisions: Keep the API client migration as a separate slice because it is imported across many frontend routes and components.

### 2026-11-21 — Step 0.1a.2 Frontend providers
- Built: Converted theme and subscription contexts to typed providers, including explicit theme and context value types. Updated API declarations for session restoration and sign-out.
- Files changed: `frontend/lib/theme.tsx`, `frontend/lib/subscription.tsx`, and `frontend/lib/api.d.ts` (removed the former JavaScript providers and redundant subscription declaration).
- Tests: `npm --workspace frontend run typecheck`, `npm --workspace frontend run lint`, `npm --workspace frontend run build`, and `git diff --check` pass.
- Manual steps for me: None.
- Problems / follow-ups: The shared API client and remaining frontend modules are still JavaScript; proceed with 0.1a.2.
- Decisions: Keep API-client conversion separate because it is imported broadly across routes and components.

### 2026-11-21 — Step 0.1a.2 Shared API client
- Built: Converted the shared API client to TypeScript. Added typed auth/session and activity/analytics response boundaries, request input types, and explicit handling for endpoints that require a response body while preserving 204 behavior for no-content calls.
- Files changed: Renamed `frontend/lib/api.js` to `frontend/lib/api.ts` and consolidated its auth-user declarations, removing the former `api.d.ts`.
- Tests: `npm --workspace frontend run typecheck`, `npm --workspace frontend run lint`, `npm --workspace frontend run build`, and `git diff --check` pass. Confirmed no `any`, `@ts-nocheck`, or `ts-ignore` escapes in the migrated client.
- Manual steps for me: None.
- Problems / follow-ups: Remaining routes, components, and hooks are still JavaScript and are not yet strict-typechecked; continue 0.1a.2 in small slices.
- Decisions: Keep the existing API endpoint behavior and centralized client while incrementally tightening response types.

### 2026-11-22 — Step 0.1a.2 Shared routing and notifications
- Built: Converted the route guard and toast provider/hook to TypeScript, adding typed props, toast state, and context access. Preserved redirect, loading, auto-dismiss, and manual-dismiss behavior.
- Files changed: Renamed `frontend/components/RouteGuard.jsx` and `Toast.jsx` to `.tsx`.
- Tests: `npm --workspace frontend run typecheck`, `npm --workspace frontend run lint`, `npm --workspace frontend run build`, and `git diff --check` pass.
- Manual steps for me: None.
- Problems / follow-ups: Remaining frontend routes, components, and the timer hook are still JavaScript and are not yet strict-typechecked.
- Decisions: The toast hook throws when used outside its provider instead of silently dropping a notification.

### 2026-11-22 — Step 0.1a.2 Password recovery and email verification
- Built: Converted password recovery/reset and email-change verification components and their App Router pages to TypeScript. Added typed form events, recovery mode props, and safe message handling for API responses.
- Files changed: `frontend/components/PasswordRecoveryForm.tsx`, `EmailChangeVerification.tsx`, and the corresponding forgot-password, reset-password, and verify-email-change pages.
- Tests: `npm --workspace frontend run typecheck`, `npm --workspace frontend run lint`, `npm --workspace frontend run build`, and `git diff --check` pass.
- Manual steps for me: None.
- Problems / follow-ups: Other frontend components/routes and the timer hook remain to migrate.
- Decisions: Defer URL-token state initialization until after hydration to preserve server-rendered output and satisfy React lint.

### 2026-11-22 — Step 0.1a.2 Shared routing and notifications
- Built: Converted the route guard and toast provider/hook to TypeScript, adding typed props, toast state, and context access. Preserved the existing redirect, loading, auto-dismiss, and manual-dismiss behavior.
- Files changed: Renamed `frontend/components/RouteGuard.jsx` and `Toast.jsx` to `.tsx`.
- Tests: `npm --workspace frontend run typecheck`, `npm --workspace frontend run lint`, `npm --workspace frontend run build`, and `git diff --check` pass.
- Manual steps for me: None.
- Problems / follow-ups: Remaining frontend routes, components, and the timer hook are still JavaScript and are not yet strict-typechecked; continue 0.1a.2 in small slices.
- Decisions: Keep the shared notification context fail-fast if consumed outside its provider rather than silently dropping a toast.

### 2026-11-22 — Step 0.1a.2 Reveal component
- Built: Converted the intersection-observer reveal wrapper to TypeScript with typed children, class name, and element ref. Preserved the visible fallback for environments without `IntersectionObserver`.
- Files changed: Renamed `frontend/components/Reveal.jsx` to `Reveal.tsx`.
- Tests: `npm --workspace frontend run typecheck`, `npm --workspace frontend run lint`, `npm --workspace frontend run build`, and `git diff --check` pass.
- Manual steps for me: None.
- Problems / follow-ups: Remaining frontend modules and routes remain to migrate one at a time.
- Decisions: Deferred the no-observer visibility update to avoid a synchronous state update inside an effect.

### 2026-11-22 — Step 0.1a.2 Remaining frontend complete
- Built: Converted the remaining frontend App Router pages, marketing and contact components, employee/dashboard/monitoring views, charts, attendance, timer, and admin components/routes to TypeScript. Added explicit API/data types where needed and kept strict checking enabled.
- Files changed: Remaining `frontend/app/**/*.jsx`, `frontend/components/**/*.jsx`, and `frontend/hooks/useTimer.jsx` were renamed to `.tsx`; added related strict types in `frontend/lib/api.ts` and `frontend/components/admin/adminHelpers.ts`.
- Tests: `npm --workspace frontend run typecheck` and `npm --workspace frontend run build` pass. `npm --workspace frontend run lint` passes with five warnings in admin route pages (four internal `window.location.assign()` navigation warnings and one unnecessary callback dependency warning). `git diff --check` passes. Confirmed no `.js` or `.jsx` source files remain under `frontend/` outside generated output/dependencies.
- Manual steps for me: None.
- Problems / follow-ups: Resolve the five non-blocking lint warnings when touching those admin routes; backend JavaScript remains for step 0.1b.
- Decisions: Treat generated `.next` output and dependencies as build artifacts, not application source modules.

### 2026-11-20
- Added `docs/` with the 8 project documents.
- Switched trial from 7 to 14 days; added invite-code employee onboarding and business-email rule to the spec.

### Entry template (copy for each step)

```
### YYYY-MM-DD — Step X.Y <name>
- Built: …
- Files changed: …
- Tests: …
- Manual steps for me: … (env vars, dashboard settings)
- Problems / follow-ups: …
- Decisions: …
```

## 8. Manual setup checklist (things the AI cannot do)

- [X] MongoDB Atlas cluster and `MONGODB_URI`
- [X] Vercel: two projects (frontend root, `backend/` root) and env vars
- [X] Gmail account, verify sending domain, SMTP credentials
- [ ] Razorpay test and live keys, webhook URL + secret
- [ ] `CRON_SECRET` and Vercel Cron schedules
- [ ] Brand SVG logo exported to `public/brand/`
- [ ] Lawyer review of privacy policy and employee data notice