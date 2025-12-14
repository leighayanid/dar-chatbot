import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/server'
import type { SubscriptionPlan, UserSubscription } from '@/lib/supabase/types'

// Force dynamic rendering to avoid build-time module evaluation
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const { user, error: authError } = await getAuthUser(req)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { planName, billingCycle } = body

    if (!planName || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing planName or billingCycle' },
        { status: 400 }
      )
    }

    // Get the plan details from the database
    const { data, error: planError } = await supabaseServer
      .from('subscription_plans')
      .select('*')
      .eq('name', planName)
      .eq('is_active', true)
      .single()

    if (planError || !data) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const plan = data as SubscriptionPlan

    // Don't create checkout for free plan
    if (plan.price_monthly === 0 && plan.price_yearly === 0) {
      return NextResponse.json(
        { error: 'Cannot checkout for free plan' },
        { status: 400 }
      )
    }

    // Get the Stripe price ID based on billing cycle
    const priceId =
      billingCycle === 'yearly'
        ? plan.stripe_price_yearly_id
        : plan.stripe_price_monthly_id

    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe price not configured for this plan' },
        { status: 400 }
      )
    }

    // Check if user already has an active subscription
    const { data: existingSub } = await supabaseServer
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const existingSubscription = existingSub as UserSubscription | null

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
        plan_name: plan.name,
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: existingSubscription ? {
          user_id: user.id,
          plan_id: plan.id,
          plan_name: plan.name,
          previous_subscription_id: existingSubscription.id,
        } : {
          user_id: user.id,
          plan_id: plan.id,
          plan_name: plan.name,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
