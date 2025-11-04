import { supabaseServer } from '@/lib/supabase/server'

export interface UserForReminder {
  id: string
  email: string
  full_name?: string
  reminder_time: string
  reminder_days: number[]
  timezone: string
}

/**
 * Get users who should receive daily reminders right now
 *
 * Logic:
 * 1. User has reminder_enabled = true
 * 2. Current day of week is in their reminder_days array
 * 3. Current time in their timezone matches their reminder_time (within the current hour)
 *
 * @param currentHour - Optional: Override current hour for testing (0-23)
 */
export async function getUsersForDailyReminder(
  currentHour?: number
): Promise<UserForReminder[]> {
  try {
    // Get all users with reminders enabled
    const { data: preferences, error } = await supabaseServer
      .from('user_preferences')
      .select('id, reminder_enabled, reminder_time, reminder_days, timezone')
      .eq('reminder_enabled', true)

    if (error) {
      console.error('Error fetching user preferences:', error)
      return []
    }

    if (!preferences || preferences.length === 0) {
      return []
    }

    // Get current date/time
    const now = new Date()
    const currentDayOfWeek = now.getDay() // 0 = Sunday, 6 = Saturday

    // Type for user preferences
    type UserPreference = {
      id: string
      reminder_enabled: boolean
      reminder_time: string
      reminder_days: number[]
      timezone: string
    }

    // Filter users based on time and day
    const eligibleUserIds = (preferences as UserPreference[])
      .filter((pref) => {
        // Check if today is in their reminder_days
        if (!pref.reminder_days || !pref.reminder_days.includes(currentDayOfWeek)) {
          return false
        }

        // Get current hour in user's timezone
        const userHour = getUserLocalHour(pref.timezone, currentHour)

        // Get hour from their reminder_time (format: "17:00:00")
        const reminderHour = parseInt(pref.reminder_time.split(':')[0])

        // Check if current hour matches reminder hour
        return userHour === reminderHour
      })
      .map((pref: any) => pref.id)

    if (eligibleUserIds.length === 0) {
      return []
    }

    // Get user details for eligible users
    const { data: users, error: usersError } = await supabaseServer
      .from('user_profiles')
      .select('id, full_name')
      .in('id', eligibleUserIds)

    if (usersError) {
      console.error('Error fetching user profiles:', usersError)
      return []
    }

    // Type for user profile
    type UserProfile = {
      id: string
      full_name?: string | null
    }

    // Get auth user emails
    const usersWithDetails: UserForReminder[] = []

    for (const pref of (preferences as UserPreference[])) {
      if (!eligibleUserIds.includes(pref.id)) continue

      // Get user email from auth
      const { data: authUser } = await supabaseServer.auth.admin.getUserById(pref.id)

      if (!authUser.user?.email) continue

      const profile = (users as UserProfile[] | null)?.find((u) => u.id === pref.id)

      usersWithDetails.push({
        id: pref.id,
        email: authUser.user.email,
        full_name: profile?.full_name || undefined,
        reminder_time: pref.reminder_time,
        reminder_days: pref.reminder_days,
        timezone: pref.timezone,
      })
    }

    return usersWithDetails
  } catch (error) {
    console.error('Error in getUsersForDailyReminder:', error)
    return []
  }
}

/**
 * Get the current hour in a specific timezone
 */
function getUserLocalHour(timezone: string, overrideHour?: number): number {
  if (overrideHour !== undefined) {
    return overrideHour
  }

  try {
    // Get current time in user's timezone
    const now = new Date()
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(now)

    return parseInt(userTime)
  } catch (error) {
    console.error(`Error getting time for timezone ${timezone}:`, error)
    // Fallback to UTC
    return new Date().getUTCHours()
  }
}

/**
 * Check if user has already logged an entry today
 * (Optional - can be used to skip reminders if user already logged)
 */
export async function userHasLoggedToday(userId: string): Promise<boolean> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data, error } = await supabaseServer
      .from('messages')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'user')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .limit(1)

    if (error) {
      console.error('Error checking if user logged today:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error in userHasLoggedToday:', error)
    return false
  }
}

/**
 * Get stats for reporting
 */
export async function getReminderStats() {
  try {
    // Total users with reminders enabled
    const { data: enabledUsers, error: enabledError } = await supabaseServer
      .from('user_preferences')
      .select('id')
      .eq('reminder_enabled', true)

    // Total users
    const { data: allUsers, error: allError } = await supabaseServer
      .from('user_preferences')
      .select('id')

    if (enabledError || allError) {
      console.error('Error fetching reminder stats')
      return null
    }

    return {
      totalUsers: allUsers?.length || 0,
      enabledUsers: enabledUsers?.length || 0,
      enabledPercentage: allUsers?.length
        ? ((enabledUsers?.length || 0) / allUsers.length * 100).toFixed(1)
        : '0',
    }
  } catch (error) {
    console.error('Error in getReminderStats:', error)
    return null
  }
}
