import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth/server'

/**
 * GET /api/subscription/usage
 * Get the current user's usage stats for the current billing period
 */
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const { user, error: authError } = await getAuthUser(req)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current month's usage
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const { data: usage, error: usageError } = await (supabaseServer as any)
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .gte('period_start', startOfMonth.toISOString())
      .single()

    if (usageError && usageError.code !== 'PGRST116') {
      throw usageError
    }

    // If no usage record exists, return zeros
    if (!usage) {
      return NextResponse.json({
        messages: 0,
        tasks: 0,
        exports: 0,
        api_calls: 0,
        period_start: startOfMonth.toISOString(),
        period_end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
      })
    }

    return NextResponse.json({
      messages: usage.messages_count || 0,
      tasks: usage.tasks_count || 0,
      exports: usage.exports_count || 0,
      api_calls: usage.api_calls_count || 0,
      period_start: usage.period_start,
      period_end: usage.period_end,
    })
  } catch (error) {
    console.error('Get usage error:', error)
    return NextResponse.json(
      { error: 'Failed to get usage' },
      { status: 500 }
    )
  }
}
