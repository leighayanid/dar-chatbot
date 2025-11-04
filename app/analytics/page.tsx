'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowLeftIcon, TrendingUpIcon, CalendarIcon, MessageSquareIcon, TargetIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'

interface ActivityData {
  date: string
  count: number
  words: number
}

interface Stats {
  totalMessages: number
  totalDays: number
  currentStreak: number
  longestStreak: number
  averagePerDay: number
  thisWeek: number
  lastWeek: number
  thisMonth: number
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    averagePerDay: 0,
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load analytics data
  useEffect(() => {
    async function loadAnalytics() {
      if (!user) return

      try {
        setLoading(true)

        // Fetch all user messages
        const { data: messages, error } = await supabase
          .from('messages')
          .select('created_at, content, role')
          .eq('user_id', user.id)
          .eq('role', 'user')
          .order('created_at', { ascending: true })

        if (error) throw error

        if (messages && messages.length > 0) {
          // Process activity data by date
          const activityMap = new Map<string, { count: number; words: number }>()

          messages.forEach((msg: any) => {
            const date = new Date(msg.created_at).toISOString().split('T')[0]
            const existing = activityMap.get(date) || { count: 0, words: 0 }
            const wordCount = msg.content.split(/\s+/).filter((w: string) => w.length > 0).length

            activityMap.set(date, {
              count: existing.count + 1,
              words: existing.words + wordCount,
            })
          })

          // Convert to array and sort
          const activity = Array.from(activityMap.entries())
            .map(([date, data]) => ({ date, count: data.count, words: data.words }))
            .sort((a, b) => a.date.localeCompare(b.date))

          setActivityData(activity)

          // Calculate statistics
          const totalMessages = messages.length
          const totalDays = activityMap.size
          const averagePerDay = totalDays > 0 ? totalMessages / totalDays : 0

          // Calculate streaks
          const { currentStreak, longestStreak } = calculateStreaks(Array.from(activityMap.keys()))

          // Calculate weekly stats
          const now = new Date()
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

          const thisWeek = messages.filter((m: any) => new Date(m.created_at) >= oneWeekAgo).length
          const lastWeek = messages.filter((m: any) => {
            const date = new Date(m.created_at)
            return date >= twoWeeksAgo && date < oneWeekAgo
          }).length
          const thisMonth = messages.filter((m: any) => new Date(m.created_at) >= oneMonthAgo).length

          setStats({
            totalMessages,
            totalDays,
            currentStreak,
            longestStreak,
            averagePerDay,
            thisWeek,
            lastWeek,
            thisMonth,
          })
        }
      } catch (err) {
        console.error('Error loading analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadAnalytics()
    }
  }, [user])

  // Calculate streaks
  function calculateStreaks(dates: string[]): { currentStreak: number; longestStreak: number } {
    if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 }

    const sortedDates = dates.sort()
    let currentStreak = 1
    let longestStreak = 1
    let tempStreak = 1

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1])
      const currDate = new Date(sortedDates[i])
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000))

      if (diffDays === 1) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }

    // Calculate current streak
    const lastDate = sortedDates[sortedDates.length - 1]
    if (lastDate === today || lastDate === yesterday) {
      let i = sortedDates.length - 1
      currentStreak = 1
      while (i > 0) {
        const prevDate = new Date(sortedDates[i - 1])
        const currDate = new Date(sortedDates[i])
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000))
        if (diffDays === 1) {
          currentStreak++
          i--
        } else {
          break
        }
      }
    } else {
      currentStreak = 0
    }

    return { currentStreak, longestStreak }
  }

  // Generate heatmap data for last 365 days
  function generateHeatmapData() {
    const data: { date: string; count: number; level: number }[] = []
    const today = new Date()

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const activity = activityData.find(a => a.date === dateStr)
      const count = activity?.count || 0

      // Level: 0 (none), 1 (low), 2 (medium), 3 (high), 4 (very high)
      let level = 0
      if (count > 0 && count <= 2) level = 1
      else if (count <= 5) level = 2
      else if (count <= 10) level = 3
      else if (count > 10) level = 4

      data.push({ date: dateStr, count, level })
    }

    return data
  }

  const heatmapData = generateHeatmapData()

  // Show loading screen while checking authentication
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <div className="mb-6 inline-flex rounded-3xl bg-gradient-to-br from-rose-100 to-orange-100 p-6 shadow-lg dark:from-rose-950/50 dark:to-orange-950/50">
            <Loader2Icon className="size-16 animate-spin text-rose-400 dark:text-rose-300" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Loading Analytics...
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Crunching your data
          </p>
        </div>
      </div>
    )
  }

  const weeklyChange = stats.lastWeek > 0 ? ((stats.thisWeek - stats.lastWeek) / stats.lastWeek) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-4 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="mx-auto max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <h1 className="mb-2 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-zinc-50 dark:via-zinc-300 dark:to-zinc-50">
            Analytics Dashboard
          </h1>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Track your productivity and accomplishment patterns
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Messages */}
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 p-3">
                <MessageSquareIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Entries</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalMessages}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Across {stats.totalDays} days
            </p>
          </div>

          {/* Current Streak */}
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 p-3">
                <TargetIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Current Streak</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.currentStreak}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Longest: {stats.longestStreak} days
            </p>
          </div>

          {/* This Week */}
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 p-3">
                <CalendarIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">This Week</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.thisWeek}</p>
              </div>
            </div>
            <p className={`text-xs ${weeklyChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {weeklyChange >= 0 ? '↑' : '↓'} {Math.abs(weeklyChange).toFixed(0)}% from last week
            </p>
          </div>

          {/* Average Per Day */}
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 p-3">
                <TrendingUpIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Daily Average</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.averagePerDay.toFixed(1)}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Entries per active day
            </p>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
          <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Activity Heatmap
          </h2>
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            Your activity over the past year
          </p>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-flex flex-col gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
                <div key={dayOfWeek} className="flex gap-1">
                  {heatmapData
                    .filter((_, index) => new Date(heatmapData[index].date).getDay() === dayOfWeek)
                    .slice(0, 53)
                    .map((day) => (
                      <div
                        key={day.date}
                        title={`${day.date}: ${day.count} entries`}
                        className={`size-3 rounded-sm transition-all hover:scale-125 ${
                          day.level === 0 ? 'bg-zinc-100 dark:bg-zinc-800' :
                          day.level === 1 ? 'bg-rose-200 dark:bg-rose-900/40' :
                          day.level === 2 ? 'bg-rose-300 dark:bg-rose-800/60' :
                          day.level === 3 ? 'bg-rose-400 dark:bg-rose-700/80' :
                          'bg-rose-500 dark:bg-rose-600'
                        }`}
                      />
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="size-3 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
              <div className="size-3 rounded-sm bg-rose-200 dark:bg-rose-900/40" />
              <div className="size-3 rounded-sm bg-rose-300 dark:bg-rose-800/60" />
              <div className="size-3 rounded-sm bg-rose-400 dark:bg-rose-700/80" />
              <div className="size-3 rounded-sm bg-rose-500 dark:bg-rose-600" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {activityData.slice(-7).reverse().map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {day.words.toLocaleString()} words
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{day.count}</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">entries</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              This Month
            </h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">Total Entries</p>
                <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">{stats.thisMonth}</p>
              </div>
              <div>
                <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">Active Days</p>
                <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                  {activityData.filter(a => {
                    const date = new Date(a.date)
                    const monthAgo = new Date()
                    monthAgo.setDate(monthAgo.getDate() - 30)
                    return date >= monthAgo
                  }).length}
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/reports"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  Generate Monthly Report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
