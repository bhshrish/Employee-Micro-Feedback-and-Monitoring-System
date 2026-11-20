# CalmWork — Progress & Decision Log

Paste this file at the start of any new AI session. Update it at the end of every step. Newest entries first within each section.

Last updated: 2026-11-20

---

## 1. Current status

- **Phase:** Documentation complete. Implementation not yet started against these docs.
- **Next step:** Plan step **0.1 Repo hygiene** (see `06-IMPLEMENTATION-PLAN.md`).
- **Live site:** https://employee-micro-feedback-and-monitor-omega.vercel.app/ (frontend only, mock data in `lib/api.ts`)
- **Repo:** https://github.com/bhshrish/Employee-Micro-Feedback-and-Monitoring-System

## 2. Done

- [x] Frontend Next.js app deployed on Vercel with public pages (Home, Pricing, About, Contact, Privacy) and a login page.
- [x] Brand defined: CalmWork (teal `#177687`, yellow `#FFDD00`, cream `#FFFCF1`, Figtree).
- [x] 8 project docs written (PRD, user flows, tech stack, frontend guidelines, backend/data model, implementation plan, CLAUDE.md, this log).

## 3. In progress

- (nothing yet)

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

- [ ] MongoDB Atlas cluster and `MONGODB_URI`
- [ ] Vercel: two projects (frontend root, `backend/` root) and env vars
- [ ] Resend account, verify sending domain, SMTP credentials
- [ ] Razorpay test and live keys, webhook URL + secret
- [ ] `CRON_SECRET` and Vercel Cron schedules
- [ ] Brand SVG logo exported to `public/brand/`
- [ ] Lawyer review of privacy policy and employee data notice