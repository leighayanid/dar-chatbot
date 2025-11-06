# UI Size Settings - Implementation Plan

## Overview

Add customizable UI size settings to make the interface adaptable to different user preferences. Users can choose between **Compact**, **Default**, and **Comfortable** sizes.

## Design Goals

1. **Reduce Bulkiness**: Make the interface less overwhelming for users who prefer minimal design
2. **Accessibility**: Provide larger sizes for users who need better readability
3. **Flexibility**: Allow users to customize their experience
4. **Consistency**: Apply sizing consistently across all components
5. **Performance**: Use CSS classes for instant switching

## Size Variants

### 🔹 Compact
**Best for**: Power users, small screens, maximizing content area
- **Font sizes**: 85% of default
- **Padding**: 75% of default
- **Avatar size**: 32px
- **Input height**: 48px min
- **Message bubbles**: Tighter spacing
- **Sidebar**: 240px width

### 🔹 Default (Current)
**Best for**: Most users, balanced experience
- **Font sizes**: Base (16px)
- **Padding**: Standard
- **Avatar size**: 40px
- **Input height**: 60px min
- **Message bubbles**: Current spacing
- **Sidebar**: 280px width

### 🔹 Comfortable
**Best for**: Accessibility, large screens, relaxed reading
- **Font sizes**: 110% of default
- **Padding**: 125% of default
- **Avatar size**: 48px
- **Input height**: 72px min
- **Message bubbles**: Generous spacing
- **Sidebar**: 320px width

## What Gets Scaled

### Typography
- Message text (12px → 14px → 16px)
- Input text (14px → 16px → 18px)
- Headers (18px → 20px → 24px)
- Timestamps (11px → 12px → 13px)
- Button text (13px → 14px → 15px)

### Spacing
- Message padding (12px → 16px → 20px)
- Section gaps (16px → 20px → 24px)
- Button padding (8px 16px → 10px 20px → 12px 24px)
- Input padding (12px → 16px → 20px)

### Components
- Avatar size (32px → 40px → 48px)
- Icon size (16px → 20px → 24px)
- Input height (48px → 60px → 72px)
- Sidebar width (240px → 280px → 320px)
- Message max-width (70% → 75% → 80%)

### UI Elements
- Border radius (6px → 8px → 10px)
- Shadow intensity (subtle → medium → pronounced)
- Line height (1.4 → 1.5 → 1.6)

## Technical Implementation

### 1. Storage
```typescript
// Use localStorage for instant preference
const UI_SIZE_KEY = 'dar-ui-size'
type UISize = 'compact' | 'default' | 'comfortable'

// Later: Sync to user_preferences table
```

### 2. Context + Hook
```typescript
// contexts/ui-size-context.tsx
interface UISizeContextType {
  size: UISize
  setSize: (size: UISize) => void
}

// hooks/use-ui-size.ts
export function useUISize() {
  const context = useContext(UISizeContext)
  return context
}
```

### 3. CSS Classes
```css
/* Apply via className based on size */
.ui-compact { /* compact styles */ }
.ui-default { /* default styles */ }
.ui-comfortable { /* comfortable styles */ }

/* Or use CSS variables */
:root {
  --ui-text-base: 16px;
  --ui-spacing-base: 16px;
  --ui-avatar-size: 40px;
  /* ... */
}

.ui-compact {
  --ui-text-base: 14px;
  --ui-spacing-base: 12px;
  --ui-avatar-size: 32px;
}
```

### 4. Component Updates
```tsx
// Apply size class to root element
<div className={`ui-${size}`}>
  {/* All children inherit sizing */}
</div>

// Or use hook in components
const { size } = useUISize()
const textSize = {
  compact: 'text-sm',
  default: 'text-base',
  comfortable: 'text-lg'
}[size]
```

### 5. Settings UI
```tsx
// In settings page
<RadioGroup value={size} onChange={setSize}>
  <Radio value="compact">
    <Icon />
    Compact
    <Description>More content, less spacing</Description>
  </Radio>
  <Radio value="default">
    <Icon />
    Default
    <Description>Balanced for most users</Description>
  </Radio>
  <Radio value="comfortable">
    <Icon />
    Comfortable
    <Description>Larger, easier to read</Description>
  </Radio>
</RadioGroup>
```

## Implementation Steps

### Phase 1: Foundation
1. ✅ Create UI size context and provider
2. ✅ Create useUISize hook
3. ✅ Add localStorage persistence
4. ✅ Define CSS variables for all sizes

