# Stripe Integration Setup Guide

This guide walks you through setting up Stripe for the DAR app subscription system.

## Prerequisites

- Stripe account ([Sign up here](https://dashboard.stripe.com/register))
- Supabase project with subscription schema migrated
- Node.js and npm installed

## Step 1: Get Stripe API Keys

1. **Log in to Stripe Dashboard**: https://dashboard.stripe.com
2. **Get your API keys**:
   - Click on "Developers" in the left sidebar
   - Click on "API keys"
   - Copy your **Publishable key** (starts with `pk_test_...`)
   - Click "Reveal test key" and copy your **Secret key** (starts with `sk_test_...`)

3. **Add to `.env.local`**:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

## Step 2: Create Products and Prices

### Option A: Via Stripe Dashboard (Recommended for beginners)

1. **Go to Products**: https://dashboard.stripe.com/products
2. **Create Pro Plan**:
   - Click "+ Add product"
   - Name: "Pro Plan"
   - Description: "Unlimited messages, AI insights, and priority support"
   - Pricing:
     - **Monthly**: $9.00 USD, Recurring billing: Monthly
     - Click "Add another price"
     - **Yearly**: $90.00 USD, Recurring billing: Yearly
   - Click "Save product"

3. **Create Team Plan**:
   - Click "+ Add product"
   - Name: "Team Plan"
   - Description: "Everything in Pro plus team collaboration features"
   - Pricing:
     - **Monthly**: $15.00 USD per user, Recurring billing: Monthly
     - Click "Add another price"
     - **Yearly**: $150.00 USD per user, Recurring billing: Yearly
   - Click "Save product"

4. **Copy Price IDs**:
   - Click on each product
   - Under "Pricing", you'll see price IDs (starts with `price_...`)
   - Copy all 4 price IDs

### Option B: Via Stripe CLI (Advanced)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create Pro Monthly Price
stripe prices create \
  --product-data[name]="Pro Plan" \
  --unit-amount=900 \
  --currency=usd \
  --recurring[interval]=month

# Create Pro Yearly Price
stripe prices create \
  --product-data[name]="Pro Plan" \
  --unit-amount=9000 \
  --currency=usd \
  --recurring[interval]=year

# Create Team Monthly Price
stripe prices create \
  --product-data[name]="Team Plan" \
  --unit-amount=1500 \
  --currency=usd \
  --recurring[interval]=month \
  --billing_scheme=per_unit

# Create Team Yearly Price
stripe prices create \
  --product-data[name]="Team Plan" \
  --unit-amount=15000 \
  --currency=usd \
  --recurring[interval]=year \
  --billing_scheme=per_unit
```

5. **Add Price IDs to `.env.local`**:
   ```bash
   STRIPE_PRO_MONTHLY_PRICE_ID=price_...
   STRIPE_PRO_YEARLY_PRICE_ID=price_...
   STRIPE_TEAM_MONTHLY_PRICE_ID=price_...
   STRIPE_TEAM_YEARLY_PRICE_ID=price_...
   ```

## Step 3: Update Database with Stripe IDs

Update your `subscription_plans` table with the Stripe product and price IDs:

```sql
-- Update Pro plan
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_...', -- Your Pro product ID
  stripe_price_monthly_id = 'price_...', -- Your Pro monthly price ID
  stripe_price_yearly_id = 'price_...' -- Your Pro yearly price ID
WHERE name = 'pro';

-- Update Team plan
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_...', -- Your Team product ID
  stripe_price_monthly_id = 'price_...', -- Your Team monthly price ID
  stripe_price_yearly_id = 'price_...' -- Your Team yearly price ID
WHERE name = 'team';
```

## Step 4: Set Up Webhook

Webhooks allow Stripe to notify your app about subscription changes (payments, cancellations, etc.).

### For Local Development (Using Stripe CLI)

1. **Forward webhooks to localhost**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Copy the webhook signing secret** (starts with `whsec_...`)

3. **Add to `.env.local`**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. **Keep the CLI running** while testing locally

### For Production (Vercel/Production Server)

1. **Go to Webhooks**: https://dashboard.stripe.com/webhooks
2. **Click "+ Add endpoint"**
3. **Enter your endpoint URL**: `https://your-domain.com/api/stripe/webhook`
4. **Select events to listen to**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

   Or select "receive all events" for simplicity

5. **Click "Add endpoint"**
6. **Copy the Signing secret** (starts with `whsec_...`)
7. **Add to your production environment variables**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Step 5: Test the Integration

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test Subscription Flow

1. **Visit the pricing page**: http://localhost:3000/pricing
2. **Click "Start Free Trial" on Pro plan**
3. **Use Stripe test cards**:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Requires authentication: `4000 0025 0000 3155`

   Use any future expiration date, any 3-digit CVC, and any ZIP code.

4. **Complete checkout**
5. **Check your database**: Verify the subscription was created in `user_subscriptions`
6. **Check webhook events**: In Stripe Dashboard → Developers → Events

### 3. Test Usage Tracking

1. **Send messages in the chat**
2. **Check the database**:
   ```sql
   SELECT * FROM usage_tracking WHERE user_id = 'your-user-id';
   ```
3. **Verify the count increments**

### 4. Test Billing Portal

1. **Go to**: http://localhost:3000/settings/billing
2. **Click "Manage Billing"**
3. **Verify you're redirected to Stripe Customer Portal**
4. **Test updating payment method, canceling subscription, etc.**

## Step 6: Deploy to Production

1. **Update Environment Variables in Vercel/Your Host**:
   - All Stripe variables (using live keys: `sk_live_...` and `pk_live_...`)
   - Make sure `NEXT_PUBLIC_APP_URL` points to your production domain

2. **Switch to Live Mode in Stripe**:
   - Toggle "Test mode" to "Live mode" in Stripe Dashboard
   - Create real products and prices (same as test mode)
   - Create production webhook endpoint

3. **Test with Real Payment Methods**:
   - Use a real credit card (you can cancel immediately after testing)
   - Verify webhooks are working
   - Check all flows work correctly

## Common Issues & Solutions

### Issue: "No subscription found" Error

**Solution**:
- Verify the webhook secret is correct
- Check that webhooks are being received (Stripe Dashboard → Developers → Events)
- Ensure `checkout.session.completed` webhook fired successfully

### Issue: Price IDs Not Found

**Solution**:
- Double-check price IDs in `.env.local` match Stripe Dashboard
- Restart your dev server after updating `.env.local`
- Verify price IDs in Stripe Dashboard haven't changed

### Issue: Webhook Signature Verification Failed

**Solution**:
- Get fresh webhook secret from Stripe CLI or Dashboard
- Update `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Restart dev server
- Restart Stripe CLI (`stripe listen --forward-to...`)

### Issue: Usage Tracking Not Working

**Solution**:
- Check database functions exist: `get_current_usage`, `check_usage_limit`, `increment_usage`
- Run migration if needed: `supabase db reset`
- Check console logs for errors in `/api/chat` route

### Issue: Customer Portal Not Opening

**Solution**:
- Verify customer has a Stripe customer ID in database
- Check `stripe_customer_id` column in `user_subscriptions` table
- Ensure user has an active subscription

## Monitoring & Maintenance

### Stripe Dashboard

Monitor these regularly:
- **Payments**: Track successful and failed payments
- **Subscriptions**: View active subscriptions and churn
- **Events**: Monitor webhook events for issues
- **Disputes**: Handle customer disputes promptly

### Database Queries

```sql
-- Check active subscriptions
SELECT
  us.id,
  u.email,
  sp.display_name,
  us.status,
  us.current_period_end
FROM user_subscriptions us
JOIN auth.users u ON us.user_id = u.id
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active';

-- Check usage tracking
SELECT
  u.email,
  ut.metric,
  ut.count,
  ut.period_start,
  ut.period_end
FROM usage_tracking ut
JOIN auth.users u ON ut.user_id = u.id
ORDER BY ut.period_start DESC;

-- Check subscription events
SELECT
  se.event_type,
  se.created_at,
  u.email
FROM subscription_events se
JOIN auth.users u ON se.user_id = u.id
ORDER BY se.created_at DESC
LIMIT 50;
```

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use test keys in development**, live keys only in production
3. **Verify webhook signatures** (already implemented in webhook route)
4. **Rotate keys periodically** (every 6-12 months)
5. **Monitor for suspicious activity** in Stripe Dashboard
6. **Enable Stripe Radar** for fraud prevention (automatic in live mode)

## Next Steps

Now that Stripe is set up:

1. ✅ Test the complete subscription flow
2. ✅ Implement feature gates in your UI (use `useSubscription` hook)
3. ✅ Add upgrade prompts throughout the app
4. ✅ Set up email notifications for payment failures
5. ✅ Monitor Stripe Dashboard for customer activity
6. ✅ Consider adding analytics (Stripe provides some, or use PostHog/Mixpanel)

## Support

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **DAR App Issues**: See GitHub repository or contact support

---

**Last Updated**: 2025-11-13
