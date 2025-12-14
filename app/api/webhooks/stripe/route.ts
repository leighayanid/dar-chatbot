import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { supabaseServer } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const planId = session.metadata?.plan_id

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session')
    return
  }

  // The subscription will be handled by subscription.created event
  // Here we just log the successful checkout
  await (supabaseServer as any).from('subscription_events').insert({
    user_id: userId,
    event_type: 'checkout_completed',
    stripe_event_id: session.id,
    metadata: {
      session_id: session.id,
      plan_id: planId,
    },
  })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  const planId = subscription.metadata?.plan_id
  const planName = subscription.metadata?.plan_name

  if (!userId || !planId) {
    console.error('Missing metadata in subscription')
    return
  }

  // Cancel any existing active subscriptions for this user
  await (supabaseServer as any)
    .from('user_subscriptions')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'active')

  // Determine billing cycle from subscription
  const interval = subscription.items.data[0]?.price.recurring?.interval
  const billingCycle = interval === 'year' ? 'yearly' : 'monthly'

  // Create or update subscription
  const sub = subscription as any
  const { error } = await (supabaseServer as any).from('user_subscriptions').upsert(
    {
      user_id: userId,
      plan_id: planId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: sub.customer as string,
      status: sub.status as 'active' | 'past_due' | 'cancelled' | 'trialing',
      billing_cycle: billingCycle,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
    },
    {
      onConflict: 'stripe_subscription_id',
    }
  )

  if (error) {
    console.error('Failed to update subscription:', error)
    return
  }

  // Log event
  await (supabaseServer as any).from('subscription_events').insert({
    user_id: userId,
    event_type: subscription.status === 'active' ? 'subscription_activated' : 'subscription_updated',
    stripe_event_id: subscription.id,
    metadata: {
      subscription_id: subscription.id,
      plan_name: planName,
      status: subscription.status,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.error('Missing user_id in subscription metadata')
    return
  }

  // Update subscription status to cancelled
  await (supabaseServer as any)
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  // Log event
  await (supabaseServer as any).from('subscription_events').insert({
    user_id: userId,
    event_type: 'subscription_cancelled',
    stripe_event_id: subscription.id,
    metadata: {
      subscription_id: subscription.id,
    },
  })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const inv = invoice as any
  const subscriptionId = inv.subscription as string

  if (!subscriptionId) return

  // Get subscription to find user
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.user_id

  if (!userId) return

  // Log successful payment
  await (supabaseServer as any).from('subscription_events').insert({
    user_id: userId,
    event_type: 'payment_succeeded',
    stripe_event_id: inv.id,
    metadata: {
      invoice_id: inv.id,
      amount: inv.amount_paid,
      subscription_id: subscriptionId,
    },
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const inv = invoice as any
  const subscriptionId = inv.subscription as string

  if (!subscriptionId) return

  // Get subscription to find user
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.user_id

  if (!userId) return

  // Update subscription status to past_due
  await (supabaseServer as any)
    .from('user_subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId)

  // Log failed payment
  await (supabaseServer as any).from('subscription_events').insert({
    user_id: userId,
    event_type: 'payment_failed',
    stripe_event_id: inv.id,
    metadata: {
      invoice_id: inv.id,
      amount: inv.amount_due,
      subscription_id: subscriptionId,
    },
  })
}
