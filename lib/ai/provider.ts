/**
 * Wrapper for AI provider with lazy loading
 * Uses createOpenAI to defer API key validation until runtime
 */

import { createOpenAI } from '@ai-sdk/openai'

// Create provider with explicit API key - uses placeholder during build
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-for-build',
})

export async function getOpenAIProvider() {
  return openai
}

/**
 * Check if AI features are available
 */
export function isAIEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY
}
