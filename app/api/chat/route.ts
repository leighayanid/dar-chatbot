import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText } from "ai";
import { createMessageServer } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Note: Using Node.js runtime to access SUPABASE_SERVICE_ROLE_KEY
// Edge runtime doesn't have access to non-NEXT_PUBLIC_ environment variables

export async function POST(req: Request) {
  // Get user from session using proper SSR client
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log('API Route: No user found in session');
    return new Response("Unauthorized", { status: 401 });
  }

  console.log('API Route: User authenticated:', user.id);

  const { messages, conversationId } = await req.json();

  console.log('API Route: Received request with conversationId:', conversationId);
  console.log('API Route: Number of messages:', messages.length);

  // Save user message to database
  const userMessage = messages[messages.length - 1];
  if (userMessage && conversationId) {
    const userMessageContent = userMessage.parts
      ?.map((part: { text: string }) => part.text)
      .join('') || '';

    console.log('API Route: Saving user message:', userMessageContent.substring(0, 50));

    const savedMessage = await createMessageServer(
      conversationId,
      'user',
      userMessageContent,
      user.id
    );

    if (savedMessage) {
      console.log('API Route: User message saved successfully:', savedMessage.id);
    } else {
      console.error('API Route: Failed to save user message');
    }
  } else {
    console.warn('API Route: Missing userMessage or conversationId');
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
        console.log('API Route: Saving assistant message:', text.substring(0, 50));

        const savedAssistantMessage = await createMessageServer(
          conversationId,
          'assistant',
          text,
          user.id
        );

        if (savedAssistantMessage) {
          console.log('API Route: Assistant message saved successfully:', savedAssistantMessage.id);
        } else {
          console.error('API Route: Failed to save assistant message');
        }
      } else {
        console.warn('API Route: No conversationId in onFinish');
      }
    },
  });

  return result.toTextStreamResponse();
}
