# Database Persistence Debugging Guide

## Current Status

The app has been updated with extensive logging to debug why messages aren't persisting. Here's what was fixed:

### Changes Made

1. **Updated API Route** ([app/api/chat/route.ts](app/api/chat/route.ts))
   - Changed from manual cookie handling to proper `createServerClient` from `@supabase/ssr`
   - Added extensive console logging to track authentication and message saving
   - Logs will show:
     - User authentication status
     - ConversationId received
     - User message saving process
     - Assistant message saving process

2. **Updated Client Side** ([app/page.tsx](app/page.tsx))
   - Added authentication check before loading data
   - Added logging to track conversation creation
   - Added logging to sendMessage wrapper
   - Logs will show:
     - Conversation creation/loading
     - ConversationId injection into API calls
     - Number of messages loaded from database

## How to Test & Debug

### Step 1: Clear Browser Data
```bash
# Open browser developer tools (F12)
# Go to Application tab > Storage
# Clear all site data for localhost:3000
# Or use incognito/private browsing mode
```

### Step 2: Access the App
1. Navigate to http://localhost:3000
2. You should be redirected to `/login`

### Step 3: Login
Login with one of these accounts:
- Email: `leighdinaya@proton.me`
- Email: `leighleigh@gmail.com`

(You'll need to know the password or create a new account)

### Step 4: Monitor Console Logs

**In Browser Console** (F12 > Console), you should see:
```
Creating new conversation for user: <user-id>
Conversation created: <conversation-id>
Conversation ID set: <conversation-id>
Loading messages from database...
Loaded 0 messages from database
```

### Step 5: Send a Test Message

Type a message and send it. You should see:
```
Sending message with conversationId: <conversation-id>
Injected conversationId into request: <conversation-id>
```

**In Terminal** (where npm run dev is running), you should see:
```
API Route: User authenticated: <user-id>
API Route: Received request with conversationId: <conversation-id>
API Route: Number of messages: 1
API Route: Saving user message: <first 50 chars>
API Route: User message saved successfully: <message-id>
API Route: Saving assistant message: <first 50 chars>
API Route: Assistant message saved successfully: <message-id>
```

### Step 6: Verify Database

```bash
# Check messages in database
docker exec supabase_db_dar-app psql -U postgres -c "SELECT id, role, content, created_at FROM messages ORDER BY created_at DESC LIMIT 5;"
```

## Common Issues & Solutions

### Issue 1: Still Getting 401 Unauthorized

**Symptoms:**
```
POST /api/chat 401 in XXXms
API Route: No user found in session
```

**Solutions:**
1. Make sure you're actually logged in (check if you see user email in header)
2. Clear all cookies and localStorage, then login again
3. Check if Supabase is running: `supabase status`
4. Verify environment variables are set in `.env.local`

### Issue 2: No ConversationId

**Symptoms:**
```
API Route: Missing userMessage or conversationId
No conversation ID available
```

**Solutions:**
1. Check browser console for conversation creation logs
2. Clear localStorage and refresh page
3. Make sure `createConversation` function is working (check for errors in console)

### Issue 3: Messages Not Saving

**Symptoms:**
- API returns 200 OK
- No error messages
- But `docker exec...` shows 0 messages

**Solutions:**
1. Check if `createMessageServer` is returning null (logs will show "Failed to save user message")
2. Verify RLS policies allow insert for authenticated users
3. Check Supabase logs: http://127.0.0.1:54323 (Supabase Studio)

## Manual Database Check

```bash
# Check if user is in database
docker exec supabase_db_dar-app psql -U postgres -c "SELECT id, email FROM auth.users;"

# Check conversations
docker exec supabase_db_dar-app psql -U postgres -c "SELECT * FROM conversations ORDER BY created_at DESC LIMIT 5;"

# Check messages
docker exec supabase_db_dar-app psql -U postgres -c "SELECT m.id, m.role, m.content, m.created_at, m.user_id, m.conversation_id FROM messages m ORDER BY m.created_at DESC LIMIT 10;"

# Check RLS policies
docker exec supabase_db_dar-app psql -U postgres -c "\d+ messages"
```

## Expected Flow

1. User loads page → Auth check → Redirect to login (if not authenticated)
2. User logs in → Session created → Redirect to home
3. Page loads → Create/load conversation → Set conversationId
4. User sends message → conversationId injected → API saves message → Database updated
5. Page refresh → Load messages from database → Display messages

## Next Steps

If you're still seeing issues after trying the above:

1. Share the console logs (both browser and terminal)
2. Share the output of the database check commands
3. Try creating a new user account to see if it's a specific user issue
4. Check Supabase Studio logs at http://127.0.0.1:54323
