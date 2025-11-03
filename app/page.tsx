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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center">
              <Image
                src="/logo.png"
                alt="DAR Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
            </div>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">DAR</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                <SparklesIcon className="size-4" />
                Track Your Success Daily
              </div>

              <h1 className="text-5xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl lg:text-7xl">
                Your Daily
                <span className="block bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Accomplishment
                </span>
                Companion
              </h1>

              <p className="text-xl leading-relaxed text-zinc-600 dark:text-zinc-400">
                Reflect, track, and celebrate your achievements with AI-powered insights.
                Transform your daily wins into meaningful progress.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                >
                  Start Free Today
                  <svg className="size-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-xl border-2 border-zinc-300 bg-white px-8 py-4 text-lg font-semibold text-zinc-900 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                >
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
                <div>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">10K+</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">1M+</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Reports Created</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">99%</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Column - Illustration */}
            <div className="relative">
              <div className="relative rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-2xl dark:from-amber-950/20 dark:to-orange-950/20">
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
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              Everything You Need to Track Success
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Powerful features designed to help you reflect, grow, and achieve more every day.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg transition-all hover:scale-105 hover:border-rose-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-rose-700">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-400 text-white">
                <BrainIcon className="size-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                AI-Powered Insights
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Get intelligent reflections and suggestions based on your accomplishments. Let AI help you identify patterns and celebrate wins.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg transition-all hover:scale-105 hover:border-amber-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-700">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-400 text-white">
                <ChartIcon className="size-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Analytics & Metrics
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Visualize your progress with beautiful charts and metrics. Track trends, streaks, and achievements over time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg transition-all hover:scale-105 hover:border-emerald-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 text-white">
                <LightningIcon className="size-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Quick Capture
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Log your accomplishments in seconds with our intuitive chat interface. No complex forms or rigid structures.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg transition-all hover:scale-105 hover:border-orange-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-700">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                <TargetIcon className="size-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Goals & Tracking
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Set meaningful goals and track your progress. Break down big objectives into daily accomplishments.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg transition-all hover:scale-105 hover:border-lime-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-lime-700">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 to-green-400 text-white">
                <DocumentIcon className="size-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Export Reports
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Generate professional reports in multiple formats. Perfect for performance reviews and team updates.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg transition-all hover:scale-105 hover:border-cyan-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-cyan-700">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-400 text-white">
                <ShieldIcon className="size-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Private & Secure
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Your data is encrypted and secure. We respect your privacy and never share your information.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg transition-all hover:scale-105 hover:border-orange-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-700">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 text-white">
                <ClockIcon className="size-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Smart Reminders
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Never forget to log your wins. Get intelligent reminders at the perfect time based on your routine.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg transition-all hover:scale-105 hover:border-pink-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pink-700">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 text-white">
                <TrendingIcon className="size-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Growth Insights
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Discover patterns in your work. See what makes you productive and where you're making the most impact.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg transition-all hover:scale-105 hover:border-yellow-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-yellow-700">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-400 text-white">
                <SparklesIcon className="size-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Templates & Actions
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Start faster with pre-built templates. Create custom quick actions for your most common tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-gradient-to-br from-rose-400 via-orange-400 to-amber-400 p-12 shadow-2xl lg:p-16">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-white">
                  Why Track Your Accomplishments?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Boost Confidence</h3>
                      <p className="text-orange-50">
                        Seeing your progress builds self-confidence and motivation to tackle bigger challenges.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Performance Reviews</h3>
                      <p className="text-orange-50">
                        Have concrete examples ready for reviews, promotions, and career conversations.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Identify Patterns</h3>
                      <p className="text-orange-50">
                        Understand what work energizes you and where you create the most value.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                      <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Combat Imposter Syndrome</h3>
                      <p className="text-orange-50">
                        Hard evidence of your accomplishments helps silence self-doubt.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
                  <blockquote className="space-y-4">
                    <p className="text-lg italic text-white">
                      "DAR has completely changed how I approach my workday. I used to forget all my wins by the end of the week. Now I have a clear record of my progress and feel more confident in my abilities."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-gradient-to-br from-amber-300 to-yellow-300" />
                      <div>
                        <div className="font-semibold text-white">Sarah Chen</div>
                        <div className="text-sm text-orange-50">Product Manager</div>
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
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Start Tracking Your Success Today
          </h2>
          <p className="mb-8 text-xl text-zinc-600 dark:text-zinc-400">
            Join thousands of professionals who are building confidence and advancing their careers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              Get Started Free
              <svg className="size-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
            No credit card required • Free forever • 5-minute setup
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white/50 px-4 py-12 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-10 items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="DAR Logo"
                    width={40}
                    height={40}
                    className="rounded-xl"
                  />
                </div>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">DAR</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your daily accomplishment companion. Track, reflect, and grow.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">Product</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Features</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Pricing</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Security</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">Company</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">About</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Blog</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Careers</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">Legal</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Privacy</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Terms</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">Cookies</Link></li>
                <li><Link href="#" className="hover:text-orange-600 dark:hover:text-orange-400">License</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            <p>© 2025 Daily Accomplishment Report. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
