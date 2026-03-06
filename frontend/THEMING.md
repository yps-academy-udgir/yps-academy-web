# Theme System Documentation

## Overview
This application uses a comprehensive Angular Material theme system with light and dark mode support. All colors, spacing, and design tokens are centralized for consistent theming across the application.

## Files Structure

```
frontend/src/
├── styles/
│   ├── _variables.scss      # All design tokens (colors, spacing, typography, etc.)
│   └── _theme.scss          # Angular Material theme configuration
├── styles.scss              # Main stylesheet with utilities
└── app/core/services/
    └── theme.service.ts     # Theme management service
```

## Using the Theme Service

### In Components (TypeScript)

```typescript
import { Component, inject, computed } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html'
})
export class ExampleComponent {
  private themeService = inject(ThemeService);
  
  // Access current theme
  currentTheme = this.themeService.currentTheme;
  
  // Check if dark mode
  isDark = computed(() => this.themeService.isDarkMode());
  
  // Toggle theme
  toggleTheme() {
    this.themeService.toggleTheme();
  }
  
  // Set specific theme
  setLightMode() {
    this.themeService.setTheme('light');
  }
}
```

## Using CSS Variables in SCSS

### Theme-Aware Colors

```scss
.my-component {
  // Background colors
  background-color: var(--background-primary);    // Main background
  background-color: var(--background-secondary);  // Cards, surface
  background-color: var(--background-tertiary);   // Nested elements
  background-color: var(--background-hover);      // Hover states
  
  // Text colors
  color: var(--text-primary);      // Main text
  color: var(--text-secondary);    // Secondary text
  color: var(--text-tertiary);     // Tertiary text
  color: var(--text-disabled);     // Disabled text
  
  // Semantic colors
  color: var(--primary-color);     // Brand primary
  color: var(--accent-color);      // Accent highlights
  color: var(--warn-color);        // Errors, warnings
  color: var(--success-color);     // Success states
  
  // Borders and dividers
  border: 1px solid var(--border-color);
  border-bottom: 1px solid var(--divider-color);
  
  // Shadows
  box-shadow: 0 2px 4px var(--shadow-color);
}
```

### Using SCSS Variables

Import variables at the top of your component SCSS file:

```scss
@use '/src/styles/variables' as vars;

.my-component {
  // Spacing
  padding: vars.$spacing-md;
  margin-bottom: vars.$spacing-lg;
  gap: vars.$spacing-sm;
  
  // Border radius
  border-radius: vars.$border-radius-md;
  
  // Shadows
  box-shadow: vars.$shadow-md;
  
  // Typography
  font-family: vars.$font-family-base;
  font-size: vars.$font-size-md;
  font-weight: vars.$font-weight-medium;
  line-height: vars.$line-height-normal;
  
  // Colors (from palette)
  background-color: vars.$primary-500;
  color: vars.$gray-100;
  
  // Transitions
  transition: all vars.$transition-normal;
  
  // Breakpoints
  @media (max-width: vars.$breakpoint-sm) {
    padding: vars.$spacing-sm;
  }
}
```

## Available Design Tokens

### Color Palette

**Primary Colors** (Indigo): `$primary-50` through `$primary-900`  
**Accent Colors** (Pink): `$accent-50` through `$accent-900`  
**Warn Colors** (Red): `$warn-50` through `$warn-900`  
**Success Colors** (Green): `$success-50` through `$success-900`  
**Gray Colors**: `$gray-50` through `$gray-900`

### Spacing System

- `$spacing-xxs`: 4px
- `$spacing-xs`: 8px
- `$spacing-sm`: 12px
- `$spacing-md`: 16px (default)
- `$spacing-lg`: 24px
- `$spacing-xl`: 32px
- `$spacing-xxl`: 48px
- `$spacing-xxxl`: 64px

### Border Radius

- `$border-radius-sm`: 4px
- `$border-radius-md`: 8px
- `$border-radius-lg`: 12px
- `$border-radius-xl`: 16px
- `$border-radius-round`: 50%

### Typography

**Font Sizes**:
- `$font-size-xs`: 12px
- `$font-size-sm`: 14px
- `$font-size-md`: 16px
- `$font-size-lg`: 18px
- `$font-size-xl`: 20px
- `$font-size-xxl`: 24px
- `$font-size-xxxl`: 32px

**Font Weights**:
- `$font-weight-light`: 300
- `$font-weight-normal`: 400
- `$font-weight-medium`: 500
- `$font-weight-bold`: 700

