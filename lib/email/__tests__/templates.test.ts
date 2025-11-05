import {
  renderDailyReminderEmail,
  renderWeeklySummaryEmail,
  renderMonthlySummaryEmail,
  renderTeamInvitationEmail,
} from '../templates'

describe('Email Templates', () => {
  describe('renderDailyReminderEmail', () => {
    it('should render daily reminder email with user name', () => {
      const result = renderDailyReminderEmail({
        userName: 'John Doe',
        userEmail: 'john@example.com',
      })

      expect(result.subject).toBe("⏰ Time to log today's accomplishments!")
      expect(result.html).toBeTruthy()
      expect(result.text).toContain('John Doe')
      expect(result.text).toContain('http://localhost:3000/dashboard')
      expect(result.text).toContain('http://localhost:3000/settings')
    })

    it('should use default greeting when name is not provided', () => {
      const result = renderDailyReminderEmail({
        userEmail: 'john@example.com',
      })

      // Text version uses 'there' as default, HTML uses email username
      expect(result.text).toContain('Hi there!')
    })

    it('should include all required sections in text version', () => {
      const result = renderDailyReminderEmail({
        userName: 'Test User',
        userEmail: 'test@example.com',
      })

      expect(result.text).toContain('Track your growth')
      expect(result.text).toContain('Build momentum')
      expect(result.text).toContain('Generate insightful reports')
      expect(result.text).toContain('Stay accountable')
      expect(result.text).toContain('You\'re receiving this email')
    })

    it('should use correct APP_URL from environment', () => {
      const result = renderDailyReminderEmail({
        userName: 'Test',
        userEmail: 'test@example.com',
      })

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      expect(result.text).toContain(appUrl)
    })
  })

  describe('renderWeeklySummaryEmail', () => {
    it('should render weekly summary with all data', () => {
      const result = renderWeeklySummaryEmail({
        userName: 'John Doe',
        userEmail: 'john@example.com',
        weekData: {
          startDate: 'Oct 28, 2025',
          endDate: 'Nov 4, 2025',
          totalEntries: 5,
          activeDays: 3,
          totalDays: 7,
          highlights: ['Achievement 1', 'Achievement 2'],
          aiSummary: 'Great progress this week!',
        },
      })

      expect(result.subject).toBe('📊 Your Weekly Accomplishments Summary')
      expect(result.html).toBeTruthy()
      expect(result.text).toContain('John Doe')
      expect(result.text).toContain('Oct 28, 2025')
      expect(result.text).toContain('Nov 4, 2025')
      expect(result.text).toContain('Total Entries: 5')
      expect(result.text).toContain('Active Days: 3/7')
      expect(result.text).toContain('Great progress this week!')
      expect(result.text).toContain('Achievement 1')
      expect(result.text).toContain('Achievement 2')
    })
  })

  describe('renderMonthlySummaryEmail', () => {
    it('should render monthly summary placeholder', () => {
      const result = renderMonthlySummaryEmail({
        userName: 'John Doe',
        userEmail: 'john@example.com',
        monthData: {
          totalEntries: 20,
          activeDays: 15,
          topAchievements: ['Achievement 1', 'Achievement 2', 'Achievement 3'],
        },
      })

      expect(result.subject).toBe('🎉 Your Monthly Accomplishments Report')
      expect(result.html).toContain('Monthly summary coming soon')
      expect(result.text).toContain('Monthly summary coming soon')
    })
  })

  describe('renderTeamInvitationEmail', () => {
    it('should render team invitation with correct data', () => {
      const result = renderTeamInvitationEmail({
        inviteeName: 'Jane Doe',
        inviterName: 'John Doe',
        teamName: 'Engineering Team',
        invitationToken: 'test-token-123',
      })

      expect(result.subject).toBe("You're invited to join Engineering Team on DAR")
      expect(result.html).toContain('Engineering Team')
      expect(result.html).toContain('/invitations/test-token-123')
      expect(result.text).toContain('Engineering Team')
      expect(result.text).toContain('/invitations/test-token-123')
    })

    it('should include invitation URL in both HTML and text versions', () => {
      const result = renderTeamInvitationEmail({
        inviteeName: 'Jane',
        inviterName: 'John',
        teamName: 'Test Team',
        invitationToken: 'abc123',
      })

      const expectedUrl = 'http://localhost:3000/invitations/abc123'
      expect(result.html).toContain(expectedUrl)
      expect(result.text).toContain(expectedUrl)
    })
  })
})