### Phase 2: Dashboard Integration
5. ✅ Apply size classes to dashboard root
6. ✅ Update message bubbles
7. ✅ Update input area
8. ✅ Update sidebar
9. ✅ Update headers and navigation

### Phase 3: Components
10. ✅ Update slash command menu
11. ✅ Update modals and dropdowns
12. ✅ Update buttons and forms
13. ✅ Update cards and containers

### Phase 4: Settings
14. ✅ Add UI size selector to settings page
15. ✅ Add preview/demo of each size
16. ✅ Add tooltips and descriptions

### Phase 5: Polish
17. ✅ Test all sizes across components
18. ✅ Ensure dark mode compatibility
19. ✅ Test responsive breakpoints
20. ✅ Add smooth transitions

## Files to Create

1. `contexts/ui-size-context.tsx` - Context provider
2. `hooks/use-ui-size.ts` - Hook for components
3. `styles/ui-size.css` - CSS variables and classes

## Files to Modify

1. `app/layout.tsx` - Add UISizeProvider
2. `app/dashboard/page.tsx` - Apply size classes
3. `app/settings/page.tsx` - Add size selector
4. `components/slash-command-menu.tsx` - Responsive sizing
5. `app/globals.css` - Add CSS variables

## CSS Variable Structure

```css
:root {
  /* Text Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;

  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Components */
  --avatar-size: 40px;
  --input-height: 60px;
  --sidebar-width: 280px;
  --message-max-width: 75%;

  /* Interactive */
  --button-padding-x: 1rem;
  --button-padding-y: 0.5rem;
  --border-radius: 0.5rem;
}

.ui-compact {
  --text-xs: 0.65rem;
  --text-sm: 0.75rem;
  --text-base: 0.875rem;
  /* ... all scaled down 85% */
}

.ui-comfortable {
  --text-xs: 0.8rem;
  --text-sm: 0.95rem;
  --text-base: 1.1rem;
  /* ... all scaled up 110% */
}
```

## Testing Checklist

- [ ] Compact size on desktop
- [ ] Compact size on mobile
- [ ] Default size on desktop
- [ ] Default size on mobile
- [ ] Comfortable size on desktop
- [ ] Comfortable size on mobile
- [ ] Dark mode with all sizes
- [ ] Slash command menu in all sizes
- [ ] Message bubbles in all sizes
- [ ] Input area in all sizes
- [ ] Sidebar in all sizes
- [ ] Settings page in all sizes
- [ ] Modals/dropdowns in all sizes
- [ ] Smooth transitions between sizes

## User Benefits

### Compact Mode
- See more messages at once
- Faster scanning of content
- Better for small screens
- Less scrolling needed
- Professional, efficient feel

### Default Mode
- Balanced experience
- Comfortable for most users
- Good readability
- Standard expectations

### Comfortable Mode
- Better accessibility
- Easier reading for long sessions
- Reduced eye strain
- Better for large screens
- Relaxed, spacious feel

## Future Enhancements

- [ ] Per-component size overrides
- [ ] Custom size (slider)
- [ ] Responsive size (auto-adjust by screen)
- [ ] Font family selection
- [ ] Line height adjustment
- [ ] Letter spacing adjustment
- [ ] Sync to user profile (database)

## Example Usage

```tsx
// In any component
import { useUISize } from '@/hooks/use-ui-size'

function MyComponent() {
  const { size } = useUISize()

  return (
    <div className={`message-bubble ui-${size}`}>
      {/* Content automatically sized */}
    </div>
  )
}

// In settings
import { useUISize } from '@/hooks/use-ui-size'

function Settings() {
  const { size, setSize } = useUISize()

  return (
    <select value={size} onChange={e => setSize(e.target.value)}>
      <option value="compact">Compact</option>
      <option value="default">Default</option>
      <option value="comfortable">Comfortable</option>
    </select>
  )
}
```

## Performance Considerations

1. **CSS Variables**: Instant switching, no re-render
2. **LocalStorage**: Fast persistence
3. **No JavaScript calculations**: Pure CSS scaling
4. **Minimal bundle size**: ~2KB for context + hook
5. **No layout shift**: Smooth transitions

## Accessibility

- Keyboard navigation works in all sizes
- Screen readers announce size changes
- Focus indicators scale with UI
- Touch targets meet minimum size (44px)
- Color contrast maintained
- ARIA labels updated

---

**Estimated Implementation Time**: 2-3 hours
**Priority**: High (improves UX significantly)
**Complexity**: Medium (requires consistent application)
