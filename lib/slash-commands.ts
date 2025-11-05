/**
 * Slash Command System for DAR
 * Provides quick templates and actions via "/" commands
 */

export type SlashCommandType = 'template' | 'action' | 'prompt'

export interface SlashCommand {
  id: string
  name: string
  description: string
  type: SlashCommandType
  icon: string
  content?: string // For templates
  action?: () => void // For actions
  keywords?: string[] // For search
}

export const slashCommands: SlashCommand[] = [
  // === Templates ===
  {
    id: 'daily-recap',
    name: 'Daily Recap',
    description: 'Structured template for daily accomplishments',
    type: 'template',
    icon: '📝',
    keywords: ['recap', 'daily', 'summary', 'accomplishments'],
    content: `Today's Accomplishments:

🎯 Key Achievements:
-

💡 What I Learned:
-

🚀 Progress Made:
-

📊 Metrics/Results:
-

🎉 Wins (Big & Small):
-

🤔 Challenges Faced:
-

📅 Tomorrow's Focus:
- `,
  },
  {
    id: 'quick-wins',
    name: 'Quick Wins',
    description: 'Log your wins for the day',
    type: 'template',
    icon: '🎉',
    keywords: ['wins', 'success', 'achievements', 'victory'],
    content: `Today's Wins:

🏆 Major Win:


✨ Small Wins:
1.
2.
3.

💪 Why this matters:
`,
  },
  {
    id: 'challenges',
    name: 'Challenges Faced',
    description: 'Document challenges and how you overcame them',
    type: 'template',
    icon: '🔥',
    keywords: ['challenges', 'problems', 'obstacles', 'difficulties'],
    content: `Challenges Today:

🚧 Challenge:


💡 What I tried:


✅ Solution/Progress:


📚 What I learned:
`,
  },
  {
    id: 'learnings',
    name: 'Today I Learned',
    description: 'Capture lessons and insights',
    type: 'template',
    icon: '💡',
    keywords: ['learned', 'lessons', 'insights', 'knowledge', 'til'],
    content: `Today I Learned:

📚 Main Lesson:


🔍 Context:


💭 Why this is important:


🎯 How I'll apply this:
`,
  },
  {
    id: 'gratitude',
    name: 'Gratitude Entry',
    description: 'Express gratitude for positive moments',
    type: 'template',
    icon: '🙏',
    keywords: ['gratitude', 'thankful', 'grateful', 'appreciation'],
    content: `Gratitude:

Today I'm grateful for:

1.
2.
3.

Why:
`,
  },
  {
    id: 'goals',
    name: 'Set Goals',
    description: 'Define goals for tomorrow or this week',
    type: 'template',
    icon: '🎯',
    keywords: ['goals', 'objectives', 'targets', 'plan'],
    content: `Goals:

🎯 Top Priority:


📋 Additional Goals:
1.
2.
3.

🚀 Why these goals matter:


⏰ Timeline:
`,
  },
  {
    id: 'reflection',
    name: 'Daily Reflection',
    description: 'End-of-day reflection and insights',
    type: 'template',
    icon: '🌙',
    keywords: ['reflection', 'review', 'retrospective', 'thoughts'],
    content: `Daily Reflection:

🌟 What went well:


🤔 What could be better:


💡 Key insight:


🎯 One thing to improve tomorrow:


😊 How I'm feeling:
`,
  },
  {
    id: 'standup',
    name: 'Daily Standup',
    description: 'Agile-style daily update',
    type: 'template',
    icon: '🏃',
    keywords: ['standup', 'scrum', 'update', 'status'],
    content: `Daily Standup:

✅ Yesterday I completed:
-

🚀 Today I will:
-

🚧 Blockers:
-
`,
  },
  {
    id: 'mood',
    name: 'Mood Check-in',
    description: 'Log how you\'re feeling',
    type: 'template',
    icon: '😊',
    keywords: ['mood', 'feeling', 'emotion', 'mental health'],
    content: `Mood Check-in:

Current mood:

Energy level (1-10):

What's influencing my mood:


What would help:
`,
  },
  {
    id: 'week-review',
    name: 'Week in Review',
    description: 'Weekly retrospective and planning',
    type: 'template',
    icon: '📅',
    keywords: ['week', 'weekly', 'review', 'retrospective'],
    content: `Week in Review:

🎯 Major Accomplishments:
1.
2.
3.

📈 Progress on Goals:


💡 Key Learnings:


🎉 Wins:


🚧 Challenges:


📅 Next Week's Focus:
`,
  },

  // === Quick Actions ===
  {
    id: 'stats',
    name: 'View Statistics',
    description: 'See your accomplishment stats',
    type: 'action',
    icon: '📊',
    keywords: ['stats', 'statistics', 'metrics', 'analytics'],
  },
  {
    id: 'settings',
    name: 'Open Settings',
    description: 'Configure your preferences',
    type: 'action',
    icon: '⚙️',
    keywords: ['settings', 'preferences', 'config'],
  },
  {
    id: 'help',
    name: 'Show Help',
    description: 'Get tips and guidance',
    type: 'action',
    icon: '❓',
    keywords: ['help', 'tips', 'guide', 'support'],
  },
]

/**
 * Search slash commands by query
 */
export function searchSlashCommands(query: string): SlashCommand[] {
  const searchTerm = query.toLowerCase().trim()

  if (!searchTerm) {
    return slashCommands
  }

  return slashCommands.filter(cmd => {
    // Search in name
    if (cmd.name.toLowerCase().includes(searchTerm)) {
      return true
    }

    // Search in description
    if (cmd.description.toLowerCase().includes(searchTerm)) {
      return true
    }

    // Search in keywords
    if (cmd.keywords?.some(keyword => keyword.includes(searchTerm))) {
      return true
    }

    return false
  })
}

/**
 * Get slash command by ID
 */
export function getSlashCommand(id: string): SlashCommand | undefined {
  return slashCommands.find(cmd => cmd.id === id)
}
