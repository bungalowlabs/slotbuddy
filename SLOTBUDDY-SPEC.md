# SlotBuddy — Product Specification

## Product Definition

**Product:** Simple appointment booking system for small service businesses.
**Name:** SlotBuddy
**Target:** Solo operators and small teams — barbers, salons, personal trainers, tattoo artists, auto detailers, massage therapists, tutors — anyone who books appointments.
**Value prop:** "Your booking page, live in 5 minutes."
**Pricing:** $15/month per business. No free tier. 14-day free trial with card upfront.
**Competitive angle:** Calendly is for meetings, not services. Square Appointments bundles payments you don't need. Acuity is $20+/month and bloated. SlotBuddy is dead simple — services, availability, booking link, done.

---

## MVP Scope

### In Scope
- Business owner signup and dashboard
- Service management (name, duration, price, description)
- Weekly availability schedule (business hours per day of week)
- Public booking page per business (no customer login required)
- Customer selects service → picks date → picks available time slot → enters name/email/phone → confirms
- Calendar view for business owner showing all bookings
- Booking confirmation email to customer and business owner
- Cancel/reschedule by business owner from dashboard
- Customer cancellation via link in confirmation email
- Unique business slug for public booking URL (/book/joes-barbershop)
- Stripe subscription billing with trial
- Landing page with pricing and signup CTA
- Fully responsive — works on phone and desktop

### Out of Scope (v2+)
- Online payment collection at booking time
- SMS reminders
- Google Calendar sync
- Multi-staff scheduling
- Waiting list
- Custom branding/colors for booking page
- Recurring appointments
- Integration with Starply or other tools (future platform play)

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14 (App Router) | Single codebase, SSR, API routes |
| Styling | Tailwind CSS | Fast iteration, mobile-first |
| Database | Vercel Postgres (Neon) | Same dashboard as hosting, zero config |
| ORM | Drizzle ORM | Type-safe, lightweight, works with Vercel Postgres |
| Auth | Auth.js (NextAuth v5) | Business owner login only, Google + email |
| Payments | Stripe (Checkout + Customer Portal + Webhooks) | Industry standard, handles trials |
| Email | Resend | Transactional email for booking confirmations |
| Hosting | Vercel | Zero-config deploys, cron jobs |
| Background Jobs | Vercel Cron | Send reminder emails 24hr before appointment |

---

## User Flows

### Business Owner Flow
```
Landing → Sign Up (Auth.js)
  → Onboarding: enter business name, generate slug, set time zone
  → Add services (e.g., "Men's Haircut", 30min, $25)
  → Set weekly availability (e.g., Mon-Fri 9am-6pm, Sat 9am-2pm)
  → Get public booking link: slotbuddy.com/book/joes-barbershop
  → Share link on Instagram, Google Business Profile, Facebook, business card
  → View bookings on calendar dashboard
  → Manage/cancel bookings as needed
```

### Customer Flow (no login required)
```
Visit /book/joes-barbershop
  → See business name, services offered
  → Select a service
  → Pick a date from calendar
  → See available time slots for that date
  → Select a time slot
  → Enter name, email, phone number
  → Confirm booking
  → Receive confirmation email with cancel/reschedule link
  → Business owner receives notification email
```

---

## Environment Variables

```
# Vercel Postgres (auto-populated by vercel env pull)
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# Auth.js
AUTH_SECRET=
AUTH_URL=http://localhost:3000

# Google OAuth (reuse from Starply's Google Cloud project, just add new redirect URIs)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=

# Resend
RESEND_API_KEY=
```

---

## Database Schema (Drizzle ORM)

```typescript
// src/db/schema.ts

import { pgTable, uuid, text, integer, boolean, timestamp, time, date, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  stripeCustomerId: text('stripe_customer_id'),
  subscriptionStatus: text('subscription_status').default('trialing'),
  trialEndsAt: timestamp('trial_ends_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  phone: text('phone'),
  address: text('address'),
  timezone: text('timezone').notNull().default('America/Chicago'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull(),
  price: integer('price'), // in cents, nullable if free
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const availability = pgTable('availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: time('start_time').notNull(), // e.g., '09:00'
  endTime: time('end_time').notNull(), // e.g., '17:00'
  isEnabled: boolean('is_enabled').default(true),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  serviceId: uuid('service_id').references(() => services.id).notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: text('status').default('confirmed'), // confirmed | cancelled | completed | no_show
  cancellationToken: text('cancellation_token').notNull(), // random token for cancel link
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const blockedTimes = pgTable('blocked_times', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## Page Architecture

```
PUBLIC PAGES (no auth):
/                              → Landing page (hero, features, pricing, signup CTA)
/book/[businessSlug]           → Public booking page: select service
/book/[businessSlug]/date      → Pick date + time slot
/book/[businessSlug]/confirm   → Enter customer details + confirm
/book/[businessSlug]/success   → Booking confirmed, details shown
/booking/cancel/[token]        → Customer cancellation page

