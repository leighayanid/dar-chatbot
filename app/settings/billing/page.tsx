'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useSubscription } from '@/lib/subscription/subscription-context'
import {
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function BillingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { subscription, usage, loading: subscriptionLoading, refreshSubscription } = useSubscription()
  const [portalLoading, setPortalLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    // Check if we're returning from a successful checkout
    if (searchParams.get('success') === 'true') {
      setShowSuccessMessage(true)
      refreshSubscription()

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [searchParams, refreshSubscription])

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error opening billing portal:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (!user || subscriptionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading billing information...</p>
        </div>
      </div>
    )
  }

  const isFree = subscription?.planName === 'free'
  const isActive = subscription?.status === 'active'
  const isPastDue = subscription?.status === 'past_due'

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 py-12 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/settings"
            className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4"
          >
            ← Back to Settings
          </Link>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
            Billing & Subscription
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-900 dark:text-green-100 font-medium">
              Subscription updated successfully! Welcome to {subscription?.displayName}!
            </p>
          </div>
        )}

        {/* Past Due Warning */}
        {isPastDue && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-red-900 dark:text-red-100 font-medium">
                Payment Failed
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                Your last payment failed. Please update your payment method to avoid service interruption.
              </p>
            </div>
          </div>
        )}

        {/* Current Plan Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                {subscription?.displayName || 'Free'} Plan
              </h2>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isActive
                    ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300'
                    : isPastDue
                    ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300'
                }`}>
                  {subscription?.status || 'Active'}
                </span>
              </div>
            </div>

            {!isFree && (
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Manage Billing
                    <ExternalLink className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>

          {isFree ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    Upgrade to Pro or Team
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-4">
                    Get unlimited messages, AI insights, priority support, and more.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    View Plans
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                    Billing Cycle
                  </span>
                </div>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white capitalize">
                  Monthly
                </p>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                    Next Billing
                  </span>
                </div>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Not available
                </p>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                    Payment Method
                  </span>
                </div>
                <button
                  onClick={handleManageBilling}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Update
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Usage Stats */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
            Usage This Month
          </h2>

          <div className="space-y-4">
            {/* Messages Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Messages
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {usage?.messages || 0} / {isFree ? '50' : 'Unlimited'}
                </span>
              </div>
              {isFree && (
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((usage?.messages || 0) / 50 * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Tasks Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tasks
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {usage?.tasks || 0} / {isFree ? '25' : 'Unlimited'}
                </span>
              </div>
              {isFree && (
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((usage?.tasks || 0) / 25 * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Templates Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Custom Templates
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {usage?.templates || 0} / {isFree ? '3' : 'Unlimited'}
                </span>
              </div>
              {isFree && (
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((usage?.templates || 0) / 3 * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {isFree && (usage?.messages || 0) >= 40 && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-amber-900 dark:text-amber-100 text-sm">
                <span className="font-semibold">Approaching limit:</span> You've used{' '}
                {Math.round(((usage?.messages || 0) / 50) * 100)}% of your monthly messages.{' '}
                <Link href="/pricing" className="underline hover:no-underline">
                  Upgrade now
                </Link>{' '}
                for unlimited access.
              </p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            Need help?
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Have questions about billing or your subscription? We're here to help.
          </p>
          <div className="flex gap-3">
            <Link
              href="mailto:support@dar-app.com"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-sm"
            >
              Contact Support
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Compare Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
