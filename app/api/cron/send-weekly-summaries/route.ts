import { NextRequest, NextResponse } from 'next/server'
import {
  getUsersForWeeklySummary,
  getWeeklyDataForUser,
  extractHighlights,
} from '@/lib/notifications/reminders'
import { sendBatchEmails, getEmailStats } from '@/lib/email/send'
import { renderWeeklySummaryEmail } from '@/lib/email/templates'
import { generateWeeklySummary, generateHighlights } from '@/lib/ai/summary'

export const runtime = 'edge'

/**
 * Cron endpoint to send weekly summary emails
 *
 * Triggered by Vercel Cron (configured in vercel.json)
 * Runs once per week (e.g., Sunday evening)
 *
 * Security: Protected by CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron not configured' },
        { status: 500 }
      )
    }

    // Check authorization header
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting weekly summary cron job...')

    // Get users who should receive weekly summaries
    const users = await getUsersForWeeklySummary()

    console.log(`Found ${users.length} eligible users for weekly summaries`)

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users need weekly summaries at this time',
        stats: {
          total: 0,
          successful: 0,
          failed: 0,
          successRate: '100.00',
        },
      })
    }

    // Prepare emails for each user
    const emailPromises = users.map(async (user) => {
      try {
        // Get weekly data for this user
        const weekData = await getWeeklyDataForUser(user.id)

        if (!weekData) {
          console.error(`Failed to get weekly data for user ${user.email}`)
          return null
        }

        // Skip users with no activity
        if (weekData.totalEntries === 0) {
          console.log(`Skipping ${user.email} - no entries this week`)
          return null
        }

        // Generate AI summary
        const aiSummary = await generateWeeklySummary(weekData.userMessages)

        // Generate highlights using AI or fallback to simple extraction
        let highlights: string[]
        try {
          highlights = await generateHighlights(weekData.userMessages, 5)
        } catch (error) {
          console.error('Error generating AI highlights, using fallback:', error)
          highlights = extractHighlights(weekData.userMessages, 5)
        }

        // Render email
        const { html, text, subject } = renderWeeklySummaryEmail({
          userName: user.full_name,
          userEmail: user.email,
          weekData: {
            ...weekData,
            highlights,
            aiSummary,
          },
        })

        return {
          to: user.email,
          subject,
          react: html as any, // Type assertion needed for edge runtime
          text,
        }
      } catch (error) {
        console.error(`Error preparing email for ${user.email}:`, error)
        return null
      }
    })

    // Wait for all emails to be prepared
    const emailsOrNull = await Promise.all(emailPromises)
    const emails = emailsOrNull.filter((email): email is NonNullable<typeof email> => email !== null)

    console.log(`Sending ${emails.length} weekly summary emails...`)

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No weekly summaries to send (all users had no activity)',
        stats: {
          total: 0,
          successful: 0,
          failed: 0,
          successRate: '100.00',
        },
      })
    }

    // Send emails in batches with rate limiting
    const results = await sendBatchEmails(emails, 200) // 200ms delay between emails

    // Get statistics
    const stats = getEmailStats(results)

    console.log('Weekly summary emails sent:', stats)

    // Log failures for debugging
    const failures = results
      .map((result, index) => ({ result, email: emails[index] }))
      .filter(({ result }) => !result.success)

    if (failures.length > 0) {
      console.error('Failed to send summaries to:', failures.map(f => f.email.to))
      failures.forEach(({ result, email }) => {
        console.error(`- ${email.to}: ${result.error}`)
      })
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${stats.successful} of ${stats.total} weekly summary emails`,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in send-weekly-summaries cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint for manual testing (same logic as GET)
 */
export async function POST(request: NextRequest) {
  return GET(request)
}
