'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  SparklesIcon,
  ChartIcon,
  LightningIcon,
  ShieldIcon,
  ClockIcon,
  TargetIcon,
  DocumentIcon,
  BrainIcon,
  TrendingIcon,
  HeroIllustration,
} from '@/components/icons'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <span className="text-lg font-bold text-zinc-900 sm:text-xl dark:text-zinc-50">DAR</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 sm:block dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg px-3 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:rounded-xl sm:px-4 sm:text-sm bg-gradient-to-r from-rose-400 to-orange-400"
            >
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">Get Started</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-12 pt-24 sm:pb-20 sm:pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
            {/* Left Column - Text Content */}
            <div className="space-y-5 sm:space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 sm:px-4 sm:py-2 sm:text-sm dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                <SparklesIcon className="size-3 sm:size-4" />
                Track Your Success Daily
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl xl:text-7xl dark:text-zinc-50">
                Your Daily
                <span className="block bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Accomplishment
                </span>
                Companion
              </h1>

              <p className="text-base leading-relaxed text-zinc-600 sm:text-lg lg:text-xl dark:text-zinc-400">
                Reflect, track, and celebrate your achievements with AI-powered insights.
                Transform your daily wins into meaningful progress.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  href="/register"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 text-base font-semibold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl sm:px-8 sm:py-4 sm:text-lg"
                >
                  Start Free Today
                  <svg className="size-4 transition-transform group-hover:translate-x-1 sm:size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-300 bg-white px-6 py-3 text-base font-semibold text-zinc-900 transition-all hover:border-zinc-400 hover:bg-zinc-50 sm:px-8 sm:py-4 sm:text-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                >
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 border-t border-zinc-200 pt-6 sm:flex sm:gap-8 sm:pt-8 dark:border-zinc-800">
                <div className="text-center sm:text-left">
                  <div className="text-xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50">10K+</div>
                  <div className="text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">Active Users</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50">1M+</div>
                  <div className="text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">Reports Created</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50">99%</div>
                  <div className="text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Column - Illustration */}
            <div className="relative hidden sm:block">
              <div className="relative rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-2xl sm:p-8 dark:from-amber-950/20 dark:to-orange-950/20">
                <HeroIllustration />
              </div>
              {/* Floating elements */}
              <div className="absolute -right-4 -top-4 size-24 animate-pulse rounded-full bg-gradient-to-br from-rose-300 to-orange-300 opacity-20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 size-32 animate-pulse rounded-full bg-gradient-to-br from-emerald-300 to-teal-300 opacity-20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center sm:mb-16">
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 sm:mb-4 sm:text-4xl dark:text-zinc-50">
              Everything You Need to Track Success
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-zinc-600 sm:text-lg dark:text-zinc-400">
              Powerful features designed to help you reflect, grow, and achieve more every day.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-lg transition-all hover:scale-[1.02] hover:border-rose-300 hover:shadow-xl sm:rounded-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-rose-700">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-pink-400 text-white sm:mb-4 sm:size-12 sm:rounded-xl">
                <BrainIcon className="size-5 sm:size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 sm:mb-3 sm:text-xl dark:text-zinc-50">
                AI-Powered Insights
              </h3>
              <p className="text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Get intelligent reflections and suggestions based on your accomplishments. Let AI help you identify patterns and celebrate wins.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-lg transition-all hover:scale-[1.02] hover:border-amber-300 hover:shadow-xl sm:rounded-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-700">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-yellow-400 text-white sm:mb-4 sm:size-12 sm:rounded-xl">
                <ChartIcon className="size-5 sm:size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 sm:mb-3 sm:text-xl dark:text-zinc-50">
                Analytics & Metrics
              </h3>
              <p className="text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Visualize your progress with beautiful charts and metrics. Track trends, streaks, and achievements over time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-lg transition-all hover:scale-[1.02] hover:border-emerald-300 hover:shadow-xl sm:rounded-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-400 text-white sm:mb-4 sm:size-12 sm:rounded-xl">
                <LightningIcon className="size-5 sm:size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 sm:mb-3 sm:text-xl dark:text-zinc-50">
                Quick Capture
              </h3>
              <p className="text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Log your accomplishments in seconds with our intuitive chat interface. No complex forms or rigid structures.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-lg transition-all hover:scale-[1.02] hover:border-orange-300 hover:shadow-xl sm:rounded-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-700">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-amber-400 text-white sm:mb-4 sm:size-12 sm:rounded-xl">
                <TargetIcon className="size-5 sm:size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 sm:mb-3 sm:text-xl dark:text-zinc-50">
                Goals & Tracking
              </h3>
              <p className="text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Set meaningful goals and track your progress. Break down big objectives into daily accomplishments.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-lg transition-all hover:scale-[1.02] hover:border-lime-300 hover:shadow-xl sm:rounded-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-lime-700">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-lime-400 to-green-400 text-white sm:mb-4 sm:size-12 sm:rounded-xl">
                <DocumentIcon className="size-5 sm:size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 sm:mb-3 sm:text-xl dark:text-zinc-50">
                Export Reports
              </h3>
              <p className="text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Generate professional reports in multiple formats. Perfect for performance reviews and team updates.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-lg transition-all hover:scale-[1.02] hover:border-cyan-300 hover:shadow-xl sm:rounded-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-cyan-700">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-sky-400 text-white sm:mb-4 sm:size-12 sm:rounded-xl">
                <ShieldIcon className="size-5 sm:size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 sm:mb-3 sm:text-xl dark:text-zinc-50">
                Private & Secure
              </h3>
              <p className="text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Your data is encrypted and secure. We respect your privacy and never share your information.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-lg transition-all hover:scale-[1.02] hover:border-orange-300 hover:shadow-xl sm:rounded-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-700">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-rose-400 text-white sm:mb-4 sm:size-12 sm:rounded-xl">
                <ClockIcon className="size-5 sm:size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 sm:mb-3 sm:text-xl dark:text-zinc-50">
                Smart Reminders
              </h3>
              <p className="text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Never forget to log your wins. Get intelligent reminders at the perfect time based on your routine.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-lg transition-all hover:scale-[1.02] hover:border-pink-300 hover:shadow-xl sm:rounded-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pink-700">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-rose-400 text-white sm:mb-4 sm:size-12 sm:rounded-xl">
                <TrendingIcon className="size-5 sm:size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 sm:mb-3 sm:text-xl dark:text-zinc-50">
                Growth Insights
              </h3>
              <p className="text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Discover patterns in your work. See what makes you productive and where you're making the most impact.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-lg transition-all hover:scale-[1.02] hover:border-yellow-300 hover:shadow-xl sm:rounded-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-yellow-700">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-amber-400 text-white sm:mb-4 sm:size-12 sm:rounded-xl">
                <SparklesIcon className="size-5 sm:size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 sm:mb-3 sm:text-xl dark:text-zinc-50">
                Templates & Actions
              </h3>
              <p className="text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Start faster with pre-built templates. Create custom quick actions for your most common tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-gradient-to-br from-rose-400 via-orange-400 to-amber-400 p-6 shadow-2xl sm:rounded-3xl sm:p-12 lg:p-16">
            <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl font-bold text-white sm:text-4xl">
                  Why Track Your Accomplishments?
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 sm:mt-1 sm:size-6">
                      <svg className="size-3 text-white sm:size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white sm:text-base">Boost Confidence</h3>
                      <p className="text-xs text-orange-50 sm:text-sm">
                        Seeing your progress builds self-confidence and motivation to tackle bigger challenges.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 sm:mt-1 sm:size-6">
                      <svg className="size-3 text-white sm:size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white sm:text-base">Performance Reviews</h3>
                      <p className="text-xs text-orange-50 sm:text-sm">
                        Have concrete examples ready for reviews, promotions, and career conversations.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 sm:mt-1 sm:size-6">
                      <svg className="size-3 text-white sm:size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white sm:text-base">Identify Patterns</h3>
                      <p className="text-xs text-orange-50 sm:text-sm">
                        Understand what work energizes you and where you create the most value.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 sm:mt-1 sm:size-6">
                      <svg className="size-3 text-white sm:size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white sm:text-base">Combat Imposter Syndrome</h3>
                      <p className="text-xs text-orange-50 sm:text-sm">
                        Hard evidence of your accomplishments helps silence self-doubt.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-xl bg-white/10 p-5 backdrop-blur-sm sm:rounded-2xl sm:p-8">
                  <blockquote className="space-y-3 sm:space-y-4">
                    <p className="text-sm italic text-white sm:text-lg">
                      "DAR has completely changed how I approach my workday. I used to forget all my wins by the end of the week. Now I have a clear record of my progress and feel more confident in my abilities."
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="size-10 rounded-full bg-gradient-to-br from-amber-300 to-yellow-300 sm:size-12" />
                      <div>
                        <div className="text-sm font-semibold text-white sm:text-base">Sarah Chen</div>
                        <div className="text-xs text-orange-50 sm:text-sm">Product Manager</div>
                      </div>
                    </div>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-zinc-900 sm:mb-6 sm:text-4xl lg:text-5xl dark:text-zinc-50">
            Start Tracking Your Success Today
          </h2>
          <p className="mb-6 text-base text-zinc-600 sm:mb-8 sm:text-xl dark:text-zinc-400">
            Join thousands of professionals who are building confidence and advancing their careers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-6 py-3 text-base font-semibold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl sm:px-8 sm:py-4 sm:text-lg"
            >
              Get Started Free
              <svg className="size-4 transition-transform group-hover:translate-x-1 sm:size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-500 sm:mt-6 sm:text-sm dark:text-zinc-500">
            No credit card required • Free forever • 5-minute setup
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white/50 px-4 py-8 backdrop-blur-xl sm:py-12 sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <div className="flex size-8 items-center justify-center sm:size-10">
                  <Image
                    src="/logo.png"
                    alt="DAR Logo"
                    width={40}
                    height={40}
                    className="rounded-lg sm:rounded-xl"
                  />
                </div>
                <span className="text-lg font-bold text-zinc-900 sm:text-xl dark:text-zinc-50">DAR</span>
              </div>
              <p className="text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
                Your daily accomplishment companion. Track, reflect, and grow.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-900 sm:mb-4 sm:text-base dark:text-zinc-50">Product</h3>
              <ul className="space-y-1.5 text-xs text-zinc-600 sm:space-y-2 sm:text-sm dark:text-zinc-400">
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Features</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Pricing</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Security</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-900 sm:mb-4 sm:text-base dark:text-zinc-50">Company</h3>
              <ul className="space-y-1.5 text-xs text-zinc-600 sm:space-y-2 sm:text-sm dark:text-zinc-400">
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">About</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Blog</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Careers</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-900 sm:mb-4 sm:text-base dark:text-zinc-50">Legal</h3>
              <ul className="space-y-1.5 text-xs text-zinc-600 sm:space-y-2 sm:text-sm dark:text-zinc-400">
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Privacy</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Terms</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Cookies</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">License</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-600 sm:mt-12 sm:pt-8 sm:text-sm dark:border-zinc-800 dark:text-zinc-400">
            <p>© 2025 Daily Accomplishment Report. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
