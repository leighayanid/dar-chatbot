'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import { UserIcon, SaveIcon, Loader2Icon, BellIcon, MonitorIcon, ZoomInIcon, ZoomOutIcon, MaximizeIcon, TrashIcon, AlertTriangleIcon } from 'lucide-react'
import Link from 'next/link'
import { AppHeader } from '@/components/app-header'
import { useUISize, type UISize } from '@/contexts/ui-size-context'

interface UserProfile {
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  job_title: string | null
  company: string | null
}

interface UserPreferences {
  reminder_enabled: boolean
  reminder_time: string
  reminder_days: number[]
  email_weekly_summary: boolean
  email_monthly_summary: boolean
  timezone: string
  ui_size: UISize
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { size: uiSize, setSize: setUISize } = useUISize()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    avatar_url: '',
    bio: '',
    job_title: '',
    company: '',
  })
  const [preferences, setPreferences] = useState<UserPreferences>({
    reminder_enabled: true,
    reminder_time: '17:00',
    reminder_days: [1, 2, 3, 4, 5],
    email_weekly_summary: true,
    email_monthly_summary: true,
    timezone: 'UTC',
    ui_size: 'default',
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load user profile and preferences
  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        setLoading(true)

        // Load profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        if (profileData) {
          const data = profileData as any
          setProfile({
            full_name: data.full_name || '',
            avatar_url: data.avatar_url || '',
            bio: data.bio || '',
            job_title: data.job_title || '',
            company: data.company || '',
          })
        }

        // Load preferences
        const { data: prefsData, error: prefsError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('id', user.id)
          .single()

        if (prefsError && prefsError.code !== 'PGRST116') {
          throw prefsError
        }

        if (prefsData) {
          const prefs = prefsData as any
          const loadedPrefs = {
            reminder_enabled: prefs.reminder_enabled,
            reminder_time: prefs.reminder_time || '17:00',
            reminder_days: prefs.reminder_days || [1, 2, 3, 4, 5],
            email_weekly_summary: prefs.email_weekly_summary,
            email_monthly_summary: prefs.email_monthly_summary,
            timezone: prefs.timezone || 'UTC',
            ui_size: prefs.ui_size || 'default',
          }
          setPreferences(loadedPrefs)
          // Sync UI size with context
          setUISize(loadedPrefs.ui_size)
        }
      } catch (err) {
        console.error('Error loading settings:', err)
        setError('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadProfile()
    }
  }, [user])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          // @ts-ignore - Supabase type inference issue
          .update({
            full_name: profile.full_name || null,
            avatar_url: profile.avatar_url || null,
            bio: profile.bio || null,
            job_title: profile.job_title || null,
            company: profile.company || null,
          })
          .eq('id', user.id)

        if (updateError) throw updateError
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('user_profiles')
          // @ts-ignore - Supabase type inference issue
          .insert({
            id: user.id,
            full_name: profile.full_name || null,
            avatar_url: profile.avatar_url || null,
            bio: profile.bio || null,
            job_title: profile.job_title || null,
            company: profile.company || null,
          })

        if (insertError) throw insertError
      }

      // Update or insert preferences
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('id', user.id)
        .single()

      // Prepare preferences data
      const prefsData: any = {
        reminder_enabled: preferences.reminder_enabled,
        reminder_time: preferences.reminder_time,
        reminder_days: preferences.reminder_days,
        email_weekly_summary: preferences.email_weekly_summary,
        email_monthly_summary: preferences.email_monthly_summary,
        timezone: preferences.timezone,
      }

      // Try to include ui_size, but if it fails (column doesn't exist), continue without it
      try {
        prefsData.ui_size = preferences.ui_size
      } catch (e) {
        console.warn('ui_size column may not exist yet, skipping')
      }

      if (existingPrefs) {
        const { error: prefsUpdateError } = await supabase
          .from('user_preferences')
          // @ts-ignore - Supabase type inference issue
          .update(prefsData)
          .eq('id', user.id)

        if (prefsUpdateError) {
          // If error is about ui_size column, retry without it
          if (prefsUpdateError.message?.includes('ui_size') || prefsUpdateError.code === '42703') {
            console.warn('ui_size column not found, saving without it')
            delete prefsData.ui_size
            const { error: retryError } = await supabase
              .from('user_preferences')
              // @ts-ignore - Supabase type inference issue
              .update(prefsData)
              .eq('id', user.id)

            if (retryError) throw retryError
          } else {
            throw prefsUpdateError
          }
        }
      } else {
        const { error: prefsInsertError } = await supabase
          .from('user_preferences')
          // @ts-ignore - Supabase type inference issue
          .insert({
            id: user.id,
            ...prefsData,
          })

        if (prefsInsertError) {
          // If error is about ui_size column, retry without it
          if (prefsInsertError.message?.includes('ui_size') || prefsInsertError.code === '42703') {
            console.warn('ui_size column not found, saving without it')
            delete prefsData.ui_size
            const { error: retryError } = await supabase
              .from('user_preferences')
              // @ts-ignore - Supabase type inference issue
              .insert({
                id: user.id,
                ...prefsData,
              })

            if (retryError) throw retryError
          } else {
            throw prefsInsertError
          }
        }
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error saving settings:', err)
      const errorMessage = err?.message || err?.error_description || 'Failed to save settings. Please try again.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user) return

    setDeleteLoading(true)
    setError(null)

    try {
      // Delete user data from Supabase (cascade will handle related data)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

      if (deleteError) {
        // If admin delete fails, try regular user deletion
        const { error: userDeleteError } = await supabase.rpc('delete_user')
        if (userDeleteError) throw userDeleteError
      }

      // Sign out and redirect to home
      await supabase.auth.signOut()
      router.push('/')
    } catch (err: any) {
      console.error('Error deleting account:', err)
      setError(err?.message || 'Failed to delete account. Please try again.')
      setShowDeleteConfirm(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Show loading screen while checking authentication
  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <div className="mb-6 inline-flex rounded-3xl bg-gradient-to-br from-rose-100 to-orange-100 p-6 shadow-lg dark:from-rose-950/50 dark:to-orange-950/50">
            <div className="size-16 animate-pulse rounded-full bg-rose-400 dark:bg-rose-300" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Loading...
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Please wait
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <AppHeader />

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-zinc-50 dark:via-zinc-300 dark:to-zinc-50">
              Settings
            </h1>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Manage your profile and account preferences
            </p>
          </div>

        {/* Layout with Sidebar */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-56 shrink-0">
            <nav className="sticky top-8 space-y-1 rounded-xl border border-zinc-200 bg-white/80 p-2 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
              <button
                onClick={() => setActiveSection('profile')}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${
                  activeSection === 'profile'
                    ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <UserIcon className="size-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveSection('appearance')}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${
                  activeSection === 'appearance'
                    ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <MonitorIcon className="size-4" />
                Appearance
              </button>
              <button
                onClick={() => setActiveSection('notifications')}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${
                  activeSection === 'notifications'
                    ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <BellIcon className="size-4" />
                Notifications
              </button>
              <button
                onClick={() => setActiveSection('account')}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${
                  activeSection === 'account'
                    ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <AlertTriangleIcon className="size-4" />
                Account
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950/50 dark:text-green-400">
                Settings updated successfully!
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded-lg bg-gradient-to-br from-rose-400 to-orange-400 p-2">
                      <UserIcon className="size-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                        Profile Information
                      </h2>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Update your personal details and information
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">

              {/* Email (Read-only) */}
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Email cannot be changed
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Full Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                />
              </div>

              {/* Job Title */}
              <div>
                <label htmlFor="job_title" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Job Title
                </label>
                <input
                  id="job_title"
                  type="text"
                  value={profile.job_title || ''}
                  onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                  placeholder="Software Engineer"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                />
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Company
                </label>
                <input
                  id="company"
                  type="text"
                  value={profile.company || ''}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  placeholder="Acme Inc."
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label htmlFor="avatar_url" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Avatar URL
                </label>
                <input
                  id="avatar_url"
                  type="url"
                  value={profile.avatar_url || ''}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Enter a URL to your profile picture
                </p>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                />
              </div>
                  </div>
                </div>
              )}

              {/* Appearance Section */}
              {activeSection === 'appearance' && (
                <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 p-2">
                    <MonitorIcon className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      UI Appearance
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Customize the interface size and density
                    </p>
                  </div>
                </div>

                {/* UI Size Selector */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Interface Size
                  </label>
                  <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
                    Choose how compact or spacious you want the interface
                  </p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {/* Compact */}
                    <button
                      type="button"
                      onClick={() => {
                        setPreferences({ ...preferences, ui_size: 'compact' })
                        setUISize('compact')
                      }}
                      className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                        preferences.ui_size === 'compact'
                          ? 'border-purple-400 bg-purple-50 dark:border-purple-500 dark:bg-purple-950/30'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
                      }`}
                    >
                      {preferences.ui_size === 'compact' && (
                        <div className="absolute right-2 top-2">
                          <div className="rounded-full bg-purple-400 p-1">
                            <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="mb-2 flex items-center gap-2">
                        <ZoomOutIcon className={`size-5 ${
                          preferences.ui_size === 'compact' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-600 dark:text-zinc-400'
                        }`} />
                        <span className={`font-semibold ${
                          preferences.ui_size === 'compact' ? 'text-purple-900 dark:text-purple-200' : 'text-zinc-900 dark:text-zinc-100'
                        }`}>
                          Compact
                        </span>
                      </div>
                      <p className={`text-xs ${
                        preferences.ui_size === 'compact' ? 'text-purple-700 dark:text-purple-300' : 'text-zinc-600 dark:text-zinc-400'
                      }`}>
                        More content, less spacing. Best for small screens and power users.
                      </p>
                    </button>

                    {/* Default */}
                    <button
                      type="button"
                      onClick={() => {
                        setPreferences({ ...preferences, ui_size: 'default' })
                        setUISize('default')
                      }}
                      className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                        preferences.ui_size === 'default'
                          ? 'border-purple-400 bg-purple-50 dark:border-purple-500 dark:bg-purple-950/30'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
                      }`}
                    >
                      {preferences.ui_size === 'default' && (
                        <div className="absolute right-2 top-2">
                          <div className="rounded-full bg-purple-400 p-1">
                            <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="mb-2 flex items-center gap-2">
                        <MaximizeIcon className={`size-5 ${
                          preferences.ui_size === 'default' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-600 dark:text-zinc-400'
                        }`} />
                        <span className={`font-semibold ${
                          preferences.ui_size === 'default' ? 'text-purple-900 dark:text-purple-200' : 'text-zinc-900 dark:text-zinc-100'
                        }`}>
                          Default
                        </span>
                      </div>
                      <p className={`text-xs ${
                        preferences.ui_size === 'default' ? 'text-purple-700 dark:text-purple-300' : 'text-zinc-600 dark:text-zinc-400'
                      }`}>
                        Balanced experience. Comfortable for most users and screen sizes.
                      </p>
                    </button>

                    {/* Comfortable */}
                    <button
                      type="button"
                      onClick={() => {
                        setPreferences({ ...preferences, ui_size: 'comfortable' })
                        setUISize('comfortable')
                      }}
                      className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                        preferences.ui_size === 'comfortable'
                          ? 'border-purple-400 bg-purple-50 dark:border-purple-500 dark:bg-purple-950/30'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
                      }`}
                    >
                      {preferences.ui_size === 'comfortable' && (
                        <div className="absolute right-2 top-2">
                          <div className="rounded-full bg-purple-400 p-1">
                            <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="mb-2 flex items-center gap-2">
                        <ZoomInIcon className={`size-5 ${
                          preferences.ui_size === 'comfortable' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-600 dark:text-zinc-400'
                        }`} />
                        <span className={`font-semibold ${
                          preferences.ui_size === 'comfortable' ? 'text-purple-900 dark:text-purple-200' : 'text-zinc-900 dark:text-zinc-100'
                        }`}>
                          Comfortable
                        </span>
                      </div>
                      <p className={`text-xs ${
                        preferences.ui_size === 'comfortable' ? 'text-purple-700 dark:text-purple-300' : 'text-zinc-600 dark:text-zinc-400'
                      }`}>
                        Larger text, generous spacing. Better accessibility and readability.
                      </p>
                    </button>
                  </div>
                </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 p-2">
                    <BellIcon className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      Notifications & Reminders
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Configure when and how you want to be reminded
                    </p>
                  </div>
                </div>

                {/* Daily Reminders */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Daily Reminders
                      </label>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Get reminded to log your daily accomplishments
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={preferences.reminder_enabled}
                        onChange={(e) => setPreferences({ ...preferences, reminder_enabled: e.target.checked })}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-300 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-gradient-to-r peer-checked:from-rose-400 peer-checked:to-orange-400 peer-checked:after:translate-x-5 dark:bg-zinc-700"></div>
                    </label>
                  </div>

                  {preferences.reminder_enabled && (
                    <>
                      {/* Reminder Time */}
                      <div>
                        <label htmlFor="reminder_time" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Reminder Time
                        </label>
                        <input
                          id="reminder_time"
                          type="time"
                          value={preferences.reminder_time}
                          onChange={(e) => setPreferences({ ...preferences, reminder_time: e.target.value })}
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                        />
                      </div>

                      {/* Reminder Days */}
                      <div>
                        <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Remind me on
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 0, label: 'Sun' },
                            { value: 1, label: 'Mon' },
                            { value: 2, label: 'Tue' },
                            { value: 3, label: 'Wed' },
                            { value: 4, label: 'Thu' },
                            { value: 5, label: 'Fri' },
                            { value: 6, label: 'Sat' },
                          ].map((day) => (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => {
                                const days = preferences.reminder_days.includes(day.value)
                                  ? preferences.reminder_days.filter(d => d !== day.value)
                                  : [...preferences.reminder_days, day.value].sort()
                                setPreferences({ ...preferences, reminder_days: days })
                              }}
                              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                preferences.reminder_days.includes(day.value)
                                  ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg'
                                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                              }`}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email Summaries */}
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Weekly Email Summary
                        </label>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Receive a summary of your week every Sunday
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={preferences.email_weekly_summary}
                          onChange={(e) => setPreferences({ ...preferences, email_weekly_summary: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-zinc-300 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-gradient-to-r peer-checked:from-rose-400 peer-checked:to-orange-400 peer-checked:after:translate-x-5 dark:bg-zinc-700"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Monthly Email Summary
                        </label>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Receive a summary of your month on the 1st
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={preferences.email_monthly_summary}
                          onChange={(e) => setPreferences({ ...preferences, email_monthly_summary: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-zinc-300 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-gradient-to-r peer-checked:from-rose-400 peer-checked:to-orange-400 peer-checked:after:translate-x-5 dark:bg-zinc-700"></div>
                      </label>
                    </div>
                  </div>
                </div>
                </div>
              )}

              {/* Account Section */}
              {activeSection === 'account' && (
                <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded-lg bg-gradient-to-br from-red-400 to-rose-400 p-2">
                      <AlertTriangleIcon className="size-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                        Account Management
                      </h2>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Manage dangerous account actions
                      </p>
                    </div>
                  </div>

                  {/* Delete Account Section */}
                  <div className="space-y-4">
                    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                      <div className="mb-4 flex items-start gap-3">
                        <TrashIcon className="size-6 text-red-600 dark:text-red-400" />
                        <div>
                          <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
                            Delete Account
                          </h3>
                          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                        </div>
                      </div>

                      {!showDeleteConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-red-700 active:scale-95 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                          <TrashIcon className="size-5" />
                          Delete Account
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-lg bg-red-100 p-4 dark:bg-red-900/50">
                            <p className="font-semibold text-red-900 dark:text-red-100">
                              Are you absolutely sure?
                            </p>
                            <p className="mt-2 text-sm text-red-800 dark:text-red-200">
                              This will permanently delete:
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-800 dark:text-red-200">
                              <li>Your profile and account information</li>
                              <li>All your messages and conversations</li>
                              <li>Your preferences and settings</li>
                              <li>Any reports or data you've created</li>
                            </ul>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(false)}
                              className="flex-1 rounded-xl bg-zinc-200 px-6 py-3 font-semibold text-zinc-700 transition-all hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleDeleteAccount}
                              disabled={deleteLoading}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                            >
                              {deleteLoading ? (
                                <>
                                  <Loader2Icon className="size-5 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <TrashIcon className="size-5" />
                                  Yes, Delete My Account
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button - Show for Profile, Appearance, and Notifications */}
              {activeSection !== 'account' && (
              <div className="flex justify-end gap-3 pt-6">
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-zinc-100 px-6 py-3 font-semibold text-zinc-700 transition-all hover:scale-105 hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {saving ? (
                    <>
                      <Loader2Icon className="size-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="size-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
              )}
            </form>
          </main>
        </div>
      </div>
    </div>
    </div>
  )
}
