# CalmWork — Product Requirements Document (PRD)

Version 1.0 · Live site: https://employee-micro-feedback-and-monitor-omega.vercel.app/
Repo: bhshrish/Employee-Micro-Feedback-and-Monitoring-System

---

## 1. Summary

CalmWork is a B2B web app that helps companies notice employee burnout early. Employees give short, anonymous weekly wellbeing check-ins and use personal productivity tools. Businesses see aggregated team signals, get alerts when a team's wellbeing drops, and download reports.

Positioning: **"A calmer way to know how work feels."** Private personal insights. Anonymous team signals. No screen surveillance.

## 2. Problem

- Companies find out about burnout when a strong performer resigns or goes on leave.
- Existing tools (We360.ai, Apploye) are activity-monitoring products: screenshots, live feeds, idle-time detection. Employees distrust them, and they measure work, not how people feel.
- Burnout is a workload problem (WHO: chronic workplace stress that has not been managed). Data should trigger a caring conversation, never a penalty.

## 3. Target users

| Persona | Who | Goal |
|---|---|---|
| **Business Owner / HR (Business Admin)** | Founder, HR lead, people-ops at a company with 10–500 staff. Uses a **business email**. | See team morale trends, catch overload early, act before attrition. |
| **Team Manager** (phase 2) | Line manager invited by the Business Admin. | See their own team's aggregated scorecard and alerts. |
| **Employee** | Any staff member. Can use a **normal (personal or work) email**. | Plan work, check in privately, trust that answers are anonymous. |
| **Platform Admin** | CalmWork staff. | Support, billing oversight, abuse handling. |

## 4. Product principles (non-negotiable)

1. **Human by default.** Signals prompt a conversation, never discipline.
2. **Anonymous wellbeing responses.** A business can never see who said what.
3. **Minimum group size.** Any aggregate based on fewer than **5** responses is suppressed (configurable, never below 5).
4. **Transparent.** Employees see exactly what the business can and cannot see (a "What my employer sees" page).
5. **No screen surveillance** in the MVP. No screenshots, no keystroke logging, no live view.

## 5. Business model

- **14-day free trial**, no credit card, full Business features. One trial per organization.
- After the trial: org moves to read-only until a paid plan is active (Razorpay).
- **Pay-per-report: ₹99** per generated PDF/CSV report (already shown on the live site).
- Open decision: recurring plan price (see Section 12).

## 6. Access model (who sees what)

| Data | Employee | Team Manager | Business Admin |
|---|---|---|---|
| Own profile, tasks, time, check-in history | Yes | No | No |
| Roster: name, email, team, role, invite status | Own row | Own team | All teams |
| Who completed this week's check-in (participation yes/no) | Own | Own team (count only) | Count per team; names only if org enables "participation visibility" |
| Wellbeing answers (mood, stress, workload, free text) | Own only | Never individual | **Never individual.** Aggregates only, min group 5 |
| Aggregated team scores, trends, burnout risk band | Own team summary | Own team | All teams |
| Per-employee work-hours/time summary (from the planner timer) | Own | Own team | All, **only for employees who accepted the org's data notice at join** |
| Reports | No | Own team (if permitted) | Yes |

"The business has access to employee data" is implemented as: roster, participation, time summaries, and aggregated wellbeing. Individual wellbeing answers stay private. This keeps the "anonymous" promise honest.

## 7. Core features (MVP)

### 7.1 Marketing site (public)
Home, Features, How it works, Pricing, About, Contact, Privacy, FAQ.
CTAs: **Start free trial** (14 days) and **View demo**.

### 7.2 Demo
- `/demo` is an interactive, read-only sandbox with seeded sample data (a fictional company, 4 teams, 12 weeks of history).
- No sign-up needed. "Start free trial" banner is always visible.
- Optional "Book a live demo" form (name, work email, company size) that emails the sales inbox.

### 7.3 Business authentication
- Business sign-up requires a **business email** (free providers blocked: gmail, yahoo, outlook, hotmail, proton, icloud, etc.).
- Email verification by OTP or link before first login.
- Sign-in: email + password (+ OTP as step 2). Forgot/reset password.
- Creating a business account starts the 14-day trial and creates the **Organization**. The email domain is stored as the org's `domain`.

### 7.4 Organization and teams
- Business Admin creates an organization (company name, size, industry).
- Creates teams (e.g. Engineering, Support, Sales). Name, description, optional manager.
- Edit, archive, move employees between teams.

### 7.5 Employee invitations
- Admin invites by email (single or CSV bulk, up to 100 per upload) into a chosen team.
- System sends an email with a **unique invitation code** (format `CALM-XXXX-XXXX`) and a join link.
- Codes: single-use, bound to the invited email, expire in 7 days, can be resent (old code invalidated) or revoked.
- Employee activates with email + invitation code, then sets a password.
- **Employees cannot sign in or register without an invitation code.** Employees may use any valid email.

