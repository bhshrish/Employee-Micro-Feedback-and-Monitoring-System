# CalmWork — User Flow / App Flow

Notation: `[Screen]` = page, `→` = navigation, `⚠` = edge case. Routes use a trailing slash (the live site uses `/pricing/`, `/login/`).

---

## 0. Route map

| Area | Route | Access |
|---|---|---|
| Public | `/`, `/pricing/`, `/about/`, `/contact/`, `/privacy/`, `/demo/` | Anyone |
| Auth | `/login/` (tabs: Business, Employee, Admin), `/login/?mode=signup`, `/join/` (employee invite), `/forgot-password/`, `/reset-password/`, `/verify/` | Guest only |
| Business | `/business/dashboard/`, `/business/teams/`, `/business/teams/[id]/`, `/business/people/`, `/business/invites/`, `/business/alerts/`, `/business/reports/`, `/business/billing/`, `/business/settings/` | Business Admin (Manager: scoped) |
| Employee | `/app/dashboard/`, `/app/check-in/`, `/app/planner/`, `/app/insights/`, `/app/privacy/` ("What my employer sees"), `/app/settings/` | Employee |
| Platform admin | `/admin/orgs/`, `/admin/users/`, `/admin/audit/` | Platform Admin |

---

## 0b. Email delivery (Nodemailer)

**All emails in every flow below are sent by the backend using Nodemailer** through one shared `sendMail()` service (`backend/src/services/mail.service.ts`). No other email library or provider SDK is used.

