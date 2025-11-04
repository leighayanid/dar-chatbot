import { getReminderStats } from '../reminders'

// Mock Supabase
const mockFrom = jest.fn()
const mockGetUserById = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  supabaseServer: {
    from: jest.fn(),
    auth: {
      admin: {
        getUserById: jest.fn(),
      },
    },
  },
}))

import { supabaseServer } from '@/lib/supabase/server'

// Assign mocks after import
;(supabaseServer.from as jest.Mock) = mockFrom
;(supabaseServer.auth.admin.getUserById as jest.Mock) = mockGetUserById

describe('Reminder Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getReminderStats', () => {
    it('should calculate stats correctly', async () => {
      const mockAllUsers = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]
      const mockEnabledUsers = [{ id: '1' }, { id: '2' }]

      let selectCount = 0
      mockFrom.mockReturnValue({
        select: jest.fn().mockImplementation(() => {
          selectCount++
          return {
            eq: jest.fn().mockResolvedValue({
              data: selectCount === 1 ? mockEnabledUsers : mockAllUsers,
              error: null,
            }),
          }
        }),
      })

      const stats = await getReminderStats()

      expect(stats).toEqual({
        totalUsers: 4,
        enabledUsers: 2,
        enabledPercentage: '50.0',
      })
    })

    it('should handle zero users', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      })

      const stats = await getReminderStats()

      expect(stats).toEqual({
        totalUsers: 0,
        enabledUsers: 0,
        enabledPercentage: '0',
      })
    })

    it('should handle database errors', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      })

      const stats = await getReminderStats()

      expect(stats).toBeNull()
    })

    it('should calculate percentage correctly with decimals', async () => {
      const mockAllUsers = [{ id: '1' }, { id: '2' }, { id: '3' }]
      const mockEnabledUsers = [{ id: '1' }]

      let selectCount = 0
      mockFrom.mockReturnValue({
        select: jest.fn().mockImplementation(() => {
          selectCount++
          return {
            eq: jest.fn().mockResolvedValue({
              data: selectCount === 1 ? mockEnabledUsers : mockAllUsers,
              error: null,
            }),
          }
        }),
      })

      const stats = await getReminderStats()

      expect(stats).toEqual({
        totalUsers: 3,
        enabledUsers: 1,
        enabledPercentage: '33.3',
      })
    })

    it('should handle 100% enabled users', async () => {
      const mockUsers = [{ id: '1' }, { id: '2' }]

      let selectCount = 0
      mockFrom.mockReturnValue({
        select: jest.fn().mockImplementation(() => {
          selectCount++
          return {
            eq: jest.fn().mockResolvedValue({
              data: mockUsers,
              error: null,
            }),
          }
        }),
      })

      const stats = await getReminderStats()

      expect(stats).toEqual({
        totalUsers: 2,
        enabledUsers: 2,
        enabledPercentage: '100.0',
      })
    })
  })

  // Note: getUsersForDailyReminder tests are omitted due to complexity
  // with timezone/date mocking. These should be tested with integration tests.
})
