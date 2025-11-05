/**
 * Test script for weekly summary emails
 *
 * This script tests the weekly summary email functionality by:
 * 1. Loading the cron endpoint
 * 2. Sending a test request with the CRON_SECRET
 * 3. Displaying the results
 *
 * Usage:
 *   node test-weekly-summary.js
 *
 * Prerequisites:
 *   - Supabase must be running (supabase start)
 *   - CRON_SECRET must be set in .env.local
 *   - Dev server should be running (npm run dev)
 */

const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found')
    console.log('Please create .env.local with your environment variables')
    process.exit(1)
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')

  lines.forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      const value = valueParts.join('=').trim()
      if (key && value) {
        process.env[key.trim()] = value
      }
    }
  })
}

async function testWeeklySummary() {
  console.log('🧪 Testing Weekly Summary Email\n')

  // Load environment variables
  loadEnv()

  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('❌ CRON_SECRET not found in .env.local')
    console.log('Generate one with: openssl rand -base64 32')
    process.exit(1)
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('⚠️  RESEND_API_KEY not found in .env.local')
    console.log('Emails will be captured by Mailpit (local Supabase email catcher)')
  }

  // Test the cron endpoint
  const url = 'http://localhost:3000/api/cron/send-weekly-summaries'

  console.log('📤 Sending test request to:', url)
  console.log('🔐 Using CRON_SECRET:', cronSecret.substring(0, 10) + '...\n')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Request failed:', response.status, response.statusText)
      console.error('Response:', JSON.stringify(data, null, 2))
      process.exit(1)
    }

    console.log('✅ Request successful!\n')
    console.log('📊 Results:')
    console.log(JSON.stringify(data, null, 2))

    if (data.stats && data.stats.total > 0) {
      console.log('\n📧 Email Summary:')
      console.log(`   Total: ${data.stats.total}`)
      console.log(`   Successful: ${data.stats.successful}`)
      console.log(`   Failed: ${data.stats.failed}`)
      console.log(`   Success Rate: ${data.stats.successRate}%`)
    }

    if (apiKey) {
      console.log('\n✉️  Check your email inbox for the weekly summary!')
    } else {
      console.log('\n✉️  Check Mailpit for the weekly summary email:')
      console.log('   👉 http://127.0.0.1:54324')
    }

    console.log('\n✅ Test completed successfully!')
  } catch (error) {
    console.error('❌ Error testing weekly summary:', error.message)

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the dev server is running:')
      console.log('   npm run dev')
    }

    process.exit(1)
  }
}

// Run the test
testWeeklySummary()
