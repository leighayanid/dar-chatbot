'use client'

import { ReactNode } from 'react'
import { useSubscription } from '@/lib/subscription/subscription-context'
import { UpgradePrompt } from './upgrade-prompt'

interface FeatureGateProps {
  feature: string
  fallback?: ReactNode
  children: ReactNode
}

export function FeatureGate({ feature, fallback, children }: FeatureGateProps) {
  const { hasFeature, loading } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!hasFeature(feature)) {
    return fallback || <UpgradePrompt feature={feature} />
  }

  return <>{children}</>
}

interface UsageGateProps {
  metric: string
  currentUsage: number
  children: ReactNode
  fallback?: ReactNode
  showWarning?: boolean
  warningThreshold?: number
}

export function UsageGate({
  metric,
  currentUsage,
  children,
  fallback,
  showWarning = true,
  warningThreshold = 0.9,
}: UsageGateProps) {
  const { canUseFeature, getFeatureLimit, loading } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  const limit = getFeatureLimit(metric) as number
  const canUse = canUseFeature(metric, currentUsage)

  // Show warning when approaching limit
  if (showWarning && limit !== -1 && currentUsage >= limit * warningThreshold && currentUsage < limit) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <span className="font-semibold">Usage Warning:</span> You've used {currentUsage} of {limit}{' '}
            {metric} this month ({Math.round((currentUsage / limit) * 100)}%)
          </p>
        </div>
        {children}
      </div>
    )
  }

  if (!canUse) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <UpgradePrompt
        message={`You've reached your ${metric} limit (${currentUsage}/${limit}). Upgrade for unlimited access.`}
      />
    )
  }

  return <>{children}</>
}
