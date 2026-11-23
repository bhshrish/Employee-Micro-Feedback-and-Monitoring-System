# CalmWork — Tech Stack (locked)

**Rule for any AI coding tool: do not add, remove, or swap anything on this list without asking the developer first.** If a library below can do the job, use it. Do not introduce a second library for the same purpose.

---

## 1. Repo layout

```
/                      Next.js frontend (repo root)
  app/                 App Router routes
  components/
  lib/                 api client, utils, validators, constants
  styles/              globals.css, tokens
  public/
backend/               Express API (separate folder, own package.json)
  src/
    config/ models/ routes/ controllers/ services/ middleware/ validators/ utils/ jobs/ emails/
    seed.js             Seed an owner account
    server.js           API entry point
  openapi.yaml
docs/                  these 8 documents
```

## 2. Languages

- **JavaScript** in both frontend and backend; use `.jsx` for files containing JSX.
- Node.js **20 LTS** (set `engines` in both package.json files).

## 3. Frontend

Purpose
Choice

Framework
**Next.js (App Router)** + React

Styling
**Tailwind CSS** with design tokens in CSS variables (see `04-FRONTEND-GUIDELINES.md`)

Font
**Figtree** via `next/font/google`

Components
Own components in `components/ui/` (Button, PillInput, TealCard, Heading, Logo…). No component library unless approved.

Icons
`lucide-react`

Forms and validation
`react-hook-form` + **`zod`** (`@hookform/resolvers`)

Server state / data fetching
`@tanstack/react-query`

Client state
React state + context only. No Redux/Zustand.

Charts
`recharts`

Dates
`date-fns`

Tests
Vitest + React Testing Library; Playwright for key flows

Lint/format
ESLint (next config) + Prettier

API access goes through **one** module: `lib/api.js` (today it holds mocks; replace internals with real `fetch` calls, keep the function signatures stable).

## 4. Backend

Purpose
Choice

Runtime / framework
**Node.js + Express.js**

Database
**MongoDB** via **Mongoose**

Validation
**zod** (shared schemas copied or published from `lib/validators`)

Auth
**JWT** access token (15 min) + refresh token (7 days), stored in **httpOnly, Secure, SameSite=Lax cookies**. Passwords hashed with **argon2** (fallback bcrypt, cost 12).

OTP
6-digit numeric, hashed in DB, 10-minute expiry

Authorization
Role middleware: `platform_admin`, `business_admin`, `manager`, `employee`, plus org scoping on every query

Email
**Nodemailer** over SMTP. Dev: **Mailpit** (localhost:1025, UI :8025). Prod: **Resend** SMTP. Templates in `backend/src/emails/` (MJML or plain HTML strings).

Payments
**Razorpay** (Orders API + webhook signature verification). INR only.

Reports
`pdfkit` (PDF) and `fast-csv` (CSV), generated server-side

Scheduling
Vercel Cron hitting protected `/api/jobs/*` endpoints (weekly check-in reminders, trial emails, alert evaluation)

Security middleware
`helmet`, `cors` (allow-list), `express-rate-limit`, `express-mongo-sanitize`, `hpp`

Logging
`pino` + `pino-http` (never log passwords, OTPs, tokens, or check-in text)

Tests
Vitest + Supertest, `mongodb-memory-server`

API style
REST, JSON, versioned under `/api/v1`

## 5. Hosting and infrastructure

Piece
Choice

Frontend
**Vercel** (project root = repo root)

Backend
**Vercel** as a **separate project** (root directory `backend/`), Express exported through `backend/src/server.js` and routed by `backend/vercel.json`. Cache the Mongo connection across invocations.

Database
**MongoDB Atlas** (M0 free for dev, M10+ for production). IP allow-list or 0.0.0.0/0 only with strong credentials for Vercel.

Email
Resend (prod), Mailpit (dev)

Payments
Razorpay (test mode in dev/preview, live in production)

Source control
GitHub, feature branches, PRs into `main`, Conventional Commits

CI
GitHub Actions: lint, build, test on every PR

Secrets
Vercel environment variables. Never commit `.env`. Keep `.env.example` with every key and a comment.

If Vercel serverless proves unsuitable for the Express app (cold starts, long reports), the pre-approved alternative is **Render** web service. Do not switch unless the developer asks.

## 6. Environment variables (`.env.example`, comment every one)

Frontend: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NEXT_PUBLIC_APP_NAME=CalmWork`.

Backend: `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_DOMAIN`, `CLIENT_ORIGIN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `CRON_SECRET`, `SEED_DEMO` (true only in dev/staging), `MIN_GROUP_SIZE=5`, `TRIAL_DAYS=14`, `REPORT_PRICE_INR=99`.

## 7. Explicitly NOT used

Prisma/SQL databases, Firebase/Supabase, NextAuth/Clerk/Auth0, Redux, styled-components, MUI/Chakra/Ant Design, GraphQL, tRPC, Stripe, Socket.io (not needed in MVP), any screen-capture or keylogging library.

## 8. Quality bars

- JavaScript lint, with runtime validation for external inputs.
- Every endpoint validated with zod and returns the standard error shape.
- Every Mongo query scoped by `orgId`.
- Lighthouse accessibility score at or above 95 on public pages.