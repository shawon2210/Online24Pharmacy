# Theme System Documentation

## Overview
The enhanced theme system provides consistent dark/light mode support across all components with full responsiveness.

## Key Features

### 1. ThemeProvider
- Automatically detects system theme preference
- Persists user theme choice to localStorage
- Listens for system theme changes
- Dispatches custom events for theme changes

### 2. useTheme Hook
```javascript
import { useTheme } from '@/hooks/useTheme';

const { theme, toggleTheme } = useTheme();
```

### 3. useResponsiveTheme Hook (NEW)
```javascript
import { useResponsiveTheme } from '@/hooks/useResponsiveTheme';

const { theme, toggleTheme, isMobile, isTablet, isDesktop, isDark, isLight } = useResponsiveTheme();
```

## CSS Variables

### Light Mode
- `--background`: #FFFFFF
- `--foreground`: #111827
- `--primary`: #10B981
- `--card`: #FFFFFF
- `--border`: #E5E7EB
- `--muted`: #F3F4F6
- `--muted-foreground`: #6B7280

### Dark Mode
- `--background`: #0F172A
- `--foreground`: #E2E8F0
- `--primary`: #34D399
- `--card`: #1E293B
- `--border`: #334155
- `--muted`: #1E293B
- `--muted-foreground`: #94A3B8

## New Responsive Components

### ResponsiveCard
```javascript
import ResponsiveCard from '@/components/common/ResponsiveCard';

<ResponsiveCard hover={true}>
  Content here
</ResponsiveCard>
```

### ResponsiveContainer
```javascript
import ResponsiveContainer from '@/components/common/ResponsiveContainer';

<ResponsiveContainer>
  Content here
</ResponsiveContainer>
```

### ResponsiveGrid
```javascript
import ResponsiveGrid from '@/components/common/ResponsiveGrid';

<ResponsiveGrid cols={4}>
  {items.map(item => <div key={item.id}>{item}</div>)}
</ResponsiveGrid>
```

## Theme Utilities

```javascript
import { themeClasses, getThemeClass, combineThemeClasses } from '@/utils/themeUtils';

// Use predefined classes
className={themeClasses.bg.primary}
className={themeClasses.text.secondary}

// Get conditional class
className={getThemeClass(isDark, 'light-class', 'dark-class')}

// Combine multiple classes
className={combineThemeClasses(themeClasses.card, 'custom-class')}
```

## Tailwind Dark Mode

All components use Tailwind's `dark:` prefix for dark mode:

```jsx
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
  Content
</div>
```

## Responsive Breakpoints

- `xs`: 475px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Best Practices

1. Always use `useResponsiveTheme` for components that need theme awareness
2. Use Tailwind's `dark:` prefix for styling
3. Use `themeClasses` utilities for consistency
4. Test components in both light and dark modes
5. Ensure proper contrast ratios for accessibility
6. Use responsive padding: `p-4 sm:p-5 md:p-6 lg:p-7`
7. Use responsive text sizes: `text-sm sm:text-base md:text-lg`

## Migration Guide

### Old Way
```javascript
const { theme } = useTheme();
const isDark = theme === 'dark';
```

### New Way
```javascript
const { isDark, isMobile, isTablet, isDesktop } = useResponsiveTheme();
```

## Testing Theme Changes

1. Toggle theme using ThemeToggle button
2. Refresh page - theme persists
3. Change system theme - app updates automatically
4. Resize window - responsive classes apply
