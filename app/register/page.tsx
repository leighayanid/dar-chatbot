'use client'

import { supabase } from '@/lib/supabase'
import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Ensure component is mounted only once
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    // Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (data.session) {
        // User is signed in immediately (email confirmation disabled)
        window.location.href = '/dashboard'
      } else {
        // Email confirmation required
        setSuccess(true)
        setLoading(false)
      }
    } catch (err) {
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
        {/* Right Column - SVG Design (shows first on mobile) */}
        <div className="order-1 hidden w-full items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 p-12 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-teal-950/30 lg:flex lg:w-1/2 lg:order-2">
          <div className="relative w-full max-w-lg">
            {/* Main Illustration */}
            <div className="relative">
              {/* Floating Elements */}
              <div className="absolute -right-8 top-12 animate-bounce" style={{animationDelay: '0.2s'}}>
                <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="35" cy="35" r="35" fill="url(#regGradient1)" opacity="0.7"/>
                  <defs>
                    <linearGradient id="regGradient1" x1="0" y1="0" x2="70" y2="70">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="absolute -left-4 top-32 animate-pulse" style={{animationDelay: '0.5s'}}>
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="25" cy="25" r="25" fill="url(#regGradient2)" opacity="0.6"/>
                  <defs>
                    <linearGradient id="regGradient2" x1="0" y1="0" x2="50" y2="50">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Main SVG */}
              <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                {/* Trophy */}
                <ellipse cx="250" cy="300" rx="80" ry="15" fill="#d1d5db" opacity="0.3"/>

                {/* Trophy Base */}
                <rect x="230" y="280" width="40" height="20" rx="4" fill="url(#trophyBaseGradient)"/>
                <rect x="220" y="270" width="60" height="15" rx="6" fill="url(#trophyPlatformGradient)"/>

                {/* Trophy Cup */}
                <path d="M200 200 L205 270 L295 270 L300 200 Z" fill="url(#trophyCupGradient)"/>
                <ellipse cx="250" cy="200" rx="50" ry="10" fill="url(#trophyTopGradient)"/>

                {/* Trophy Handles */}
                <path d="M195 220 Q170 220 170 240 Q170 255 185 255 L195 250 Z" fill="url(#handleGradient)" opacity="0.8"/>
                <path d="M305 220 Q330 220 330 240 Q330 255 315 255 L305 250 Z" fill="url(#handleGradient)" opacity="0.8"/>

                {/* Person Celebrating */}
                <circle cx="120" cy="150" r="30" fill="url(#personHeadGradient)"/>
                <ellipse cx="120" cy="220" rx="40" ry="55" fill="url(#personBodyGradient)"/>

                {/* Arms Up */}
                <ellipse cx="85" cy="190" rx="12" ry="35" fill="url(#armGradient)" transform="rotate(-30 85 190)"/>
                <ellipse cx="155" cy="190" rx="12" ry="35" fill="url(#armGradient)" transform="rotate(30 155 190)"/>

                {/* Confetti */}
                <rect x="100" y="80" width="8" height="12" rx="2" fill="#10b981" opacity="0.8" transform="rotate(25 104 86)"/>
                <rect x="140" y="70" width="6" height="10" rx="2" fill="#f59e0b" opacity="0.8" transform="rotate(-15 143 75)"/>
                <rect x="180" y="90" width="8" height="12" rx="2" fill="#14b8a6" opacity="0.8" transform="rotate(40 184 96)"/>
                <rect x="350" y="120" width="8" height="12" rx="2" fill="#f97316" opacity="0.8" transform="rotate(-25 354 126)"/>
                <rect x="400" y="140" width="6" height="10" rx="2" fill="#10b981" opacity="0.8" transform="rotate(20 403 145)"/>
                <rect x="380" y="90" width="8" height="12" rx="2" fill="#14b8a6" opacity="0.8" transform="rotate(-35 384 96)"/>

                {/* Stars/Sparkles */}
                <path d="M370 180 L374 192 L386 192 L376 199 L380 211 L370 204 L360 211 L364 199 L354 192 L366 192 Z" fill="url(#sparkleGradient1)" opacity="0.7"/>
                <path d="M420 240 L422 246 L428 246 L423 250 L425 256 L420 252 L415 256 L417 250 L412 246 L418 246 Z" fill="url(#sparkleGradient2)" opacity="0.7"/>
                <path d="M150 320 L152 324 L156 324 L153 327 L155 331 L150 328 L145 331 L147 327 L144 324 L148 324 Z" fill="url(#sparkleGradient1)" opacity="0.5"/>
                <path d="M80 280 L82 284 L86 284 L83 287 L85 291 L80 288 L75 291 L77 287 L74 284 L78 284 Z" fill="url(#sparkleGradient2)" opacity="0.5"/>

                {/* Checkmarks */}
                <circle cx="380" cy="200" r="25" fill="url(#checkBgGradient)" opacity="0.2"/>
                <path d="M370 200 L377 207 L395 185" stroke="url(#checkStrokeGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

                <defs>
                  <linearGradient id="trophyBaseGradient" x1="230" y1="280" x2="270" y2="300">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>

                  <linearGradient id="trophyPlatformGradient" x1="220" y1="270" x2="280" y2="285">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>

                  <linearGradient id="trophyCupGradient" x1="200" y1="200" x2="300" y2="270">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>

                  <linearGradient id="trophyTopGradient" x1="200" y1="190" x2="300" y2="210">
                    <stop offset="0%" stopColor="#fcd34d" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>

                  <linearGradient id="handleGradient" x1="170" y1="220" x2="195" y2="255">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>

                  <linearGradient id="personHeadGradient" x1="90" y1="120" x2="150" y2="180">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>

                  <linearGradient id="personBodyGradient" x1="80" y1="165" x2="160" y2="275">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>

                  <linearGradient id="armGradient" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>

                  <linearGradient id="sparkleGradient1" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>

                  <linearGradient id="sparkleGradient2" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>

                  <linearGradient id="checkBgGradient" x1="355" y1="175" x2="405" y2="225">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>

                  <linearGradient id="checkStrokeGradient" x1="370" y1="185" x2="395" y2="207">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Text Content */}
            <div className="mt-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Start Your Journey
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Join thousands celebrating their daily wins
              </p>
            </div>
          </div>
        </div>

        {/* Left Column - Form */}
        <div className="order-2 flex w-full items-center justify-center p-8 lg:w-1/2 lg:order-1 lg:p-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                Create Account
              </h1>
              <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
                Start tracking your daily accomplishments today
              </p>
            </div>

            {/* Auth Form */}
            <div className="rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
              {success ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-green-50 p-4 text-sm text-green-600 dark:bg-green-950/50 dark:text-green-400">
                    Account created successfully! Please check your email to confirm your account.
                  </div>
                  <Link
                    href="/login"
                    className="block w-full rounded-xl bg-gradient-to-r from-green-400 to-emerald-400 px-4 py-3 text-center font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                  >
                    Go to Login
                  </Link>
                </div>
              ) : (
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
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 transition-colors focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-green-300"
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
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-12 text-zinc-900 transition-colors focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-green-300"
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
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Must be at least 6 characters
                    </p>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-12 text-zinc-900 transition-colors focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-green-300"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-green-400 to-emerald-400 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 space-y-3 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Sign in here
                </Link>
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