AUTHENTICATED PAGES (business owner):
/login                         → Login form
/signup                        → Signup form
/onboarding                    → Business name, slug, timezone setup
/dashboard                     → Calendar view of bookings
/dashboard/bookings            → List view of all bookings
/dashboard/services            → Manage services (CRUD)
/dashboard/availability        → Set weekly hours
/dashboard/blocked             → Block off specific dates/times
/dashboard/settings            → Business info, billing, booking link

API ROUTES:
/api/auth/[...nextauth]        → Auth.js route handler
/api/bookings/create           → Public: create a new booking (no auth)
/api/bookings/cancel           → Public: cancel via token (no auth)
/api/bookings/[id]             → Authenticated: update/cancel booking
/api/services                  → Authenticated: CRUD services
/api/availability              → Authenticated: CRUD availability
/api/availability/slots        → Public: get available slots for a date (no auth)
/api/blocked                   → Authenticated: CRUD blocked times
/api/stripe/webhook            → Stripe subscription events
/api/stripe/checkout           → Create Stripe checkout session
/api/cron/reminders            → Cron: send 24hr reminder emails
```

**Critical — two access levels:**
1. Business owner pages (/dashboard/*) — require Auth.js session, gate behind active subscription/trial
2. Public booking pages (/book/*) — completely unauthenticated. Customers never need to create an account. The booking form collects name, email, phone and that's it.

---

## Slot Availability Logic

When a customer picks a date, the system calculates available time slots:

1. Look up the business's availability for that day of week (e.g., Monday 9am-5pm)
2. Get the selected service's duration (e.g., 30 minutes)
3. Generate all possible start times in increments of the service duration (9:00, 9:30, 10:00, ...)
4. Remove slots that overlap with existing confirmed bookings
5. Remove slots that overlap with blocked times
6. Remove slots that are in the past (if booking for today)
7. Return remaining available slots

All time calculations happen in the business's configured timezone. Store in UTC in the database. Convert for display.

**Double-booking prevention:** Use a database transaction when creating a booking. Check for conflicts within the transaction and fail if the slot was taken between when the customer saw availability and when they confirmed.

---

## Email Templates

**Booking Confirmation (to customer):**
- Subject: "Your appointment at {business_name} is confirmed"
- Body: service name, date, time, business address/phone, cancel link

**New Booking Notification (to business owner):**
- Subject: "New booking: {customer_name} - {service_name}"
- Body: customer name, email, phone, service, date, time

**Cancellation Confirmation (to customer):**
- Subject: "Your appointment at {business_name} has been cancelled"
- Body: confirmation that the booking was cancelled

**Reminder (24hr before, via cron):**
- Subject: "Reminder: Your appointment at {business_name} tomorrow"
- Body: service name, date, time, business address/phone, cancel link

---

## Stripe Integration

- Checkout: redirect to Stripe Checkout with 14-day trial, $15/month using STRIPE_PRICE_ID
- Webhook events to handle: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- On trial end without payment: set `subscription_status = 'expired'`, block dashboard access
- Public booking pages remain accessible even if owner's subscription expires (don't punish their customers)
- Customer portal: let business owners manage billing via Stripe's hosted portal

---

## Build Sequence

### Week 1: Foundation
1. Initialize project: Next.js 14 App Router, TypeScript, Tailwind CSS, Drizzle ORM with Vercel Postgres connection using DATABASE_URL, project folder structure matching page architecture. Set framework preset to Next.js in vercel.json.
2. Auth.js: configure Google + email providers, session handling, protected route middleware for /dashboard/* routes, user creation in database on first login
3. Database: Drizzle migration config using DATABASE_URL_UNPOOLED, run migrations to create all six tables (users, businesses, services, availability, bookings, blocked_times)
4. Onboarding flow: after first login, redirect to /onboarding to create business (name, auto-generate slug, select timezone), save to businesses table
5. Landing page: hero section with tagline "Your booking page, live in 5 minutes.", features grid, pricing card ($15/month), signup CTA, mobile responsive

### Week 2: Business Owner Dashboard
6. Services CRUD: /dashboard/services page with add/edit/delete services, each service has name, description, duration (dropdown: 15/30/45/60/90/120 min), price (optional), active toggle, drag to reorder
7. Availability setup: /dashboard/availability page showing 7-day weekly grid, toggle each day on/off, set start and end time per day, save to availability table
8. Calendar dashboard: /dashboard page showing week/day view calendar with all confirmed bookings as blocks, click a booking to see details, mark as completed/no-show/cancel
9. Bookings list: /dashboard/bookings page with table of all bookings (filterable by date range, status), click to view detail
10. Blocked times: /dashboard/blocked page to add date ranges where no bookings are allowed (vacations, holidays), CRUD interface

### Week 3: Public Booking Flow
11. Public booking page: /book/[businessSlug] shows business name, description, list of active services with name/duration/price, select a service to continue
12. Date and slot picker: /book/[businessSlug]/date shows a calendar to pick a date, then displays available time slots for that date using the slot availability logic. Mobile-friendly grid of time buttons.
13. Booking confirmation: /book/[businessSlug]/confirm shows selected service/date/time, form for customer name, email, phone. On submit: create booking in database with conflict check, generate cancellation token, redirect to success page.
14. Email notifications: on booking creation, send confirmation email to customer and notification email to business owner via Resend. Include cancel link with token in customer email.
15. Cancellation flow: /booking/cancel/[token] page that looks up booking by cancellation_token, shows booking details, confirm cancel button. On cancel: update status to 'cancelled', send cancellation confirmation email to customer.

### Week 4: Monetization & Production
16. Stripe: /api/stripe/checkout creates Checkout session with 14-day trial using STRIPE_PRICE_ID, /api/stripe/webhook handles subscription lifecycle events and syncs status to users table
17. Access control: middleware gates /dashboard/* behind active subscription or valid trial, redirect expired users to upgrade page. Public booking pages (/book/*) are NEVER gated — always accessible.
18. Settings page: /dashboard/settings showing business info (editable), public booking link with copy button, Stripe Customer Portal link for billing management
19. Cron job: add cron config to vercel.json, /api/cron/reminders runs daily at 8am, finds all confirmed bookings for the next day, sends reminder email to customer via Resend
20. Production hardening: error boundaries on all pages, loading skeletons for async data, toast notifications for user actions, rate limiting on public booking API (prevent spam), input validation on all forms, full mobile responsive pass on all pages (especially the booking flow — most customers will book from their phone)

---

## Deployment

1. Create GitHub repo `slotbuddy` under existing account
2. Create new Vercel project linked to the repo, set framework to Next.js
3. Add Vercel Postgres from Storage tab, connect to project
4. Add all environment variables in Vercel dashboard
5. Push code — Vercel auto-deploys from main branch
6. Set custom domain when ready
7. Switch Stripe from test to live mode at launch

---

## Go-To-Market

**Pre-launch:**
- Register domain (slotbuddy.com or similar)
- Create 60-second demo video showing full booking flow
- Set up a Resend account for transactional email

**Launch week:**
- Post on r/smallbusiness, r/barber, r/hairstylist, r/personaltraining, r/entrepreneur
- Submit to Product Hunt
- Post demo video on X/Twitter, LinkedIn, Instagram
- Walk into 10 barbershops and salons in McKinney with a demo on your phone

**Ongoing:**
- SEO blog posts: "free booking page for barbers", "how to let customers book online", "best appointment scheduling for small business"
- Google Ads: $5-10/day targeting "online booking for barbers", "appointment scheduling small business"
- Partner with local business associations and chambers of commerce
- Every customer's booking page is a free ad — their customers see "Powered by SlotBuddy" at the bottom

---

## Revenue Targets

| Milestone | Customers | MRR |
|-----------|-----------|-----|
| Month 1 | 10 | $150 |
| Month 3 | 40 | $600 |
| Month 6 | 100 | $1,500 |
| Month 12 | 300 | $4,500 |

Costs at 300 customers: Vercel free tier handles it. Resend free tier covers 3,000 emails/month (enough to start, then ~$20/month). Stripe takes 2.9% + $0.30. No AI API costs. Margins are 95%+.

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Crowded market (Calendly, Square, Acuity) | Hard to differentiate | Compete on simplicity and price — $15/mo for a tool that takes 5 minutes to set up |
| Low retention if businesses don't get bookings | Churn | Onboarding guides on how to share the link, "Powered by SlotBuddy" drives organic signups |
| Spam bookings on public pages | Bad UX for business owner | Rate limiting, honeypot fields, optional email verification for bookings |
| Time zone bugs | Wrong appointment times | Store everything UTC, convert on display, test extensively |
| Mobile booking flow is clunky | Customers abandon | Design mobile-first, test on real phones, keep the flow to 3 taps |
