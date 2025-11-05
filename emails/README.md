# Email Templates

This directory contains React Email templates for automated user notifications.

## Overview

We use [React Email](https://react.email/) to create type-safe, component-based email templates. These templates are rendered to HTML and sent via [Resend](https://resend.com/).

## Templates

### `daily-reminder.tsx` (Phase 1)
**Purpose**: Prompt users to log their daily accomplishments

**Features**:
- Personalized greeting with user name
- List of benefits for daily logging
- CTA button to dashboard
- Settings/unsubscribe links

**Triggered**: Hourly via cron, sent to users at their configured reminder time
**Cron**: `0 * * * *` (every hour)

### `weekly-summary.tsx` (Phase 2)
**Purpose**: Provide users with a weekly recap and insights

**Features**:
- Statistics cards (entries, active days, consistency)
- AI-generated summary of accomplishments
- Top 5 highlights selected by AI
- Dynamic encouragement based on performance
- CTA button to reports page
- Settings/unsubscribe links

**Triggered**: Weekly via cron, sent every Sunday at 8 PM UTC
**Cron**: `0 20 * * 0` (Sunday 8 PM UTC)

## Design System

All templates follow a consistent design language:

**Colors**:
- Primary: Blue to indigo gradient (#667eea to #764ba2)
- Accent: Various (blue for AI, yellow for highlights, green for encouragement)
- Background: Light gray (#f6f9fc)
- Text: Dark gray (#1a1a1a, #484848)

**Layout**:
- Container: Max-width, centered, rounded corners, shadow
- Header: Gradient background with app name
- Content: Padding, comfortable line-height
- Footer: Light background, smaller text

**Typography**:
- Font: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, etc.)
- Headings: Bold, large size (28px-32px)
- Body: Regular, readable size (15px-16px)
- Footer: Small, subtle (12px-13px)

## Usage

Templates are rendered using `lib/email/templates.ts`:

```typescript
import { renderDailyReminderEmail, renderWeeklySummaryEmail } from '@/lib/email/templates'

// Render daily reminder
const { html, text, subject } = renderDailyReminderEmail({
  userName: 'John Doe',
  userEmail: 'john@example.com',
})

// Render weekly summary
const { html, text, subject } = renderWeeklySummaryEmail({
  userName: 'John Doe',
  userEmail: 'john@example.com',
  weekData: {
    startDate: 'Oct 28, 2025',
    endDate: 'Nov 4, 2025',
    totalEntries: 5,
    activeDays: 3,
    totalDays: 7,
    highlights: ['Achievement 1', 'Achievement 2'],
    aiSummary: 'Great work this week!',
  },
})
```

## Testing

### Local Testing
1. Start Supabase (includes Mailpit):
   ```bash
   supabase start
   ```

2. Run test scripts:
   ```bash
   node test-email.js          # Daily reminder
   node test-weekly-summary.js # Weekly summary
   ```

3. View emails in Mailpit:
   - Open http://127.0.0.1:54324
   - All locally sent emails appear here

### Preview in React Email Dev Server
```bash
npm run email:dev
```
Opens http://localhost:3001 with live preview of all templates.

## Creating New Templates

1. **Create template file** in this directory:
   ```tsx
   // emails/new-template.tsx
   import { Html, Body, Container, Text, Button } from '@react-email/components'

   interface NewTemplateProps {
     userName: string
     // ... other props
   }

   export const NewTemplate = ({ userName }: NewTemplateProps) => {
     return (
       <Html>
         <Body>
           <Container>
             <Text>Hi {userName}!</Text>
             <Button href="https://example.com">Click me</Button>
           </Container>
         </Body>
       </Html>
     )
   }

   export default NewTemplate
   ```

2. **Add renderer** to `lib/email/templates.ts`:
   ```typescript
   import NewTemplate from '@/emails/new-template'

   export function renderNewTemplate(params: NewTemplateProps) {
     const html = render(NewTemplate(params))
     const text = `Plain text version...`

     return {
       html,
       text,
       subject: 'Your Subject Here',
     }
   }
   ```

3. **Create cron endpoint** (if scheduled):
   ```typescript
   // app/api/cron/send-new-template/route.ts
   import { renderNewTemplate } from '@/lib/email/templates'
   import { sendBatchEmails } from '@/lib/email/send'

   export async function GET(request: NextRequest) {
     // Security check, user filtering, email sending...
   }
   ```

4. **Add to vercel.json** (if scheduled):
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/send-new-template",
         "schedule": "0 9 * * *"
       }
     ]
   }
   ```

5. **Add test script**:
   ```javascript
   // test-new-template.js
   // Similar to test-email.js or test-weekly-summary.js
   ```

## Resources

- [React Email Documentation](https://react.email/docs)
- [React Email Examples](https://react.email/examples)
- [Resend Documentation](https://resend.com/docs)
- [Cron Schedule Reference](https://crontab.guru/)

## Best Practices

1. **Always include plain text version** - Some email clients don't support HTML
2. **Test in multiple clients** - Gmail, Outlook, Apple Mail, mobile
3. **Keep it simple** - Complex layouts may not render consistently
4. **Optimize images** - Use CDN links, not base64
5. **Include unsubscribe link** - Required for compliance and good UX
6. **Use system fonts** - Avoid custom fonts for better compatibility
7. **Mobile-first** - Design for mobile, enhance for desktop
8. **Test with long content** - Names, messages can be longer than expected
9. **Fallback colors** - Not all clients support gradients
10. **Accessibility** - Use semantic HTML, proper contrast ratios

## Email Deliverability

To ensure emails reach users' inboxes:

1. **Verify domain** in Resend dashboard
2. **Set up SPF/DKIM** records (Resend provides)
3. **Warm up sending** - Start with small volumes
4. **Monitor bounce rates** - High bounces hurt reputation
5. **Honor unsubscribes** - Immediately stop sending
6. **Avoid spam triggers** - ALL CAPS, excessive punctuation!!!, etc.
7. **Authenticate senders** - Use verified domain, not generic addresses
8. **Consistent sending** - Don't suddenly send huge volumes

## Future Templates

- **Monthly Summary** (Phase 3) - Comprehensive monthly report
- **Team Invitation** (Phase 4) - Invite users to join teams
- **Welcome Email** - Onboarding for new users
- **Password Reset** - Security-related emails
- **Account Updates** - Notification of account changes
