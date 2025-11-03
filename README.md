# Daily Accomplishment Report (DAR)

A modern web application for tracking and reflecting on daily accomplishments, powered by AI assistance. Built with Next.js, Supabase, and the Vercel AI SDK.

## Features

- **AI-Powered Reflection**: Get help articulating and organizing your daily accomplishments with Claude AI
- **Real-time Streaming**: See AI responses as they're generated
- **User Authentication**: Secure sign-up and login with Supabase Auth
- **User Profiles**: Manage your personal information and account settings
- **Data Persistence**: All conversations and messages are saved to your database
- **Chat History**: Browse and navigate through your previous conversations by date
- **Export Reports**: Export your accomplishment reports as DOCX files
- **Modern Design**: Beautiful warm pastel color scheme with smooth animations
- **Dark Mode Support**: Comfortable viewing in any lighting condition
- **Responsive Layout**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 16 with App Router and Turbopack
- **Runtime**: React 19
- **AI Integration**: Vercel AI SDK 5 with Anthropic Claude
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **UI Components**: AI Elements (built on shadcn/ui and Radix UI)
- **Styling**: Tailwind CSS v4
- **TypeScript**: Full type safety with strict mode

## Getting Started

### Prerequisites

- Node.js 18 or later
- Docker (for local Supabase development)
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com/))

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

3. Start local Supabase:

```bash
supabase start
```

This will start all Supabase services locally. Copy the displayed credentials (especially `API URL`, `anon key`, and `service_role key`) to your `.env.local` file.

4. Edit `.env.local` and add your keys:

```env
# Anthropic API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Supabase Configuration (Local Development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

7. Create an account at [http://localhost:3000/register](http://localhost:3000/register)

## Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the production application
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `supabase start` - Start local Supabase instance
- `supabase stop` - Stop local Supabase instance
- `supabase status` - Check Supabase status and credentials
- `supabase db reset` - Reset database and apply migrations
- `supabase migration new [name]` - Create a new migration

## Project Structure

```
dar-app/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # AI chat API endpoint
│   ├── dashboard/
│   │   └── page.tsx          # Main chat interface
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── register/
│   │   └── page.tsx          # Registration page
│   ├── settings/
│   │   └── page.tsx          # User settings and profile
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── ai-elements/          # AI Elements components
│   ├── ui/                   # shadcn/ui components
│   └── theme-toggle.tsx      # Dark mode toggle
├── lib/
│   ├── auth/
│   │   └── auth-context.tsx  # Authentication context
│   ├── supabase/
│   │   ├── client.ts         # Client-side Supabase client
│   │   ├── server.ts         # Server-side Supabase client
│   │   ├── types.ts          # Database types
│   │   └── index.ts          # Database operations
│   └── utils.ts              # Utility functions
├── supabase/
│   ├── migrations/           # Database migration files
│   └── config.toml          # Supabase local configuration
├── proxy.ts                  # Authentication middleware
└── public/
    └── logo.png             # App logo
```

## Database Schema

### Tables

**conversations**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `title` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP, auto-updated)

**messages**
- `id` (UUID, primary key)
- `conversation_id` (UUID, foreign key to conversations)
- `user_id` (UUID, foreign key to auth.users)
- `role` (TEXT: 'user', 'assistant', or 'system')
- `content` (TEXT)
- `created_at` (TIMESTAMP)

**user_profiles**
- `id` (UUID, primary key, foreign key to auth.users)
- `full_name` (TEXT, nullable)
- `avatar_url` (TEXT, nullable)
- `bio` (TEXT, nullable)
- `job_title` (TEXT, nullable)
- `company` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP, auto-updated)

All tables have Row Level Security (RLS) enabled, ensuring users can only access their own data.

## How It Works

1. **Authentication**: Users sign up and log in through Supabase Auth
2. **Middleware Protection**: The `proxy.ts` middleware protects routes and manages session cookies
3. **Chat Interface**: The dashboard uses AI SDK's `useChat` hook to manage chat state
4. **AI Streaming**: Messages are sent to `/api/chat` which streams responses from Claude
5. **Data Persistence**: All messages and conversations are automatically saved to Supabase
6. **User Profiles**: Users can manage their profile information in the settings page

## Customization

### Changing the AI Model

Edit [app/api/chat/route.ts](app/api/chat/route.ts) and change the model:

```typescript
model: anthropic("claude-3-5-sonnet-20241022")
// or use a different provider:
// model: openai("gpt-4-turbo")
```

### Modifying the System Prompt

Edit the `system` property in [app/api/chat/route.ts](app/api/chat/route.ts) to change how the AI assistant behaves.

### Styling

The app uses a warm pastel color scheme (rose, orange, amber) with Tailwind CSS v4. Modify styles in:
- [app/globals.css](app/globals.css) for global styles
- Individual components for component-specific styles
- Color scheme uses gradients: `from-rose-400 to-orange-400`

### Database Migrations

To modify the database schema:

```bash
supabase migration new your_migration_name
# Edit the generated file in supabase/migrations/
supabase db reset  # Apply the migration locally
```

## Features to Implement

### Priority Features

- [ ] **Task/Todo Management**
  - Add daily task tracking functionality
  - Allow users to create, edit, and mark tasks as complete
  - Integrate tasks with accomplishment reports
  - AI suggestions for task breakdown and prioritization
  - Daily task summary and completion statistics

- [ ] **Enhanced Reporting**
  - Weekly and monthly accomplishment summaries
  - Progress tracking over time
  - Custom report templates
  - PDF export in addition to DOCX

- [ ] **Team Features**
  - Share accomplishments with team members
  - Team dashboards and analytics
  - Manager review and feedback
  - Team accomplishment aggregation

### Future Enhancements

- [ ] **Goal Setting**
  - Set and track long-term goals
  - Link daily accomplishments to goals
  - Goal progress visualization
  - AI-powered goal recommendations

- [ ] **Analytics Dashboard**
  - Productivity metrics and insights
  - Accomplishment trends and patterns
  - Time-based analysis
  - Custom charts and visualizations

- [ ] **Integrations**
  - Calendar integration (Google Calendar, Outlook)
  - Project management tools (Jira, Asana, Trello)
  - Slack/Teams notifications
  - Email summaries

- [ ] **Mobile App**
  - Native iOS and Android apps
  - Push notifications
  - Offline support
  - Voice input for accomplishments

- [ ] **Collaboration Features**
  - Comments and feedback on accomplishments
  - Mentorship and coaching features
  - Peer recognition system
  - Team challenges and competitions

## Accessing Supabase Studio

After running `supabase start`, you can access the Supabase Studio UI at:
- **Studio**: http://127.0.0.1:54323
- **API**: http://127.0.0.1:54321

Use the Studio to:
- View and edit table data
- Run SQL queries
- Manage authentication users
- View logs and analytics

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [AI Elements Documentation](https://ai-sdk.dev/elements/overview)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

### Prerequisites for Production

1. Create a Supabase project at [database.new](https://database.new)
2. Get your production Supabase credentials
3. Add your environment variables to Vercel

### Deployment Steps

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com/new)
3. Add environment variables:
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Troubleshooting

### Supabase Connection Issues

- Make sure Docker is running
- Run `supabase status` to check if services are running
- Check that your `.env.local` has the correct credentials from `supabase start`

### Authentication Issues

- Clear browser cookies and localStorage
- Check Supabase Studio to verify users exist
- Make sure email confirmation is disabled for local development (check `supabase/config.toml`)

### Database Issues

- Run `supabase db reset` to reset the database and reapply migrations
- Check migration files in `supabase/migrations/` for errors
- View logs in Supabase Studio

## License

MIT