### 7.6 Employee app
- **Dashboard:** today's plan, wellbeing score, check-in prompt.
- **Weekly wellbeing check-in:** 6 short questions (mood, stress, workload, sleep/energy, support from manager, free text). Anonymous. About 2 minutes.
- **Productivity planner:** tasks with estimates, calendar, meetings, reminders, simple start/stop timer.
- **Private insights:** personal trend of own check-ins (visible only to the employee).
- **Leave application** and **document e-signature** (phase 2).

### 7.7 Business dashboard
- Org overview: average wellbeing (1–5), participation rate, burnout-risk bands per team (Healthy / Watch / At risk), trend vs last week.
- Team scorecards with 12-week trend.
- **Workload balance view:** Healthy / Overburdened / Underutilized per team, based on planner estimates vs tracked hours (team level first).
- **Alerts:** rule-based triggers (see 7.8) with suggested conversation prompts, never accusations.
- Employee roster with invite status and per-employee time summaries (per the access model).

### 7.8 Alert rules (MVP)
- Team average wellbeing drops by 0.7 or more for 2 consecutive weeks.
- Team average stress at or above 4.0 for 2 consecutive weeks.
- Participation drops below 40% for 2 weeks (a signal in itself).
- Sustained overtime: team average weekly tracked hours above the configured norm for 3 weeks.
- Alerts only fire when the group size meets the minimum (5).
- Every alert includes a "How to open the conversation" tip and a link to resources.

### 7.9 Reports (free)
- Admins and managers choose a date range and metrics, then download an aggregated PDF or CSV at no charge.
- Reports contain aggregated data only.

### 7.10 Billing
- Trial banner with days left. At day 14, the org becomes read-only.
- Razorpay for subscriptions.

### 7.11 Platform Admin (separate login)
Org list, trial and payment status, user lookup, suspend/restore, audit log.

## 8. Demo accounts (developer testing, seeded)

See `05-BACKEND-DATA-MODEL.md` §9 for the exact seed. Summary:

| Role | Email | Notes |
|---|---|---|
| Business Admin | `owner@acme-demo.example` | Org "Acme Demo Co", trial day 3 |
| Business Admin | `hr@northwind-demo.example` | Org "Northwind Demo", trial expiring tomorrow |
| Business Admin | `founder@lumen-demo.example` | Org "Lumen Demo", trial expired (tests paywall) |
| Employee | `priya.demo@personalmail.example` | Active, Acme / Engineering |
| Employee | `sam.demo@personalmail.example` | Active, Acme / Support |
| Employee | `invite.pending@personalmail.example` | Invited, not yet activated (tests invite code flow) |

All demo emails use the reserved `.example` TLD so no real mailbox can receive them. In development, outgoing mail is caught by Mailpit.

## 9. Competitive reference and our differentiation

| Capability | We360.ai / Apploye | CalmWork |
|---|---|---|
| Free trial | 7-day (We360) / free start (Apploye) | **14 days, no card** |
| Demo | Book demo + live demo | Interactive sandbox + book demo |
| Screenshots, live view, app/URL tracking | Core feature | **Not in MVP** (later, opt-in only) |
| Wellbeing / burnout | Inferred from activity data | **Self-reported, anonymous, aggregated** |
| Burnout guidance | Healthy / Overburdened / Underutilized view | Same workload view + anonymous check-ins + conversation prompts |
| Time tracking and reports | Yes | Yes, lightweight, employee-owned |

Borrowed from We360's burnout guide: team-level first, say what you track, act with support not penalties, combine data with anonymous check-ins.
Borrowed from Apploye: role levels (owner / manager / member), start-free CTA, live demo, offline-friendly tracker, exportable reports.

## 10. Success metrics

- Trial to paid conversion at or above 10%.
- Employee check-in participation at or above 60% per org.
- Median invite to activation under 24 hours.
- Time-to-first-insight (sign-up to first team score) under 7 days.

## 11. Out of scope (MVP)

- Per-employee wellbeing visibility to anyone but the employee.
- Payroll, invoicing, client billing.
- Native mobile apps (responsive web only).
- SSO / SAML, HRIS integrations, Slack/Teams bots.
- AI-generated diagnosis or "burnout score per person". CalmWork never diagnoses anyone.
- Multi-language UI (English first, INR pricing).

Later phases (not now): opt-in screen-capture module, salary checker, SSO, integrations, mobile apps.

## 12. Open decisions

1. Recurring plan price after the trial (live site currently says "pay only per report, ₹99").
2. Whether participation names are visible to admins by default (default in this doc: counts only).
3. Whether employees may keep using free personal tools after their org's trial ends.
4. Backend hosting (default chosen in tech stack doc).

## 13. Legal and safety notes

- Employee monitoring and data laws vary by place. Get a lawyer's review before launch (India DPDP Act, and GDPR if serving EU users).
- CalmWork is not a medical product. Show a standard "not medical advice; talk to a doctor or mental health professional" notice on wellbeing pages.
- Include a crisis/support resources page reachable from the check-in.