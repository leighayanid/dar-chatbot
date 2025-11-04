/**
 * Test script for email notifications
 *
 * This script tests the email sending functionality without needing a real Resend API key.
 * When running locally with Supabase, all emails are captured by Mailpit.
 *
 * Usage:
 *   node test-email.js
 *
 * Then view the email at: http://127.0.0.1:54324
 */

const testEmail = async () => {
  try {
    console.log('🧪 Testing Email Notification System...\n')

    // Test data
    const testData = {
      email: 'test@example.com',
      name: 'Test User'
    }

    console.log(`📧 Sending test email to: ${testData.email}`)
    console.log(`👤 User name: ${testData.name}\n`)

    // Make request to test endpoint
    const response = await fetch('http://localhost:3000/api/test-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Test failed:', result)
      console.error('\nPossible issues:')
      console.error('1. Is the dev server running? (npm run dev)')
      console.error('2. Is RESEND_API_KEY set in .env.local?')
      console.error('3. Is Supabase running? (supabase status)')
      process.exit(1)
    }

    console.log('✅ Email sent successfully!')
    console.log(`📨 Message ID: ${result.messageId || 'N/A'}`)
    console.log(`📬 Recipient: ${result.recipient}`)
    console.log('\n📮 View the email at: http://127.0.0.1:54324')
    console.log('   (Mailpit interface - all local emails go here)\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('\nMake sure:')
    console.error('1. Dev server is running: npm run dev')
    console.error('2. Supabase is running: supabase status')
    console.error('3. Environment variables are set in .env.local\n')
    process.exit(1)
  }
}

// Run test
testEmail()
