import { generateText } from 'ai'
import { getOpenAIProvider } from './provider'

/**
 * Generate an AI-powered summary of user accomplishments
 * Uses OpenAI to analyze and summarize the week's messages
 */
export async function generateWeeklySummary(
  userMessages: string[]
): Promise<string> {
  try {
    // If no messages, return default text
    if (!userMessages || userMessages.length === 0) {
      return "You didn't log any accomplishments this week. Start fresh next week and capture your progress daily!"
    }

    // Get OpenAI provider
    const openai = await getOpenAIProvider()

    // Combine all messages
    const allMessages = userMessages.join('\n\n')

    // Generate summary using OpenAI
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `You are analyzing a user's daily accomplishment logs from the past week.

Your task is to create a concise, encouraging 2-3 sentence summary that:
1. Identifies key themes or patterns in their accomplishments
2. Highlights notable achievements
3. Provides positive reinforcement
4. Is written in second person (addressing the user as "you")

User's accomplishments from this week:

${allMessages}

Write a brief, motivational summary (2-3 sentences max):`,
    })

    return text.trim()
  } catch (error) {
    console.error('Error generating AI summary:', error)
    // Return a fallback message if AI generation fails
    return "You've made great progress this week with your daily reflections. Keep up the excellent work tracking your accomplishments!"
  }
}

/**
 * Generate highlights from user messages using AI
 * Selects the most significant accomplishments
 */
export async function generateHighlights(
  userMessages: string[],
  maxHighlights = 5
): Promise<string[]> {
  try {
    // If no messages or very few, return them directly
    if (!userMessages || userMessages.length === 0) {
      return []
    }

    if (userMessages.length <= maxHighlights) {
      // Return all messages if we have fewer than max
      return userMessages.filter(msg => msg.length >= 20)
    }

    // Get OpenAI provider
    const openai = await getOpenAIProvider()

    // Use AI to select the most significant accomplishments
    const allMessages = userMessages
      .map((msg, i) => `${i + 1}. ${msg}`)
      .join('\n')

    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `You are selecting the top ${maxHighlights} most significant accomplishments from a user's weekly log.

Criteria for significance:
- Represents substantial progress or achievement
- Shows concrete results or impact
- Demonstrates learning or growth
- Has measurable outcomes

User's accomplishments:

${allMessages}

Select the ${maxHighlights} most significant accomplishments. Return ONLY the selected accomplishments, one per line, without numbers or extra formatting. Keep the original wording.`,
    })

    // Parse the response into an array
    const highlights = text
      .trim()
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, maxHighlights)

    return highlights
  } catch (error) {
    console.error('Error generating AI highlights:', error)
    // Fallback to simple selection
    return userMessages
      .filter(msg => msg.length >= 20)
      .slice(0, maxHighlights)
  }
}
