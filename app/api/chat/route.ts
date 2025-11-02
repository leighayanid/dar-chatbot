import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

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
  });

  return result.toTextStreamResponse();
}
