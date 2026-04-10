# SlotBuddy

Simple, affordable appointment booking system for small service businesses.

## Project Context

SlotBuddy lets small business owners (barbers, salons, trainers, auto shops) set up a booking page where their customers can self-schedule appointments. The business owner sees a clean calendar view, manages services and availability, and gets notified of new bookings. Customers get a simple booking link — no app download, no account required.

This is part of a future multi-tool platform for small business owners (alongside Starply for review management). Shared auth and billing infrastructure across tools.

Read SLOTBUDDY-SPEC.md for the complete product specification, database schema, page architecture, and build sequence.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Database:** Vercel Postgres (Neon) via Drizzle ORM
- **Auth:** Auth.js (NextAuth v5) — Google + email providers
- **Payments:** Stripe (Checkout + Customer Portal + Webhooks)
- **Notifications:** Resend (transactional email for booking confirmations)
- **Hosting:** Vercel
- **Background Jobs:** Vercel Cron

## Environment Variables

Database env vars (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`) are pulled from Vercel. Other required vars:

- `AUTH_SECRET` — Auth.js session secret
- `AUTH_URL` — http://localhost:3000 (dev)
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `STRIPE_SECRET_KEY` — Stripe test mode secret key
- `STRIPE_PUBLISHABLE_KEY` — Stripe test mode publishable key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `STRIPE_PRICE_ID` — Stripe price ID for $15/month plan
- `RESEND_API_KEY` — Resend email API key

## Secrets Handling

NEVER print, echo, paste, or otherwise reproduce the value of any environment variable in chat output, commit messages, file contents, or tool arguments that will surface in conversation. This applies to ALL env vars (secrets, OAuth IDs, URLs, price IDs — everything), regardless of whether they look "sensitive."

- When auditing env vars, only report variable names and pass/fail status, never values. Diagnose problems by shape (length, prefix, presence of `\n`/whitespace) without revealing the value.
- When reading `.env*` files or `vercel env pull` output, do not quote, summarize, or display matched lines. Use Grep with patterns that report only line numbers or counts, not content.
- When fixing a malformed env var, pipe the value into `vercel env add` from a source that does not echo it (e.g., re-pull from Vercel into a temp file, then use that file as input). Do NOT retype the value into a `printf` literal in a tool call.
- Always delete `.env.production.local` (and any other pulled env files) immediately after use in the same tool call that consumed them.
- If a value has already been exposed in conversation, treat it as compromised and tell the user to rotate it.

## Build Instructions

Follow the Build Sequence in SLOTBUDDY-SPEC.md strictly in order. Complete one task at a time. Do not skip ahead. After each task, wait for confirmation before proceeding to the next.

## Critical Architecture Notes

1. There are TWO sides to this app:
   - **Business owner side** (authenticated): dashboard, calendar, services, settings — behind Auth.js login
   - **Customer booking side** (public, no auth): booking page at `/book/[businessSlug]` — completely public, no login required for customers

2. Database connection uses `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (for migrations).

3. Every business gets a unique slug for their public booking URL: `slotbuddy.com/book/joes-barbershop`

4. Time zones matter. Store all times in UTC in the database. Display in the business's configured time zone on both the owner dashboard and the public booking page.

5. No double-booking. Use database-level constraints and optimistic locking to prevent two customers from booking the same slot.
