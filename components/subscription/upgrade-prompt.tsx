'use client'

import Link from 'next/link'
import { useSubscription } from '@/lib/subscription/subscription-context'
import { Sparkles, ArrowRight, Lock } from 'lucide-react'

interface UpgradePromptProps {
  feature?: string
  message?: string
  compact?: boolean
}

export function UpgradePrompt({ feature, message, compact = false }: UpgradePromptProps) {
  const { subscription } = useSubscription()

  const defaultMessages: Record<string, string> = {
    ai_insights: 'Get AI-powered insights with Pro',
    email_reminders: 'Never miss a day with daily reminders',
    custom_reports: 'Create custom reports with Pro',
    team_features: 'Collaborate with your team',
    unlimited_messages: 'Send unlimited messages with Pro',
  }

  const displayMessage = message || (feature && defaultMessages[feature]) || 'Upgrade to unlock this feature'

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
        <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="text-blue-900 dark:text-blue-100">{displayMessage}</span>
        <Link
          href="/pricing"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1"
        >
          Upgrade
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 border border-blue-200/50 dark:border-zinc-700 rounded-2xl">
      <div className="w-16 h-16 mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
        <Sparkles className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {subscription?.planName === 'free' ? 'Upgrade to Pro' : 'Premium Feature'}
      </h3>

      <p className="text-gray-600 dark:text-gray-300 text-center mb-6 max-w-md">
        {displayMessage}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/pricing"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          View Plans
          <ArrowRight className="w-4 h-4" />
        </Link>

        {subscription?.planName === 'free' && (
          <Link
            href="/pricing"
            className="px-6 py-3 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors duration-200"
          >
            Learn More
          </Link>
        )}
      </div>

      {subscription?.planName === 'free' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Start your 14-day free trial • No credit card required
        </p>
      )}
    </div>
  )
}

interface UsageLimitPromptProps {
  metric: string
  currentUsage: number
  limit: number
}

export function UsageLimitPrompt({ metric, currentUsage, limit }: UsageLimitPromptProps) {
  const metricNames: Record<string, string> = {
    messages: 'messages',
    tasks: 'tasks',
    templates: 'custom templates',
    reports: 'reports',
    api_calls: 'API calls',
  }

  const metricName = metricNames[metric] || metric

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-900 border border-amber-200 dark:border-amber-900/50 rounded-xl">
      <div className="w-12 h-12 mb-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
        <Lock className="w-6 h-6 text-white" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        Usage Limit Reached
      </h3>

      <p className="text-gray-600 dark:text-gray-300 text-center mb-4 text-sm">
        You've used {currentUsage} of {limit} {metricName} this month
      </p>

      <Link
        href="/pricing"
        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Upgrade for Unlimited
      </Link>
    </div>
  )
}