- Transport: Nodemailer SMTP transport configured from env (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`).
- Development: SMTP points to Mailpit (`localhost:1025`, inbox UI at http://localhost:8025). Nothing leaves the machine.
- Production: SMTP points to Resend (or any SMTP provider) with a verified sending domain.
- Emails are rendered from templates in `backend/src/emails/` and sent from the API (never from the browser).
- Sending failures never block the user action: the request succeeds, the failure is logged (without codes or tokens), and the email is retried up to 3 times with backoff. Invite emails that still fail show "Delivery failed" with a Resend action.
- Emails sent by flow:

| Flow | Email |
|---|---|
| Business sign-up | Verification OTP |
| Business / admin sign-in | Login OTP |
| Forgot password | Reset link |
| Invite employee / resend | Invitation code + join link |
| Trial lifecycle | Welcome, day 7, day 12, trial ended |
| Weekly check-in | Reminder |
| Alerts | Alert digest |
| Reports | Report ready |
| Contact / book a demo | Notification to the sales inbox |

---

## 1. Visitor to trial (business)

1. `[Home]` → CTA **Start free trial** or **View demo**.
2. **View demo** → `[Demo sandbox]`: seeded read-only business dashboard. Persistent banner: "You're viewing sample data. Start your free 14-day trial." Any write action shows a tooltip "Available in your trial".
3. **Start free trial** → `[Sign up: Business]`: fields: full name, **business email**, company name, password, accept terms.
4. Submit → validate:
   - ⚠ Free-provider email (gmail, yahoo, outlook, hotmail, proton, icloud…): inline error "Please use your work email."
   - ⚠ Email already registered: "An account exists. Sign in or reset your password."
   - ⚠ Weak password: show requirements inline.
5. Create user (unverified) + organization (trial starts at **verification**, not sign-up). Send the verification email **via Nodemailer** with a 6-digit OTP (10 min expiry).
6. `[Verify email]` → enter OTP.
   - ⚠ Wrong OTP: remaining attempts shown (max 5, then 15-min lock).
   - ⚠ Expired: "Resend code" (60s cooldown).
7. Verified → trial starts (`trialEndsAt = now + 14 days`) → `[Onboarding wizard]` (3 steps, skippable):
   1. Confirm company (name, size, industry).
   2. Create first team.
   3. Invite employees (paste emails or CSV) or "Do this later".
8. → `[Business dashboard]` with empty state ("Invite your first team to see signals") and trial banner "14 days left".

## 2. Business sign-in

1. `[Login: Business tab]` → email + password.
2. Valid → send login OTP email (Nodemailer) → `[OTP step]` → dashboard.
3. ⚠ Wrong credentials: generic "Email or password is incorrect" (never reveal which).
4. ⚠ 5 failed attempts: 15-minute lockout, email notice.
5. ⚠ Unverified account: redirect to `[Verify email]`.
6. ⚠ Wrong tab (employee email on Business tab): "This looks like an employee account. Use the Employee tab."
7. **Forgot password** → enter email → always show "If an account exists, we sent a link" (reset email sent via Nodemailer only when the account exists) → `[Reset password]` (token valid 30 min, single use) → success → back to sign-in.

## 3. Create teams

1. `[Teams]` → **New team** → modal: name (required, unique within org), description, manager (optional).
2. ⚠ Duplicate name: inline error.
3. Team card shows member count, invite status, and "Scorecard unlocks at 5 responses".
4. Edit/archive: ⚠ Archiving a team with active members requires choosing a destination team.

## 4. Invite employees (business side)

1. `[Invites]` → **Invite employees** → choose team → enter emails (comma/line separated) or upload CSV (`email,name`).
2. Validate each row:
   - ⚠ Invalid format: row flagged, others still sent.
   - ⚠ Duplicate in file: de-duplicated.
   - ⚠ Already a member of another team in this org: "Move instead?"
   - ⚠ Already invited (pending): offer **Resend** (generates a new code, old one invalidated).
   - ⚠ Over 100 rows: reject with message.
   - ⚠ Trial expired / org read-only: block with upgrade prompt.
3. On send: create invite records, then send each person an email via Nodemailer: invitation code `CALM-XXXX-XXXX`, join link `/join/?code=…`, company name, plain-language note on what the employer can and cannot see.
4. `[Invites list]` statuses: **Pending / Accepted / Expired / Revoked**. Actions: Resend, Revoke, Copy code.
5. ⚠ Nodemailer send error or bounce: status "Delivery failed" with retry (see §0b).

## 5. Employee onboarding (invitation code required)

1. Employee opens email → clicks link (code prefilled) **or** goes to `/login/` → Employee tab → "I have an invitation code".
2. `[Join]` step 1: enter **email + invitation code**.
   - ⚠ Code not found / wrong: "That code isn't valid. Check the email or ask your admin to resend." (generic; rate-limited to 5 tries/15 min per IP+email).
   - ⚠ Code expired: "This code has expired. Ask your admin to send a new one."
   - ⚠ Code already used: "This invitation has already been used. Try signing in."
   - ⚠ Revoked: same message as invalid.
   - ⚠ Email doesn't match the invited email: invalid message.
   - ⚠ Org trial expired/suspended: "Your organization's workspace is paused."
3. Step 2: **Data notice** (required): plain-language list of what the employer sees (roster, participation, time summary) and never sees (individual check-in answers). Checkbox "I understand".
4. Step 3: set name and password (employee may use any email; no business-email rule).
5. Activate: mark invite accepted, create user, add to team → `[Employee dashboard]` with a short 3-card tour.
6. ⚠ Employee tries to **sign up without a code** (`/login/?mode=signup` on Employee tab): show "Employee accounts are created by invitation. Ask your admin for a code."
7. ⚠ A user invited to two orgs: v1 supports one org per user; second invite shows "You already belong to an organization."

## 6. Employee sign-in (returning)

1. `[Login: Employee tab]` → email + password → (optional OTP if the org enabled 2-step) → dashboard.
2. ⚠ Account deactivated by admin: "Your access has been removed. Contact your admin."
3. ⚠ Forgot password: same flow as business.

## 7. Weekly check-in (employee)

1. Dashboard card "Your check-in is ready · 2 minutes · Anonymous". Reminder email/in-app every Monday (configurable).
2. `[Check-in]` one question per screen: mood, stress, workload, energy/sleep (1–5 scale with labels), manager support (1–5), optional free text.
3. Submit → thank-you screen with the employee's own trend and a "Resources" link.
4. ⚠ Already submitted this week: show "Done for this week" and the option to view history only.
5. ⚠ Leave mid-way: draft kept locally; nothing sent until Submit.
6. ⚠ Free-text contains crisis language (keyword match): show supportive resources inline; do NOT notify the employer.
7. Anonymity: server stores `userId` only in a separate participation record; answer records contain `orgId`, `teamId`, `weekStart`, no `userId`. See data model.

## 8. Planner (employee)

`[Planner]` → add task (title, estimate, due date) → start/stop timer → mark done. Calendar view with meetings and reminders.
- ⚠ Timer left running over 10 hours: auto-stop prompt next visit.
- ⚠ Offline: queue changes locally, sync on reconnect.

## 9. Business dashboard and alerts

1. `[Dashboard]`: org wellbeing score, participation, risk band per team, trend arrows, active alerts.
2. Click a team → `[Team scorecard]`: 12-week trend, drivers (stress, workload), participation, workload balance (Healthy / Overburdened / Underutilized).
3. ⚠ Team has fewer than 5 responses: show "Not enough responses to protect anonymity" (no numbers).
4. ⚠ A team shrinks below 5 members: scorecard hides; past aggregates remain only at org level.
5. `[Alerts]`: list with severity, rule that fired, suggested conversation prompt. Actions: Acknowledge, Snooze 7 days, Add note.
6. `[People]`: roster, invite status, per-employee time summary (only employees who accepted the notice).

## 10. Reports and payment

1. `[Reports]` → **New report**: date range, metrics, format (PDF/CSV).
2. Preview (aggregated) → **Pay ₹99** → Razorpay checkout.
3. Payment success (verified by webhook, not by the client redirect) → report generated → Download. Reports stay available 30 days.
4. ⚠ Payment fails/cancelled: report stays "Awaiting payment"; no download.
5. ⚠ Webhook delayed: show "Confirming payment…" and poll for 60s.
6. ⚠ Double click on pay: idempotency key per report.

## 11. Trial lifecycle

| Day | Event |
|---|---|
| 0 | Verified, trial starts, welcome email |
| 7 | Mid-trial email with setup tips |
| 12 | "2 days left" email and in-app banner |
| 14 | Trial ends: org becomes **read-only** (data kept) |
| 14 + 30 | Data retention reminder |
| 14 + 90 | Data scheduled for deletion unless subscribed (warn 14 days before) |

- Read-only state: can view dashboards, cannot invite, create teams, or generate reports. Employees can still view their own data; new check-ins pause.
- ⚠ Trial abuse: one trial per business email domain.
- ⚠ Upgrade: paying immediately restores full access.

## 12. Platform admin

`/login/` → Admin tab → email + password + OTP → `[Orgs]` list (trial status, seats, last active) → org detail (suspend/restore, extend trial, resend invites) → every action written to the audit log. Admins cannot read check-in answers either.

## 13. Global edge cases

- Session expires: redirect to the correct login tab with a "Please sign in again" message and return-to path.
- Role mismatch: employee visiting `/business/*` gets a 403 page with a link back to their dashboard.
- Network error: inline retry, never lose form input.
- 404/500: calm, branded error pages.
- Empty states always explain the next step in one sentence.