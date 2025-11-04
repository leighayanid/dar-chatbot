import { sendEmail, sendBatchEmails, getEmailStats } from '../send'
import type { SendEmailResult } from '../send'

// Mock Resend
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn(),
      },
    })),
  }
})

describe('Email Send Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getEmailStats', () => {
    it('should calculate stats correctly for all successful sends', () => {
      const results: SendEmailResult[] = [
        { success: true, messageId: '1' },
        { success: true, messageId: '2' },
        { success: true, messageId: '3' },
      ]

      const stats = getEmailStats(results)

      expect(stats).toEqual({
        total: 3,
        successful: 3,
        failed: 0,
        successRate: '100.00',
      })
    })

    it('should calculate stats correctly for mixed results', () => {
      const results: SendEmailResult[] = [
        { success: true, messageId: '1' },
        { success: false, error: 'Failed' },
        { success: true, messageId: '2' },
        { success: false, error: 'Failed' },
      ]

      const stats = getEmailStats(results)

      expect(stats).toEqual({
        total: 4,
        successful: 2,
        failed: 2,
        successRate: '50.00',
      })
    })

    it('should handle empty results', () => {
      const stats = getEmailStats([])

      expect(stats).toEqual({
        total: 0,
        successful: 0,
        failed: 0,
        successRate: '0.00',
      })
    })

    it('should calculate stats correctly for all failures', () => {
      const results: SendEmailResult[] = [
        { success: false, error: 'Error 1' },
        { success: false, error: 'Error 2' },
      ]

      const stats = getEmailStats(results)

      expect(stats).toEqual({
        total: 2,
        successful: 0,
        failed: 2,
        successRate: '0.00',
      })
    })

    it('should handle decimal success rates correctly', () => {
      const results: SendEmailResult[] = [
        { success: true, messageId: '1' },
        { success: true, messageId: '2' },
        { success: false, error: 'Failed' },
      ]

      const stats = getEmailStats(results)

      expect(stats).toEqual({
        total: 3,
        successful: 2,
        failed: 1,
        successRate: '66.67',
      })
    })
  })

  describe('sendEmail', () => {
    it('should return error when RESEND_API_KEY is not configured', async () => {
      const originalKey = process.env.RESEND_API_KEY
      delete process.env.RESEND_API_KEY

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        react: {} as any, // Mock React element
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email service not configured')

      process.env.RESEND_API_KEY = originalKey
    })

    it('should return error when recipient is not provided', async () => {
      const result = await sendEmail({
        to: '',
        subject: 'Test',
        react: {} as any, // Mock React element
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('No recipient specified')
    })

    it('should return error when recipient array is empty', async () => {
      const result = await sendEmail({
        to: [],
        subject: 'Test',
        react: {} as any, // Mock React element
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('No recipient specified')
    })
  })

  describe('sendBatchEmails', () => {
    it('should process all emails in batch', async () => {
      const emails = [
        {
          to: 'test1@example.com',
          subject: 'Test 1',
          react: {} as any, // Mock React element
        },
        {
          to: 'test2@example.com',
          subject: 'Test 2',
          react: {} as any, // Mock React element
        },
      ]

      // Mock sendEmail to return success for all
      const originalKey = process.env.RESEND_API_KEY
      delete process.env.RESEND_API_KEY // This will make sendEmail return error, which is fine for this test

      const results = await sendBatchEmails(emails, 0) // 0 delay for testing

      expect(results).toHaveLength(2)
      expect(results.every((r) => !r.success)).toBe(true) // All should fail due to missing API key

      process.env.RESEND_API_KEY = originalKey
    })

    it('should handle empty email array', async () => {
      const results = await sendBatchEmails([], 0)

      expect(results).toHaveLength(0)
    })
  })
})
