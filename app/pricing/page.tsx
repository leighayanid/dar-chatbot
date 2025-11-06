'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import { CheckIcon, SparklesIcon, UsersIcon, BuildingIcon, Loader2Icon, ZapIcon } from 'lucide-react'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  display_name: string
  description: string
  price_monthly: number
  price_yearly: number
  features: {
    limits: {
      messages: number
      tasks: number
      templates: number
      history_days: number
      team_members?: number
    }
    features: Record<string, any>
  }
  sort_order: number
  is_active: boolean
}

const planIcons = {
  free: SparklesIcon,
  pro: ZapIcon,
  team: UsersIcon,
  enterprise: BuildingIcon,
}

const planColors = {
  free: 'from-zinc-400 to-zinc-500',
  pro: 'from-blue-500 to-indigo-600',
  team: 'from-purple-500 to-pink-600',
  enterprise: 'from-orange-500 to-rose-600',
}

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    async function loadPlans() {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')

        if (error) throw error

        setPlans(data || [])
      } catch (err) {
        console.error('Error loading plans:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [])

  const handleGetStarted = (planName: string) => {
    if (!user) {
      router.push('/register')
      return
    }

    if (planName === 'free') {
      router.push('/dashboard')
    } else {
      // TODO: Redirect to Stripe checkout
      router.push('/dashboard')
    }
  }

  const getPrice = (plan: Plan) => {
    const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
    if (billingCycle === 'yearly') {
      return (price / 12).toFixed(2)
    }
    return price.toFixed(2)
  }

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited'
    return limit.toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <Loader2Icon className="mx-auto mb-4 size-12 animate-spin text-rose-400" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading pricing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              DAR
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="mb-4 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-5xl font-bold tracking-tight text-transparent dark:from-zinc-50 dark:via-zinc-300 dark:to-zinc-50 md:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Choose the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>

          {/* Billing Toggle */}
          <div className="mb-12 inline-flex items-center gap-4 rounded-2xl bg-white/80 p-2 shadow-xl backdrop-blur-xl dark:bg-zinc-900/80">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              Yearly
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-950/30 dark:text-green-400">
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = planIcons[plan.name as keyof typeof planIcons] || SparklesIcon
            const isPro = plan.name === 'pro'
            const isPopular = isPro

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-all hover:scale-105 hover:shadow-2xl dark:bg-zinc-900/80 ${
                  isPopular
                    ? 'border-rose-400 ring-2 ring-rose-400 ring-offset-4 dark:ring-offset-zinc-950'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex rounded-full bg-gradient-to-r from-rose-400 to-orange-400 px-4 py-1 text-xs font-bold text-white shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Icon */}
                <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${planColors[plan.name as keyof typeof planColors] || 'from-zinc-400 to-zinc-500'} p-3 shadow-lg`}>
                  <Icon className="size-6 text-white" />
                </div>

                {/* Plan Name */}
                <h3 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {plan.display_name}
                </h3>

                {/* Plan Description */}
                <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                      ${getPrice(plan)}
                    </span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      /{plan.name === 'team' || plan.name === 'enterprise' ? 'user/' : ''}
                      {billingCycle === 'yearly' ? 'month' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.price_yearly > 0 && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                      Billed ${plan.price_yearly} annually
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleGetStarted(plan.name)}
                  className={`mb-8 w-full rounded-xl py-3 font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 ${
                    isPopular
                      ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white'
                      : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700'
                  }`}
                >
                  {plan.name === 'free' ? 'Get Started Free' : plan.name === 'enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </button>

                {/* Features List */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                    What's Included
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm">
                      <CheckIcon className="mt-0.5 size-5 shrink-0 text-green-600" />
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {formatLimit(plan.features.limits.messages)} messages/month
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <CheckIcon className="mt-0.5 size-5 shrink-0 text-green-600" />
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {formatLimit(plan.features.limits.tasks)} tasks
                      </span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <CheckIcon className="mt-0.5 size-5 shrink-0 text-green-600" />
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {formatLimit(plan.features.limits.templates)} templates
                      </span>
                    </li>
                    {plan.features.features.ai_insights && (
                      <li className="flex items-start gap-3 text-sm">
                        <CheckIcon className="mt-0.5 size-5 shrink-0 text-green-600" />
                        <span className="text-zinc-700 dark:text-zinc-300">
                          AI-powered insights
                        </span>
                      </li>
                    )}
                    {plan.features.features.team_features && (
                      <li className="flex items-start gap-3 text-sm">
                        <CheckIcon className="mt-0.5 size-5 shrink-0 text-green-600" />
                        <span className="text-zinc-700 dark:text-zinc-300">
                          Team collaboration
                        </span>
                      </li>
                    )}
                    {plan.features.features.priority_support && (
                      <li className="flex items-start gap-3 text-sm">
                        <CheckIcon className="mt-0.5 size-5 shrink-0 text-green-600" />
                        <span className="text-zinc-700 dark:text-zinc-300">
                          Priority support
                        </span>
                      </li>
                    )}
                    {plan.features.features.dedicated_support && (
                      <li className="flex items-start gap-3 text-sm">
                        <CheckIcon className="mt-0.5 size-5 shrink-0 text-green-600" />
                        <span className="text-zinc-700 dark:text-zinc-300">
                          Dedicated support
                        </span>
                      </li>
                    )}
                  </ul>
                  <Link
                    href="#features"
                    className="inline-block pt-2 text-xs font-medium text-rose-400 hover:text-rose-500"
                  >
                    See all features →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section id="features" className="px-4 pb-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Compare Features
          </h2>

          <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white/80 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-6 py-4 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {plan.display_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <tr>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">Messages/month</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center text-sm text-zinc-700 dark:text-zinc-300">
                      {formatLimit(plan.features.limits.messages)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">Tasks</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center text-sm text-zinc-700 dark:text-zinc-300">
                      {formatLimit(plan.features.limits.tasks)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">AI-powered insights</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.features.features.ai_insights ? (
                        <CheckIcon className="mx-auto size-5 text-green-600" />
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">Team collaboration</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.features.features.team_features ? (
                        <CheckIcon className="mx-auto size-5 text-green-600" />
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">Custom reports</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.features.features.custom_reports ? (
                        <CheckIcon className="mx-auto size-5 text-green-600" />
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">Priority support</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.features.features.priority_support ? (
                        <CheckIcon className="mx-auto size-5 text-green-600" />
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'Can I change plans at any time?',
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the difference.",
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, MasterCard, American Express) through Stripe. Enterprise customers can also pay via invoice.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! Pro plan includes a 14-day free trial. Team plans get 30 days. No credit card required for the free plan.',
              },
              {
                q: 'What happens if I exceed my plan limits?',
                a: "You'll receive notifications as you approach your limits. You can upgrade at any time or wait until the next billing cycle when limits reset.",
              },
              {
                q: 'Do you offer refunds?',
                a: "Yes, we offer a 30-day money-back guarantee for all paid plans. Contact support if you're not satisfied.",
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel anytime from your account settings. Your access will continue until the end of your billing period.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80"
              >
                <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                  {faq.q}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-rose-400 to-orange-400 p-12 text-center shadow-2xl">
          <h2 className="mb-4 text-4xl font-bold text-white">
            Ready to boost your productivity?
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Join thousands of professionals tracking their daily accomplishments
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-white px-8 py-4 font-semibold text-rose-500 shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              Start Free Trial
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border-2 border-white px-8 py-4 font-semibold text-white transition-all hover:bg-white/10"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              © 2024 DAR. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Privacy
              </Link>
              <Link href="/contact" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
