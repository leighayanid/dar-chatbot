'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Logo } from '@/components/logo'
import { TeamSwitcher } from '@/components/team-switcher'
import { useAuth } from '@/lib/auth/auth-context'
import { useTheme } from '@/lib/theme/theme-context'
import {
  ChevronDownIcon,
  CheckSquareIcon,
  TrendingUpIcon,
  SparklesIcon,
  FileTextIcon,
  SettingsIcon,
  MoonIcon,
  SunIcon,
  LogOutIcon,
} from 'lucide-react'

interface AppHeaderProps {
  children?: React.ReactNode // Optional center content (e.g., view tabs, breadcrumbs)
  actions?: React.ReactNode // Optional actions (e.g., export, clear chat)
}

export function AppHeader({ children, actions }: AppHeaderProps) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-100 w-full shrink-0 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/80">
      <div className="relative flex w-full items-center justify-between px-4 py-3">
        {/* Left: Logo */}
        <Link href="/dashboard" className="flex items-center">
          <Logo size="md" />
        </Link>

        {/* Center: Optional content (tabs, breadcrumbs, etc.) */}
        {children && <div className="flex items-center">{children}</div>}

        {/* Right: Team Switcher + User Dropdown */}
        <div className="flex items-center gap-2">
          {/* Team Switcher */}
          <TeamSwitcher />

          {/* User Dropdown */}
          {user && (
            <div className="relative z-50" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="relative z-50 flex items-center gap-2 rounded-full bg-linear-to-br from-zinc-100 to-zinc-200 p-1 pr-3 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:from-zinc-800 dark:to-zinc-700 dark:text-zinc-300"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt="User avatar"
                  className="size-8 rounded-full border-2 border-white dark:border-zinc-700"
                />
                <ChevronDownIcon className={`size-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full z-9999 mt-2 w-64 rounded-2xl border border-zinc-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95">
                  {/* User Email */}
                  <div className="mb-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Signed in as</p>
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{user.email}</p>
                  </div>

                  {/* Navigation Links */}
                  <Link
                    href="/tasks"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      pathname === '/tasks'
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                        : 'text-zinc-700 hover:bg-green-50 dark:text-zinc-300 dark:hover:bg-green-950/30'
                    }`}
                  >
                    <CheckSquareIcon className="size-4 text-green-600 dark:text-green-400" />
                    <span>Tasks</span>
                  </Link>

                  <Link
                    href="/analytics"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      pathname === '/analytics'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                        : 'text-zinc-700 hover:bg-blue-50 dark:text-zinc-300 dark:hover:bg-blue-950/30'
                    }`}
                  >
                    <TrendingUpIcon className="size-4 text-blue-600 dark:text-blue-400" />
                    <span>Analytics</span>
                  </Link>

                  <Link
                    href="/templates"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      pathname === '/templates'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300'
                        : 'text-zinc-700 hover:bg-purple-50 dark:text-zinc-300 dark:hover:bg-purple-950/30'
                    }`}
                  >
                    <SparklesIcon className="size-4 text-purple-600 dark:text-purple-400" />
                    <span>Templates</span>
                  </Link>

                  <Link
                    href="/reports"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      pathname === '/reports'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
                        : 'text-zinc-700 hover:bg-amber-50 dark:text-zinc-300 dark:hover:bg-amber-950/30'
                    }`}
                  >
                    <FileTextIcon className="size-4 text-amber-600 dark:text-amber-400" />
                    <span>Reports</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      pathname === '/settings'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
                        : 'text-zinc-700 hover:bg-rose-50 dark:text-zinc-300 dark:hover:bg-rose-950/30'
                    }`}
                  >
                    <SettingsIcon className="size-4 text-rose-600 dark:text-rose-400" />
                    <span>Settings</span>
                  </Link>

                  {/* Divider */}
                  <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />

                  {/* Theme Toggle */}
                  <button
                    onClick={() => {
                      toggleTheme()
                      setDropdownOpen(false)
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {theme === 'light' ? (
                      <>
                        <MoonIcon className="size-4 text-zinc-600 dark:text-zinc-400" />
                        <span>Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <SunIcon className="size-4 text-zinc-600 dark:text-zinc-400" />
                        <span>Light Mode</span>
                      </>
                    )}
                  </button>

                  {/* Optional Actions (passed from page) */}
                  {actions}

                  {/* Divider */}
                  <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <LogOutIcon className="size-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
