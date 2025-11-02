import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText } from "ai";
import { createMessageServer } from "@/lib/supabase";

// Note: Using Node.js runtime to access SUPABASE_SERVICE_ROLE_KEY
// Edge runtime doesn't have access to non-NEXT_PUBLIC_ environment variables

export async function POST(req: Request) {
  const { messages, conversationId } = await req.json();

  // Save user message to database
  const userMessage = messages[messages.length - 1];
  if (userMessage && conversationId) {
    const userMessageContent = userMessage.parts
      ?.map((part: { text: string }) => part.text)
      .join('') || '';

    await createMessageServer(
      conversationId,
      'user',
      userMessageContent
    );
  }

  const result = streamText({
    model: anthropic("claude-3-5-sonnet-20241022"),
    system: `You are a helpful assistant for a Daily Accomplishment Report app.

Your role is to:
- Help users reflect on their daily accomplishments
- Ask thoughtful questions to help them articulate what they achieved
- Encourage them to capture both big and small wins
- Help them identify patterns in their work
- Suggest ways to frame their accomplishments positively

Be encouraging, supportive, and help users see the value in their daily work.`,
    messages: convertToModelMessages(messages),
    async onFinish({ text }) {
      // Save assistant message to database after streaming is complete
      if (conversationId) {
        await createMessageServer(
          conversationId,
          'assistant',
          text
        );
      }
    },
  });

  return result.toTextStreamResponse();
}
