import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface DailyReminderEmailProps {
  userName?: string
  dashboardUrl?: string
  settingsUrl?: string
}

export const DailyReminderEmail = ({
  userName = 'there',
  dashboardUrl = 'http://localhost:3000/dashboard',
  settingsUrl = 'http://localhost:3000/settings',
}: DailyReminderEmailProps) => {
  const previewText = `Time to log today's accomplishments!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient background */}
          <Section style={header}>
            <Heading style={headerTitle}>DAR</Heading>
            <Text style={headerSubtitle}>Daily Accomplishment Report</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Hi {userName}! 👋</Heading>

            <Text style={text}>
              It's time to reflect on your day and log your accomplishments. Taking a few minutes now to document your progress helps you:
            </Text>

            <Section style={benefitsList}>
              <Text style={benefitItem}>✨ Track your growth and achievements</Text>
              <Text style={benefitItem}>💪 Build momentum and stay motivated</Text>
              <Text style={benefitItem}>📊 Generate insightful reports later</Text>
              <Text style={benefitItem}>🎯 Stay accountable to your goals</Text>
            </Section>

            <Text style={text}>
              Don't let today's wins slip away — capture them now!
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                Log Today's Accomplishments
              </Button>
            </Section>

            <Text style={motivationalText}>
              "Small daily improvements are the key to staggering long-term results."
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you enabled daily reminders in your DAR settings.
            </Text>
            <Text style={footerText}>
              <Link href={settingsUrl} style={footerLink}>
                Manage your notification preferences
              </Link>
              {' '}or{' '}
              <Link href={settingsUrl} style={footerLink}>
                turn off reminders
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} DAR App. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default DailyReminderEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  marginTop: '32px',
  marginBottom: '32px',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

const header = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const headerTitle = {
  margin: '0',
  fontSize: '32px',
  fontWeight: '700',
  color: '#ffffff',
  letterSpacing: '2px',
}

const headerSubtitle = {
  margin: '8px 0 0 0',
  fontSize: '14px',
  color: '#e6e6fa',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
}

const content = {
  padding: '40px 32px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 24px 0',
  lineHeight: '1.3',
}

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
}

const benefitsList = {
  margin: '24px 0',
  padding: '20px 24px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  borderLeft: '4px solid #667eea',
}

const benefitItem = {
  color: '#484848',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  lineHeight: '1.5',
}

const motivationalText = {
  color: '#666',
  fontSize: '15px',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '24px 0 0 0',
  padding: '16px 0',
  borderTop: '1px solid #e6e6e6',
}

const hr = {
  borderColor: '#e6e6e6',
  margin: '0',
}

const footer = {
  padding: '32px 32px 24px 32px',
  backgroundColor: '#f8f9fa',
}

const footerText = {
  color: '#8898aa',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#667eea',
  textDecoration: 'underline',
}

const footerCopyright = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
}
