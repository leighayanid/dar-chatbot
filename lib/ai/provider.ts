/**
 * Wrapper for AI provider with lazy loading
 */

let cachedProvider: any = null

export async function getAnthropicProvider() {
  // Return cached provider if available
  if (cachedProvider) {
    return cachedProvider
  }

  // Dynamically import the Anthropic provider
  const { anthropic } = await import('@ai-sdk/anthropic')

  // Cache the provider
  cachedProvider = anthropic

  return anthropic
}

/**
 * Check if AI features are available
 */
export function isAIEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}
