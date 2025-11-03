'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/auth-context'
import {
  SparklesIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from 'lucide-react'

interface DailySummary {
  todayCount: number
  todayWords: number
  yesterdayCount: number
  avgCount: number
  recentMessages: Array<{
    content: string
    created_at: string
  }>
}

export function SmartDailySummary() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    async function loadSummary() {
      if (!user) return

      try {
        setLoading(true)

        // Get today's date range
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Get yesterday's date range
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        // Fetch today's messages
        const { data: todayMessages, error: todayError } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('user_id', user.id)
          .eq('role', 'user')
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString())
          .order('created_at', { ascending: false })

        if (todayError) throw todayError

        // Fetch yesterday's messages
        const { data: yesterdayMessages, error: yesterdayError } = await supabase
          .from('messages')
          .select('content')
          .eq('user_id', user.id)
          .eq('role', 'user')
          .gte('created_at', yesterday.toISOString())
          .lt('created_at', today.toISOString())

        if (yesterdayError) throw yesterdayError

        // Fetch all messages for average calculation
        const { data: allMessages, error: allError } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('user_id', user.id)
          .eq('role', 'user')

        if (allError) throw allError

        // Calculate stats
        const todayCount = todayMessages?.length || 0
        const todayWords = todayMessages?.reduce((sum, msg) =>
          sum + msg.content.split(/\s+/).filter(w => w.length > 0).length, 0
        ) || 0
        const yesterdayCount = yesterdayMessages?.length || 0

        // Calculate average
        const allDates = new Set(allMessages?.map(m =>
          new Date(m.created_at).toISOString().split('T')[0]
        ))
        const avgCount = allDates.size > 0 ? (allMessages?.length || 0) / allDates.size : 0

        setSummary({
          todayCount,
          todayWords,
          yesterdayCount,
          avgCount,
          recentMessages: todayMessages?.slice(0, 3) || []
        })
      } catch (err) {
        console.error('Error loading daily summary:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSummary()

    // Refresh every 5 minutes
    const interval = setInterval(loadSummary, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  if (loading || !summary || summary.todayCount === 0) {
    return null
  }

  const vsYesterday = summary.yesterdayCount > 0
    ? ((summary.todayCount - summary.yesterdayCount) / summary.yesterdayCount) * 100
    : 0
  const vsAverage = summary.avgCount > 0
    ? ((summary.todayCount - summary.avgCount) / summary.avgCount) * 100
    : 0

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-6 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 p-3">
            <SparklesIcon className="size-5 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Today's Summary
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {summary.todayCount} {summary.todayCount === 1 ? 'entry' : 'entries'} · {summary.todayWords.toLocaleString()} words
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="size-5 text-zinc-400" />
        ) : (
          <ChevronDownIcon className="size-5 text-zinc-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
          {/* Stats Grid */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {/* Today's Entries */}
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:from-blue-950/30 dark:to-cyan-950/30">
              <div className="mb-2 flex items-center gap-2">
                <MessageSquareIcon className="size-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-medium text-blue-900 dark:text-blue-300">Today</p>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-50">{summary.todayCount}</p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {summary.todayWords.toLocaleString()} words
              </p>
            </div>

            {/* vs Yesterday */}
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:from-purple-950/30 dark:to-pink-950/30">
              <div className="mb-2 flex items-center gap-2">
                <CalendarIcon className="size-4 text-purple-600 dark:text-purple-400" />
                <p className="text-xs font-medium text-purple-900 dark:text-purple-300">vs Yesterday</p>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-50">
                {summary.yesterdayCount}
              </p>
              <p className={`text-xs font-semibold ${
                vsYesterday >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {vsYesterday >= 0 ? '↑' : '↓'} {Math.abs(vsYesterday).toFixed(0)}%
              </p>
            </div>

            {/* vs Average */}
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-950/30 dark:to-emerald-950/30">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUpIcon className="size-4 text-green-600 dark:text-green-400" />
                <p className="text-xs font-medium text-green-900 dark:text-green-300">vs Average</p>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-50">
                {summary.avgCount.toFixed(1)}
              </p>
              <p className={`text-xs font-semibold ${
                vsAverage >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {vsAverage >= 0 ? '↑' : '↓'} {Math.abs(vsAverage).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Recent Entries */}
          {summary.recentMessages.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Recent Entries
              </h3>
              <div className="space-y-2">
                {summary.recentMessages.map((msg, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-gradient-to-br from-zinc-50 to-zinc-100 p-3 dark:from-zinc-800/50 dark:to-zinc-800/30"
                  >
                    <p className="line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">
                      {msg.content}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(msg.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
