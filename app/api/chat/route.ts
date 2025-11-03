import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText } from "ai";
import { createMessageServer } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Note: Using Node.js runtime to access SUPABASE_SERVICE_ROLE_KEY
// Edge runtime doesn't have access to non-NEXT_PUBLIC_ environment variables

export async function POST(req: Request) {
  // Get user from session
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        cookie: cookieHeader,
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

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
      userMessageContent,
      user.id
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
          text,
          user.id
        );
      }
    },
  });

  return result.toTextStreamResponse();
}
