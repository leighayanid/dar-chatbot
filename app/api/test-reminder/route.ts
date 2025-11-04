import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/email/send'
import { renderDailyReminderEmail } from '@/lib/email/templates'

export const runtime = 'edge'

/**
 * Test endpoint for sending reminder emails
 *
 * DEVELOPMENT ONLY - Do not use in production
 *
 * Sends a test reminder email to the currently authenticated user
 *
 * Usage:
 *   GET /api/test-reminder
 *   or
 *   POST /api/test-reminder
 *     Body: { email: "test@example.com", name: "Test User" }
 */
export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Test endpoint not available in production' },
        { status: 403 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated. Please log in first.' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Render email
    const { html, text, subject } = renderDailyReminderEmail({
      userName: (profile as any)?.full_name || undefined,
      userEmail: user.email!,
    })

    // Send email
    const result = await sendEmail({
      to: user.email!,
      subject,
      react: html as any,
      text,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: result.error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test reminder email sent successfully',
      recipient: user.email,
      messageId: result.messageId,
    })
  } catch (error) {
    console.error('Error sending test reminder:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint for sending test email to arbitrary address
 */
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Test endpoint not available in production' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Render email
    const { html, text, subject } = renderDailyReminderEmail({
      userName: name,
      userEmail: email,
    })

    // Send email
    const result = await sendEmail({
      to: email,
      subject,
      react: html as any,
      text,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: result.error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test reminder email sent successfully',
      recipient: email,
      messageId: result.messageId,
    })
  } catch (error) {
    console.error('Error sending test reminder:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
