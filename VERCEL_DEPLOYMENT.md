# Vercel Deployment Guide

This guide will help you deploy your DAR application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com)
2. Your project pushed to GitHub/GitLab/Bitbucket
3. Production Supabase project set up
4. Anthropic API key
5. (Optional) Resend API key for email notifications
6. (Optional) Stripe account for payments

## Step 1: Set Up Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add the following:

### Required Variables

```bash
# AI Configuration (REQUIRED FOR BUILD)
ANTHROPIC_API_KEY=sk-ant-your-real-api-key-here

# Supabase Configuration (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Optional Variables (for full functionality)

```bash
# Email Notifications (Resend)
RESEND_API_KEY=re_your-resend-api-key

# Cron Job Security
CRON_SECRET=your-random-secret-string-generate-with-openssl

# Stripe Payment Processing (if using subscriptions)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

## Step 2: Important Notes

### Environment Variable Scopes

Set all variables for **all environments** (Production, Preview, Development) unless you want different values per environment.

### ANTHROPIC_API_KEY is Required for Build

⚠️ **Critical**: The `ANTHROPIC_API_KEY` must be set in Vercel **before deployment** because the AI SDK validates it during the build process. The build will fail without it.

### Generating Secrets

Generate a secure `CRON_SECRET`:
```bash
openssl rand -base64 32
```

## Step 3: Configure Supabase for Production

1. Create a production Supabase project at https://supabase.com
2. Run your migrations:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```
3. Copy your production credentials to Vercel environment variables

## Step 4: Deploy

### Option 1: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will detect Next.js automatically
5. Add all environment variables from Step 1
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and set environment variables when asked
```

## Step 5: Post-Deployment Setup

### Configure Cron Jobs (for email notifications)

After deployment, Vercel Cron will automatically run based on your `vercel.json` configuration:
- Daily reminders: Every hour (filters by user timezone)
- Weekly summaries: Sunday at 8 PM UTC

Verify cron jobs in: Vercel Dashboard → Your Project → Cron

### Set Up Stripe Webhooks (if using payments)

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET` in Vercel

### Configure Custom Domain (optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_APP_URL` to your custom domain
4. Update Supabase redirect URLs if needed

## Troubleshooting

### Build Fails with "Neither apiKey nor config.authenticator provided"

**Solution**: Make sure `ANTHROPIC_API_KEY` is set in Vercel environment variables for all environments.

### Supabase Connection Issues

**Solution**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase project is not paused
- Ensure RLS policies are configured correctly

### Email Notifications Not Sending

**Solution**:
- Verify `RESEND_API_KEY` is set
- Check `NEXT_PUBLIC_APP_URL` is correct
- Verify `CRON_SECRET` matches between cron jobs and environment variable
- Check Vercel Function logs for errors

### Cron Jobs Not Running

**Solution**:
- Verify `vercel.json` exists and is properly configured
- Check Vercel Dashboard → Cron for job status
- Ensure `CRON_SECRET` is set correctly
- Check Function logs for authentication errors

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `ANTHROPIC_API_KEY` - Your Anthropic API key (REQUIRED FOR BUILD)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Production Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Production Supabase service role key
- [ ] `NEXT_PUBLIC_APP_URL` - Your production app URL
- [ ] `RESEND_API_KEY` - (Optional) For email notifications
- [ ] `CRON_SECRET` - (Optional) For securing cron endpoints
- [ ] `STRIPE_SECRET_KEY` - (Optional) For payment processing
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - (Optional) For Stripe checkout
- [ ] `STRIPE_WEBHOOK_SECRET` - (Optional) For Stripe webhooks

## Deployment Commands

The build command is automatically configured in `package.json`:

```json
{
  "scripts": {
    "build": "ANTHROPIC_API_KEY=sk-ant-build-dummy-key-... next build"
  }
}
```

**Note**: This dummy key is only used if `ANTHROPIC_API_KEY` is not set as an environment variable. Vercel will use the environment variable you set in the dashboard, overriding this default.

## Support

If you encounter issues:
1. Check Vercel Function logs in the dashboard
2. Review Supabase logs for database errors
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly

---

**Ready to deploy!** Make sure all environment variables are set in Vercel, then push your code or click deploy.
