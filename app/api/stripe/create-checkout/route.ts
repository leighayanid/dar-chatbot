import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES, PLAN_NAMES } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export const runtime = 'nodejs'

interface CheckoutRequest {
  planName: 'pro' | 'team'
  billingCycle: 'monthly' | 'yearly'
  teamId?: string
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const headersList = await headers()
    const cookieHeader = headersList.get('cookie') || ''

    // Parse session from cookie - simplified approach
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const body: CheckoutRequest = await request.json()
    const { planName, billingCycle, teamId } = body

    // Validate plan
    if (!['pro', 'team'].includes(planName)) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose "pro" or "team"' },
        { status: 400 }
      )
    }

    // Validate billing cycle
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Choose "monthly" or "yearly"' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId: string | null = null

    if (teamId) {
      // Team subscription
      const { data: teamSub } = (await (supabaseServer as any)
        .from('team_subscriptions')
        .select('stripe_customer_id')
        .eq('team_id', teamId)
        .single()) as any

      customerId = teamSub?.stripe_customer_id || null
    } else {
      // Individual subscription
      const { data: userSub } = (await (supabaseServer as any)
        .from('user_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()) as any

      customerId = userSub?.stripe_customer_id || null
    }

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          team_id: teamId || '',
        },
      })
      customerId = customer.id

      // Save customer ID to database
      if (teamId) {
        await (supabaseServer as any)
          .from('team_subscriptions')
          .upsert({
            team_id: teamId,
            stripe_customer_id: customerId,
            plan_id: ((await supabaseServer
              .from('subscription_plans')
              .select('id')
              .eq('name', planName)
              .single()) as any).data?.id || '',
            status: 'incomplete',
            billing_cycle: billingCycle,
            seats_total: 2, // Minimum for team plan
            seats_used: 1,
          } as any)
      } else {
        await (supabaseServer as any)
          .from('user_subscriptions')
          .update({ stripe_customer_id: customerId } as any)
          .eq('user_id', user.id)
      }
    }

    // Get the price ID
    const priceId = STRIPE_PRICES[planName][billingCycle]

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1, // For teams, quantity represents seats
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        team_id: teamId || '',
        plan_name: planName,
        billing_cycle: billingCycle,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
