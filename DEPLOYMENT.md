# Deployment Guide

This guide will walk you through deploying the DAR app to production.

## Prerequisites

- [ ] GitHub account
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Supabase account (sign up at https://supabase.com)
- [ ] Resend account (sign up at https://resend.com)
- [ ] Stripe account (sign up at https://stripe.com)
- [ ] Anthropic API key (from https://console.anthropic.com/)

## Step 1: Prepare Your Repository

### 1.1 Ensure Clean Git State

```bash
git status
git add .
git commit -m "feat: prepare for deployment"
```

### 1.2 Push to GitHub

If not already done:
```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/dar-app.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Supabase Production Database

### 2.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Choose an organization (or create one)
4. Fill in project details:
   - **Name**: dar-app-prod (or your preference)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start

### 2.2 Apply Database Migrations

```bash
# Link your local project to the production database
supabase link --project-ref YOUR_PROJECT_REF

# Push your migrations to production
supabase db push
```

**Note**: Find your project ref in the Supabase dashboard URL or project settings.

### 2.3 Get Production Credentials

From your Supabase project dashboard (Settings → API):
- **Project URL**: `https://xxx.supabase.co`
- **Anon/Public Key**: `eyJh...` (starts with eyJh)
- **Service Role Key**: `eyJh...` (different from anon key - keep this secret!)

## Step 3: Set Up Email Service (Resend)

### 3.1 Create Resend Account & Get API Key

1. Go to https://resend.com
2. Sign up and verify your email
3. Go to API Keys → Create API Key
4. Save the key (starts with `re_`)

### 3.2 Add Your Domain (Optional but Recommended)

For production emails:
1. Go to Domains → Add Domain
2. Follow DNS verification steps
3. Use your verified domain in email templates

**For now**: You can use the default `onboarding@resend.dev` for testing.

## Step 4: Set Up Payments (Stripe)

### 4.1 Create Stripe Account

1. Go to https://stripe.com
2. Sign up and complete account setup
3. Get your API keys from https://dashboard.stripe.com/apikeys
   - **Publishable key**: `pk_test_...` (for test mode)
   - **Secret key**: `sk_test_...` (keep this secret!)

### 4.2 Create Products & Prices

1. Go to Products → Add Product
2. Create pricing tiers:

**Pro Plan:**
- Name: "DAR Pro"
- Monthly: $10/month (recurring)
- Yearly: $100/year (recurring)

**Team Plan:**
- Name: "DAR Team"
- Monthly: $30/month (recurring)
- Yearly: $300/year (recurring)

3. Save the Price IDs for each plan (e.g., `price_1abc...`)

### 4.3 Set Up Webhooks (After Deployment)

You'll need your deployment URL first. We'll come back to this in Step 6.

## Step 5: Deploy to Vercel

### 5.1 Import Project to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 5.2 Add Environment Variables

Before deploying, add these environment variables in Vercel:

```env
# AI
ANTHROPIC_API_KEY=sk-ant-xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Email
RESEND_API_KEY=re_xxx
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Cron Security
CRON_SECRET=YOUR_RANDOM_SECRET_HERE

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
STRIPE_TEAM_MONTHLY_PRICE_ID=price_xxx
STRIPE_TEAM_YEARLY_PRICE_ID=price_xxx
```

**To generate `CRON_SECRET`:**
```bash
openssl rand -base64 32
```

### 5.3 Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Note your deployment URL (e.g., `https://dar-app.vercel.app`)

## Step 6: Configure Stripe Webhooks

### 6.1 Create Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL:
   ```
   https://your-app.vercel.app/api/webhooks/stripe
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy the **Signing secret** (starts with `whsec_`)

### 6.2 Update Vercel Environment Variables

1. Go to your Vercel project → Settings → Environment Variables
2. Update `STRIPE_WEBHOOK_SECRET` with the signing secret
3. Redeploy your app (Deployments → ⋮ → Redeploy)

## Step 7: Verify Cron Jobs

### 7.1 Check Cron Configuration

Vercel will automatically detect and configure the cron jobs from `vercel.json`:
- Daily reminders: Every hour
- Weekly summaries: Sundays at 8 PM UTC

### 7.2 Test Cron Endpoints

```bash
# Test daily reminders endpoint
curl -X POST https://your-app.vercel.app/api/cron/send-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test weekly summaries endpoint
curl -X POST https://your-app.vercel.app/api/cron/send-weekly-summaries \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response: `{ "success": true, ... }`

## Step 8: Post-Deployment Checklist

- [ ] App loads successfully at your Vercel URL
- [ ] Can create a new chat conversation
- [ ] AI responses are working
- [ ] Messages persist after page reload
- [ ] Theme toggle works
- [ ] Sidebar navigation works
- [ ] Stripe checkout flow works (test with Stripe test cards)
- [ ] Email reminders are scheduled
- [ ] Weekly summaries are scheduled
- [ ] Webhook events are received (check Stripe dashboard)

## Step 9: Custom Domain (Optional)

### 9.1 Add Custom Domain in Vercel

1. Go to your project → Settings → Domains
2. Add your domain (e.g., `dar.yourdomain.com`)
3. Follow DNS configuration instructions

### 9.2 Update Environment Variables

After domain is configured:
1. Update `NEXT_PUBLIC_APP_URL` to your custom domain
2. Update Stripe webhook URL to use custom domain
3. Update Resend domain settings if applicable

## Monitoring & Maintenance

### View Logs

- **Vercel Logs**: Project → Deployments → [deployment] → Logs
- **Supabase Logs**: Project → Logs
- **Stripe Events**: Dashboard → Events
- **Resend Emails**: Dashboard → Emails

### Monitor Cron Jobs

- Vercel → Project → Deployments → Cron
- Check execution history and logs

### Database Backups

Supabase automatically backs up your database daily on paid plans.

## Troubleshooting

### Build Fails

1. Check build logs in Vercel
2. Ensure all dependencies are in `package.json`
3. Test build locally: `npm run build`

### Environment Variables Not Working

1. Ensure they're set in Vercel dashboard
2. Redeploy after adding/updating variables
3. Check variable names match exactly

### Cron Jobs Not Running

1. Verify `vercel.json` is in the repository root
2. Check Vercel Cron dashboard for execution logs
3. Ensure `CRON_SECRET` is set correctly

### Stripe Webhooks Failing

1. Check webhook signing secret is correct
2. Verify webhook URL is accessible
3. Check Stripe dashboard → Events for error details

### Emails Not Sending

1. Verify `RESEND_API_KEY` is correct
2. Check Resend dashboard for email logs
3. Ensure domain is verified (for production)

## Going to Production

When you're ready to go live:

1. **Switch Stripe to Live Mode**:
   - Use live API keys (`sk_live_...`, `pk_live_...`)
   - Recreate products/prices in live mode
   - Update webhook endpoint to use live mode

2. **Update Environment Variables**:
   - Set all Stripe variables to live values
   - Keep other variables the same

3. **Test Everything Again**:
   - Run through full user journey
   - Test payments with real card (then refund)
   - Verify emails are being sent

4. **Monitor Closely**:
   - Watch for errors in Vercel logs
   - Monitor Stripe events
   - Check email deliverability

## Support

- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs
- **Resend**: https://resend.com/docs
- **Next.js**: https://nextjs.org/docs
