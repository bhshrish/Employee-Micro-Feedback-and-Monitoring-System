# CalmWork — Backend Structure & Data Model

Express + MongoDB (Mongoose) + JavaScript. Base path `/api/v1`. Everything is org-scoped.

---

## 1. Roles

`platform_admin` · `business_admin` · `manager` · `employee`

Every request: authenticate (JWT cookie) → authorize by role → scope by `orgId` from the token (never from the request body).

## 2. Collections

### users
```
_id, email (unique, lowercase), passwordHash, name,
role: 'platform_admin'|'business_admin'|'manager'|'employee',
orgId (null for platform_admin), teamId (employees/managers),
emailVerified: bool, status: 'active'|'deactivated',
dataNoticeAcceptedAt, failedLogins, lockedUntil, lastLoginAt,
createdAt, updatedAt
```
Index: `email` unique; `{orgId, role}`; `{orgId, teamId}`.

### organizations
```
_id, name, domain (from owner's business email), size, industry,
ownerId, minGroupSize (default 5, min 5),
participationVisibility: bool (default false),
plan: 'trial'|'paid'|'expired'|'suspended',
trialStartedAt, trialEndsAt, paidUntil,
createdAt
```
Index: `domain` unique (one trial per domain).

### teams
```
_id, orgId, name, description, managerId, archived: bool, createdAt
```
Index: `{orgId, name}` unique.

### invites
```
_id, orgId, teamId, email, codeHash, codeLast4,
status: 'pending'|'accepted'|'expired'|'revoked',
invitedBy, expiresAt (7 days), acceptedAt, acceptedUserId,
attempts, createdAt
```
Code format `CALM-XXXX-XXXX` (alphabet without 0/O/1/I), generated with `crypto.randomInt`, stored **hashed** (SHA-256 + pepper). Index: `{email, orgId, status}`, `codeHash`.

### otps
```
_id, userId or email, purpose: 'verify_email'|'login'|'reset_password',
codeHash, expiresAt, attempts, consumedAt
```
TTL index on `expiresAt`.

### checkins  (**anonymous**: no userId)
```
_id, orgId, teamId, weekStart (Monday, UTC date),
mood, stress, workload, energy, support (each 1–5),
text (optional, encrypted at rest), createdAt
```
No `userId`, no exact timestamp (store date only, jitter order). Index: `{orgId, teamId, weekStart}`.

### checkin_participation  (who has submitted, never linked to answers)
```
_id, orgId, teamId, userId, weekStart
```
Unique `{userId, weekStart}`. This enforces one check-in per week without linking identity to answers. **Do not store any shared id between `checkins` and `checkin_participation`.** Create both in the same request; do not log the pairing.

### tasks
```
_id, orgId, userId, title, estimateMin, dueAt, status, createdAt
```
### time_entries
```
_id, orgId, userId, taskId, startedAt, endedAt, source:'timer'|'manual'
```
### events
```
_id, orgId, userId, title, startsAt, endsAt, remindAt, type:'meeting'|'reminder'
```
### leave_requests (phase 2)
`_id, orgId, userId, type, from, to, reason, status, decidedBy, decidedAt`

### alerts
```
_id, orgId, teamId, rule, severity:'watch'|'attention',
metrics (aggregated snapshot), status:'open'|'acknowledged'|'snoozed',
snoozedUntil, note, createdAt
```
### team_weekly_stats  (precomputed aggregates)
```
_id, orgId, teamId, weekStart, responseCount, memberCount,
avgMood, avgStress, avgWorkload, avgEnergy, avgSupport, wellbeingScore,
participationRate, avgWeeklyHours, workloadBand
```
Written by a weekly job. If `responseCount < org.minGroupSize`, numeric fields are stored as `null`.

### reports
```
_id, orgId, requestedBy, params {from,to,metrics,format},
status:'awaiting_payment'|'paid'|'generating'|'ready'|'failed',
paymentId, fileKey, expiresAt, createdAt
```
### payments
```
_id, orgId, reportId, razorpayOrderId (unique), razorpayPaymentId,
amountPaise (9900), currency:'INR', status:'created'|'paid'|'failed',
signatureVerified, createdAt
```
### audit_logs
```
_id, orgId, actorId, action, targetType, targetId, ip, at
```
Append-only. Logs invites, role changes, exports, suspensions, report downloads.

