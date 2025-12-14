import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Get optional team ID from request body
    const body = await request.json().catch(() => ({}))
    const { teamId } = body

    // Get Stripe customer ID
    let customerId: string | null = null

    if (teamId) {
      // Team billing portal
      const { data: teamSub } = (await (supabaseServer as any)
        .from('team_subscriptions')
        .select('stripe_customer_id')
        .eq('team_id', teamId)
        .single()) as any

      customerId = teamSub?.stripe_customer_id || null
    } else {
      // Individual billing portal
      const { data: userSub } = (await (supabaseServer as any)
        .from('user_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()) as any

      customerId = userSub?.stripe_customer_id || null
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'No subscription found. Please subscribe first.' },
        { status: 404 }
      )
    }

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}
