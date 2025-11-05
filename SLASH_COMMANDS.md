# Slash Commands Feature

## Overview

The Slash Commands feature provides a quick, intuitive way to insert templates and execute actions in the DAR chat interface. Simply type `/` and a beautiful menu appears with searchable commands.

## How to Use

1. **Open the command menu**: Type `/` in the chat input
2. **Search**: Continue typing to filter commands (e.g., `/wins`, `/reflection`)
3. **Navigate**: Use arrow keys (↑↓) to move through options
4. **Select**: Press `Enter` or click to select a command
5. **Close**: Press `Esc` to close without selecting

## Available Commands

### 📝 Templates

Templates are pre-formatted structures that help you organize your thoughts and log accomplishments consistently.

#### `/daily-recap` - Daily Recap
Structured template for comprehensive daily logging.
```
Today's Accomplishments:

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
-
```

#### `/wins` - Quick Wins
Fast way to log your daily victories.
```
Today's Wins:

🏆 Major Win:


✨ Small Wins:
1.
2.
3.

💪 Why this matters:
```

#### `/challenges` - Challenges Faced
Document obstacles and how you overcame them.
```
Challenges Today:

🚧 Challenge:


💡 What I tried:


✅ Solution/Progress:


📚 What I learned:
```

#### `/learnings` - Today I Learned
Capture lessons and insights.
```
Today I Learned:

📚 Main Lesson:


🔍 Context:


💭 Why this is important:


🎯 How I'll apply this:
```

#### `/gratitude` - Gratitude Entry
Express appreciation for positive moments.
```
Gratitude:

Today I'm grateful for:

1.
2.
3.

Why:
```

#### `/goals` - Set Goals
Define objectives for tomorrow or this week.
```
Goals:

🎯 Top Priority:


📋 Additional Goals:
1.
2.
3.

🚀 Why these goals matter:


⏰ Timeline:
```

#### `/reflection` - Daily Reflection
End-of-day contemplation and insights.
```
Daily Reflection:

🌟 What went well:


🤔 What could be better:


💡 Key insight:


🎯 One thing to improve tomorrow:


😊 How I'm feeling:
```

#### `/standup` - Daily Standup
Agile-style daily update (great for remote teams).
```
Daily Standup:

✅ Yesterday I completed:
-

🚀 Today I will:
-

🚧 Blockers:
-
```

#### `/mood` - Mood Check-in
Track your emotional state.
```
Mood Check-in:

Current mood:

Energy level (1-10):

What's influencing my mood:


What would help:
```

#### `/week-review` - Week in Review
Weekly retrospective and planning.
```
Week in Review:

🎯 Major Accomplishments:
1.
2.
3.

📈 Progress on Goals:


💡 Key Learnings:


🎉 Wins:


🚧 Challenges:


📅 Next Week's Focus:
```

### ⚡ Quick Actions

Actions provide instant access to common features.

#### `/stats` - View Statistics
Opens the weekly/monthly summary view showing your statistics.

#### `/settings` - Open Settings
Navigates to the settings page for preferences.

#### `/help` - Show Help
Asks the AI for tips on using DAR effectively.

## Features

### 🔍 Smart Search
- Real-time filtering as you type
- Searches command names, descriptions, and keywords
- No results message when nothing matches

### ⌨️ Keyboard Navigation
- **↑/↓**: Navigate through commands
- **Enter**: Select highlighted command
- **Esc**: Close menu

### 🎨 Beautiful Design
- Glassmorphic design with backdrop blur
- Gradient accents matching DAR's design language
- Color-coded badges (blue for templates, purple for actions)
- Smooth animations and transitions
- Dark mode support

### 🏷️ Command Categories
- **Templates**: Pre-formatted text for structured logging
- **Actions**: Quick shortcuts to app features
- **Prompts**: Guided questions (future enhancement)

## Use Cases

