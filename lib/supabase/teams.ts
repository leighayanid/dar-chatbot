import { supabase } from './client'
import { supabaseServer } from './server'

// Type definitions
export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer'
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface Team {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: TeamRole
  joined_at: string
}

export interface TeamInvitation {
  id: string
  team_id: string
  email: string
  role: TeamRole
  invited_by: string
  status: InvitationStatus
  token: string
  expires_at: string
  created_at: string
  accepted_at: string | null
}

export interface Feedback {
  id: string
  conversation_id: string | null
  task_id: string | null
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

// =====================================================
// TEAM OPERATIONS
// =====================================================

export async function createTeam(name: string, description?: string): Promise<Team | null> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('createTeam: User not authenticated')
    return null
  }

  const { data, error } = await supabase
    .from('teams')
    // @ts-ignore - Supabase type inference issue
    .insert({
      name,
      description: description || null,
      owner_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('createTeam: Error creating team:', error)
    return null
  }

  return data as Team
}

export async function getTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getTeams: Error fetching teams:', error)
    return []
  }

  return data || []
}

export async function getTeam(id: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('getTeam: Error fetching team:', error)
    return null
  }

  return data
}

export async function updateTeam(
  id: string,
  updates: Partial<Pick<Team, 'name' | 'description' | 'avatar_url'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('teams')
    // @ts-ignore - Supabase type inference issue
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('updateTeam: Error updating team:', error)
    return false
  }

  return true
}

export async function deleteTeam(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deleteTeam: Error deleting team:', error)
    return false
  }

  return true
}

// =====================================================
// TEAM MEMBER OPERATIONS
// =====================================================

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('getTeamMembers: Error fetching team members:', error)
    return []
  }

  return data || []
}

export async function getUserTeams(userId?: string): Promise<Team[]> {
  const { data: { user } } = await supabase.auth.getUser()
  const targetUserId = userId || user?.id

  if (!targetUserId) {
    console.error('getUserTeams: User not authenticated')
    return []
  }

  // Get all team_ids for the user
  const { data: memberData, error: memberError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', targetUserId)

  if (memberError) {
    console.error('getUserTeams: Error fetching user teams:', memberError)
    return []
  }

  if (!memberData || memberData.length === 0) {
    return []
  }

  const teamIds = memberData.map((m: any) => m.team_id)

  // Get the actual team data
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .in('id', teamIds)
    .order('created_at', { ascending: false })

  if (teamsError) {
    console.error('getUserTeams: Error fetching teams:', teamsError)
    return []
  }

  return teams || []
}

export async function getUserRole(teamId: string, userId?: string): Promise<TeamRole | null> {
  const { data: { user } } = await supabase.auth.getUser()
  const targetUserId = userId || user?.id

  if (!targetUserId) {
    console.error('getUserRole: User not authenticated')
    return null
  }

  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', targetUserId)
    .single()

  if (error) {
    console.error('getUserRole: Error fetching user role:', error)
    return null
  }

  return (data as any)?.role as TeamRole || null
}

export async function updateMemberRole(
  teamId: string,
  userId: string,
  role: TeamRole
): Promise<boolean> {
  const { error } = await supabase
    .from('team_members')
    // @ts-ignore - Supabase type inference issue
    .update({ role })
    .eq('team_id', teamId)
    .eq('user_id', userId)

  if (error) {
    console.error('updateMemberRole: Error updating member role:', error)
    return false
  }

  return true
}

export async function removeMember(teamId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId)

  if (error) {
    console.error('removeMember: Error removing member:', error)
    return false
  }

  return true
}

// =====================================================
// INVITATION OPERATIONS
// =====================================================

export async function createInvitation(
  teamId: string,
  email: string,
  role: TeamRole = 'member'
): Promise<TeamInvitation | null> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('createInvitation: User not authenticated')
    return null
  }

  // Generate a random token
  const token = crypto.randomUUID()

  const { data, error } = await supabase
    .from('team_invitations')
    // @ts-ignore - Supabase type inference issue
    .insert({
      team_id: teamId,
      email,
      role,
      invited_by: user.id,
      token,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('createInvitation: Error creating invitation:', error)
    return null
  }

  return data as TeamInvitation
}

export async function getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
  const { data, error } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getTeamInvitations: Error fetching invitations:', error)
    return []
  }

  return data || []
}

export async function getUserInvitations(): Promise<TeamInvitation[]> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    console.error('getUserInvitations: User not authenticated or missing email')
    return []
  }

  const { data, error } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('email', user.email)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getUserInvitations: Error fetching user invitations:', error)
    return []
  }

  return data || []
}

export async function getInvitationByToken(token: string): Promise<TeamInvitation | null> {
  const { data, error } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (error) {
    console.error('getInvitationByToken: Error fetching invitation:', error)
    return null
  }

  return data
}

