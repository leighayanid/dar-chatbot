'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowLeftIcon, UserIcon, SaveIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  job_title: string | null
  company: string | null
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    avatar_url: '',
    bio: '',
    job_title: '',
    company: '',
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load user profile
  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is fine for new users
          throw error
        }

        if (data) {
          setProfile({
            full_name: data.full_name || '',
            avatar_url: data.avatar_url || '',
            bio: data.bio || '',
            job_title: data.job_title || '',
            company: data.company || '',
          })
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Failed to load profile')
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
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (existing) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('user_profiles')
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

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-4 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="mx-auto max-w-4xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <h1 className="mb-2 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-zinc-50 dark:via-zinc-300 dark:to-zinc-50">
            Account Settings
          </h1>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Manage your profile and account preferences
          </p>
        </div>

        {/* Settings Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
          {/* Profile Section */}
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 p-3">
                <UserIcon className="size-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Profile Information
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Update your personal details and information
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              {success && (
                <div className="rounded-xl bg-green-50 p-4 text-sm text-green-600 dark:bg-green-950/50 dark:text-green-400">
                  Profile updated successfully!
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Email (Read-only) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Email cannot be changed
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Full Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                />
              </div>

              {/* Job Title */}
              <div>
                <label htmlFor="job_title" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Job Title
                </label>
                <input
                  id="job_title"
                  type="text"
                  value={profile.job_title || ''}
                  onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                  placeholder="Software Engineer"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                />
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Company
                </label>
                <input
                  id="company"
                  type="text"
                  value={profile.company || ''}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  placeholder="Acme Inc."
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Enter a URL to your profile picture
                </p>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-4">
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
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
