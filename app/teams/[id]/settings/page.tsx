'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { AppHeader } from '@/components/app-header'
import {
  UsersIcon,
  MailIcon,
  TrashIcon,
  SaveIcon,
  XIcon,
  CheckIcon,
  ClockIcon,
  ShieldIcon,
  CrownIcon,
  EyeIcon
} from 'lucide-react'

interface Team {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: string
  joined_at: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  token: string
  expires_at: string
  created_at: string
}

export default function TeamSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const teamId = params.id as string

  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Team info editing
  const [editedName, setEditedName] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Invitation
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [isInviting, setIsInviting] = useState(false)

  // Load team data
  useEffect(() => {
    if (!teamId || !user) return

    const loadData = async () => {
      setIsLoading(true)

      try {
        // Load team
        const teamRes = await fetch(`/api/teams/${teamId}`)
        if (teamRes.ok) {
          const teamData = await teamRes.json()
          setTeam(teamData.team)
          setEditedName(teamData.team.name)
          setEditedDescription(teamData.team.description || '')
        }

        // Load members
        const membersRes = await fetch(`/api/teams/${teamId}/members`)
        if (membersRes.ok) {
          const membersData = await membersRes.json()
          setMembers(membersData.members)

          // Find current user's role
          const currentMember = membersData.members.find(
            (m: TeamMember) => m.user_id === user.id
          )
          if (currentMember) {
            setUserRole(currentMember.role)
          }
        }

        // Load invitations (only for admins/owners)
        const invitationsRes = await fetch(`/api/teams/${teamId}/invitations`)
        if (invitationsRes.ok) {
          const invitationsData = await invitationsRes.json()
          setInvitations(invitationsData.invitations)
        }
      } catch (error) {
        console.error('Error loading team data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [teamId, user])

  const canManage = userRole === 'owner' || userRole === 'admin'
  const isOwner = userRole === 'owner'

  const handleSaveTeam = async () => {
    if (!canManage) return

    setIsSaving(true)

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editedName,
          description: editedDescription || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTeam(data.team)
        alert('Team updated successfully!')
      } else {
        alert('Failed to update team')
      }
    } catch (error) {
      console.error('Error updating team:', error)
      alert('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canManage) return

    setIsInviting(true)

    try {
      const response = await fetch(`/api/teams/${teamId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        })
      })

      if (response.ok) {
        const data = await response.json()
        setInvitations([...invitations, data.invitation])
        setInviteEmail('')
        setInviteRole('member')
        alert('Invitation sent successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('An error occurred')
    } finally {
      setIsInviting(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    if (!canManage) return

    if (!confirm('Are you sure you want to cancel this invitation?')) return

    try {
      const response = await fetch(
        `/api/teams/${teamId}/invitations?invitationId=${invitationId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setInvitations(invitations.filter(i => i.id !== invitationId))
      } else {
        alert('Failed to cancel invitation')
      }
    } catch (error) {
      console.error('Error canceling invitation:', error)
      alert('An error occurred')
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!canManage) return

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (response.ok) {
        setMembers(
          members.map(m =>
            m.user_id === userId ? { ...m, role: newRole } : m
          )
        )
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('An error occurred')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!canManage) return

    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const response = await fetch(
        `/api/teams/${teamId}/members?userId=${userId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setMembers(members.filter(m => m.user_id !== userId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      alert('An error occurred')
    }
  }

  const handleDeleteTeam = async () => {
    if (!isOwner) return

    const confirmText = `delete ${team?.name}`
    const userInput = prompt(
      `This action cannot be undone. Type "${confirmText}" to confirm:`
    )

    if (userInput !== confirmText) return

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Team deleted successfully')
        router.push('/dashboard')
      } else {
        alert('Failed to delete team')
      }
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('An error occurred')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <CrownIcon className="h-4 w-4 text-amber-500" />
      case 'admin':
        return <ShieldIcon className="h-4 w-4 text-blue-500" />
      case 'member':
        return <UsersIcon className="h-4 w-4 text-green-500" />
      case 'viewer':
        return <EyeIcon className="h-4 w-4 text-zinc-500" />
      default:
        return null
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'admin':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'member':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'viewer':
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
      default:
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-500 dark:border-zinc-700" />
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Loading team settings...
          </p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Team not found
          </h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      <AppHeader />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Team Settings
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Manage {team.name}
            </p>
          </div>
        <div className="space-y-8">
          {/* Team Information */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800">
            <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Team Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Team Name
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  disabled={!canManage}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:disabled:bg-zinc-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  disabled={!canManage}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:disabled:bg-zinc-800"
                />
              </div>

              {canManage && (
                <button
                  onClick={handleSaveTeam}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  <SaveIcon className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </section>

          {/* Team Members */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800">
            <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Team Members ({members.length})
            </h2>

            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-medium">
                      {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {member.full_name || member.email}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {canManage && member.role !== 'owner' ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.user_id, e.target.value)}
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${getRoleBadgeColor(
                          member.role
                        )}`}
                      >
                        {getRoleIcon(member.role)}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    )}

                    {canManage && member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Invite Members */}
          {canManage && (
            <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-800">
              <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Invite Members
              </h2>

              <form onSubmit={handleInvite} className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
                    required
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-900"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    <MailIcon className="h-4 w-4" />
                    {isInviting ? 'Sending...' : 'Invite'}
                  </button>
                </div>
              </form>

              {/* Pending Invitations */}
              {invitations.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Pending Invitations
                  </h3>
                  <div className="space-y-2">
                    {invitations
                      .filter((i) => i.status === 'pending')
                      .map((invitation) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
                        >
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-zinc-400" />
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                              {invitation.email}
                            </span>
                            <span
                              className={`text-xs font-medium ${getRoleBadgeColor(
                                invitation.role
                              )} rounded px-2 py-1`}
                            >
                              {invitation.role}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCancelInvitation(invitation.id)}
                            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Danger Zone */}
          {isOwner && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
              <h2 className="mb-4 text-xl font-bold text-red-900 dark:text-red-400">
                Danger Zone
              </h2>
              <p className="mb-4 text-sm text-red-700 dark:text-red-400">
                Once you delete a team, there is no going back. All team data, including members and shared content, will be permanently removed.
              </p>
              <button
                onClick={handleDeleteTeam}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4" />
                Delete Team
              </button>
            </section>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
