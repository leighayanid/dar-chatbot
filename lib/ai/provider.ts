/**
 * Wrapper for AI provider to handle build-time issues and missing API keys
 * Returns null if ANTHROPIC_API_KEY is not configured
 * This allows the app to work without AI features
 *
 * IMPORTANT: This module never imports @ai-sdk/anthropic directly to avoid
 * build-time module evaluation errors when the API key is not set
 */

let cachedProvider: any = null
let loadAttempted = false

export async function getAnthropicProvider() {
  // Check if API key is configured
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey || apiKey.includes('dummy') || apiKey === 'your_api_key_here' || apiKey === '') {
    if (!loadAttempted) {
      console.log('ANTHROPIC_API_KEY not configured - AI features are disabled')
      loadAttempted = true
    }
    return null
  }

  // Return cached provider if available
  if (cachedProvider) {
    return cachedProvider
  }

  try {
    // Try to dynamically import the Anthropic provider
    // This will fail if the package is not installed
    // @ts-ignore - Module may not be installed
    const anthropicModule = await import('@ai-sdk/anthropic')

    // Cache the provider
    cachedProvider = anthropicModule.anthropic
    loadAttempted = true

    console.log('Anthropic AI provider loaded successfully')
    return cachedProvider
  } catch (error) {
    if (!loadAttempted) {
      console.warn('Anthropic SDK not installed. AI features are disabled.')
      console.warn('To enable AI features, run: npm install @ai-sdk/anthropic')
    }
    loadAttempted = true
    return null
  }
}

/**
 * Check if AI features are available
 */
export function isAIEnabled(): boolean {
  const apiKey = process.env.ANTHROPIC_API_KEY
  return !!(apiKey && apiKey !== 'your_api_key_here' && apiKey !== '' && !apiKey.includes('dummy'))
}
