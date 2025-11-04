import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const FROM_EMAIL = 'DAR App <onboarding@resend.dev>' // Change this when you verify your domain
const FROM_NAME = 'DAR App'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: React.ReactElement
  text?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  react,
  text,
}: SendEmailOptions): Promise<SendEmailResult> {
  try {
    // Validate API key
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return {
        success: false,
        error: 'Email service not configured',
      }
    }

    // Validate recipient
    if (!to || (Array.isArray(to) && to.length === 0)) {
      return {
        success: false,
        error: 'No recipient specified',
      }
    }

    // Send email
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      text,
    })

    if (error) {
      console.error('Error sending email:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }

    console.log('Email sent successfully:', data?.id)
    return {
      success: true,
      messageId: data?.id,
    }
  } catch (error) {
    console.error('Unexpected error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send batch emails with rate limiting
 */
export async function sendBatchEmails(
  emails: SendEmailOptions[],
  delayMs = 100
): Promise<SendEmailResult[]> {
  const results: SendEmailResult[] = []

  for (const email of emails) {
    const result = await sendEmail(email)
    results.push(result)

    // Add delay between sends to avoid rate limiting
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}

/**
 * Get email statistics from batch results
 */
export function getEmailStats(results: SendEmailResult[]) {
  const total = results.length
  const successful = results.filter(r => r.success).length
  const failed = total - successful
  const successRate = total > 0 ? (successful / total) * 100 : 0

  return {
    total,
    successful,
    failed,
    successRate: successRate.toFixed(2),
  }
}
