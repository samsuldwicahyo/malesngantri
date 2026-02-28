---
name: color-consistency
description: Rules for maintaining consistent color value formats across Tailwind projects
---

# Color Consistency Rule

## Description

Maintain consistent color value formats throughout the project. By default, Tailwind CSS ^4 uses `hsl()` format, but projects using `shadcn-svelte` may use `oklch()` format. Always check the main CSS file and use the same format for all color values.

## Guidelines

### Determine Color Format

**Check the main CSS file for color format:**
```css
/* HSL format (default Tailwind) */
:root {
  --color-primary: 220 90% 56%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

/* OKLCH format (shadcn-svelte) */
:root {
  --color-primary: 0.7 0.18 0.577;
  --background: 1 0 0;
  --foreground: 0.098 0.02 0.09;
}
```

### HSL Format (Default Tailwind)

**Use when:**
- Standard Tailwind CSS ^4 setup
- No shadcn-svelte integration
- Custom color system

**Examples:**
```css
:root {
  --color-primary: 220 90% 56%;        /* blue-500 */
  --color-secondary: 210 40% 20%;      /* gray-800 */
  --color-accent: 340 82% 65%;         /* pink-500 */
  --background: 0 0% 100%;             /* white */
  --foreground: 222.2 84% 4.9%;        /* gray-900 */
}
```

**Utility usage:**
```html
<div class="bg-blue-500 text-white">
  <!-- Uses HSL-based colors -->
</div>
```

### OKLCH Format (shadcn-svelte)

**Use when:**
- Project uses shadcn-svelte components
- shadcn-svelte theming system is active

**Examples:**
```css
:root {
  --background: 1 0 0;                /* white */
  --foreground: 0.098 0.02 0.09;     /* gray-900 */
  --card: 1 0 0;                       /* white */
  --card-foreground: 0.098 0.02 0.09; /* gray-900 */
  --primary: 0.7 0.18 0.577;          /* blue-500 */
  --primary-foreground: 1 0 0;         /* white */
}
```

**shadcn-svelte component usage:**
```html
<button class="bg-primary text-primary-foreground">
  <!-- Uses OKLCH-based colors -->
</button>
```

### Consistency Rules

**1. Match the project's established format:**
- If main CSS uses HSL, use HSL for all custom colors
- If main CSS uses OKLCH, use OKLCH for all custom colors

**2. Arbitrary values follow the same format:**
```css
/* HSL format project */
<div class="bg-[220_90%_56%] text-[0_0%_100%]">

/* OKLCH format project */
<div class="bg-[0.7_0.18_0.577] text-[1_0_0]">
```

**3. CSS variables maintain format consistency:**
```css
/* HSL project */
:root {
  --custom-brand: 142 76% 36%; /* green-600 */
}

/* OKLCH project */
:root {
  --custom-brand: 0.55 0.15 0.35; /* green-600 equivalent */
}
```

### Format Conversion

**Common conversions:**
```css
/* HSL to OKLCH (approximate) */
--color-blue-500: 220 90% 56%; → 0.7 0.18 0.577;
--color-green-500: 142 76% 36%; → 0.55 0.15 0.35;
--color-red-500: 0 84% 60%; → 0.65 0.25 0.5;

/* OKLCH to HSL (approximate) */
--color-blue-500: 0.7 0.18 0.577; → 220 90% 56%;
--color-green-500: 0.55 0.15 0.35; → 142 76% 36%;
--color-red-500: 0.65 0.25 0.5; → 0 84% 60%;
```

### Implementation Examples

**HSL-based project:**
```css
/* app.css */
@import "tailwindcss";

@theme {
  --color-brand-50: 220 91% 96%;
  --color-brand-500: 220 90% 56%;
  --color-brand-900: 220 90% 20%;
}

:root {
  --color-custom: 340 82% 65%; /* pink-500 */
}
```

**OKLCH-based project (shadcn-svelte):**
```css
/* app.css */
@import "tailwindcss";

:root {
  --background: 1 0 0;
  --foreground: 0.098 0.02 0.09;
  --primary: 0.7 0.18 0.577;
  --primary-foreground: 1 0 0;
  --custom: 0.65 0.25 0.5; /* red-500 equivalent */
}
```

## Best Practices

- Always check the main CSS file first to determine the color format
- Never mix HSL and OKLCH formats in the same project
- Document the chosen color format in project documentation
- Use color format conversion tools when migrating between formats
- Test color rendering across different browsers
- Maintain consistency between CSS variables and utility classes
- Consider accessibility when choosing custom colors

## shadcn-svelte Integration

When using shadcn-svelte, follow their theming patterns:

```css
/* shadcn-svelte theme structure */
:root {
  --background: 1 0 0;
  --foreground: 0.098 0.02 0.09;
  --card: 1 0 0;
  --card-foreground: 0.098 0.02 0.09;
  --popover: 1 0 0;
  --popover-foreground: 0.098 0.02 0.09;
  --primary: 0.7 0.18 0.577;
  --primary-foreground: 1 0 0;
  --secondary: 0.95 0.02 0.09;
  --secondary-foreground: 0.098 0.02 0.09;
  --muted: 0.95 0.02 0.09;
  --muted-foreground: 0.596 0.07 0.577;
  --accent: 0.95 0.02 0.09;
  --accent-foreground: 0.098 0.02 0.09;
  --destructive: 0.65 0.25 0.5;
  --destructive-foreground: 1 0 0;
  --border: 0.95 0.02 0.09;
  --input: 0.95 0.02 0.09;
  --ring: 0.7 0.18 0.577;
}
```
