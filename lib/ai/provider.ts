/**
 * Wrapper for AI provider to handle build-time issues
 * The @ai-sdk/anthropic package throws an error during Next.js build if ANTHROPIC_API_KEY is not set
 * This wrapper provides a safe way to import the provider
 */

let cachedProvider: any = null

export async function getAnthropicProvider() {
  if (cachedProvider) {
    return cachedProvider
  }

  // Lazy load to avoid module evaluation during build
  const { anthropic } = await import('@ai-sdk/anthropic')

  // Cache the provider
  cachedProvider = anthropic

  return anthropic
}
