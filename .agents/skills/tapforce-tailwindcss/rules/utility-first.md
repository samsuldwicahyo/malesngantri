---
name: utility-first
description: Rules for preferring Tailwind utilities over custom CSS in component styling
---

# Utility-First Approach Rule

## Description

Always prefer writing UI styles using Tailwind CSS ^4 utility classes instead of writing custom CSS. This ensures consistency, maintainability, and leverages Tailwind's optimized utility system.

## Guidelines

### Use Utility Classes for All Styling

Prefer utility classes for:
- Layout (flex, grid, positioning)
- Spacing (padding, margin, gap)
- Typography (font size, weight, line height)
- Colors (background, text, borders)
- Responsive design
- Interactive states (hover, focus, active)

### Examples

**Good - Using utilities:**
```html
<button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
  Click me
</button>
```

**Avoid - Custom CSS:**
```html
<button class="custom-button">
  Click me
</button>
<style>
.custom-button {
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
.custom-button:hover {
  background-color: #2563eb;
}
</style>
```

### When to Break the Rule

Only consider custom CSS when:
- Complex animations not possible with utilities
- Third-party component library overrides
- Browser-specific CSS hacks
- Performance-critical custom properties

## Implementation Tips

- Use Tailwind's IntelliSense for class discovery
- Group related utilities logically
- Use responsive prefixes (sm:, md:, lg:) for breakpoints
- Leverage state variants (hover:, focus:) for interactions
