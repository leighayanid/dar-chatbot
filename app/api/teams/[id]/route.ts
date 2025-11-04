import { NextRequest, NextResponse } from 'next/server'
import { getTeam, updateTeam, deleteTeam, getUserRole } from '@/lib/supabase/teams'
import { supabase } from '@/lib/supabase'

export const runtime = 'edge'

// GET /api/teams/[id] - Get a specific team
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

    // Get team
    const team = await getTeam(teamId)

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/teams/[id] - Update a team
export async function PUT(
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

    // Check if user is owner or admin
    const role = await getUserRole(teamId, user.id)

    if (!role || (role !== 'owner' && role !== 'admin')) {
      return NextResponse.json(
        { error: 'Forbidden: You must be an owner or admin to update this team' },
        { status: 403 }
      )
    }

    // Parse request body
    const updates = await request.json()

    // Update team
    const success = await updateTeam(teamId, updates)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update team' },
        { status: 500 }
      )
    }

    // Get updated team
    const team = await getTeam(teamId)

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/teams/[id] - Delete a team
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

    // Check if user is owner
    const team = await getTeam(teamId)

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    if (team.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Only the team owner can delete the team' },
        { status: 403 }
      )
    }

    // Delete team
    const success = await deleteTeam(teamId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete team' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