## 3. Anonymity and k-threshold rules (enforce in the service layer, not the UI)

1. Check-in answers never contain `userId`.
2. Any aggregate query returns data only if `responseCount >= org.minGroupSize`, otherwise `{ suppressed: true }`.
3. Org-level aggregates also suppress when total responses < min.
4. No endpoint exposes raw `checkins` rows to business roles. Free text is never returned to business roles in v1.
5. Differencing guard: do not return stats for two overlapping groups that differ by fewer than `minGroupSize` people (e.g. don't allow date ranges that isolate one person's week).
6. Admins and platform staff cannot read `checkins` at all.

## 4. Auth design

- Sign-up (business): validate **business email** (blocklist in `utils/business-email.js`), hash password, create user + org (plan `trial`, dates set on verify), send OTP.
- Sessions: access JWT 15 min + rotating refresh JWT 7 days in httpOnly cookies. Refresh tokens stored hashed in `sessions`, revoked on logout/password change.
- Business/platform-admin login: password, then OTP step. Employee login: password (OTP optional per org).
- Employee activation requires `email + invite code`; code compared via hash, constant-time, rate-limited.
- Lockout: 5 failed attempts then 15 minutes. Generic error messages.
- CSRF: SameSite=Lax cookies + `Origin` check on mutating requests.
- Trial gate middleware `requireActiveOrg`: blocks writes when `plan` is `expired` or `suspended`.

## 5. API endpoints

Standard success: `{ "data": ... }`. Standard error:
```json
{ "error": { "code": "INVITE_EXPIRED", "message": "This code has expired.", "fields": { } } }
```

### Auth
| Method | Path | Notes |
|---|---|---|
| POST | `/auth/business/signup` | name, email, company, password. 400 `FREE_EMAIL_NOT_ALLOWED` |
| POST | `/auth/verify-email` | email, otp. Starts the trial |
| POST | `/auth/resend-otp` | 60s cooldown |
| POST | `/auth/login` | email, password, `portal: 'business'|'employee'|'admin'` |
| POST | `/auth/login/otp` | second step |
| POST | `/auth/employee/join` | email, inviteCode, name, password, acceptNotice |
| POST | `/auth/forgot-password` | always 200 |
| POST | `/auth/reset-password` | token, password |
| POST | `/auth/refresh`, `/auth/logout`, GET `/auth/me` | |

### Organization and teams (business_admin)
| Method | Path |
|---|---|
| GET/PATCH | `/org` |
| GET/POST | `/teams` |
| GET/PATCH/DELETE(archive) | `/teams/:id` |
| GET | `/people` (roster, filters, per-employee time summary) |
| PATCH | `/people/:id` (move team, deactivate, set manager) |

### Invites (business_admin)
| Method | Path | Notes |
|---|---|---|
| POST | `/invites` | `{ teamId, emails[] }` max 100, sends emails |
| POST | `/invites/bulk-csv` | CSV upload |
| GET | `/invites` | filter by status |
| POST | `/invites/:id/resend` | new code, old invalidated |
| POST | `/invites/:id/revoke` | |

### Employee
| Method | Path |
|---|---|
| GET | `/checkins/status` (this week done?) |
| POST | `/checkins` (creates anonymous answer + participation row) |
| GET | `/checkins/mine` (own trend, computed from a personal copy; see note) |
| GET/POST/PATCH/DELETE | `/tasks`, `/events` |
| POST | `/time/start`, `/time/stop`; GET `/time/summary` |
| GET | `/me/privacy` ("what my employer sees") |

Note on "own trend": to show the employee their own history without linking answers to identity, store the employee's personal history in a separate `my_checkins` collection keyed by `userId`, **never readable by business roles**, and never joined to `checkins`.

### Business insights
| Method | Path |
|---|---|
| GET | `/insights/overview` |
| GET | `/insights/teams/:id?weeks=12` |
| GET | `/insights/workload` |
| GET | `/alerts`; PATCH `/alerts/:id` (ack, snooze, note) |

### Reports and billing
| Method | Path | Notes |
|---|---|---|
| POST | `/reports/generate` | creates a free, aggregated PDF or CSV for an admin or manager |
| GET | `/reports/:reportId` | downloads the report within the current workspace |
| GET | `/billing/status` | trial days left, plan |

