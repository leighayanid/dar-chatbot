import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WeeklySummaryEmailProps {
  userName?: string
  weekData: {
    startDate: string
    endDate: string
    totalEntries: number
    activeDays: number
    totalDays: number
    highlights: string[]
    aiSummary: string
  }
  reportsUrl?: string
  settingsUrl?: string
}

export const WeeklySummaryEmail = ({
  userName = 'there',
  weekData,
  reportsUrl = 'http://localhost:3000/reports',
  settingsUrl = 'http://localhost:3000/settings',
}: WeeklySummaryEmailProps) => {
  const previewText = `Your week in review: ${weekData.totalEntries} entries across ${weekData.activeDays} days!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient background */}
          <Section style={header}>
            <Heading style={headerTitle}>DAR</Heading>
            <Text style={headerSubtitle}>Weekly Summary</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Hi {userName}! 📊</Heading>

            <Text style={text}>
              Here's your weekly accomplishment summary for{' '}
              <strong>{weekData.startDate}</strong> to{' '}
              <strong>{weekData.endDate}</strong>:
            </Text>

            {/* Stats Section */}
            <Section style={statsContainer}>
              <Section style={statBox}>
                <Text style={statNumber}>{weekData.totalEntries}</Text>
                <Text style={statLabel}>Total Entries</Text>
              </Section>
              <Section style={statBox}>
                <Text style={statNumber}>{weekData.activeDays}/{weekData.totalDays}</Text>
                <Text style={statLabel}>Active Days</Text>
              </Section>
              <Section style={statBox}>
                <Text style={statNumber}>
                  {Math.round((weekData.activeDays / weekData.totalDays) * 100)}%
                </Text>
                <Text style={statLabel}>Consistency</Text>
              </Section>
            </Section>

            {/* AI Summary */}
            {weekData.aiSummary && (
              <>
                <Heading style={h2}>✨ AI Summary</Heading>
                <Section style={summaryBox}>
                  <Text style={summaryText}>{weekData.aiSummary}</Text>
                </Section>
              </>
            )}

            {/* Highlights */}
            {weekData.highlights && weekData.highlights.length > 0 && (
              <>
                <Heading style={h2}>🌟 Highlights from Your Week</Heading>
                <Section style={highlightsList}>
                  {weekData.highlights.map((highlight, index) => (
                    <Text key={index} style={highlightItem}>
                      • {highlight}
                    </Text>
                  ))}
                </Section>
              </>
            )}

            {/* Encouragement */}
            <Text style={encouragementText}>
              {weekData.activeDays >= 5
                ? "Incredible consistency! You're building a powerful habit of reflection and growth."
                : weekData.activeDays >= 3
                ? "Great work this week! Keep building momentum with daily check-ins."
                : "Every entry counts! Try to log more days next week to maximize your insights."}
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={reportsUrl}>
                View Full Report
              </Button>
            </Section>

            <Text style={motivationalText}>
              "Success is the sum of small efforts repeated day in and day out."
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you enabled weekly summaries in your DAR settings.
            </Text>
            <Text style={footerText}>
              <Link href={settingsUrl} style={footerLink}>
                Manage your notification preferences
              </Link>
              {' '}or{' '}
              <Link href={settingsUrl} style={footerLink}>
                turn off weekly summaries
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

export default WeeklySummaryEmail

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

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  margin: '32px 0 16px 0',
  lineHeight: '1.4',
}

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
}

const statsContainer = {
  display: 'flex',
  justifyContent: 'space-between',
  margin: '32px 0',
  gap: '16px',
}

const statBox = {
  flex: '1',
  textAlign: 'center' as const,
  padding: '24px 16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  border: '2px solid #667eea',
}

const statNumber = {
  color: '#667eea',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  lineHeight: '1',
}

const statLabel = {
  color: '#666',
  fontSize: '13px',
  fontWeight: '500',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const summaryBox = {
  margin: '16px 0 24px 0',
  padding: '24px',
  backgroundColor: '#f0f4ff',
  borderRadius: '8px',
  borderLeft: '4px solid #667eea',
}

const summaryText = {
  color: '#2d3748',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0',
  fontStyle: 'italic',
}

const highlightsList = {
  margin: '16px 0 24px 0',
  padding: '20px 24px',
  backgroundColor: '#fff9f0',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
}

const highlightItem = {
  color: '#484848',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '8px 0',
}

const encouragementText = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  borderLeft: '4px solid #10b981',
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
