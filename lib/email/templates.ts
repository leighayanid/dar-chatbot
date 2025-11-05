import { render } from '@react-email/components'
import DailyReminderEmail from '@/emails/daily-reminder'
import WeeklySummaryEmail from '@/emails/weekly-summary'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Render daily reminder email
 */
export function renderDailyReminderEmail(params: {
  userName?: string
  userEmail: string
}) {
  const { userName, userEmail } = params

  const dashboardUrl = `${APP_URL}/dashboard`
  const settingsUrl = `${APP_URL}/settings`

  // Render React component to HTML
  const html = render(
    DailyReminderEmail({
      userName: userName || userEmail.split('@')[0],
      dashboardUrl,
      settingsUrl,
    })
  )

  // Plain text version (fallback for email clients that don't support HTML)
  const text = `
Hi ${userName || 'there'}!

It's time to reflect on your day and log your accomplishments.

Taking a few minutes now to document your progress helps you:
- Track your growth and achievements
- Build momentum and stay motivated
- Generate insightful reports later
- Stay accountable to your goals

Don't let today's wins slip away — capture them now!

Log your accomplishments: ${dashboardUrl}

---

You're receiving this email because you enabled daily reminders in your DAR settings.
Manage your preferences: ${settingsUrl}

© ${new Date().getFullYear()} DAR App. All rights reserved.
  `.trim()

  return {
    html,
    text,
    subject: "⏰ Time to log today's accomplishments!",
  }
}

/**
 * Render weekly summary email
 */
export function renderWeeklySummaryEmail(params: {
  userName?: string
  userEmail: string
  weekData: {
    startDate: string
    endDate: string
    totalEntries: number
    activeDays: number
    totalDays: number
    highlights: string[]
    aiSummary: string
  }
}) {
  const { userName, userEmail, weekData } = params

  const reportsUrl = `${APP_URL}/reports`
  const settingsUrl = `${APP_URL}/settings`

  // Render React component to HTML
  const html = render(
    WeeklySummaryEmail({
      userName: userName || userEmail.split('@')[0],
      weekData,
      reportsUrl,
      settingsUrl,
    })
  )

  // Plain text version
  const text = `
Hi ${userName || 'there'}!

Here's your weekly accomplishment summary for ${weekData.startDate} to ${weekData.endDate}:

📊 Your Stats:
- Total Entries: ${weekData.totalEntries}
- Active Days: ${weekData.activeDays}/${weekData.totalDays}
- Consistency: ${Math.round((weekData.activeDays / weekData.totalDays) * 100)}%

✨ AI Summary:
${weekData.aiSummary}

🌟 Highlights from Your Week:
${weekData.highlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}

View your full report: ${reportsUrl}

---

You're receiving this email because you enabled weekly summaries in your DAR settings.
Manage your preferences: ${settingsUrl}

© ${new Date().getFullYear()} DAR App. All rights reserved.
  `.trim()

  return {
    html,
    text,
    subject: '📊 Your Weekly Accomplishments Summary',
  }
}

/**
 * Render monthly summary email (placeholder for Phase 3)
 */
export function renderMonthlySummaryEmail(params: {
  userName?: string
  userEmail: string
  monthData: {
    totalEntries: number
    activeDays: number
    topAchievements: string[]
  }
}) {
  // TODO: Implement in Phase 3
  return {
    html: '<p>Monthly summary coming soon!</p>',
    text: 'Monthly summary coming soon!',
    subject: '🎉 Your Monthly Accomplishments Report',
  }
}

/**
 * Render team invitation email (placeholder for Phase 4)
 */
export function renderTeamInvitationEmail(params: {
  inviteeName: string
  inviterName: string
  teamName: string
  invitationToken: string
}) {
  // TODO: Implement in Phase 4
  const invitationUrl = `${APP_URL}/invitations/${params.invitationToken}`

  return {
    html: `<p>You've been invited to join ${params.teamName}!</p><a href="${invitationUrl}">Accept Invitation</a>`,
    text: `You've been invited to join ${params.teamName}!\n\nAccept: ${invitationUrl}`,
    subject: `You're invited to join ${params.teamName} on DAR`,
  }
}
