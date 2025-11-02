# Daily Accomplishment Report (DAR)

A modern web application for tracking and reflecting on daily accomplishments, powered by AI assistance. Built with Next.js, AI SDK, and AI Elements.

## Features

- **Chat-like Interface**: Familiar ChatGPT/Claude-style UI for easy interaction
- **AI-Powered Reflection**: Get help articulating and organizing your daily accomplishments
- **Real-time Streaming**: See AI responses as they're generated
- **Modern Design**: Built with shadcn/ui and Tailwind CSS
- **Dark Mode Support**: Comfortable viewing in any lighting condition

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **AI Integration**: Vercel AI SDK with Anthropic Claude
- **UI Components**: AI Elements (built on shadcn/ui)
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18 or later
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com/))

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Copy `.env.example` to `.env.local` and add your API key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_api_key_here
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the production application
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
dar-app/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # AI chat API endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main chat interface
├── components/
│   ├── ai-elements/           # AI Elements components
│   └── ui/                    # shadcn/ui components
├── lib/
│   └── utils.ts               # Utility functions
└── public/                    # Static assets
```

## How It Works

1. The app uses the AI SDK's `useChat` hook to manage chat state and API communication
2. Messages are sent to `/api/chat` which streams responses from Claude
3. AI Elements components provide the chat UI with proper styling and interactions
4. The AI assistant helps users reflect on their accomplishments and identify patterns

## Customization

### Changing the AI Model

Edit `app/api/chat/route.ts` and change the model:

```typescript
model: anthropic("claude-3-5-sonnet-20241022")
// or use a different provider:
// model: openai("gpt-4-turbo")
```

### Modifying the System Prompt

Edit the `system` property in `app/api/chat/route.ts` to change how the AI assistant behaves.

### Styling

The app uses Tailwind CSS. Modify styles in:
- `app/globals.css` for global styles
- Individual components for component-specific styles

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [AI Elements Documentation](https://ai-sdk.dev/elements/overview)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
