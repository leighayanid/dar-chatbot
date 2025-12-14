# Quick Fix: Vercel Deployment Error

## The Error You're Seeing

```
Error: Neither apiKey nor config.authenticator provided
> Build error occurred
Error: Failed to collect page data for /api/...
```

## Why This Happens

The Anthropic AI SDK validates the API key when it's imported, which happens during Next.js build. If `ANTHROPIC_API_KEY` is not set in Vercel's environment variables, the build fails.

## Quick Fix (5 Minutes)

### Step 1: Get Your Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign in or create an account
3. Click "API Keys" in the sidebar
4. Create a new API key or copy an existing one
5. The key starts with `sk-ant-...`

### Step 2: Add Environment Variable to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your API key (starts with `sk-ant-...`)
   - **Environment**: Select all three (Production, Preview, Development)
5. Click **Save**

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Set the environment variable
vercel env add ANTHROPIC_API_KEY

# When prompted:
# - Paste your API key
# - Select all environments (Production, Preview, Development)
```

### Step 3: Redeploy

After adding the environment variable:

**Option A: Via Dashboard**
1. Go to **Deployments** tab
2. Click the three dots (**...**) on the latest deployment
3. Click **Redeploy**
4. Ensure "Use existing Build Cache" is **unchecked**
5. Click **Redeploy**

**Option B: Via Git Push**
```bash
git commit --allow-empty -m "Trigger rebuild with ANTHROPIC_API_KEY"
git push
```

**Option C: Via CLI**
```bash
vercel --prod
```

### Step 4: Verify Success

1. Watch the build logs in Vercel dashboard
2. Look for: ✅ `Compiled successfully`
3. The deployment should complete without the API key error

## Additional Required Variables (Set These Next)

After fixing the API key error, you'll need these for the app to work:

```bash
# Supabase (Database) - Get from https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# App URL - Your Vercel deployment URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Setting Up Supabase (If You Haven't)

1. Go to https://supabase.com/dashboard
2. Create a new project (or use existing)
3. Wait for project to finish setting up
4. Go to **Settings** → **API**
5. Copy these values to Vercel environment variables:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

6. Run your database migrations:
```bash
# Link your local project to the production project
supabase link --project-ref your-project-ref

# Push migrations to production
supabase db push
```

## Still Getting Errors?

### If Build Still Fails

1. **Check the environment variable is set correctly**:
   - Go to Vercel → Settings → Environment Variables
   - Verify `ANTHROPIC_API_KEY` exists and has a value
   - The value should start with `sk-ant-`

2. **Clear build cache**:
   - Redeploy with "Use existing Build Cache" **unchecked**

3. **Check Vercel function logs**:
   - Go to your deployment
   - Click **Functions** tab
   - Look for detailed error messages

### If App Works But Features Don't

- **No AI responses**: Verify `ANTHROPIC_API_KEY` is set
- **Database errors**: Verify all three Supabase variables are set
- **Email notifications don't work**: Add `RESEND_API_KEY` (optional feature)
- **Cron jobs failing**: Add `CRON_SECRET` with a random string

## Need More Help?

- See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for complete deployment guide
- See [.env.example](.env.example) for all environment variables
- Check [Vercel documentation](https://vercel.com/docs/environment-variables)

---

**Quick Checklist:**
- [ ] Added `ANTHROPIC_API_KEY` to Vercel
- [ ] Added Supabase variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Added `NEXT_PUBLIC_APP_URL`
- [ ] Redeployed with fresh build cache
- [ ] Verified build succeeded in Vercel logs