### Daily Journaling
Use `/daily-recap` every evening to log the day's accomplishments in a structured format.

### Quick Updates
Use `/standup` for daily team check-ins or personal progress tracking.

### Reflection Practice
Use `/reflection` at the end of the week to contemplate your progress and plan improvements.

### Goal Setting
Use `/goals` on Sunday evenings to plan the upcoming week.

### Learning Documentation
Use `/learnings` whenever you discover something new worth remembering.

### Emotional Wellness
Use `/mood` and `/gratitude` to track emotional health alongside professional accomplishments.

## Technical Implementation

### Architecture

```
lib/slash-commands.ts         # Command definitions and search logic
components/slash-command-menu.tsx   # UI component with keyboard nav
app/dashboard/page.tsx         # Integration into chat interface
```

### Adding New Commands

1. **Define the command** in `lib/slash-commands.ts`:
```typescript
{
  id: 'my-command',
  name: 'My Command',
  description: 'What this command does',
  type: 'template', // or 'action'
  icon: '🎯',
  keywords: ['search', 'terms'],
  content: 'Template content here' // for templates
}
```

2. **Handle actions** (if type is 'action') in `app/dashboard/page.tsx`:
```typescript
// In handleSlashCommandSelect function
else if (command.id === 'my-action') {
  // Execute your action
}
```

### Command Types

- **`template`**: Inserts formatted text into the input
- **`action`**: Executes a function (navigate, open modal, etc.)
- **`prompt`**: Future enhancement for guided workflows

## Best Practices

### For Users

1. **Explore the menu**: Type `/` and browse all available commands
2. **Use keywords**: Remember common keywords like "wins", "goals", "reflection"
3. **Customize templates**: After inserting, feel free to modify the template
4. **Be consistent**: Using the same templates daily helps with AI insights
5. **Mix and match**: Combine multiple templates in one entry

### For Developers

1. **Keep templates focused**: Each template should serve a specific purpose
2. **Use emojis wisely**: They add visual interest but don't overdo it
3. **Provide context**: Good descriptions help users find commands
4. **Add keywords**: Include synonyms and related terms for better search
5. **Test thoroughly**: Ensure templates work in both light and dark mode

## Future Enhancements

- [ ] Custom user-defined templates
- [ ] Template favorites/pinning
- [ ] Recent commands history
- [ ] AI-suggested templates based on context
- [ ] Template variables (auto-fill date, time, etc.)
- [ ] Template sharing across teams
- [ ] Template categories/folders
- [ ] Slash command analytics (which are most used)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Open slash command menu |
| `↑` | Move selection up |
| `↓` | Move selection down |
| `Enter` | Select command |
| `Esc` | Close menu |
| Type to search | Filter commands |

## Accessibility

- Full keyboard navigation support
- Screen reader friendly labels
- High contrast in dark mode
- Visible focus indicators
- Responsive to user preferences

## FAQ

**Q: Can I create my own templates?**
A: Currently, templates are predefined. Custom templates are planned for a future update.

**Q: Can I edit templates after insertion?**
A: Yes! Once inserted, templates are just text and can be edited freely.

**Q: Do slash commands work on mobile?**
A: Yes! The menu is fully responsive. Tap to select commands.

**Q: Can I use multiple templates in one entry?**
A: Absolutely! Insert one, fill it out, then insert another.

**Q: Why doesn't `/help` insert text?**
A: `/help` is an action command that asks the AI for guidance instead of inserting a template.

**Q: Can I share my favorite templates with teammates?**
A: Template sharing is planned for a future release.

## Contributing

To suggest new templates or report issues:
1. Consider the use case and target audience
2. Ensure it doesn't duplicate existing templates
3. Keep it concise and focused
4. Include helpful structure and prompts
5. Test with real data

---

**Pro Tip**: Combine templates with AI chat! Insert a template, fill it out, then ask the AI for insights or feedback on your accomplishments.
