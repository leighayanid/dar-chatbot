# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Daily Accomplishment Report (DAR) is a Next.js application that provides a chat-like interface for users to log and reflect on their daily accomplishments with AI assistance. The app uses Vercel AI SDK for streaming AI responses and AI Elements for the UI components.

## Development Commands

### Running the Application
```bash
npm run dev        # Start development server with Turbopack (http://localhost:3000)
npm run build      # Build for production
npm start          # Run production build
npm run lint       # Run ESLint
```

### Component Installation
```bash
npx shadcn@latest add [component]      # Add shadcn/ui components
npx ai-elements@latest                 # Install/update AI Elements
```

### Supabase (Database)
```bash
supabase start                         # Start local Supabase (Docker required)
supabase stop                          # Stop local Supabase
supabase status                        # Check status and get credentials
supabase db reset                      # Reset database and apply migrations
supabase migration new [name]          # Create new migration file
supabase db push                       # Push migrations to remote (after supabase link)
supabase link                          # Link to remote Supabase project
```

**Important:** Local Supabase requires Docker. After running `supabase start`, copy the displayed credentials to `.env.local`.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router with Turbopack)
- **Runtime**: React 19
- **AI Integration**: Vercel AI SDK 5 with streaming support
- **Database**: Supabase (PostgreSQL) with local development support
- **UI Library**: AI Elements (built on shadcn/ui and Radix UI)
- **Styling**: Tailwind CSS v4
- **TypeScript**: Strict mode enabled

### Key Directories
- `app/` - Next.js App Router pages and layouts
  - `api/chat/route.ts` - AI chat streaming endpoint using AI SDK's `streamText`
  - `page.tsx` - Main chat interface (client component)
- `components/ai-elements/` - Pre-built AI chat components (Conversation, Message, PromptInput, etc.)
- `components/ui/` - Base shadcn/ui components
- `lib/` - Shared utilities and configurations
  - `utils.ts` - Shared utilities (cn helper, etc.)
  - `supabase/` - Supabase client configurations and types
    - `client.ts` - Client-side Supabase client
    - `server.ts` - Server-side Supabase client (with service role)
    - `types.ts` - TypeScript types for database schema
- `supabase/` - Supabase configuration and migrations
  - `migrations/` - Database migration files
  - `config.toml` - Supabase local configuration

### AI Integration Pattern

The app uses AI SDK 5's unified provider abstraction:

1. **Client Side** (`app/page.tsx`):
   - Uses `useChat` hook from `@ai-sdk/react`
   - Manages message state and streaming status
   - Input state is managed separately (not by useChat in v5)
   - Messages use parts-based structure: `message.parts[].text`
   - Send messages with: `sendMessage({ text: "message" })`

2. **Server Side** (`app/api/chat/route.ts`):
   - Uses `streamText` from `ai` package
   - Configured with Anthropic provider: `anthropic("claude-3-5-sonnet-20241022")`
   - Returns streaming responses via `toTextStreamResponse()`
   - Includes system prompt for accomplishment tracking context

### UI Component Architecture

The app features a custom-designed chat interface with:
- **Custom Message Bubbles**:
  - User messages: Blue-to-indigo gradient with white text, right-aligned
  - AI messages: White background (dark mode: zinc-800), left-aligned
  - Avatar glow effects on hover (gradient halos)
  - Smooth shadow transitions
  - 75% max-width for readability
- **Enhanced Input Area**:
  - Gradient border container (zinc gradient)
  - Glassmorphic background
  - Blue-to-indigo gradient submit button with hover effects
  - Scale animations on interaction
- **Modern Date Headers**:
  - Sticky positioning with gradient pill design
  - Blue-indigo-purple gradient
  - Backdrop blur for depth
- **Sidebar**:
  - Glassmorphic design with backdrop-blur
  - Interactive date buttons with hover states and scale effects
  - Gradient accent on History header
  - Badge-style message counts

### Database Schema

The app uses Supabase (PostgreSQL) for data persistence:

**Tables:**
- **conversations**: Stores chat conversation sessions
  - `id` (UUID, primary key)
  - `title` (TEXT, nullable)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP, auto-updated via trigger)

- **messages**: Stores individual chat messages
  - `id` (UUID, primary key)
  - `conversation_id` (UUID, foreign key to conversations)
  - `role` (TEXT: 'user', 'assistant', or 'system')
  - `content` (TEXT)
  - `created_at` (TIMESTAMP)

**Features:**
- Row Level Security (RLS) enabled on all tables
- Indexes on `conversation_id` and `created_at` for performance
- Cascade delete: deleting a conversation removes all its messages
- TypeScript types auto-generated in `lib/supabase/types.ts`

