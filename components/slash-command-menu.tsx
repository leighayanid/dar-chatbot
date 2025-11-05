'use client'

import { useEffect, useRef, useState } from 'react'
import { searchSlashCommands, type SlashCommand } from '@/lib/slash-commands'

interface SlashCommandMenuProps {
  query: string
  onSelect: (command: SlashCommand) => void
  onClose: () => void
  position?: { top: number; left: number }
}

export function SlashCommandMenu({
  query,
  onSelect,
  onClose,
  position,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Search commands based on query (without the leading "/")
  const searchQuery = query.startsWith('/') ? query.slice(1) : query
  const filteredCommands = searchSlashCommands(searchQuery)

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  // Scroll selected item into view
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [selectedIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredCommands, selectedIndex, onSelect, onClose])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (filteredCommands.length === 0) {
    return (
      <div
        ref={menuRef}
        className="fixed z-50 w-96 rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-800/95"
        style={{
          bottom: position?.top ? undefined : '120px',
          left: position?.left || '50%',
          transform: position?.left ? undefined : 'translateX(-50%)',
        }}
      >
        <div className="flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400">
          <span className="text-lg">🔍</span>
          <p className="text-sm">No commands found for "{searchQuery}"</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-[480px] max-h-[400px] overflow-hidden rounded-xl border border-zinc-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-800/95"
      style={{
        bottom: position?.top ? undefined : '120px',
        left: position?.left || '50%',
        transform: position?.left ? undefined : 'translateX(-50%)',
      }}
    >
      {/* Header */}
      <div className="border-b border-zinc-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 dark:border-zinc-700 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            Commands
          </h3>
          {searchQuery && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              · searching "{searchQuery}"
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Use ↑↓ to navigate, Enter to select, Esc to close
        </p>
      </div>

      {/* Command List */}
      <div className="max-h-[320px] overflow-y-auto">
        {filteredCommands.map((command, index) => (
          <button
            key={command.id}
            ref={el => {
              itemRefs.current[index] = el
            }}
            onClick={() => onSelect(command)}
            className={`w-full px-4 py-3 text-left transition-all ${
              index === selectedIndex
                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
            } ${
              index !== filteredCommands.length - 1
                ? 'border-b border-zinc-100 dark:border-zinc-700/50'
                : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xl transition-transform ${
                  index === selectedIndex
                    ? 'scale-110 bg-white shadow-md dark:bg-zinc-800'
                    : 'bg-zinc-100 dark:bg-zinc-700'
                }`}
              >
                {command.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {command.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      command.type === 'template'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : command.type === 'action'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}
                  >
                    {command.type}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                  {command.description}
                </p>
              </div>

              {/* Selected indicator */}
              {index === selectedIndex && (
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 p-1.5">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900/50">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''} available
        </p>
      </div>
    </div>
  )
}
