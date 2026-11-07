# Workwell backend

Express + JavaScript + Mongoose API for Workwell. All API endpoints are versioned under `/api/v1`; the API landing page is `/api/docs` and the machine-readable contract is `/api/openapi.yaml`.

## Run locally

1. Copy `.env.example` to `.env`, set distinct random `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values, and configure MongoDB.
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

`docker compose up --build` runs the API and MongoDB. Configure the required Compose variables in the shell or an untracked backend `.env` file.

Set `OPS_ADMIN_PASSWORD` in the backend environment to enable the single platform operations admin login. The fixed username and email are `admin` and `admin@gmail.com`; the password is not stored in source code and must have at least 12 characters. If it is missing or too short, platform admin sign-in is disabled while organization routes remain available. The platform console is `/operations`; organization administrators use the separate `/admin` application and bearer-token RBAC.

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

The base score is the weighted sum of those four values. A positive increase in that base score from the prior eligible week is capped at 100 and contributes 10% to the final score; the base contributes 90%. When no eligible previous week exists, the change contribution is zero. Scores below 40 are low, 40–64 are medium, and 65–100 are high. Analytics are emitted only when the response count meets the organization's `minGroupSize`.

The evaluator opens a deduplicated team/type alert for burnout risk at score 40 or higher, stress increases of at least 15% for three consecutive eligible weeks, mood at or below 2.5, or participation falling from at least 70% to 50% or less. It runs after pulse submission and on a scheduled UTC cron. Alerts contain only aggregate metrics and never identify respondents.

Stripe is optional for local startup; billing actions return a service-unavailable error until configured. Stripe webhook signatures are verified against the raw request body and event IDs are persisted for idempotent processing. No card numbers or CVCs are accepted by the API.

The weekly cron job scores eligible aggregated pulse data and creates at most one alert per team/week. This backend does not send reminder emails because no mail delivery provider is configured.

Workspace owners/admins can create members using `POST /api/v1/workspace/invitations`; the API returns a one-time, seven-day acceptance token for `POST /api/v1/auth/accept-invitation`. The token is hashed at rest. The People page creates a shareable acceptance link; accepting it creates the employee account without signing in.

Password reset requests are delivered through the optional `PASSWORD_RESET_DELIVERY_URL` webhook, which receives JSON `{ "type": "password_reset", "to": "...", "resetUrl": "..." }`. `PASSWORD_RESET_DELIVERY_TOKEN` is sent as a bearer token when configured. Without a delivery URL, development responses include a reset token for local testing; production responses remain generic and do not disclose the token. Invitations remain shareable single-use links because no mail provider is built in.

The built-in rate limiter uses Express's per-process store. Use a single API instance or add a shared store/API gateway limit before running multiple API replicas.

## Deploy to Vercel

Create a separate Vercel project for this API and set its Root Directory to `backend`. `src/server.js` exports a request handler for Vercel, and `vercel.json` routes all paths to that handler. Database connections are initialized lazily and reused when the function instance is warm; CORS preflight requests are answered without requiring a database connection, and database connection errors pass through Express so allowed frontend origins still receive CORS headers. The scheduled jobs only start when running the persistent local server. Add the required production environment variables from `.env.example` in the Vercel project settings, including a hosted MongoDB URI, distinct JWT secrets, `COOKIE_SECURE=true`, the frontend URL, and the frontend origin in `CORS_ORIGINS`. Set `OPS_ADMIN_PASSWORD` to a password of at least 12 characters to enable platform admin sign-in; without it, other API routes remain available. Set `CORS_ORIGINS` to the frontend origin (scheme and host, no path); a trailing slash is ignored. Production cookies use `SameSite=None; Secure` for cross-origin frontend/API requests. Browser third-party-cookie restrictions can still affect separate default `*.vercel.app` domains, so custom frontend and API domains under the same registrable domain are recommended. Do not deploy with local MongoDB or development secrets.

Vercel functions are not persistent servers, so the in-process scheduled alert and trial-expiration jobs are not a reliable scheduler there. Configure an external scheduler to invoke equivalent maintenance tasks, or deploy the API on a persistent Node.js host if those jobs must run on schedule.

## Tests

Tests use `mongodb-memory-server` and Supertest; no external MongoDB is required. The in-memory server may need to download the matching MongoDB binary on first run.
