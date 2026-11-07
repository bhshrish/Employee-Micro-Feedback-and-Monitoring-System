# PULSE

PULSE is an employee feedback and burnout-monitoring application. This repository contains a Next.js frontend in [`frontend/`](./frontend/) and a separately deployable Express REST API in [`backend/`](./backend/). Both applications are JavaScript; the API is the source of truth for authentication, organization-scoped data, time sessions, anonymous pulses, analytics, billing, and reports.

## Requirements

- Node.js LTS (20 or newer recommended)
- npm
- MongoDB 7 or newer (local or hosted)
- Stripe test-mode keys for billing and webhook testing

## Setup

```bash
npm ci
cp backend/.env.example backend/.env
```

Set the required secrets and service URLs in `backend/.env`; never commit that file. Start MongoDB, then run the API in development mode:

```bash
docker compose -f backend/docker-compose.yml up -d
npm run api:dev
```

The API listens on the configured `PORT` (default `4000`). Use `GET /health` for liveness and `GET /health/ready` to verify its MongoDB connection. The OpenAPI reference is served at `/api/docs`. Creating an account does not sign you in; after signup, sign in with the new credentials to open the workspace. Email addresses and passwords are case-sensitive and must be entered with the same capitalization used at signup.

Keep the API running, then start the frontend in a second terminal with `npm run dev` (or `npm --workspace frontend run dev`). The login page connects to `http://localhost:4000/api/v1` by default, so login and signup will not work until MongoDB and the API are available. Set `NEXT_PUBLIC_API_URL` when the API is hosted elsewhere, and include the frontend origin in the API's `CORS_ORIGINS`.

## Deploy both apps to Vercel

Deploy the frontend and API as **two separate Vercel projects** from this repository. MongoDB must be hosted separately (for example, MongoDB Atlas).

1. Create a Vercel project for the frontend, select this repository, and set **Root Directory** to `frontend`. Note its production URL. Create a second project for the API from the same repository and set **Root Directory** to `backend`.
2. Add the production backend variables listed in [`backend/.env.example`](./backend/.env.example) to the API project's settings. Required values include:
   - `NODE_ENV=production`
   - `MONGODB_URI` for a hosted database
   - Two distinct, randomly generated secrets of at least 32 characters for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
   - `FRONTEND_URL` set to the frontend's production URL
   - `CORS_ORIGINS` set to the exact frontend production origin (scheme and host, no path)
   - `COOKIE_SECURE=true`
3. Deploy the API. Its base URL is the Vercel deployment URL; confirm `GET /health` responds with `{"status":"ok"}`.
4. Set `NEXT_PUBLIC_API_URL` in the frontend project to the API URL plus `/api/v1` (for example, `https://your-api.vercel.app/api/v1`), then deploy the frontend.
5. Test signup/sign-in and refresh-token behavior on the deployed frontend. For Stripe, configure the production Stripe variables and point the Stripe webhook at `https://your-api.vercel.app/api/v1/billing/webhook`.

Add these variables to the Vercel project settings, not to source control. Use custom frontend and API domains under the same registrable domain for production authentication (for example, `app.example.com` and `api.example.com`): the refresh cookie is `SameSite=Lax`, and separate default `*.vercel.app` domains may treat frontend-to-API requests as cross-site. Leave `COOKIE_DOMAIN` unset unless you have a specific domain-cookie requirement. Vercel functions are not persistent servers, so the API's in-process alert and trial-expiration jobs do not run reliably there; use an external scheduler or a persistent host if those jobs are required.

## Environment

See [`backend/.env.example`](./backend/.env.example) for the complete variable list and descriptions. At minimum configure `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `CORS_ORIGINS`. Stripe test-mode credentials and plan price IDs are required to enable checkout and billing. Secrets must be strong, unique values in deployed environments.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run api:dev` | Run the backend with the development watcher |
| `npm run start:api` | Start the compiled backend |
| `npm run build:api` | Lint/check the JavaScript backend |
| `npm run build:web` | Build the Next.js frontend |
| `npm run build` | Build backend and frontend |
| `npm run lint` | Lint the backend |
| `npm test` | Run backend unit and integration tests |
| `npm run seed` | Populate the configured database with sample data |

For local MongoDB, the provided Compose service can be started with the setup command above and stopped with:

```bash
docker compose -f backend/docker-compose.yml down
```

## Architecture

The API follows strict layers: routes perform validation and authentication, controllers translate HTTP input/output, services contain business logic, and Mongoose models own persistence. Services do not access Express request or response objects. All protected records are scoped to the organization in the verified access token.

Pulse answers do not contain a user identifier. A separate submission record enforces one response per user and ISO week without linking participation records to answers. Team analytics suppress groups below the organization's configured minimum size.

Burnout analytics combine normalized stress, workload, inverse mood, participation, and week-over-week movement. The formula, alert evaluation, and thresholds are documented in the backend README.

## API overview

Versioned JSON routes are under `/api/v1`: authentication, user and team administration, time sessions, weekly pulses, manager-only aggregate analytics, alerts, Stripe billing, and subscription-gated reports. Responses use `{ "data": ... }` on success and `{ "error": { "code": ..., "message": ... } }` on failure. See the OpenAPI document at [`backend/openapi.yaml`](./backend/openapi.yaml).

Stripe is configured in test mode. The webhook endpoint verifies Stripe signatures against the raw request body and deduplicates processed events.

## Security notes

- Configure the CORS allowlist to only the frontend origin; cookies require HTTPS in production.
- Access tokens are short-lived. Refresh tokens rotate, are stored hashed, and reuse revokes the token family.
- Passwords use bcrypt; sensitive user fields are never serialized.
- Request schemas reject unknown input fields and protect database queries from operator injection.
- API logs exclude passwords, bearer/cookie tokens, card data, and pulse comments.
- Reports require an active paid subscription; trial access to report previews is limited.

Use the test-only secrets and data in local development. Do not expose debug credentials, MongoDB, or Stripe test secrets in production.

## CI

GitHub Actions runs backend lint, tests, and build on pushes and pull requests. The integration tests use an in-memory MongoDB instance and do not require a separate database service.
