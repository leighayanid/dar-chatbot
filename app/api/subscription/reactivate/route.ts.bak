import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/server'
import type { UserSubscription } from '@/lib/supabase/types'

/**
 * POST /api/subscription/reactivate
 * Reactivate a cancelled subscription (undo cancel_at_period_end)
 */
export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const { user, error: authError } = await getAuthUser(req)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's subscription that is set to cancel
    const { data, error: subError } = await supabaseServer
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('cancel_at_period_end', true)
      .single()

    if (subError || !data) {
      return NextResponse.json(
        { error: 'No subscription set to cancel found' },
        { status: 404 }
      )
    }

    const subscription = data as UserSubscription

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Invalid subscription - no Stripe subscription ID' },
        { status: 400 }
      )
    }

    // Reactivate the subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: false,
      }
    )

    // Update the subscription in the database
    await (supabaseServer as any)
      .from('user_subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    // Log the event
    await (supabaseServer as any).from('subscription_events').insert({
      user_id: user.id,
      event_type: 'subscription_reactivated',
      stripe_event_id: stripeSubscription.id,
      metadata: {
        subscription_id: subscription.id,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Reactivate subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    )
  }
}