export async function acceptInvitation(token: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('acceptInvitation: User not authenticated')
    return false
  }

  // Get the invitation
  const invitation = await getInvitationByToken(token)

  if (!invitation) {
    console.error('acceptInvitation: Invitation not found')
    return false
  }

  if (invitation.status !== 'pending') {
    console.error('acceptInvitation: Invitation is not pending')
    return false
  }

  if (new Date(invitation.expires_at) < new Date()) {
    console.error('acceptInvitation: Invitation has expired')
    return false
  }

  // Add user to team
  const { error: memberError } = await supabase
    .from('team_members')
    // @ts-ignore - Supabase type inference issue
    .insert({
      team_id: invitation.team_id,
      user_id: user.id,
      role: invitation.role
    })

  if (memberError) {
    console.error('acceptInvitation: Error adding member to team:', memberError)
    return false
  }

  // Update invitation status
  const { error: updateError } = await supabase
    .from('team_invitations')
    // @ts-ignore - Supabase type inference issue
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('token', token)

  if (updateError) {
    console.error('acceptInvitation: Error updating invitation:', updateError)
    return false
  }

  return true
}

export async function declineInvitation(token: string): Promise<boolean> {
  const { error } = await supabase
    .from('team_invitations')
    // @ts-ignore - Supabase type inference issue
    .update({ status: 'declined' })
    .eq('token', token)

  if (error) {
    console.error('declineInvitation: Error declining invitation:', error)
    return false
  }

  return true
}

export async function cancelInvitation(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('team_invitations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('cancelInvitation: Error canceling invitation:', error)
    return false
  }

  return true
}

// =====================================================
// FEEDBACK/COMMENTS OPERATIONS
// =====================================================

export async function createFeedback(
  content: string,
  conversationId?: string,
  taskId?: string
): Promise<Feedback | null> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('createFeedback: User not authenticated')
    return null
  }

  if (!conversationId && !taskId) {
    console.error('createFeedback: Must provide either conversationId or taskId')
    return null
  }

  const { data, error } = await supabase
    .from('feedback')
    // @ts-ignore - Supabase type inference issue
    .insert({
      content,
      conversation_id: conversationId || null,
      task_id: taskId || null,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('createFeedback: Error creating feedback:', error)
    return null
  }

  return data as Feedback
}

export async function getConversationFeedback(conversationId: string): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getConversationFeedback: Error fetching feedback:', error)
    return []
  }

  return data || []
}

export async function getTaskFeedback(taskId: string): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getTaskFeedback: Error fetching feedback:', error)
    return []
  }

  return data || []
}

export async function updateFeedback(id: string, content: string): Promise<boolean> {
  const { error } = await supabase
    .from('feedback')
    // @ts-ignore - Supabase type inference issue
    .update({ content })
    .eq('id', id)

  if (error) {
    console.error('updateFeedback: Error updating feedback:', error)
    return false
  }

  return true
}

export async function deleteFeedback(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('feedback')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deleteFeedback: Error deleting feedback:', error)
    return false
  }

  return true
}

// =====================================================
// SHARING OPERATIONS
// =====================================================

export async function shareConversationWithTeam(
  conversationId: string,
  teamId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('conversations')
    // @ts-ignore - Supabase type inference issue
    .update({
      team_id: teamId,
      visibility: 'team'
    })
    .eq('id', conversationId)

  if (error) {
    console.error('shareConversationWithTeam: Error sharing conversation:', error)
    return false
  }

  return true
}

export async function shareTaskWithTeam(taskId: string, teamId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    // @ts-ignore - Supabase type inference issue
    .update({
      team_id: teamId,
      visibility: 'team'
    })
    .eq('id', taskId)

  if (error) {
    console.error('shareTaskWithTeam: Error sharing task:', error)
    return false
  }

  return true
}

export async function assignTask(taskId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    // @ts-ignore - Supabase type inference issue
    .update({ assigned_to: userId })
    .eq('id', taskId)

  if (error) {
    console.error('assignTask: Error assigning task:', error)
    return false
  }

  return true
}

export async function unshareConversation(conversationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('conversations')
    // @ts-ignore - Supabase type inference issue
    .update({
      team_id: null,
      visibility: 'private'
    })
    .eq('id', conversationId)

  if (error) {
    console.error('unshareConversation: Error unsharing conversation:', error)
    return false
  }

  return true
}

export async function unshareTask(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    // @ts-ignore - Supabase type inference issue
    .update({
      team_id: null,
      visibility: 'private',
      assigned_to: null
    })
    .eq('id', taskId)

  if (error) {
    console.error('unshareTask: Error unsharing task:', error)
    return false
  }

  return true
}
