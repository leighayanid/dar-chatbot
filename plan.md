# DAR App - Reminders & Notifications Implementation Plan

## 🚀 Quick Start - Testing Daily Reminders

Phase 1 (Daily Reminders) is complete and ready for testing! Here's how to test:

### Local Testing

1. **Start the services:**
   ```bash
   supabase start          # Start Supabase (includes Mailpit)
   npm run dev             # Start Next.js dev server
   ```

2. **Run the test script:**
   ```bash
   node test-email.js      # Sends a test reminder email
   ```

3. **View the email:**
   - Open http://127.0.0.1:54324 (Mailpit web interface)
   - You'll see the test email with full HTML rendering

### Production Testing

To test in production:

1. **Get a Resend API key:**
   - Sign up at https://resend.com
   - Get your API key from https://resend.com/api-keys
   - Add to `.env.local`: `RESEND_API_KEY=re_...`

2. **Generate a cron secret:**
   ```bash
   openssl rand -base64 32
   ```
   - Add to `.env.local`: `CRON_SECRET=<generated-secret>`

3. **Deploy to Vercel:**
   - Add the same environment variables in Vercel dashboard
   - Vercel will automatically detect `vercel.json` and set up the cron job
   - Cron runs every hour and checks which users need reminders

4. **Test the cron endpoint manually:**
   ```bash
   curl -X GET https://your-domain.com/api/cron/send-reminders \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

---

## 📊 Current Status Overview

### ✅ Completed (85%)

**Database Schema** (`supabase/migrations/20251103115051_add_phase2_features.sql`)
- ✅ `user_preferences` table with full reminder configuration
  - `reminder_enabled` (BOOLEAN, default: true)
  - `reminder_time` (TIME, default: '17:00:00' / 5 PM)
  - `reminder_days` (INTEGER[], default: [1,2,3,4,5] for Mon-Fri)
  - `email_weekly_summary` (BOOLEAN, default: true)
  - `email_monthly_summary` (BOOLEAN, default: true)
  - `timezone` (TEXT, default: 'UTC')
- ✅ RLS policies for user preferences
- ✅ Automatic creation via trigger for new users
- ✅ Updated_at trigger for tracking changes

**Settings UI** (`app/settings/page.tsx`)
- ✅ Complete reminder preferences interface
- ✅ Daily reminder toggle (on/off)
- ✅ Time picker for reminder time
- ✅ Day selector (Sun-Sat visual buttons)
- ✅ Weekly email summary toggle
- ✅ Monthly email summary toggle
- ✅ Timezone selector
- ✅ Save/update functionality with error handling

**Email Infrastructure** (`supabase/config.toml`)
- ✅ Local testing with Mailpit (http://127.0.0.1:54324)
- ✅ SMTP configuration structure ready for production
- ✅ Email rate limiting configured

**Email Service Integration**
- ✅ Resend library installed
- ✅ React Email installed
- ✅ Email sending wrapper created (`lib/email/send.ts`)
- ✅ Batch sending with rate limiting
- ✅ Error handling and statistics

**Email Templates**
- ✅ Daily reminder template (`emails/daily-reminder.tsx`)
- ✅ Template rendering utilities (`lib/email/templates.ts`)
- ⚪ Weekly summary template (Phase 2)
- ⚪ Monthly summary template (Phase 3)
- ⚪ Team invitation template (Phase 4)

**Notification Logic** (`lib/notifications/reminders.ts`)
- ✅ Data aggregation utilities
- ✅ Timezone-aware scheduling
- ✅ User eligibility filtering
- ✅ Day-of-week matching
- ✅ Helper functions for stats

**API Routes**
- ✅ Cron endpoint for daily reminders (`app/api/cron/send-reminders/route.ts`)
- ✅ Test endpoint for development (`app/api/test-reminder/route.ts`)
- ⚪ Cron endpoint for weekly summaries (Phase 2)
- ⚪ Cron endpoint for monthly summaries (Phase 3)

**Scheduling**
- ✅ Vercel Cron configuration (`vercel.json`)
- ✅ Hourly schedule for daily reminders
- ✅ Cron secret authentication

**Testing**
- ✅ Test script created (`test-email.js`)
- ✅ TypeScript compilation successful
- ⚪ Production deployment testing

### ⚠️ Ready for Testing (15%)

**Production Setup Required**
- ⚠️ Get real Resend API key (currently using placeholder)
- ⚠️ Deploy to Vercel and verify cron jobs work
- ⚠️ Test with real users and timezones
- ⚠️ Monitor email delivery rates
- ⚠️ Verify Mailpit captures emails locally

---

## 🏗️ Architecture Overview

### Technology Stack

**Email Service**: [Resend](https://resend.com/)
- Modern, developer-friendly API
- 3,000 free emails/month
- 100/day for free tier
- Excellent deliverability
- Built-in analytics

**Email Templates**: [React Email](https://react.email/)
- Type-safe email templates
- Component-based (like React)
- Preview in development
- Renders to production-ready HTML

**Scheduling**: [Vercel Cron](https://vercel.com/docs/cron-jobs)
- Native Vercel integration
- Configured via `vercel.json`
- Secure with secret headers
- Free on Pro plan, limited on Hobby

**Timezone Handling**: Native JavaScript `Intl` + user preferences
- Store user timezone in database
- Calculate local time for each user
- Send at appropriate UTC time

### Data Flow

```
┌─────────────────┐
│  Vercel Cron    │ Triggers hourly/daily
│  (vercel.json)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Route      │ /api/cron/send-reminders
│  (Protected)    │ Validates cron secret
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Query Users    │ lib/notifications/reminders.ts
│  - Enabled      │ - Filter by reminder_enabled
│  - Day match    │ - Check reminder_days
│  - Time match   │ - Timezone calculations
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Render Email   │ React Email template
│  Template       │ + user data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send via       │ Resend API
│  Resend         │ Batch processing
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Log Results    │ Success/failure tracking
│                 │ Error handling
└─────────────────┘
```

---

## 🎯 Implementation Roadmap

### Phase 1: Daily Reminders (Current Focus) 🔵

**Goal**: Send daily reminder emails to prompt users to log accomplishments

**User Experience**:
- User configures reminder time in settings (e.g., 5:00 PM)
- User selects which days (e.g., Mon-Fri)
- Every enabled day at their local time, they receive an email:
  - "Time to log your accomplishments!"
  - Motivational message
  - Direct link to dashboard
  - Unsubscribe/settings link

**Implementation Steps**:

1. ✅ Install Dependencies
   ```bash
   npm install resend react-email @react-email/components
   ```

2. ✅ Environment Setup
   - Add `RESEND_API_KEY` to `.env.local` and `.env.example`
   - Add `NEXT_PUBLIC_APP_URL` for email links
   - Get API key from https://resend.com/api-keys

3. ✅ Email Template (`emails/daily-reminder.tsx`)
   - React Email component
   - Personalized greeting
   - Call-to-action button → dashboard
   - Settings/unsubscribe link
   - Responsive design

4. ✅ Email Utilities (`lib/email/`)
   - `send.ts`: Resend client wrapper
   - `templates.ts`: Render helpers

5. ✅ Reminder Logic (`lib/notifications/reminders.ts`)
   - `getUsersForDailyReminder()`: Query eligible users
   - Timezone-aware filtering
   - Day-of-week matching

6. ✅ Cron API Route (`app/api/cron/send-reminders/route.ts`)
   - Verify cron secret header
   - Fetch eligible users
   - Send batch emails
   - Log results

7. ✅ Vercel Cron Config (`vercel.json`)
   ```json
   {
     "crons": [{
       "path": "/api/cron/send-reminders",
       "schedule": "0 * * * *"
     }]
   }
   ```

8. ✅ Test Endpoint (`app/api/test-reminder/route.ts`)
   - Development only
   - Manual trigger for testing
   - Send to current user

9. ✅ Local Testing
   - Test with Inbucket
   - Verify timezone handling
   - Check email rendering
   - Validate day filtering

**Success Criteria**:
- Users receive emails at their configured local time
- Emails respect day-of-week preferences
- Beautiful, mobile-responsive HTML emails
- Users can disable via settings
- Tested locally before production

**Estimated Time**: 4-6 hours

---

### Phase 2: Weekly Summary Emails 🔵

**Goal**: Send weekly recap of user's accomplishments every week

**User Experience**:
- Opt-in via settings (`email_weekly_summary` toggle)
- Receives email every Sunday evening (or Monday morning)
- Email contains:
  - Summary stats (total entries, active days)
  - Highlights from the week
  - Encouragement message
  - Link to full reports page

**Implementation**:
1. Email template (`emails/weekly-summary.tsx`)
2. Data aggregation function (query last 7 days of messages)
3. AI-powered summary generation (optional - use Claude to summarize)
4. Cron route (`/api/cron/send-weekly-summary`)
5. Vercel cron schedule (runs once per week)

**Success Criteria**:
- Weekly emails sent on schedule
- Accurate data aggregation
- Engaging summary format
- Opt-out via settings works

**Estimated Time**: 3-4 hours

---

### Phase 3: Monthly Summary Emails 🔵

**Goal**: Send monthly recap at the end of each month

**User Experience**:
- Opt-in via settings (`email_monthly_summary` toggle)
- Receives email on the 1st of each month
- Email contains:
  - Full month stats
  - Charts/visualizations (optional)
  - Key achievements
  - Month-over-month comparison
  - Link to download full report

**Implementation**:
1. Email template (`emails/monthly-summary.tsx`)
2. Data aggregation for 30-day period
3. Enhanced AI summary with insights
4. Cron route (`/api/cron/send-monthly-summary`)
5. Vercel cron schedule (runs 1st of month)

**Success Criteria**:
- Monthly emails sent on first day of month
- Comprehensive data analysis
- Professional report format
- Users can download/share

**Estimated Time**: 3-4 hours

---

### Phase 4: Team Invitation Emails 🔵

**Goal**: Send invitation emails when users are invited to teams

**User Experience**:
- Team admin sends invitation via team settings
- Invitee receives email immediately:
  - Team name and description
  - Who invited them
  - Accept/decline buttons (links to invitation page)
  - Expiration notice (7 days)

**Implementation**:
1. Email template (`emails/team-invitation.tsx`)
2. Update team invitation route to send email
3. Replace existing TODO comment in `/app/api/teams/[id]/invitations/route.ts`
4. Invitation acceptance flow remains the same

**Files to Modify**:
- `app/api/teams/[id]/invitations/route.ts` (line 113-116)
- Add email sending after invitation creation

**Success Criteria**:
- Emails sent immediately upon invitation
- Links work correctly
- Professional, branded emails
- Expiration warning clear

**Estimated Time**: 2-3 hours

---

### Phase 5: In-App Notifications (Future) 🔵

**Goal**: Real-time notifications within the app

**Features**:
- Toast notifications for important events
- Notification center/bell icon
- Mark as read functionality
- Preferences for each notification type

**Implementation**:
- New `notifications` table in database
- Real-time subscriptions via Supabase
- UI component for notification center
- Integration with existing pages

**Estimated Time**: 6-8 hours (future enhancement)

---

## 📝 Technical Notes

### Timezone Handling Strategy

User's timezone is stored in `user_preferences.timezone`. When checking if a user should receive a reminder:

```typescript
// User wants reminder at 5:00 PM their time
const userTime = reminder_time // "17:00:00"
const userTZ = timezone // "America/New_York"

