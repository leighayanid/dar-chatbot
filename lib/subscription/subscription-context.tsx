'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'

interface PlanFeatures {
  messages_per_month: number // -1 = unlimited
  active_tasks: number
  custom_templates: number
  history_days: number
  export_formats: string[]
  system_templates: number
  analytics_days: number
  email_reminders: boolean
  ai_insights: boolean
  goals?: number
  recurring_tasks?: boolean
  team_features?: boolean
  shared_templates?: boolean
  team_analytics?: boolean
  manager_dashboard?: boolean
  slack_integration?: boolean
  teams_integration?: boolean
  sso?: boolean
  audit_logs?: boolean
  api_access?: boolean
  custom_integrations?: boolean
  dedicated_support?: boolean
  sla?: string
  [key: string]: any // Allow dynamic feature keys
}

interface Subscription {
  planName: string
  displayName: string
  status: string
  features: PlanFeatures
  trialEnd: string | null
}

interface Usage {
  messages: number
  tasks: number
  templates: number
  reports?: number
  api_calls?: number
}

interface SubscriptionContextType {
  subscription: Subscription | null
  usage: Usage | null
  loading: boolean
  hasFeature: (feature: string) => boolean
  canUseFeature: (feature: string, currentUsage?: number) => boolean
  getFeatureLimit: (feature: string) => number | boolean
  refreshSubscription: () => Promise<void>
  refreshUsage: () => Promise<void>
  upgradeRequired: boolean
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  usage: null,
  loading: true,
  hasFeature: () => false,
  canUseFeature: () => false,
  getFeatureLimit: () => false,
  refreshSubscription: async () => {},
  refreshUsage: async () => {},
  upgradeRequired: false,
})

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.rpc('get_user_plan', {
        user_id: user.id,
      })

      if (error) {
        console.error('Error fetching subscription:', error)
      } else if (data) {
        setSubscription(data as Subscription)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchUsage = useCallback(async () => {
    if (!user) return

    try {
      const metrics = ['messages', 'tasks', 'templates', 'reports', 'api_calls']
      const usageData: any = {}

      // Fetch all metrics in parallel
      const results = await Promise.all(
        metrics.map((metric) =>
          supabase.rpc('get_current_usage', {
            user_id: user.id,
            metric,
          })
        )
      )

      metrics.forEach((metric, index) => {
        usageData[metric] = results[index].data || 0
      })

      setUsage(usageData)
    } catch (error) {
      console.error('Error fetching usage:', error)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setUsage(null)
      setLoading(false)
      return
    }

    fetchSubscription()
    fetchUsage()
  }, [user, fetchSubscription, fetchUsage])

  function hasFeature(feature: string): boolean {
    if (!subscription) return false

    const value = subscription.features[feature]

    // If feature doesn't exist, default to false
    if (value === undefined || value === null) return false

    // Boolean features
    if (typeof value === 'boolean') return value

    // Numeric features: -1 (unlimited) or > 0 means has access
    if (typeof value === 'number') return value === -1 || value > 0

    // Array features: has access if array has items
    if (Array.isArray(value)) return value.length > 0

    return false
  }

  function canUseFeature(feature: string, currentUsage?: number): boolean {
    if (!subscription) return false

    const limit = subscription.features[feature]

    // -1 means unlimited
    if (limit === -1) return true

    // Boolean features
    if (typeof limit === 'boolean') return limit

    // Numeric limits with usage check
    if (typeof limit === 'number' && currentUsage !== undefined) {
      return currentUsage < limit
    }

    return false
  }

  function getFeatureLimit(feature: string): number | boolean {
    if (!subscription) return false
    return subscription.features[feature]
  }

  const upgradeRequired = subscription?.planName === 'free'

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        usage,
        loading,
        hasFeature,
        canUseFeature,
        getFeatureLimit,
        refreshSubscription: fetchSubscription,
        refreshUsage: fetchUsage,
        upgradeRequired,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}
