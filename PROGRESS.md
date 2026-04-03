# SlotBuddy Build Progress

## Week 1: Foundation

### Task 1: Initialize project ← IN PROGRESS
- [x] Next.js 14 App Router + TypeScript + Tailwind CSS
- [x] Drizzle ORM setup with schema (all 6 tables)
- [x] Project folder structure matching page architecture
- [x] vercel.json with framework preset and cron config
- [x] Package dependencies installed (drizzle, next-auth, stripe, resend, neon)
- [ ] GitHub repo created, initial commit pushed
- [ ] Vercel project created with Postgres database
- [ ] Environment variables configured

### Task 2: Auth.js setup
- [ ] Google provider configured
- [ ] Session handling (JWT strategy)
- [ ] Protected route middleware for /dashboard/*
- [ ] User creation in database on first login
- [ ] Login/signup pages

### Task 3: Database migrations
- [ ] Drizzle migration config using DATABASE_URL_UNPOOLED
- [ ] Run migrations to create all six tables

### Task 4: Onboarding flow
- [ ] /onboarding page (business name, slug, timezone)
- [ ] Auto-generate slug from business name
- [ ] Redirect after first login

### Task 5: Landing page
- [ ] Hero section with tagline
- [ ] Features grid
- [ ] Pricing card ($15/month)
- [ ] Signup CTA
- [ ] Mobile responsive

## Week 2: Business Owner Dashboard

### Task 6: Services CRUD
- [ ] /dashboard/services page
- [ ] Add/edit/delete services
- [ ] Name, description, duration, price, active toggle

### Task 7: Availability setup
- [ ] /dashboard/availability page
- [ ] 7-day weekly grid
- [ ] Toggle days on/off, set start/end times

### Task 8: Calendar dashboard
- [ ] /dashboard page with week/day view
- [ ] Booking blocks, click for details
- [ ] Mark as completed/no-show/cancel

### Task 9: Bookings list
- [ ] /dashboard/bookings page
- [ ] Table with filters (date range, status)

### Task 10: Blocked times
- [ ] /dashboard/blocked page
- [ ] Add date ranges, CRUD interface

## Week 3: Public Booking Flow

### Task 11: Public booking page
- [ ] /book/[businessSlug] — service selection

### Task 12: Date and slot picker
- [ ] Calendar date picker
- [ ] Available time slots display

### Task 13: Booking confirmation
- [ ] Customer details form
- [ ] Conflict check on submit
- [ ] Success page

### Task 14: Email notifications
- [ ] Confirmation email to customer
- [ ] Notification email to business owner
- [ ] Cancel link with token

### Task 15: Cancellation flow
- [ ] /booking/cancel/[token] page
- [ ] Cancellation confirmation email

## Week 4: Monetization & Production

### Task 16: Stripe integration
- [ ] Checkout with 14-day trial
- [ ] Webhook lifecycle events

### Task 17: Access control
- [ ] Subscription/trial gating on dashboard
- [ ] Public booking pages always accessible

### Task 18: Settings page
- [ ] Business info editing
- [ ] Booking link with copy button
- [ ] Stripe Customer Portal link

### Task 19: Cron job for reminders
- [ ] /api/cron/reminders
- [ ] 24hr reminder emails via Resend

### Task 20: Production hardening
- [ ] Error boundaries
- [ ] Loading skeletons
- [ ] Rate limiting
- [ ] Input validation
- [ ] Full mobile responsive pass
