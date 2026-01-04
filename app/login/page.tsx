'use client'

import { supabase } from '@/lib/supabase'
import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Ensure component is mounted only once
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Sign in response:', { data, error: signInError })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      if (data.session) {
        console.log('Session created, redirecting...')
        // Small delay to ensure cookies are set
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 500)
      } else {
        setError('No session created')
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="size-16 animate-pulse rounded-full bg-rose-400 dark:bg-rose-300" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Theme Toggle */}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="flex w-full flex-col lg:flex-row">
        {/* Left Column - Form */}
        <div className="flex w-full items-center justify-center p-5 sm:p-8 lg:w-1/2 lg:p-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-1.5 bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:mb-2 sm:text-4xl">
                Welcome Back
              </h1>
              <p className="text-sm font-medium text-zinc-600 sm:text-lg dark:text-zinc-400">
                Sign in to continue tracking your achievements
              </p>
            </div>

            {/* Auth Form */}
            <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-xl backdrop-blur-xl sm:rounded-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/80">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-12 text-zinc-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-rose-300"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="mt-4 space-y-2 text-center sm:mt-6 sm:space-y-3">
              <p className="text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  Create one here
                </Link>
              </p>
              <p className="text-[10px] text-zinc-500 sm:text-xs dark:text-zinc-400">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - SVG Design */}
        <div className="hidden w-full items-center justify-center bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 p-12 dark:from-rose-950/30 dark:via-orange-950/20 dark:to-amber-950/30 lg:flex lg:w-1/2">
          <div className="relative w-full max-w-lg">
            {/* Main Illustration */}
            <div className="relative">
              {/* Floating Elements */}
              <div className="absolute -left-8 top-12 animate-bounce">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="40" fill="url(#gradient1)" opacity="0.8"/>
                  <defs>
                    <linearGradient id="gradient1" x1="0" y1="0" x2="80" y2="80">
                      <stop offset="0%" stopColor="#fb923c" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="absolute -right-4 top-32 animate-pulse">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 0L37.5 22.5L60 30L37.5 37.5L30 60L22.5 37.5L0 30L22.5 22.5L30 0Z" fill="url(#gradient2)" opacity="0.6"/>
                  <defs>
                    <linearGradient id="gradient2" x1="0" y1="0" x2="60" y2="60">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Main SVG */}
              <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                {/* Background Shapes */}
                <circle cx="250" cy="200" r="180" fill="url(#bgGradient)" opacity="0.1"/>

                {/* Laptop */}
                <rect x="150" y="150" width="200" height="120" rx="8" fill="url(#laptopGradient)" />
                <rect x="160" y="160" width="180" height="90" rx="4" fill="#ffffff" opacity="0.9"/>

                {/* Screen Content - Dashboard */}
                <rect x="170" y="170" width="80" height="12" rx="4" fill="url(#textGradient1)" opacity="0.8"/>
                <rect x="170" y="190" width="160" height="8" rx="3" fill="#e5e7eb" opacity="0.6"/>
                <rect x="170" y="205" width="120" height="8" rx="3" fill="#e5e7eb" opacity="0.6"/>

                {/* Chart Bars */}
                <rect x="180" y="230" width="20" height="10" rx="2" fill="url(#barGradient1)" opacity="0.8"/>
                <rect x="210" y="220" width="20" height="20" rx="2" fill="url(#barGradient2)" opacity="0.8"/>
                <rect x="240" y="215" width="20" height="25" rx="2" fill="url(#barGradient3)" opacity="0.8"/>
                <rect x="270" y="225" width="20" height="15" rx="2" fill="url(#barGradient1)" opacity="0.8"/>
                <rect x="300" y="210" width="20" height="30" rx="2" fill="url(#barGradient2)" opacity="0.8"/>

                {/* Laptop Base */}
                <path d="M130 270 L370 270 L380 285 L120 285 Z" fill="url(#baseGradient)"/>

                {/* Person */}
                <circle cx="100" cy="180" r="25" fill="url(#personGradient)"/>
                <ellipse cx="100" cy="240" rx="35" ry="45" fill="url(#bodyGradient)"/>

                {/* Checkmark */}
                <circle cx="400" cy="100" r="40" fill="url(#checkBg)" opacity="0.2"/>
                <path d="M380 100 L395 115 L420 85" stroke="url(#checkGradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

                {/* Stars */}
                <path d="M80 80 L83 88 L91 88 L85 93 L87 101 L80 96 L73 101 L75 93 L69 88 L77 88 Z" fill="url(#starGradient)" opacity="0.6"/>
                <path d="M420 200 L423 208 L431 208 L425 213 L427 221 L420 216 L413 221 L415 213 L409 208 L417 208 Z" fill="url(#starGradient)" opacity="0.6"/>
                <path d="M380 320 L382 325 L387 325 L383 328 L385 333 L380 330 L375 333 L377 328 L373 325 L378 325 Z" fill="url(#starGradient)" opacity="0.4"/>

                <defs>
                  <linearGradient id="bgGradient" x1="70" y1="20" x2="430" y2="380">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="50%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>

                  <linearGradient id="laptopGradient" x1="150" y1="150" x2="350" y2="270">
                    <stop offset="0%" stopColor="#9ca3af" />
                    <stop offset="100%" stopColor="#6b7280" />
                  </linearGradient>

                  <linearGradient id="baseGradient" x1="120" y1="270" x2="380" y2="285">
                    <stop offset="0%" stopColor="#6b7280" />
                    <stop offset="100%" stopColor="#4b5563" />
                  </linearGradient>

                  <linearGradient id="personGradient" x1="75" y1="155" x2="125" y2="205">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>

                  <linearGradient id="bodyGradient" x1="65" y1="195" x2="135" y2="285">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>

                  <linearGradient id="checkBg" x1="360" y1="60" x2="440" y2="140">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>

                  <linearGradient id="checkGradient" x1="380" y1="85" x2="420" y2="115">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>

                  <linearGradient id="starGradient" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>

                  <linearGradient id="textGradient1" x1="170" y1="170" x2="250" y2="182">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>

                  <linearGradient id="barGradient1" x1="0" y1="0" x2="20" y2="40">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>

                  <linearGradient id="barGradient2" x1="0" y1="0" x2="20" y2="40">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>

                  <linearGradient id="barGradient3" x1="0" y1="0" x2="20" y2="40">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Text Content */}
            <div className="mt-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Track Your Progress
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Reflect on your daily accomplishments with AI-powered insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
