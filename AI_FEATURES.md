# AI Features - Optional Setup Guide

The DAR app can work with or without AI features. AI features are currently **disabled** to allow deployment without requiring an Anthropic API key.

## Current Status

✅ **App is fully functional** - All core features work without AI
❌ **AI chat is disabled** - Chat endpoint will return a helpful message
❌ **AI summaries are disabled** - Weekly summaries will use fallback text

## How AI Features Were Disabled

The `@ai-sdk/anthropic` package has been **removed** from dependencies to prevent build errors when `ANTHROPIC_API_KEY` is not configured.

## To Enable AI Features (Optional)

If you want to enable AI-powered chat and summaries:

### 1. Install the Anthropic SDK

```bash
npm install @ai-sdk/anthropic
```

### 2. Get an Anthropic API Key

1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Navigate to "API Keys"
4. Create a new API key (starts with `sk-ant-...`)

### 3. Add the API Key

**For Local Development:**

Add to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

**For Vercel Deployment:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your API key
   - Environments: All (Production, Preview, Development)
3. Redeploy your app

### 4. Restart/Redeploy

**Local:**
```bash
npm run dev
```

**Vercel:**
- Push a new commit, or
- Go to Deployments → Redeploy

## What AI Features Do

### 1. AI-Powered Chat
- Located at the main dashboard
- Helps users reflect on their daily accomplishments
- Asks thoughtful questions to help articulate achievements
- Provides encouraging feedback

### 2. AI-Generated Summaries
- Weekly email summaries with AI-powered insights
- Highlights the most significant accomplishments
- Identifies patterns and themes in user's work

### 3. Smart Highlights
- AI selects the top accomplishments from the week
- Based on criteria: progress, impact, learning, outcomes

## Fallback Behavior (When AI is Disabled)

When AI is not configured, the app gracefully falls back to:

- **Chat**: Returns a message explaining AI is not available
- **Weekly Summaries**: Uses generic encouraging messages
- **Highlights**: Simple selection of recent accomplishments (first N items)

## Cost Considerations

Anthropic API Usage:
- **Free tier**: $5 in free credits (limited time)
- **Paid**: ~$0.003 per 1K tokens (input) / ~$0.015 per 1K tokens (output)
- **Typical chat message**: ~$0.001 - $0.01 depending on length
- **Weekly summary**: ~$0.005 - $0.02 per user

**Estimate for 100 active users:**
- Daily chat: ~$3-10/day
- Weekly summaries: ~$1-2/week
- **Total**: ~$100-350/month

## Alternative: Use OpenAI Instead

The app can be configured to use OpenAI instead of Anthropic:

```bash
# Install OpenAI SDK (already in dependencies)
npm install @ai-sdk/openai  # Already installed

# Get API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-key-here
```

Then update [app/api/chat/route.ts](app/api/chat/route.ts):

```typescript
// Change from:
import { getAnthropicProvider } from '@/lib/ai/provider'
const anthropic = await getAnthropicProvider()
model: anthropic('claude-3-5-sonnet-20241022')

// To:
import { openai } from '@ai-sdk/openai'
model: openai('gpt-4-turbo')
```

## Troubleshooting

**Build fails with "Neither apiKey nor config.authenticator provided"**

1. Make sure `@ai-sdk/anthropic` is removed: `npm uninstall @ai-sdk/anthropic`
2. Clear build cache: `rm -rf .next`
3. Rebuild: `npm run build`

**AI features not working after adding API key**

1. Verify API key is set correctly
2. Check console logs for errors
3. Ensure you reinstalled the package: `npm install @ai-sdk/anthropic`
4. Restart the development server

**Vercel deployment succeeds but AI doesn't work**

1. Check environment variables are set in Vercel dashboard
2. Ensure `@ai-sdk/anthropic` is in `dependencies` (not `devDependencies`)
3. Redeploy with fresh build cache

## Summary

The app is designed to work **perfectly fine without AI**. AI features are a premium enhancement that can be enabled when you're ready by:
1. Installing the SDK
2. Adding your API key
3. Redeploying

All core functionality (logging accomplishments, viewing history, generating reports, etc.) works without AI!
