---
name: Stripe currently in test mode
description: SlotBuddy Stripe keys/webhook are test-mode during the revamp; must be swapped to live before launch
type: project
---

All Stripe env vars in Vercel prod (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`) are **test-mode** values during the revamp build (Task 4 of REVAMP-PROGRESS.md).

**Why:** Lets us run end-to-end checkout/webhook tests with Stripe test cards without touching real money.

**How to apply:** Before launch, swap all four to live-mode values and recreate the webhook endpoint in Stripe live mode (events: `customer.subscription.created/updated/deleted`, `invoice.payment_failed`). Remind the user about this when wrapping up Task 4 and again at pre-launch checklist time.
