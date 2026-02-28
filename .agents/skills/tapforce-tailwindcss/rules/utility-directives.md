---
name: utility-directives
description: Rules for defining custom CSS classes using Tailwind's @utility directive
---

# Utility Directives Rule

## Description

When defining new custom CSS classes for styles that will be shared across multiple places in a project, always prefer defining them using the `@utility` directive instead of regular CSS classes.

## Guidelines

### Use @utility For

- Repeated utility combinations
- Custom component base classes
- Project-specific design patterns
- Complex multi-property utilities

### @utility Syntax

```css
@utility <name> {
  /* CSS properties using Tailwind utilities */
  @apply <utility-classes>;
  /* Or custom CSS properties */
}
```

### Examples

**Component utilities:**
```css
@utility btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors;
}

@utility card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700;
}

@utility input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
```

**Layout utilities:**
```css
@utility section-padding {
  @apply py-12 px-4 md:px-8 lg:px-16;
}

@utility container-max {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

@utility grid-auto {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}
```

**Advanced utilities with custom properties:**
```css
@utility gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@utility glass-effect {
  @apply bg-white/20 backdrop-blur-lg border border-white/20;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

@utility hover-lift {
  @apply transform transition-transform duration-200 hover:scale-105;
}
```

### Responsive Utilities

```css
@utility responsive-padding {
  @apply p-4 sm:p-6 md:p-8 lg:p-12;
}

@utility responsive-text {
  @apply text-sm sm:text-base md:text-lg lg:text-xl;
}
```

### State-Based Utilities

```css
@utility interactive-button {
  @apply bg-gray-200 hover:bg-gray-300 focus:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors;
}

@utility link-underline {
  @apply underline decoration-2 underline-offset-4 hover:decoration-blue-500 transition-colors;
}
```

## Usage in Components

**HTML usage:**
```html
<button class="btn-primary">Primary Button</button>
<div class="card">Card content</div>
<input type="text" class="input-field" placeholder="Enter text">
```

**Svelte components:**
```svelte
<!-- Button.svelte -->
<button class="btn-primary {$$props.class}">
  <slot />
</button>

<!-- Card.svelte -->
<div class="card {$$props.class}">
  <slot />
</div>
```

## Best Practices

- Name utilities semantically (e.g., `btn-primary` not `blue-button`)
- Keep utilities focused on single responsibilities
- Use responsive prefixes within utilities when appropriate
- Include state variants (hover, focus) for interactive elements
- Document complex utilities with comments
- Test utilities across different screen sizes
- Consider adding frequently used utilities to component libraries

## When to Use Regular CSS Classes

Use regular CSS classes instead of @utility when:
- Working with third-party component libraries that require specific class names
- Implementing complex animations not possible with utilities
- Browser-specific CSS hacks are needed
- Performance-critical styles that can't be optimized by Tailwind

## Integration with CSS Organization

Place @utility definitions in the root CSS file within appropriate layers:

```css
@import "tailwindcss";

/* Custom utilities */
@layer utilities {
  @utility btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors;
  }
  
  @utility card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
  }
}
```
