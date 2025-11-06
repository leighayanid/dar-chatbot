import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/server'

/**
 * GET /api/subscription
 * Get the current user's subscription details
 */
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const { user, error: authError } = await getAuthUser(req)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's active subscription with plan details
    const { data: subscription, error: subError } = await (supabaseServer as any)
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          id,
          name,
          display_name,
          description,
          price_monthly,
          price_yearly,
          features
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError && subError.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      throw subError
    }

    // If no active subscription, user is on free plan
    if (!subscription) {
      const { data: freePlan } = await (supabaseServer as any)
        .from('subscription_plans')
        .select('*')
        .eq('name', 'free')
        .single()

      return NextResponse.json({
        subscription: null,
        plan: freePlan,
        is_free: true,
      })
    }

    return NextResponse.json({
      subscription,
      plan: subscription.subscription_plans,
      is_free: false,
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    )
  }
}
