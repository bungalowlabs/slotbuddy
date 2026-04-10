# SlotBuddy Revamp Progress

Living checklist for the website revamp. Update status as tasks complete so future sessions can resume without re-deriving context. Read this first when starting a revamp-related session.

## Decisions locked in

- **Trial model:** 14-day free trial with 100% feature access. On expiry, owner sees CC wall (already redirects to `/upgrade` via `dashboard/layout.tsx:38-42`); public booking page at `/book/[slug]` is **locked** (shows "this business is paused" — no new bookings).
- **Trial banner:** persistent top banner inside dashboard layout, "X days left in trial → Add payment method". Color escalates gray → yellow (≤5 days) → red (≤2 days). Not dismissible.
- **New dashboard home:** `/dashboard` becomes an overview page; full calendar moves to `/dashboard/calendar`. Sections: trial banner, booking-link card, stat strip, today's schedule, recent activity, setup checklist (auto-hides when complete).
- **Copy booking link:** promoted to a prominent card on the new dashboard home. Sidebar version stays as secondary.
- **Realtors / verticals:** add `bufferBeforeMinutes`/`bufferAfterMinutes` and `requiresApproval` to services (benefits all verticals, not just realtors). Custom intake fields = separate larger effort.
- **Optional fields:** keep schema as-is (most are nullable). Fix is in UI — label optional fields, conditionally render on public page. Required at signup: name, slug, timezone only.

## Build order

- [x] **1. Fix onboarding redirect bug** — `src/app/onboarding/page.tsx` has no server-side guard. Add server-side check that redirects to `/dashboard` if user already has a business (mirror pattern from `dashboard/layout.tsx:18-26`).
- [x] **2. New dashboard home page** — restructure `/dashboard`, move calendar to `/dashboard/calendar`. Includes booking-link card, stat strip, today's schedule, recent activity, setup checklist. Absorbs the "promote copy link" task.
- [x] **3. Trial infrastructure** — set `users.trialEndsAt = now + 14 days` on signup (verify current signup behavior first). Build trial banner component for dashboard layout with day-based color escalation.
- [ ] **4. Stripe wiring** — add missing `STRIPE_WEBHOOK_SECRET` to Vercel prod. Verify `/upgrade` page → Stripe Checkout → webhook → `subscriptionStatus` flow end-to-end.
- [x] **5. Lock public booking on trial expiry** — `/book/[slug]` and booking API routes must check owner's `subscriptionStatus`/`trialEndsAt`. Show "paused" state to customers, return 403 from booking creation.
- [x] **6. Mobile pass on customer booking flow** — `/book/[slug]`, `/date`, `/confirm`, `/success`. Most customers are on phones; this surface needs a dedicated review before launch.
- [x] **7. Service buffer time + manual approval** — schema additions to `services`: `bufferBeforeMinutes`, `bufferAfterMinutes`, `requiresApproval`. Update slot-availability logic to respect buffers. New `pending` booking status + owner approval flow.
- [x] **8. Custom intake fields** — new `service_fields` table (id, service_id, label, type, required). Render dynamically on booking confirm page. Larger effort — defer until 1–7 are solid.

## Smaller items noted but not yet sequenced

- "Today" jump button on calendar
- Empty states across services/availability/bookings (partially handled by setup checklist on home)
- Verify signup actually creates the user row + sets trial fields

## Post-revamp additions

- **AI service descriptions** — "✨ Generate with AI" button on service form. Calls Claude Haiku 4.5 via `/api/ai/service-description`. Requires `ANTHROPIC_API_KEY` env var. Confirmed working locally.

## Status log

- 2026-04-08 — Plan created. No tasks started.
- 2026-04-08 — Task 2 shipped. Moved calendar to `/dashboard/calendar` (added Today button), rebuilt `/dashboard` as a server-component overview: booking-link card, 4-stat strip, today's schedule, recent activity, auto-hiding setup checklist. Sidebar + mobile nav now have Home + Calendar entries. Sidebar booking-link card kept as secondary per plan.
- 2026-04-08 — Task 3 shipped. Verified `auth.ts` already sets `trialEndsAt = now + 14d` on first sign-in. Added `src/components/trial-banner.tsx` (server component, gray → yellow ≤5 → red ≤2, not dismissible, links to `/upgrade`). Refactored `dashboard/layout.tsx` trial check to expose `isTrialing`/`user` and render the banner above main content.
- 2026-04-10 — AI service description generation shipped. `@anthropic-ai/sdk` added, `/api/ai/service-description` route using Haiku 4.5, "✨ Generate with AI" button on ServiceForm. Requires `ANTHROPIC_API_KEY_PROD` with prepaid credit (separate from Claude Pro plan).
- 2026-04-08 — Task 8 shipped. New `service_fields` table + `bookings.field_values` jsonb (migration `0002_service_fields.sql`). Owner-scoped CRUD at `/api/services/fields`; public read at `/api/public/service-fields`. Services page has "Questions" button per service opening a `FieldsManager` inline panel (add/remove, 4 field types, required toggle). Confirm page fetches and renders dynamic fields, disables submit if required ones are blank, posts `fieldValues` as `{ [fieldId]: { label, value } }` on the booking. Booking detail GET returns fieldValues. Note: list views don't surface field values yet — only the detail endpoint does.
- 2026-04-08 — Task 7 shipped. Added `bufferBeforeMinutes`/`bufferAfterMinutes`/`requiresApproval` to services (migration `0001_service_buffer_approval.sql`). Slot availability + booking-create conflict check now buffer-expand both the candidate and existing bookings and count `pending` alongside `confirmed`. Services form has buffer selects + "Require manual approval" checkbox. Bookings page shows pending badge + Approve/Decline actions (desktop table + mobile cards). PATCH route accepts `pending`. Customer success page shows "Request received" copy when status=pending.
- 2026-04-08 — Task 6 shipped. Mobile pass on `/book/[slug]` flow: bumped input font-size to `text-base` (prevents iOS auto-zoom), added `autoComplete` + `inputMode` on name/email/phone, bigger touch targets on calendar days (`min-h-[44px]`) and slot buttons (`min-h-[48px]`, `py-3`), sticky bottom CTA on confirm page (form submits via `form="booking-form"`), `-ml-2 px-2 py-2` back-button hit area, `active:scale` feedback on service cards.
- 2026-04-08 — Task 5 shipped. New `src/lib/business-access.ts` `isBusinessBookable(ownerUserId)` helper (active sub OR unexpired trial). Public `/book/[slug]` page renders a "booking is paused" state when not bookable; `/api/bookings/create` returns 403; `/api/availability/slots` returns empty slot list. Confirm/date pages naturally fall through (no slots → can't proceed; create returns 403 if forced).
- 2026-04-08 — Task 1 shipped. Added `src/app/onboarding/layout.tsx` server-side guard that redirects to `/dashboard` if user already has a business. Used a layout instead of converting the client page so the form's state hooks stay intact.

## How to update this file

When finishing a task: change `[ ]` to `[x]`, add a one-line entry to **Status log** with date + what shipped + any non-obvious decisions made along the way. Keep entries terse — this is a token-efficient memory aid, not a changelog.
