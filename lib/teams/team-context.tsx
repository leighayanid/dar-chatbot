'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import type { Team, TeamMember } from '@/lib/supabase/teams'

interface TeamContextType {
  teams: Team[]
  currentTeam: Team | null
  currentTeamRole: string | null
  isLoading: boolean
  setCurrentTeam: (team: Team | null) => void
  refreshTeams: () => Promise<void>
  createTeam: (name: string, description?: string) => Promise<Team | null>
  updateTeam: (id: string, updates: Partial<Team>) => Promise<boolean>
  deleteTeam: (id: string) => Promise<boolean>
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [currentTeamRole, setCurrentTeamRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load teams
  const loadTeams = useCallback(async () => {
    if (!user) {
      setTeams([])
      setCurrentTeam(null)
      setCurrentTeamRole(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/teams')

      if (!response.ok) {
        // Get detailed error message from response
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to fetch teams:', response.status, errorData)

        // Don't throw error for 401 (unauthorized) - just log it
        // This can happen during initial load when auth is still being set up
        if (response.status === 401) {
          console.warn('User not authenticated yet, skipping team load')
          setTeams([])
          setIsLoading(false)
          return
        }

        throw new Error(errorData.error || 'Failed to fetch teams')
      }

      const data = await response.json()
      setTeams(data.teams || [])

      // If there's a saved current team in localStorage, restore it
      const savedTeamId = localStorage.getItem('dar-current-team')
      if (savedTeamId) {
        const savedTeam = data.teams?.find((t: Team) => t.id === savedTeamId)
        if (savedTeam) {
          setCurrentTeam(savedTeam)
        }
      }
    } catch (error) {
      console.error('Error loading teams:', error)
      // Set empty teams array on error, but don't break the app
      setTeams([])
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Load user's role in current team
  const loadCurrentTeamRole = useCallback(async () => {
    if (!currentTeam || !user) {
      setCurrentTeamRole(null)
      return
    }

    try {
      const response = await fetch(`/api/teams/${currentTeam.id}/members`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to fetch team members:', response.status, errorData)

        // Don't throw error for 401 - just log it
        if (response.status === 401) {
          console.warn('User not authenticated, skipping team role load')
          setCurrentTeamRole(null)
          return
        }

        throw new Error(errorData.error || 'Failed to fetch team members')
      }

      const data = await response.json()
      const member = data.members?.find((m: TeamMember & { email: string }) => m.user_id === user.id)

      if (member) {
        setCurrentTeamRole(member.role)
      } else {
        setCurrentTeamRole(null)
      }
    } catch (error) {
      console.error('Error loading current team role:', error)
      setCurrentTeamRole(null)
    }
  }, [currentTeam, user])

  // Load teams when user changes
  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  // Load current team role when current team changes
  useEffect(() => {
    loadCurrentTeamRole()
  }, [loadCurrentTeamRole])

  // Save current team to localStorage
  useEffect(() => {
    if (currentTeam) {
      localStorage.setItem('dar-current-team', currentTeam.id)
    } else {
      localStorage.removeItem('dar-current-team')
    }
  }, [currentTeam])

  const handleSetCurrentTeam = useCallback((team: Team | null) => {
    setCurrentTeam(team)
  }, [])

  const handleCreateTeam = useCallback(async (name: string, description?: string): Promise<Team | null> => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })

      if (!response.ok) {
        throw new Error('Failed to create team')
      }

      const data = await response.json()

      // Refresh teams list
      await loadTeams()

      return data.team
    } catch (error) {
      console.error('Error creating team:', error)
      return null
    }
  }, [loadTeams])

  const handleUpdateTeam = useCallback(async (id: string, updates: Partial<Team>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update team')
      }

      // Refresh teams list
      await loadTeams()

      return true
    } catch (error) {
      console.error('Error updating team:', error)
      return false
    }
  }, [loadTeams])

  const handleDeleteTeam = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete team')
      }

      // If deleted team was current team, clear it
      if (currentTeam?.id === id) {
        setCurrentTeam(null)
      }

      // Refresh teams list
      await loadTeams()

      return true
    } catch (error) {
      console.error('Error deleting team:', error)
      return false
    }
  }, [currentTeam, loadTeams])

  const value: TeamContextType = {
    teams,
    currentTeam,
    currentTeamRole,
    isLoading,
    setCurrentTeam: handleSetCurrentTeam,
    refreshTeams: loadTeams,
    createTeam: handleCreateTeam,
    updateTeam: handleUpdateTeam,
    deleteTeam: handleDeleteTeam
  }

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}
