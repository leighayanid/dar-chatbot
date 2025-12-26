# Vercel Deployment Instructions

## Quick Start

To deploy your DAR app to Vercel:

### 1. Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-`)

### 2. Set Up Supabase (Production)

1. Go to https://supabase.com/dashboard
2. Create a new project
3. Wait for it to initialize
4. Go to Settings → API
5. Copy these values:
   - Project URL
   - `anon` public key
   - `service_role` key (Show secret)

6. Run migrations:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

### 3. Add Environment Variables to Vercel

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

**Required:**
```
OPENAI_API_KEY=sk-your-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Optional (for full features):**
```
RESEND_API_KEY=re_your-key
CRON_SECRET=your-random-secret
STRIPE_SECRET_KEY=sk_your-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_your-key
```

**Important:** Select "All Environments" (Production, Preview, Development) for each variable.

### 4. Deploy

**Option A: Via GitHub**
1. Push your code to GitHub
2. Connect repo in Vercel dashboard
3. Vercel will auto-deploy

**Option B: Via Vercel CLI**
```bash
npm i -g vercel
vercel
```

## What Each Environment Variable Does

| Variable | Purpose | Required? |
|----------|---------|-----------|
| `OPENAI_API_KEY` | AI chat & summaries | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Database connection | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side DB auth | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | Email links & redirects | ✅ Yes |
| `RESEND_API_KEY` | Email notifications | Optional |
| `CRON_SECRET` | Cron job security | Optional |
| `STRIPE_SECRET_KEY` | Payment processing | Optional |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe checkout | Optional |

## Troubleshooting

### Build fails with "Neither apiKey nor config.authenticator provided"

**Solution:** Make sure `OPENAI_API_KEY` and `STRIPE_SECRET_KEY` are set in Vercel environment variables (or use placeholder values during build if not using Stripe).

### Database connection errors

**Solution:**
- Verify all three Supabase variables are correct
- Check Supabase project is not paused
- Ensure you ran `supabase db push`

### Email notifications not working

**Solution:**
- Add `RESEND_API_KEY`
- Verify `NEXT_PUBLIC_APP_URL` is your actual domain
- Check Vercel Function logs for errors

## Post-Deployment

### Set Up Cron Jobs

Vercel will automatically run cron jobs based on `vercel.json`:
- **Daily reminders**: Every hour (filtered by user timezone)
- **Weekly summaries**: Sunday 8 PM UTC

View cron status: Vercel Dashboard → Your Project → Cron

### Configure Stripe Webhooks (if using payments)

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` in Vercel

### Add Custom Domain (optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Checklist

Before deploying, ensure you have:

- [ ] OpenAI API key from platform.openai.com
- [ ] Production Supabase project set up
- [ ] All required environment variables added to Vercel
- [ ] Database migrations pushed (`supabase db push`)
- [ ] (Optional) Resend API key for emails
- [ ] (Optional) Stripe keys for payments
- [ ] Code pushed to Git repository
- [ ] Vercel project connected to repository

## Support

If you encounter issues:
- Check Vercel deployment logs
- Verify all environment variables are set correctly
- Ensure variable names match exactly (case-sensitive)
- Try redeploying with fresh build cache

---

**Ready to deploy!** 🚀
