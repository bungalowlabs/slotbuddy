# Production Setup Guide

Reusable checklist for launching a Next.js SaaS app with Stripe, Google OAuth, Resend, and Vercel.

---

## 1. Stripe (Payments)

### Create Product
1. Go to Stripe Dashboard > Products > Add Product
2. **Name:** Your App Name Pro
3. **Description:** Monthly subscription for [your app]. Includes [feature list].
4. **Tax code:** Leave default (Electronically Supplied Services)
5. **Price:** Set your monthly amount, check "Include tax in price"
6. **Billing:** Monthly, recurring
7. **Lookup key:** `yourapp_pro_monthly`
8. Save and copy the `price_xxx` ID

### Create Webhook
1. Go to Developers > Webhooks > Add Endpoint
2. **Endpoint URL:** `https://yourdomain.com/api/stripe/webhook`
3. **Name:** Your App Production
4. **Description:** Handles subscription lifecycle events for yourdomain.com
5. **Events to listen for:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Save and copy the webhook signing secret (`whsec_xxx`)

### Copy Keys
From Stripe Dashboard (make sure you're in **Live mode**, not Test):
- `STRIPE_SECRET_KEY` — `sk_live_xxx` (from Developers > API Keys)
- `STRIPE_PUBLISHABLE_KEY` — `pk_live_xxx` (from Developers > API Keys)
- `STRIPE_WEBHOOK_SECRET` — `whsec_xxx` (from the webhook you created)
- `STRIPE_PRICE_ID` — `price_xxx` (from the product you created)

---

## 2. Google Cloud Console (OAuth)

### Create Project
1. Go to https://console.cloud.google.com
2. Create a new project with your app name

### OAuth Consent Screen
1. Go to APIs & Services > OAuth consent screen
2. Choose **External**
3. Fill in:
   - **App name:** Your App Name
   - **User support email:** your email
   - **App domain:** `https://yourdomain.com`
   - **Developer contact email:** your email
4. Save and Continue
5. **Scopes:** Add `email` and `profile`, Save and Continue
6. **Test users:** Skip, Save and Continue
7. Back to Dashboard > Click **"Publish App"** to move out of testing mode

### Create Credentials
1. Go to APIs & Services > Credentials
2. Create Credentials > OAuth client ID
3. **Type:** Web application
4. **Name:** Your App Production
5. **Authorized JavaScript origins:** `https://yourdomain.com`
6. **Authorized redirect URIs:** `https://yourdomain.com/api/auth/callback/google`
7. Click Create
8. Copy **Client ID** and **Client Secret**

### Env Vars
- `GOOGLE_CLIENT_ID` — the client ID
- `GOOGLE_CLIENT_SECRET` — the client secret

---

## 3. Resend (Transactional Email)

### Verify Domain
1. Go to https://resend.com/domains
2. Click "Add Domain" > enter `yourdomain.com`
3. Resend provides DNS records to add:
   - **MX record** — for receiving bounces
   - **TXT record (SPF)** — authorizes Resend to send on your behalf
   - **DKIM records** — email authentication
4. Add all DNS records at your domain registrar
5. Wait for verification (5-30 minutes)
6. Once verified, status turns green

### Env Vars
- `RESEND_API_KEY` — from https://resend.com/api-keys
- `FROM_EMAIL` — `Your App <noreply@yourdomain.com>` (must use verified domain)

---

## 4. Vercel (Hosting & Deployment)

### Link Project
1. Go to Vercel Dashboard
2. Import your Git repository or create new project
3. Framework: Next.js (auto-detected)

### Add Domain
1. Project Settings > Domains
2. Add `yourdomain.com`
3. Vercel provides DNS instructions:
   - **A record:** `76.76.21.21` (for apex domain)
   - **CNAME:** `cname.vercel-dns.com` (for www subdomain)
4. Add records at your domain registrar
5. Wait for SSL certificate (automatic, usually 1-2 minutes)

### Database (Vercel Postgres / Neon)
1. Go to Storage tab > Create Database > Postgres
2. Connect to your project
3. Environment variables auto-populate: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, etc.

### Environment Variables
Add all env vars to **Production** environment:

| Variable | Source |
|----------|--------|
| `AUTH_SECRET` | Generate: `openssl rand -base64 32` |
| `AUTH_URL` | `https://yourdomain.com` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `STRIPE_SECRET_KEY` | Stripe Dashboard (live mode) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard (live mode) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook endpoint |
| `STRIPE_PRICE_ID` | Stripe Product price ID |
| `RESEND_API_KEY` | Resend Dashboard |
| `FROM_EMAIL` | `Your App <noreply@yourdomain.com>` |
| `CRON_SECRET` | Generate: `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | Anthropic Console (if using AI features) |
| `DATABASE_URL` | Auto from Vercel Postgres |
| `DATABASE_URL_UNPOOLED` | Auto from Vercel Postgres |

### Push Env Vars via CLI
```bash
# Push a single var
echo "your_value" | vercel env add VAR_NAME production --force

# Or bulk push from a file
while IFS='=' read -r key value; do
  echo "$value" | vercel env add "$key" production --force
done < .env.production
```

### Deploy
```bash
vercel --prod
```

---

## 5. Post-Deploy Checklist

- [ ] Visit your domain — landing page loads with SSL
- [ ] Sign up with Google OAuth — redirects correctly
- [ ] Create a business through onboarding
- [ ] Add a service
- [ ] Test the public booking flow as a customer
- [ ] Complete a Stripe checkout (use a real card or Stripe test card if still in test mode)
- [ ] Verify email confirmation arrives from your verified domain
- [ ] Check Stripe webhook events are being received (Stripe Dashboard > Webhooks > Recent events)
- [ ] Verify cron job fires (Vercel Dashboard > project > Cron Jobs tab)
- [ ] Share a link on Slack/social — verify OG meta tags render correctly

---

## Quick Reference: Generate Secrets

```bash
# Auth secret
openssl rand -base64 32

# Cron secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