## Environment Variables

Copy `.env.example` to `.env.local` and add your API key:

```bash
cp .env.example .env.local
```

Required in `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...                        # Required for Claude AI

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321     # Local: auto-generated by supabase start
NEXT_PUBLIC_SUPABASE_ANON_KEY=...                   # Local: auto-generated by supabase start
SUPABASE_SERVICE_ROLE_KEY=...                       # Local: auto-generated by supabase start
```

The app is configured to use Anthropic's Claude, but can be switched to other providers (OpenAI, Google, etc.) by changing the model in [app/api/chat/route.ts](app/api/chat/route.ts).

## Code Style & Patterns

### Component Patterns
- Use `"use client"` directive for client components (required for AI SDK hooks)
- AI Elements components are client-side only
- API routes use Edge Runtime for optimal streaming performance

### Styling
- Tailwind CSS v4 with modern design system
- Dark mode support via `dark:` variants
- **Design Language**:
  - Gradient backgrounds (subtle multi-color gradients)
  - Glassmorphism effects (backdrop-blur with semi-transparent backgrounds)
  - Smooth animations and transitions (hover effects, scale transforms)
  - Modern shadows (layered, colored shadows on interactive elements)
  - Rounded corners (xl to 3xl for different components)
  - Blue-to-indigo gradient for primary actions
  - Color palette: Blue/Indigo for primary, Red for destructive, Zinc for neutral

### Type Safety
- Full TypeScript with strict mode
- AI SDK provides types for messages, chat state, etc.
- AI Elements components are fully typed

## Common Tasks

### Adding New AI Capabilities
Edit `app/api/chat/route.ts`:
- Modify `system` prompt to change AI behavior
- Change `model` to use different AI models
- Add tools/functions for structured outputs

### Modifying the Chat UI
Edit `app/page.tsx`:
- Conversation layout and styling
- Message rendering and variants
- Input field configuration

### Adding New Components
```bash
npx shadcn@latest add [component-name]    # Add base UI component
# AI Elements are already installed, import from @/components/ai-elements/
```

### Working with the Database

**Client-side usage:**
```typescript
import { supabase } from '@/lib/supabase'

// Query messages
const { data, error } = await supabase
  .from('messages')
  .select('*')
  .order('created_at', { ascending: false })
```

**Server-side usage (API routes):**
```typescript
import { supabaseServer } from '@/lib/supabase'

// Insert a message (bypasses RLS with service role)
const { data, error } = await supabaseServer
  .from('messages')
  .insert({
    conversation_id: 'uuid',
    role: 'user',
    content: 'Hello world'
  })
```

**Creating migrations:**
```bash
supabase migration new add_new_table
# Edit the generated file in supabase/migrations/
supabase db reset  # Apply the migration locally
```

**Accessing Supabase Studio:**
- After running `supabase start`, access the Studio UI at http://127.0.0.1:54323
- View tables, run queries, and manage your database visually

## Important Notes

- **AI SDK 5**: This app uses AI SDK 5.x with the updated API
  - `useChat` imported from `@ai-sdk/react` (not `ai/react`)
  - Messages use parts-based structure instead of simple content strings
  - `sendMessage({ text: "..." })` instead of append/handleSubmit
  - Streaming responses use `toTextStreamResponse()` instead of `toDataStreamResponse()`
- **AI Elements Compatibility**: Some AI Elements components (confirmation.tsx, tool.tsx) had type incompatibilities with AI SDK 5 and were patched with flexible types
- The chat API uses Edge Runtime for optimal streaming - avoid Node.js-only APIs in route handlers
- **Message Persistence**: Messages are automatically saved to localStorage and restored on page load
  - Storage key: `dar-chat-messages`
  - Clear chat button removes all messages and localStorage data
- **Message Timestamps**: Each message displays a timestamp in 12-hour format
- **Date Grouping**: Messages are grouped by date with sticky headers (Today, Yesterday, or full date)
- **Sidebar Navigation**:
  - Displays list of all dates with message counts
  - Click to scroll to specific date
  - Responsive with toggle button on mobile (hamburger menu)
  - Auto-opens on desktop (≥1024px), hidden by default on mobile
  - Overlay backdrop on mobile for better UX
- **Theme Toggle**:
  - Light/Dark mode toggle button in header with moon/sun icons
  - Persists preference in localStorage (`dar-theme` key)
  - Respects system preference on first load
  - Smooth transitions between themes
  - All components fully support both themes
- The app uses Tailwind CSS v4 (PostCSS config in `postcss.config.mjs`)
- **Message Conversion**: API route uses `convertToModelMessages()` to convert UI messages to model messages for AI SDK compatibility