### Platform admin
`GET /admin/orgs`, `PATCH /admin/orgs/:id` (suspend, extend trial), `GET /admin/audit`.

### Jobs (Vercel Cron, `Authorization: Bearer CRON_SECRET`)
`POST /jobs/weekly-stats`, `/jobs/evaluate-alerts`, `/jobs/checkin-reminders`, `/jobs/trial-emails`, `/jobs/expire-trials`.

## 6. Data flows

**Invite to activation:** Admin POST `/invites` → create invite (hashed code) → email code + link → employee POST `/auth/employee/join` → verify email+code+status+expiry → create user, mark invite accepted, attach team → issue session.

**Check-in:** Employee POST `/checkins` → verify no row in `checkin_participation` for this week → write anonymous `checkins` + `checkin_participation` + `my_checkins` → weekly job aggregates into `team_weekly_stats` (applying k-threshold) → alert job evaluates rules → dashboard reads only `team_weekly_stats` and `alerts`.

**Report generation:** An authenticated admin or manager POSTs `/reports/generate` with the period, metrics, and format. The API stores an aggregated PDF or CSV and returns a download URL; no payment is required.

## 7. Validation, errors, security

- zod schema per endpoint; reject unknown fields.
- Rate limits: auth 10/min/IP, invite-code attempts 5/15 min per IP+email, global 300/min.
- Never reveal whether an email exists (login, forgot password, invite).
- Encrypt check-in `text` (AES-256-GCM, key from env).
- Mongoose queries always include `orgId`. Add an ESLint rule or helper `scoped(model, orgId)`.
- Error codes: `VALIDATION_ERROR`, `FREE_EMAIL_NOT_ALLOWED`, `INVALID_CREDENTIALS`, `LOCKED`, `INVITE_INVALID`, `INVITE_EXPIRED`, `INVITE_USED`, `TRIAL_EXPIRED`, `FORBIDDEN`, `NOT_FOUND`, `ALREADY_SUBMITTED`, `PAYMENT_FAILED`, `RATE_LIMITED`.

## 8. Email templates

`verify-otp`, `login-otp`, `invite` (code, join link, company, "what your employer can and can't see"), `reset-password`, `checkin-reminder`, `trial-welcome`, `trial-day7`, `trial-day12`, `trial-ended`, `report-ready`, `alert-digest`.

## 9. Demo seed (development and staging only)

Run `npm run seed` in `backend/`. Guard: refuses to run unless `SEED_DEMO=true` and `NODE_ENV !== 'production'`. In development, all mail goes to Mailpit (http://localhost:8025), and `NODE_ENV=development` also prints invite codes to the server console.

All addresses use the reserved `.example` TLD, so they can never reach a real mailbox. Business-email validation must therefore allow `.example` domains in dev/test (the free-provider blocklist is what blocks personal providers; `.example` is not on it).

### Business demo accounts (password: `Demo@12345`)

| Email | Org | State | Tests |
|---|---|---|---|
| `owner@acme-demo.example` | Acme Demo Co | Trial, day 3, 4 teams, 12 weeks of data, 3 open alerts | Main happy path, dashboards, reports |
| `hr@northwind-demo.example` | Northwind Demo | Trial ends tomorrow | Trial-ending banner, emails |
| `founder@lumen-demo.example` | Lumen Demo | Trial expired | Read-only mode, upgrade prompt |

### Employee demo accounts (password: `Demo@12345`)

| Email | Org / team | State |
|---|---|---|
| `priya.demo@personalmail.example` | Acme / Engineering | Active, 8 weeks of check-ins |
| `sam.demo@personalmail.example` | Acme / Support | Active, check-in due this week |
| `invite.pending@personalmail.example` | Acme / Engineering | **Invited, not activated.** Code `CALM-DEMO-7K4Q` (dev only, fixed) |

Also seed: an expired invite (`CALM-DEMO-EXP1`), a revoked invite (`CALM-DEMO-REV1`), and a used invite, so every error path is testable. Seed 5+ employees per Acme team so the k-threshold passes, and one small team (3 people) to test suppression.

Test-credential note: these passwords and codes exist only in the dev seed. Production must have `SEED_DEMO` unset, and the seed script must not be deployed to the production database.

### Public demo sandbox
`/demo` does not use these accounts. It renders from a static `demoData.json` (fictional company) and never calls authenticated endpoints.