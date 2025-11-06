'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import {
  CreditCardIcon,
  ZapIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
  Loader2Icon,
  ArrowRightIcon,
  SparklesIcon,
} from 'lucide-react'
import Link from 'next/link'

interface Subscription {
  id: string
  status: string
  billing_cycle: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  subscription_plans: {
    name: string
    display_name: string
    price_monthly: number
    price_yearly: number
    features: any
  }
}

interface Usage {
  messages: number
  tasks: number
  exports: number
  api_calls: number
  period_start: string
  period_end: string
}

export default function SubscriptionSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plan, setPlan] = useState<any>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isFree, setIsFree] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadSubscriptionData()
  }, [user, router])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)

      // Load subscription
      const subResponse = await fetch('/api/subscription')
      if (subResponse.ok) {
        const subData = await subResponse.json()
        setSubscription(subData.subscription)
        setPlan(subData.plan)
        setIsFree(subData.is_free)
      }

      // Load usage
      const usageResponse = await fetch('/api/subscription/usage')
      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        setUsage(usageData)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
      return
    }

    try {
      setActionLoading('cancel')
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      await loadSubscriptionData()
      alert('Subscription cancelled. You will have access until the end of your billing period.')
    } catch (error) {
      console.error('Cancel error:', error)
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      setActionLoading('reactivate')
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription')
      }

      await loadSubscriptionData()
      alert('Subscription reactivated successfully!')
    } catch (error) {
      console.error('Reactivate error:', error)
      alert('Failed to reactivate subscription. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      setActionLoading('portal')
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal. Please try again.')
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <Loader2Icon className="mx-auto mb-4 size-12 animate-spin text-rose-400" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Subscription & Billing
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage your subscription, view usage, and update billing information
          </p>
        </div>

        <div className="space-y-6">
          {/* Current Plan Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Current Plan
                </h2>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1.5 text-sm font-bold text-white">
                    <SparklesIcon className="size-4" />
                    {plan?.display_name || 'Free'}
                  </span>
                  {subscription?.status && (
                    <span
                      className={`text-xs font-medium ${
                        subscription.status === 'active'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`}
                    >
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
              {!isFree && (
                <button
                  onClick={handleManageBilling}
                  disabled={actionLoading === 'portal'}
                  className="flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 shadow-lg transition-all hover:scale-105 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
                >
                  {actionLoading === 'portal' ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <CreditCardIcon className="size-4" />
                  )}
                  Manage Billing
                </button>
              )}
            </div>

            {subscription && !isFree && (
              <div className="space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Billing Cycle</p>
                    <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {subscription.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Next Billing Date</p>
                    <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>

                {subscription.cancel_at_period_end ? (
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-950/20">
                    <div className="mb-3 flex items-start gap-3">
                      <AlertCircleIcon className="size-5 shrink-0 text-orange-600 dark:text-orange-400" />
                      <div>
                        <p className="font-semibold text-orange-900 dark:text-orange-200">
                          Subscription Cancelled
                        </p>
                        <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                          Your subscription will end on {formatDate(subscription.current_period_end)}.
                          You will be downgraded to the Free plan.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading === 'reactivate'}
                      className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading === 'reactivate' ? (
                        <>
                          <Loader2Icon className="size-4 animate-spin" />
                          Reactivating...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="size-4" />
                          Reactivate Subscription
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading === 'cancel'}
                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            )}

            {isFree && (
              <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                  Upgrade to unlock unlimited messages, advanced AI insights, custom templates, and more.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  View Plans
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Usage Card */}
          {plan && usage && (
            <div className="rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
              <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Current Usage
              </h2>
              <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                {formatDate(usage.period_start)} - {formatDate(usage.period_end)}
              </p>

              <div className="space-y-6">
                {/* Messages */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Messages
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {usage.messages.toLocaleString()} /{' '}
                      {plan.features.limits.messages === -1
                        ? 'Unlimited'
                        : plan.features.limits.messages.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                      style={{
                        width: `${getUsagePercentage(usage.messages, plan.features.limits.messages)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Tasks */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Tasks
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {usage.tasks.toLocaleString()} /{' '}
                      {plan.features.limits.tasks === -1
                        ? 'Unlimited'
                        : plan.features.limits.tasks.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all"
                      style={{
                        width: `${getUsagePercentage(usage.tasks, plan.features.limits.tasks)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Exports */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Exports
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {usage.exports.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-rose-600 transition-all"
                      style={{ width: `${Math.min((usage.exports / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
