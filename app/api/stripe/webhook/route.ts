import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { supabaseServer } from '@/lib/supabase/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

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
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  console.log('Received Stripe webhook:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
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
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const teamId = session.metadata?.team_id
  const planName = session.metadata?.plan_name
  const billingCycle = session.metadata?.billing_cycle

  if (!userId || !planName) {
    console.error('Missing metadata in checkout session:', session.id)
    return
  }

  // Get plan ID from database
  const { data: plan } = (await (supabaseServer as any)
    .from('subscription_plans')
    .select('id')
    .eq('name', planName)
    .single()) as any

  if (!plan) {
    console.error('Plan not found:', planName)
    return
  }

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  )

  const subscriptionAny = subscription as any

  const subscriptionData = {
    plan_id: plan.id,
    stripe_subscription_id: subscriptionAny.id,
    stripe_price_id: subscriptionAny.items.data[0].price.id,
    status: subscriptionAny.status,
    billing_cycle: billingCycle || 'monthly',
    current_period_start: new Date(subscriptionAny.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscriptionAny.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscriptionAny.cancel_at_period_end,
  }

  if (teamId) {
    // Update team subscription
    await (supabaseServer as any)
      .from('team_subscriptions')
      .update({
        ...subscriptionData,
        seats_total: subscription.items.data[0].quantity || 2,
      } as any)
      .eq('team_id', teamId)
  } else {
    // Update user subscription
    await (supabaseServer as any)
      .from('user_subscriptions')
      .update(subscriptionData as any)
      .eq('user_id', userId)
  }

  // Log the event
  await (supabaseServer as any).rpc('log_subscription_event', {
    p_user_id: userId,
    p_subscription_id: (subscription as any).id,
    p_subscription_type: teamId ? 'team' : 'user',
    p_event_type: 'subscription_created',
    p_event_data: { session_id: session.id, plan_name: planName },
    p_stripe_event_id: null,
  } as any)

  console.log('Checkout completed for user:', userId, 'plan:', planName)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionAny = subscription as any

  const updateData = {
    status: subscriptionAny.status,
    current_period_start: new Date(subscriptionAny.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscriptionAny.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscriptionAny.cancel_at_period_end,
  }

  // Try to update user subscription
  const { data: userSub } = (await (supabaseServer as any)
    .from('user_subscriptions')
    .update(updateData as any)
    .eq('stripe_subscription_id', subscription.id)
    .select()
    .single()) as any

  if (userSub) {
    console.log('Updated user subscription:', subscription.id)
    return
  }

  // Try to update team subscription
  const { data: teamSub } = (await (supabaseServer as any)
    .from('team_subscriptions')
    .update({
      ...updateData,
      seats_total: subscription.items.data[0].quantity || 2,
    } as any)
    .eq('stripe_subscription_id', subscription.id)
    .select()
    .single()) as any

  if (teamSub) {
    console.log('Updated team subscription:', subscription.id)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Get the free plan ID
  const { data: freePlan } = (await (supabaseServer as any)
    .from('subscription_plans')
    .select('id')
    .eq('name', 'free')
    .single()) as any

  if (!freePlan) {
    console.error('Free plan not found')
    return
  }

  // Downgrade user to free plan
  const { data: userSub } = (await (supabaseServer as any)
    .from('user_subscriptions')
    .update({
      plan_id: freePlan.id,
      status: 'canceled',
    } as any)
    .eq('stripe_subscription_id', subscription.id)
    .select('user_id')
    .single()) as any

  if (userSub) {
    console.log('Downgraded user to free plan:', userSub.user_id)
    return
  }

  // Downgrade team to free plan
  const { data: teamSub } = (await (supabaseServer as any)
    .from('team_subscriptions')
    .update({
      plan_id: freePlan.id,
      status: 'canceled',
    } as any)
    .eq('stripe_subscription_id', subscription.id)
    .select('team_id')
    .single()) as any

  if (teamSub) {
    console.log('Downgraded team to free plan:', teamSub.team_id)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Update subscription status to active if it was past_due
  const subscriptionId = (invoice as any).subscription as string

  if (subscriptionId) {
    await (supabaseServer as any)
      .from('user_subscriptions')
      .update({ status: 'active' } as any)
      .eq('stripe_subscription_id', subscriptionId)
      .eq('status', 'past_due')

    await (supabaseServer as any)
      .from('team_subscriptions')
      .update({ status: 'active' } as any)
      .eq('stripe_subscription_id', subscriptionId)
      .eq('status', 'past_due')

    console.log('Payment succeeded for subscription:', subscriptionId)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  if (subscriptionId) {
    // Mark subscription as past_due
    await supabaseServer
      .from('user_subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', subscriptionId)

    await supabaseServer
      .from('team_subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', subscriptionId)

    console.log('Payment failed for subscription:', subscriptionId)

    // TODO: Send email notification to user about failed payment
  }
}
