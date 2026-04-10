---
name: Revamp all 8 tasks complete
description: All 8 REVAMP-PROGRESS.md tasks shipped; pending items are Stripe end-to-end test, DB migrations on prod, and Stripe test→live swap
type: project
---

All 8 revamp tasks are checked off in REVAMP-PROGRESS.md. AI service description feature also shipped (post-revamp).

**Still pending before prod deploy:**
- Run DB migrations on Vercel prod: `0001_service_buffer_approval.sql` and `0002_service_fields.sql`
- Redeploy to Vercel to pick up all code changes + `STRIPE_WEBHOOK_SECRET` + `ANTHROPIC_API_KEY_PROD`
- End-to-end Stripe test with test card `4242 4242 4242 4242`
- Confirm `AUTH_URL` in Vercel prod is the prod domain, not localhost
- Confirm 4 webhook events match handler

**Why:** Tasks are done in code but DB + deploy haven't happened yet; user wanted to batch the redeploy.

**How to apply:** When user says "deploy" or "test Stripe", walk through the pending list above. Remind about Stripe test→live swap at pre-launch (see `project_stripe_test_mode.md`).
