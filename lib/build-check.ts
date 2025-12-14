/**
 * Utility to check if we're in build mode
 * Used to prevent route execution during Next.js build
 */

export function isBuildTime(): boolean {
  // Check if we're in the build phase
  return process.env.NEXT_PHASE === 'phase-production-build' ||
         process.env.NODE_ENV === 'production' && !process.env.VERCEL
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}
