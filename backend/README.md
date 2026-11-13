# CalmWork backend

Express + JavaScript + Mongoose API for CalmWork. All API endpoints are versioned under `/api/v1`; the API landing page is `/api/docs` and the machine-readable contract is `/api/openapi.yaml`.

## Run locally

1. Copy `.env.example` to `.env`, set independent random `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `JWT_ADMIN_SECRET` values, and configure MongoDB and SMTP.
2. Use Node.js 20.19+ and run `npm install`
3. `npm run dev`

MongoDB must be reachable before the server starts. `GET /api/v1/health/live` is the liveness probe; `/api/v1/health/ready` also checks MongoDB readiness.

## Scripts

- `npm run dev` — watch-mode server
- `npm run build` — lint and validate the JavaScript source
- `npm run lint` — static lint
- `npm test` — Vitest unit and Supertest suite
- `npm run migrate:legacy` — add current workspace and subscription fields to legacy accounts and teams
- `npm run seed` — create an owner using `SEED_EMAIL`, `SEED_PASSWORD` (12+ characters), and `SEED_NAME` environment variables
- `npm start` — start the API server

Run `npm run migrate:legacy` once when upgrading a database created by a legacy release. The migration validates all affected workspace and subscription references before updating accounts and teams. It adds the current fields while retaining the legacy fields and collections, so existing records are not deleted.

From the repository root, `docker compose --env-file backend/.env -f backend/docker-compose.yml up --build` runs the API and MongoDB using the local-only values in `backend/.env`.

Business owners create accounts with a name, business name, email, and password. Employees establish password accounts through invitation links. Users sign in with email and password or request a one-time email/SMS code; SMS sign-in requires an enrolled phone number. Password reset links and email codes are delivered by SMTP, and reset links are single-use and time-limited. The single platform administrator uses `/admin/login` with `OPS_ADMIN_EMAIL` and a database-backed password initialized from `OPS_ADMIN_INITIAL_PASSWORD`. Configure `OPS_ADMIN_NAME`, `OPS_ADMIN_EMAIL`, and a unique initial password in the API environment; remove the initial password variable after the administrator credential is first created. Admin sessions use a separate HTTP-only cookie and are invalidated when the password is reset.

## Security and privacy

Passwords use bcrypt cost 12. Access tokens are short-lived JWTs; refresh tokens are random, hashed at rest, rotated on every refresh, and family-revoked when reuse is detected. Refresh tokens are only returned in an HTTP-only cookie. Tenant IDs are derived from the authenticated user, never accepted as caller-controlled scope.

MongoDB indexes (including tenant uniqueness, refresh-token expiry, and invitation expiry indexes) are created on production startup before the API listens. For large pre-existing databases, schedule index builds as part of a maintenance deployment.

Pulse responses contain only team/workspace identifiers, week, and three bounded ratings. Optional comments are discarded. User-linked weekly receipts are stored separately from response records. Team aggregates, alerts, and reports omit groups below five responses; no individual pulse response/comment is exposed. Activity records are visible to their owner only.

## Burnout score and alerts

The weekly team score normalizes each rating to a 0–100 risk value:

- stress risk = `(average stress - 1) / 4 × 100` (30% weight)
- workload risk = `(average workload - 1) / 4 × 100` (25% weight)
- inverse mood risk = `(5 - average mood) / 4 × 100` (25% weight)
- participation risk = `(1 - submitted / active team members) × 100` (20% weight)

The base score is the weighted sum of those four values. A positive increase in that base score from the prior eligible week is capped at 100 and contributes 10% to the final score; the base contributes 90%. When no eligible previous week exists, the change contribution is zero. Scores below 40 are low, 40–64 are medium, and 65–100 are high. Analytics are emitted only when the response count meets the organization's `minGroupSize`. Aggregated planned task minutes, meeting minutes, and approved leave days can additionally influence burnout scoring without exposing task details or individual pulse responses.

The evaluator opens a deduplicated team/type alert for burnout risk at score 40 or higher, stress increases of at least 15% for three consecutive eligible weeks, mood at or below 2.5, or participation falling from at least 70% to 50% or less. It runs after pulse submission and on a scheduled UTC cron. Alerts contain only aggregate metrics and never identify respondents.

Razorpay subscriptions are optional for local startup. Configure a Razorpay key ID, key secret, webhook secret, and the six recurring plan IDs to enable checkout. Webhook signatures are verified against the raw request body and processed events are deduplicated. Payment details are entered on Razorpay-hosted checkout pages; CalmWork does not accept or store card numbers or CVCs.

The weekly cron job scores eligible aggregated pulse data and creates at most one alert per team/week. A reminder job runs every minute on a persistent server, claiming due calendar reminders and emailing the event owner through the configured SMTP provider.

Workspace owners/admins can create members using `POST /api/v1/workspace/invitations`; the API returns a one-time, seven-day acceptance token. The token is hashed at rest. The People page creates a shareable acceptance link, and an invitee uses the link to set their name and password and join.

The `/api/v1/tools` routes provide tenant-scoped planner, calendar, leave, signature acknowledgment, and employee-only salary estimate workflows. Salary input is ephemeral and is not stored. Electronic signatures in this workflow are acknowledgments with an integrity hash, not a third-party qualified digital-signature service.

The built-in rate limiter uses Express's per-process store. Use a single API instance or add a shared store/API gateway limit before running multiple API replicas.

## Deploy to Vercel

Create a separate Vercel project for this API and set its Root Directory to `backend`. `src/server.js` exports a request handler for Vercel, and `vercel.json` routes all paths to that handler. Database connections are initialized lazily and reused when the function instance is warm; CORS preflight requests are answered without requiring a database connection, and database connection errors pass through Express so allowed frontend origins still receive CORS headers. Add the required production environment variables from `.env.example` in the Vercel project settings, including a hosted MongoDB URI, all three independent JWT secrets, SMTP credentials, `COOKIE_SECURE=true`, the frontend URL, and the frontend origin in `CORS_ORIGINS`. Set `OPS_ADMIN_EMAIL` and `OPS_ADMIN_NAME` for the one platform administrator. Set `OPS_ADMIN_INITIAL_PASSWORD` before the first administrator login to initialize the credential, then remove it after initialization; password reset is performed by email. Set `CORS_ORIGINS` to the frontend origin (scheme and host, no path); a trailing slash is ignored. Production cookies use `SameSite=None; Secure` for cross-origin frontend/API requests. Browser third-party-cookie restrictions can still affect separate default `*.vercel.app` domains, so custom frontend and API domains under the same registrable domain are recommended. Do not deploy with local MongoDB or development secrets.

Vercel functions are not persistent servers, so the in-process scheduled alert, trial-expiration, and calendar-reminder jobs are not reliable there. Configure an external scheduler to invoke equivalent maintenance tasks, or deploy the API on a persistent Node.js host if those jobs must run on schedule.

## Tests

Tests use `mongodb-memory-server` and Supertest; no external MongoDB is required. The in-memory server may need to download the matching MongoDB binary on first run.
