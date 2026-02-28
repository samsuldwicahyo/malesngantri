---
name: css-organization
description: Rules for organizing CSS files and centralizing custom styles in Tailwind projects
---

# CSS Organization Rule

## Description

Centralize CSS variables and custom styles in the root CSS file rather than defining them inline in components or pages. This ensures maintainability and consistency across the project.

## Guidelines

### Root CSS File Structure

The main CSS file (typically `app.css`, `main.css`, or `index.css`) should contain:

1. **Tailwind imports** - Base Tailwind directives
2. **CSS variables** - Custom properties for theming
3. **Base styles** - Global styles and resets
4. **Component overrides** - Third-party component customizations

### Example Root CSS Structure

```css
/* app.css */
@import "tailwindcss";

/* CSS Variables - Theme Configuration */
:root {
  --color-primary: 220 90% 56%;
  --color-secondary: 210 40% 20%;
  --font-sans: system-ui, sans-serif;
  --radius: 0.5rem;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

/* Dark mode variables */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: 220 90% 60%;
    --color-secondary: 210 40% 90%;
  }
}

/* Base styles */
@layer base {
  html {
    font-family: var(--font-sans);
  }
  
  body {
    @apply bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100;
  }
}

/* Component overrides */
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded;
  }
}
```

### CSS Variable Organization

**Group variables by purpose:**
```css
:root {
  /* Colors */
  --color-primary: 220 90% 56%;
  --color-secondary: 210 40% 20%;
  --color-accent: 340 82% 65%;
  
  /* Typography */
  --font-sans: system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  
  /* Effects */
  --radius: 0.5rem;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}
```

### Theme Customization Patterns

**Extending default theme:**
```css
@theme {
  --color-brand-50: #eff6ff;
  --color-brand-500: #3b82f6;
  --color-brand-900: #1e3a8a;
  
  --font-family-display: "Inter", system-ui, sans-serif;
  --font-family-mono: "Fira Code", ui-monospace, monospace;
}
```

**Referencing other variables:**
```css
:root {
  --color-primary: 220 90% 56%;
  --color-primary-foreground: 220 90% 98%;
  
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}
```

## Component Style Guidelines

### Avoid Inline Styles

**Avoid:**
```svelte
<!-- Component.svelte -->
<style>
  .local-style {
    --local-color: #3b82f6;
    background: var(--local-color);
  }
</style>
```

**Prefer:**
```svelte
<!-- Component.svelte -->
<div class="bg-blue-500 text-white">
  <!-- Use utilities or reference root variables -->
</div>
```

### Framework-Specific Patterns

**SvelteKit with @apply:**
```svelte
<style lang="postcss">
  @reference "../app.css";
  .component-style {
    @apply bg-blue-500 hover:bg-blue-600 text-white;
  }
</style>
```

## Best Practices

- Define all CSS variables in the root CSS file
- Use semantic variable naming (e.g., `--color-primary` not `--blue-500`)
- Group related variables together
- Document complex variable relationships
- Use Tailwind's @layer directive for organization
- Reference the root CSS file from component styles when needed
- Keep component styles minimal and utility-focused
