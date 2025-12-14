import { NextRequest, NextResponse } from 'next/server'
import {
  getTeamMembers,
  getUserRole,
  updateMemberRole,
  removeMember,
  type TeamRole
} from '@/lib/supabase/teams'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export const runtime = 'nodejs'

// GET /api/teams/[id]/members - Get all members of a team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: teamId } = await params

    // Check if user is a member of this team
    const userRole = await getUserRole(teamId, user.id)

    if (!userRole) {
      return NextResponse.json(
        { error: 'Forbidden: You are not a member of this team' },
        { status: 403 }
      )
    }

    // Get team members
    const members = await getTeamMembers(teamId)

    // Get user details for each member
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name, avatar_url')
          .eq('id', member.user_id)
          .single()

        const { data: authUser } = await supabase.auth.admin.getUserById(member.user_id)

        return {
          ...member,
          email: authUser.user?.email || null,
          full_name: (profile as any)?.full_name || null,
          avatar_url: (profile as any)?.avatar_url || null
        }
      })
    )

    return NextResponse.json({ members: membersWithDetails })
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/teams/[id]/members - Update a member's role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: teamId } = await params

    // Check if user can manage team (owner or admin)
    const userRole = await getUserRole(teamId, user.id)

    if (!userRole || (userRole !== 'owner' && userRole !== 'admin')) {
      return NextResponse.json(
        { error: 'Forbidden: You must be an owner or admin to manage members' },
        { status: 403 }
      )
    }

    // Parse request body
    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles: TeamRole[] = ['owner', 'admin', 'member', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Can't change owner role unless you are the owner
    const targetRole = await getUserRole(teamId, userId)
    if (targetRole === 'owner' && userRole !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden: Only owners can change other owners' },
        { status: 403 }
      )
    }

    // Update member role
    const success = await updateMemberRole(teamId, userId, role)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update member role' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating member role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/teams/[id]/members - Remove a member from the team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: teamId } = await params

    // Check if user can manage team (owner or admin)
    const userRole = await getUserRole(teamId, user.id)

    if (!userRole || (userRole !== 'owner' && userRole !== 'admin')) {
      return NextResponse.json(
        { error: 'Forbidden: You must be an owner or admin to remove members' },
        { status: 403 }
      )
    }

    // Get userId from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Can't remove the owner
    const targetRole = await getUserRole(teamId, userId)
    if (targetRole === 'owner') {
      return NextResponse.json(
        { error: 'Forbidden: Cannot remove the team owner' },
        { status: 403 }
      )
    }

    // Remove member
    const success = await removeMember(teamId, userId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to remove member' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
