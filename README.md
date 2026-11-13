# CalmWork

CalmWork is an employee feedback and burnout-monitoring application. This repository contains a Next.js frontend in [`frontend/`](./frontend/) and a separately deployable Express REST API in [`backend/`](./backend/). Both applications are JavaScript; the API is the source of truth for authentication, organization-scoped data, time sessions, anonymous pulses, analytics, billing, and reports.

## Requirements

- Node.js LTS (20 or newer recommended)
- npm
- MongoDB 7 or newer (local or hosted)
- Razorpay test-mode keys and recurring plan IDs for billing and webhook testing

## Setup

```bash
npm ci
cp backend/.env.example backend/.env
```

Set the required secrets and service URLs in `backend/.env`; never commit that file. Start MongoDB, then run the API in development mode:

```bash
docker compose --env-file backend/.env -f backend/docker-compose.yml up -d
npm run api:dev
```

The API listens on the configured `PORT` (default `4000`). Use `GET /health` for liveness and `GET /health/ready` to verify its MongoDB connection. The OpenAPI reference is served at `/api/docs`. Business owners sign up with their name, business name, email, and password; employees create password accounts through business invitations. Users can sign in with a password or request a one-time email or SMS sign-in code. Employees can enroll a phone number in Settings for SMS codes. Users can request an email password-reset link from the login page. Configure SMTP for email codes and password-reset delivery. The single platform administrator signs in at `/admin/login` with the configured `OPS_ADMIN_EMAIL` and password; its session uses the separate `JWT_ADMIN_SECRET`. Set a unique `OPS_ADMIN_INITIAL_PASSWORD` once to initialize the administrator credential in MongoDB, then remove that variable.

The platform operations dashboard is available at `/admin`. It can review and activate/suspend businesses and users, create teams and assign employees, review daily attendance and export CSV, and review activity summaries aggregated by business. It does not expose individual salary estimates or pulse responses.

Workspace monitoring summaries are included during the seven-day free trial. After the trial, an active monthly or yearly plan is required to continue using monitoring. Report exports require an active paid plan.

Keep the API running, then start the frontend in a second terminal with `npm run dev` (or `npm --workspace frontend run dev`). The login page connects to `http://localhost:4000/api/v1` by default, so login and signup will not work until MongoDB and the API are available. Set `NEXT_PUBLIC_API_URL` when the API is hosted elsewhere, and include the frontend origin in the API's `CORS_ORIGINS`.

## Deploy both apps to Vercel

Deploy the frontend and API as **two separate Vercel projects** from this repository. MongoDB must be hosted separately (for example, MongoDB Atlas).

1. Create a Vercel project for the frontend, select this repository, and set **Root Directory** to `frontend`. Note its production URL. Create a second project for the API from the same repository and set **Root Directory** to `backend`.
2. Add the production backend variables listed in [`backend/.env.example`](./backend/.env.example) to the API project's settings. Required values include:
   - `NODE_ENV=production`
   - `MONGODB_URI` for a hosted database
   - Three distinct, randomly generated secrets of at least 32 characters for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `JWT_ADMIN_SECRET`
   - `FRONTEND_URL` set to the frontend's production URL
   - `CORS_ORIGINS` set to the exact frontend production origin (scheme and host, no path)
   - `COOKIE_SECURE=true`
   - `OPS_ADMIN_EMAIL`, `OPS_ADMIN_NAME`, and an initial unique `OPS_ADMIN_INITIAL_PASSWORD` for the one platform administrator; remove the initial password after the administrator has been initialized
   - Working SMTP credentials for administrator and user password resets and email codes
   - Razorpay key ID, key secret, webhook secret, and the six recurring plan IDs described in [`backend/.env.example`](./backend/.env.example)
3. Deploy the API. Its base URL is the Vercel deployment URL; confirm `GET /health` responds with `{"status":"ok"}`.
4. Set `NEXT_PUBLIC_API_URL` in the frontend project to the API URL plus `/api/v1` (for example, `https://your-api.vercel.app/api/v1`), then deploy the frontend.
5. Test password sign-in, email/SMS code sign-in, password reset, and refresh-token behavior on the deployed frontend. Configure Razorpay webhooks to call `https://your-api.vercel.app/api/v1/webhooks/razorpay` and subscribe to the subscription lifecycle and payment failure events.

Add these variables to the Vercel project settings, not to source control. Production refresh cookies use `SameSite=None; Secure` so the frontend can refresh sessions when the frontend and API have different origins. Sign in again after deploying this cookie change to replace an older cookie. Browser third-party-cookie restrictions can still affect separate default `*.vercel.app` domains; custom frontend and API domains under the same registrable domain (for example, `app.example.com` and `api.example.com`) are recommended. Leave `COOKIE_DOMAIN` unset unless you have a specific domain-cookie requirement. Vercel functions are not persistent servers, so the API's in-process alert and trial-expiration jobs do not run reliably there; use an external scheduler or a persistent host if those jobs are required.

## Environment

See [`backend/.env.example`](./backend/.env.example) for the complete variable list and descriptions. At minimum configure `MONGODB_URI`, all three JWT secrets, `CORS_ORIGINS`, and SMTP delivery. Razorpay checkout additionally requires its API credentials, webhook secret, and plan IDs created in the Razorpay Dashboard. Secrets must be strong, unique values in deployed environments.

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
docker compose --env-file backend/.env -f backend/docker-compose.yml down
```

## Architecture

The API follows strict layers: routes perform validation and authentication, controllers translate HTTP input/output, services contain business logic, and Mongoose models own persistence. Services do not access Express request or response objects. All protected records are scoped to the organization in the verified access token.

Pulse answers do not contain a user identifier. A separate submission record enforces one response per user and ISO week without linking participation records to answers. Team analytics suppress groups below the organization's configured minimum size.

Burnout analytics combine normalized stress, workload, inverse mood, participation, and week-over-week movement. The formula, alert evaluation, and thresholds are documented in the backend README.

## API overview

Versioned JSON routes are under `/api/v1`: email/password and email/SMS-code authentication, password recovery, single-platform-administrator password authentication, user and team administration, time sessions, weekly pulses, manager-only aggregate analytics, alerts, Razorpay billing, employee tools, and subscription-gated reports. JSON responses include `success`, `data`, and `error` fields; compatibility fields are retained for existing clients. See the OpenAPI document at [`backend/openapi.yaml`](./backend/openapi.yaml).

Razorpay subscription webhooks are verified against the raw request body and deduplicated before subscription state or invoice records are updated.

## Security notes

- Configure the CORS allowlist to only the frontend origin; cookies require HTTPS in production.
- Access tokens are short-lived. Refresh tokens rotate, are stored hashed, and reuse revokes the token family.
- Passwords use bcrypt; sensitive user fields are never serialized.
- Request schemas reject unknown input fields and protect database queries from operator injection.
- API logs exclude passwords, bearer/cookie tokens, card data, and pulse comments.
- Reports require an active paid subscription; trial access to report previews is limited.

Use the test-only secrets and data in local development. Do not expose debug credentials, MongoDB, or Razorpay test secrets in production.

## CI

GitHub Actions runs backend lint, tests, and build on pushes and pull requests. The integration tests use an in-memory MongoDB instance and do not require a separate database service.