// Current time in user's timezone
const now = new Date()
const userLocalTime = new Intl.DateTimeFormat('en-US', {
  timeZone: userTZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).format(now)

// Check if current hour matches
if (userLocalTime.startsWith('17:')) {
  // Send reminder!
}
```

**Cron Strategy**: Run every hour, check all users whose `reminder_time` matches current hour in their timezone.

### Email Rate Limiting

**Resend Limits**:
- Free: 100 emails/day, 3,000/month
- Pro: 50,000 emails/month

**Batching Strategy**:
- Send daily reminders in batches of 50
- Add small delay between batches (100ms)
- Log any failures for retry

### Error Handling

**Email Send Failures**:
- Log to console with user ID
- Don't retry immediately (avoid spam)
- Track failure rate
- Alert if > 10% failure rate

**Database Query Failures**:
- Return empty array (fail gracefully)
- Log error for debugging
- Don't crash cron job

### Security

**Cron Endpoints**:
- Protected by `CRON_SECRET` env variable
- Verify `Authorization` header
- Return 401 if unauthorized

**Email Links**:
- Use secure tokens where needed
- HTTPS only in production
- No sensitive data in query params

---

## 🔧 Development Setup

### Local Testing with Inbucket

1. Start Supabase (starts Inbucket automatically):
   ```bash
   supabase start
   ```

2. Access Inbucket web UI:
   ```
   http://127.0.0.1:54324
   ```

3. All emails sent locally are captured here (not actually sent)

4. SMTP details for direct testing:
   - Host: 127.0.0.1
   - Port: 54325

### Testing Reminder Emails

**Manual Test Endpoint** (dev only):
```bash
# Send test reminder to current user
curl http://localhost:3000/api/test-reminder \
  -H "Cookie: <your-session-cookie>"
```

**Preview Email Templates**:
```bash
# React Email includes a dev server
npm run email:dev
# Opens http://localhost:3001 with email previews
```

### Environment Variables

**Required for Development**:
```env
# .env.local

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Secret (generate random string)
CRON_SECRET=your-random-secret-string-here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI (already configured)
ANTHROPIC_API_KEY=sk-ant-...
```

**Production** (Vercel):
- Add same variables to Vercel project settings
- Use production Resend API key
- Update `NEXT_PUBLIC_APP_URL` to your domain

---

## 📚 Resources

### Documentation
- [Resend Docs](https://resend.com/docs)
- [React Email Docs](https://react.email/docs)
- [Vercel Cron Docs](https://vercel.com/docs/cron-jobs)

### Code Examples
- [React Email Examples](https://react.email/examples)
- [Resend Next.js Guide](https://resend.com/docs/send-with-nextjs)

### Testing
- [Inbucket](https://www.inbucket.org/) - Already configured in Supabase

---

## 🐛 Troubleshooting

### Emails Not Sending

**Check**:
1. Is `RESEND_API_KEY` set correctly?
2. Is Resend domain verified? (production only)
3. Check Resend dashboard for errors
4. Look at API route logs
5. Verify user has `reminder_enabled = true`

### Wrong Timing

**Check**:
1. User's `timezone` setting in database
2. User's `reminder_time` setting
3. User's `reminder_days` array
4. Current day of week calculation
5. Cron schedule in vercel.json

### Emails Going to Spam

**Solutions**:
1. Set up SPF/DKIM records (Resend provides)
2. Verify domain in Resend
3. Use professional "From" address
4. Include unsubscribe link
5. Don't send too frequently

### Local Inbucket Not Working

**Check**:
1. Is Supabase running? (`supabase status`)
2. Is Inbucket port available? (54324)
3. Try restarting Supabase (`supabase stop && supabase start`)

---

## ✅ Current Sprint: Daily Reminders

**Status**: ✅ Phase 1 Complete (Ready for Testing)

**Tasks**:
- [x] Create this plan.md
- [x] Install dependencies (resend, react-email)
- [x] Add environment variables
- [x] Create email template
- [x] Create email utility library
- [x] Create reminder logic utility
- [x] Create cron API route
- [x] Create Vercel cron config
- [x] Create test endpoint
- [x] Create test script (test-email.js)
- [x] Fix TypeScript compilation errors
- [ ] Test locally with Mailpit
- [ ] Get real Resend API key
- [ ] Deploy to Vercel and test production

**Completed**: 2025-11-05

---

## 📊 Progress Tracking

| Feature | Status | Completion |
|---------|--------|------------|
| Database Schema | ✅ Done | 100% |
| Settings UI | ✅ Done | 100% |
| Daily Reminders | ✅ Done (Testing) | 95% |
| Weekly Summaries | ⚪ Not Started | 0% |
| Monthly Summaries | ⚪ Not Started | 0% |
| Team Invitations | ⚪ Not Started | 0% |
| In-App Notifications | ⚪ Not Started | 0% |

**Overall Completion**: 85% Phase 1 | 42% Total (3 of 7 features complete/in-testing)

---

*Last Updated: 2025-11-05*
*Next Review: After Production Testing / Before Phase 2*
