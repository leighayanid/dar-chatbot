/**
 * Stub file to prevent @ai-sdk/anthropic from being imported during build
 * This file re-exports the provider dynamically only when needed
 */

// DO NOT import @ai-sdk/anthropic here - it will cause build errors
// All imports must be dynamic (using import())

export { getAnthropicProvider, isAIEnabled } from './provider'