**Line Heights**:
- `$line-height-tight`: 1.2
- `$line-height-normal`: 1.5
- `$line-height-relaxed`: 1.75

### Shadows

- `$shadow-sm`: Small elevation
- `$shadow-md`: Medium elevation
- `$shadow-lg`: Large elevation
- `$shadow-xl`: Extra large elevation

### Transitions

- `$transition-fast`: 150ms
- `$transition-normal`: 250ms
- `$transition-slow`: 350ms

### Breakpoints

- `$breakpoint-xs`: 0px
- `$breakpoint-sm`: 600px
- `$breakpoint-md`: 960px
- `$breakpoint-lg`: 1280px
- `$breakpoint-xl`: 1920px

## Utility Classes

The theme system provides extensive utility classes for rapid development:

### Layout
```html
<div class="d-flex flex-column align-center justify-between">
  <div class="full-width">Content</div>
  <div class="spacer"></div>
</div>
```

### Spacing
```html
<!-- Margin -->
<div class="m-md mt-lg mb-sm ml-xs mr-xl">Content</div>

<!-- Padding -->
<div class="p-lg pt-md pb-sm pl-xs pr-md">Content</div>
```

### Typography
```html
<p class="text-primary text-lg font-medium text-center">Text</p>
<p class="text-secondary text-sm font-normal">Secondary text</p>
```

### Shadows & Borders
```html
<div class="shadow-md border-radius-lg">Card</div>
<div class="shadow-lg border-radius-xl">Elevated card</div>
```

### Responsive
```html
<div class="hide-xs show-sm">Visible on small+ screens</div>
<div class="hide-lg">Hidden on large screens</div>
```

## Best Practices

### 1. Always Use Variables
❌ **Don't:**
```scss
.component {
  padding: 16px;
  color: #333333;
  border-radius: 8px;
}
```

✅ **Do:**
```scss
@use '/src/styles/variables' as vars;

.component {
  padding: vars.$spacing-md;
  color: var(--text-primary);
  border-radius: vars.$border-radius-md;
}
```

### 2. Use Theme-Aware CSS Variables for Colors
❌ **Don't:**
```scss
.component {
  background-color: #ffffff;
  color: #000000;
}
```

✅ **Do:**
```scss
.component {
  background-color: var(--background-secondary);
  color: var(--text-primary);
}
```

### 3. Leverage Utility Classes
❌ **Don't:**
```scss
.component {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 24px;
}
```

✅ **Do:**
```html
<div class="d-flex align-center p-md mb-lg"></div>
```

### 4. Use Semantic Color Names
❌ **Don't:**
```scss
.success-message {
  background-color: #4caf50;
}
```

✅ **Do:**
```scss
@use '/src/styles/variables' as vars;

.success-message {
  background-color: var(--success-color);
  // or for specific shade
  background-color: vars.$success-500;
}
```

### 5. Responsive Design
```scss
@use '/src/styles/variables' as vars;

.component {
  padding: vars.$spacing-lg;
  
  @media (max-width: vars.$breakpoint-sm) {
    padding: vars.$spacing-sm;
  }
  
  @media (min-width: vars.$breakpoint-lg) {
    padding: vars.$spacing-xl;
  }
}
```

## Adding New Variables

When adding new design tokens, follow these steps:

1. **Add to `_variables.scss`**:
```scss
// New color
$info-500: #2196f3;

// New spacing
$spacing-mega: 96px;
```

2. **Update theme CSS variables if needed** in `_theme.scss`:
```scss
.light-theme {
  --info-color: #{vars.$info-500};
}

.dark-theme {
  --info-color: #{vars.$info-300};
}
```

3. **Export as CSS custom property** in `_variables.scss`:
```scss
:root {
  --spacing-mega: #{$spacing-mega};
}
```

4. **Document in this file** for team reference.

## Theme Persistence

The theme preference is automatically saved to `localStorage` with key `yps-academy-theme`. The theme persists across browser sessions and is automatically applied on app initialization.

## Testing Themes

To test your components in both themes:

1. Click the theme toggle button in the header (sun/moon icon)
2. Or use browser console:
```javascript
// Toggle theme
document.body.classList.toggle('dark-theme');
document.body.classList.toggle('light-theme');
```

## Future Enhancements

Consider these additions for enhanced theming:

- [ ] System preference detection (`prefers-color-scheme`)
- [ ] Additional color schemes (e.g., high contrast)
- [ ] Theme customization UI
- [ ] Per-user theme preferences (requires backend)
- [ ] Scheduled theme changes (e.g., dark mode at night)
