'use client'

import { useState } from 'react'
import { useTeam } from '@/lib/teams/team-context'
import { UsersIcon, PlusIcon, SettingsIcon, CheckIcon, ChevronDownIcon } from 'lucide-react'

export function TeamSwitcher() {
  const { teams, currentTeam, setCurrentTeam, isLoading } = useTeam()
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="h-4 w-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Team Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750"
      >
        <UsersIcon className="h-4 w-4" />
        <span className="max-w-[120px] truncate">
          {currentTeam ? currentTeam.name : 'Personal'}
        </span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
            <div className="p-2">
              {/* Personal Workspace */}
              <button
                onClick={() => {
                  setCurrentTeam(null)
                  setIsOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  !currentTeam
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-750'
                }`}
              >
                <span className="font-medium">Personal</span>
                {!currentTeam && <CheckIcon className="h-4 w-4" />}
              </button>

              {/* Divider */}
              {teams.length > 0 && (
                <div className="my-2 border-t border-zinc-200 dark:border-zinc-700" />
              )}

              {/* Teams List */}
              <div className="space-y-1">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => {
                      setCurrentTeam(team)
                      setIsOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      currentTeam?.id === team.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300'
                        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-750'
                    }`}
                  >
                    <span className="truncate font-medium">{team.name}</span>
                    {currentTeam?.id === team.id && <CheckIcon className="h-4 w-4" />}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-2 space-y-1 border-t border-zinc-200 pt-2 dark:border-zinc-700">
                <button
                  onClick={() => {
                    setShowCreateModal(true)
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-750"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Team</span>
                </button>

                {currentTeam && (
                  <a
                    href={`/teams/${currentTeam.id}/settings`}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-750"
                    onClick={() => setIsOpen(false)}
                  >
                    <SettingsIcon className="h-4 w-4" />
                    <span>Team Settings</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <CreateTeamModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const { createTeam } = useTeam()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Team name is required')
      return
    }

    setIsCreating(true)

    try {
      const team = await createTeam(name.trim(), description.trim() || undefined)

      if (team) {
        onClose()
      } else {
        setError('Failed to create team. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Create New Team
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="team-name"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Team Name *
            </label>
            <input
              id="team-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Team"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:border-blue-400"
              disabled={isCreating}
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="team-description"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Description (optional)
            </label>
            <textarea
              id="team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this team about?"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:border-blue-400"
              disabled={isCreating}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-750"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 font-medium text-white transition-all hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:hover:from-blue-500 disabled:hover:to-indigo-500"
            >
              {isCreating ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
