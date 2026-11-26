# Devy — Polar.sh Billing & Pro Setup (5-Minute Checklist)

Devy uses **Polar.sh** (Merchant of Record — handles EU/US/global VAT & sales tax automatically) paired with **Supabase Edge Functions** and a **Postgres security trigger** so `profiles.is_premium` can **only** be updated by cryptographically verified server-side webhooks.

---

## 1. Run the Supabase SQL Migration
Open **Supabase Dashboard → SQL Editor → New Query**, paste the full contents of [`supabase_billing_polar.sql`](../supabase_billing_polar.sql), and click **Run**.

This creates:
- Polar billing metadata columns on `public.profiles` (`pro_plan`, `subscription_status`, `polar_customer_id`, `polar_subscription_id`, `polar_order_id`, `pro_renews_at`, `pro_ends_at`)
- Private audit & deduplication table `public.billing_webhook_events` (service-role only)
- Security trigger `trg_prevent_client_billing_tampering` blocking browser/client tampering with `is_premium`

---

## 2. Create Your 3 Devy Pro Products in Polar.sh
*(Tip: Start on **sandbox.polar.sh** first, then repeat on **polar.sh** when ready to go live!)*

In **Polar Dashboard → Catalog → Products → + New Product**:
1. **Devy Pro — Monthly** (\$3.99/mo recurring) → copy **Product ID**
2. **Devy Pro — Annual** (\$24/yr recurring, optional 7-day free trial) → copy **Product ID**
3. **Devy Pro — Lifetime Founder Pass** (\$39 one-time) → copy **Product ID**

Also create an **Organization Access Token** in **Settings → Developers → Tokens** with scopes:
- `checkouts:read` & `checkouts:write`
- `customer_sessions:write`
- `customers:read` & `customers:write`
- `products:read`

---

## 3. Set Supabase Edge Function Secrets & Deploy
Run from the project root (after `supabase link --project-ref <your-ref>`):

```bash
supabase secrets set \
  POLAR_ACCESS_TOKEN="polar_oat_..." \
  POLAR_SERVER="sandbox" \
  POLAR_PRODUCT_MONTHLY="your_monthly_product_id" \
  POLAR_PRODUCT_ANNUAL="your_annual_product_id" \
  POLAR_PRODUCT_LIFETIME="your_lifetime_product_id" \
  POLAR_WEBHOOK_SECRET="whsec_..." \
  DEVY_APP_URL="https://your-live-domain.com"

supabase functions deploy create-polar-checkout --no-verify-jwt
supabase functions deploy polar-webhook --no-verify-jwt
```

> Switch `POLAR_SERVER="production"` (with your live token & product IDs) when launching publicly!
> Both functions deploy with `--no-verify-jwt` because modern Supabase `sb_publishable_` / ES256 projects verify user tokens inside `create-polar-checkout` via `supabase.auth.getUser(token)`, while `polar-webhook` verifies Standard Webhooks HMAC-SHA256 headers (`webhook-id`, `webhook-timestamp`, `webhook-signature`).

---

## 4. Register the Webhook Endpoint in Polar
Go to **Polar Dashboard → Settings → Webhooks → + Add Endpoint**:
- **URL**: `https://<your-project-ref>.supabase.co/functions/v1/polar-webhook`
- **Secret**: copy the generated `whsec_...` secret into `POLAR_WEBHOOK_SECRET` above
- **Events to subscribe to**:
  - `order.paid`
  - `order.refunded`
  - `subscription.created`
  - `subscription.updated`
  - `subscription.active`
  - `subscription.canceled`
  - `subscription.uncanceled`
  - `subscription.revoked`

---

## 5. Test End-to-End in Polar Sandbox
1. Sign in to Devy, click **Upgrade to Pro**, pick Monthly / Annual / Lifetime, and complete checkout using Polar Sandbox's test card.
2. You'll redirect back to `/?checkout=success&plan=...`, Devy polls your profile until the webhook settles, and unlocks Pro with the victory fanfare!
3. Open **Profile** → **`💳 MANAGE BILLING / INVOICES ↗`** to verify the pre-authenticated Polar Customer Portal.
