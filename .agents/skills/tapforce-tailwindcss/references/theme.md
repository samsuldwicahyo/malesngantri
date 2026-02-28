# Theme and Colors

This guide covers how to customize themes, work with colors, and manage color systems in Tailwind CSS ^4.

## Color System Overview

Tailwind CSS ^4 uses HSL color format by default and provides a comprehensive color palette with semantic naming.

### Default Color Palette

Tailwind includes these color families:
- **Gray**: Neutral colors for text, borders, backgrounds
- **Red, Orange, Amber, Yellow**: Warm colors
- **Lime, Green, Emerald, Teal**: Green colors
- **Cyan, Sky, Blue, Indigo**: Blue colors
- **Violet, Purple, Fuchsia**: Purple colors
- **Pink, Rose**: Pink colors
- **Slate, Zinc, Neutral, Stone**: Additional grays

### Color Scale

Each color family has these shades:
- 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

```html
<!-- Example color scale -->
<div class="bg-red-50">Lightest red</div>
<div class="bg-red-500">Standard red</div>
<div class="bg-red-900">Darkest red</div>
```

## Theme Customization

### CSS-Based Theme Configuration

Tailwind CSS ^4 uses CSS for theme configuration instead of JavaScript.

```css
/* app.css */
@import "tailwindcss";

@theme {
  /* Custom colors */
  --color-brand: #3b82f6;
  --color-brand-50: #eff6ff;
  --color-brand-500: #3b82f6;
  --color-brand-900: #1e3a8a;
  
  /* Custom fonts */
  --font-family-display: "Inter", system-ui, sans-serif;
  --font-family-mono: "Fira Code", ui-monospace, monospace;
  
  /* Custom spacing */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
  
  /* Custom border radius */
  --radius-4xl: 2rem;
  
  /* Custom shadows */
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.5);
}
```

### Extending Default Theme

```css
/* Extend existing colors */
@theme {
  --color-blue-950: #172554;
  --color-gray-950: #030712;
  
  /* Add new color families */
  --color-rose-50: #fff1f2;
  --color-rose-500: #f43f5e;
  --color-rose-950: #881337;
}
```

### Semantic Color Variables

```css
/* Define semantic colors */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 220 90% 56%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 220 90% 56%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 94.1%;
}
```

## Color Usage Patterns

### Text Colors

```html
<!-- Standard text colors -->
<p class="text-gray-900">Dark gray text</p>
<p class="text-gray-600">Medium gray text</p>
<p class="text-gray-400">Light gray text</p>

<!-- Semantic text colors -->
<p class="text-primary">Primary color text</p>
<p class="text-secondary">Secondary color text</p>
<p class="text-muted">Muted color text</p>

<!-- Status colors -->
<p class="text-red-600">Error text</p>
<p class="text-green-600">Success text</p>
<p class="text-blue-600">Info text</p>
<p class="text-yellow-600">Warning text</p>
```

### Background Colors

```html
<!-- Standard backgrounds -->
<div class="bg-white">White background</div>
<div class="bg-gray-50">Light gray background</div>
<div class="bg-gray-100">Gray background</div>

<!-- Semantic backgrounds -->
<div class="bg-background">Main background</div>
<div class="bg-card">Card background</div>
<div class="bg-muted">Muted background</div>

<!-- Status backgrounds -->
<div class="bg-red-50">Error background</div>
<div class="bg-green-50">Success background</div>
<div class="bg-blue-50">Info background</div>
```

### Border Colors

```html
<!-- Standard borders -->
<div class="border border-gray-200">Light border</div>
<div class="border border-gray-300">Medium border</div>
<div class="border border-gray-400">Dark border</div>

<!-- Semantic borders -->
<div class="border border-border">Default border</div>
<div class="border border-input">Input border</div>

<!-- Status borders -->
<div class="border border-red-300">Error border</div>
<div class="border border-green-300">Success border</div>
```

## Advanced Color Techniques

### Opacity Variants

```html
<!-- Opacity utilities -->
<div class="bg-blue-500 bg-opacity-50">50% opacity blue</div>
<div class="text-gray-900 text-opacity-75">75% opacity text</div>
<div class="border border-gray-400 border-opacity-50">50% opacity border</div>

<!-- Modern opacity syntax (Tailwind ^4) -->
<div class="bg-blue-500/50">50% opacity blue</div>
<div class="text-gray-900/75">75% opacity text</div>
<div class="border-gray-400/50">50% opacity border</div>
```

### Color Combinations

```html
<!-- Complementary colors -->
<div class="bg-blue-500 text-white">Blue with white text</div>
<div class="bg-yellow-500 text-gray-900">Yellow with dark text</div>

<!-- Analogous colors -->
<div class="bg-blue-500 border-blue-600 text-blue-50">
  Blue theme with variations
</div>

<!-- Triadic colors -->
<div class="bg-red-500 text-yellow-300 border-green-500">
  Triadic color scheme
</div>
```

### Gradient Colors

```html
<!-- Linear gradients -->
<div class="bg-gradient-to-r from-blue-500 to-purple-600">
  Blue to purple gradient
</div>

<div class="bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500">
  Multi-color gradient
</div>

<!-- Radial gradients -->
<div class="bg-gradient-radial from-blue-400 to-blue-600">
  Radial blue gradient
</div>
```

## Color Accessibility

### Contrast Ratios

```html
<!-- High contrast combinations (WCAG AA) -->
<div class="bg-white text-gray-900">21:1 contrast ratio</div>
<div class="bg-gray-900 text-white">21:1 contrast ratio</div>
<div class="bg-blue-600 text-white">4.5:1 contrast ratio</div>

<!-- Medium contrast (WCAG AA minimum) -->
<div class="bg-gray-100 text-gray-900">15.8:1 contrast ratio</div>
<div class="bg-blue-500 text-white">3.1:1 contrast ratio</div>

<!-- Low contrast (avoid for important text) -->
<div class="bg-gray-200 text-gray-700">4.5:1 contrast ratio</div>
<div class="bg-blue-300 text-gray-900">2.1:1 contrast ratio (insufficient)
</div>
```

### Accessible Color Palettes

```css
/* Accessible color palette */
@theme {
  --color-primary: 220 90% 56%; /* blue-500 */
  --color-primary-foreground: 210 40% 98%; /* white */
  
  --color-secondary: 210 40% 96%; /* gray-100 */
  --color-secondary-foreground: 222.2 84% 4.9%; /* gray-900 */
  
  --color-success: 142 76% 36%; /* green-600 */
  --color-success-foreground: 210 40% 98%; /* white */
  
  --color-warning: 38 92% 50%; /* yellow-500 */
  --color-warning-foreground: 222.2 84% 4.9%; /* gray-900 */
  
  --color-error: 0 84% 60%; /* red-500 */
  --color-error-foreground: 210 40% 98%; /* white */
}
```

## Brand Color Systems

### Creating Brand Colors

```css
/* Brand color system */
@theme {
  /* Primary brand colors */
  --color-brand-50: #f0f9ff;
  --color-brand-100: #e0f2fe;
  --color-brand-200: #bae6fd;
  --color-brand-300: #7dd3fc;
  --color-brand-400: #38bdf8;
  --color-brand-500: #0ea5e9;
  --color-brand-600: #0284c7;
  --color-brand-700: #0369a1;
  --color-brand-800: #075985;
  --color-brand-900: #0c4a6e;
  --color-brand-950: #082f49;
  
  /* Secondary brand colors */
  --color-accent-50: #fdf4ff;
  --color-accent-100: #fae8ff;
  --color-accent-200: #f5d0fe;
  --color-accent-300: #f0abfc;
  --color-accent-400: #e879f9;
  --color-accent-500: #d946ef;
  --color-accent-600: #c026d3;
  --color-accent-700: #a21caf;
  --color-accent-800: #86198f;
  --color-accent-900: #701a75;
  --color-accent-950: #4a044e;
}
```

### Using Brand Colors

```html
<!-- Brand color usage -->
<div class="bg-brand-500 text-white">Primary brand color</div>
<div class="bg-accent-500 text-white">Secondary brand color</div>

<!-- Brand color variations -->
<div class="bg-brand-100 text-brand-900">Light brand background</div>
<div class="bg-brand-900 text-brand-100">Dark brand background</div>
```

## Color Utilities

### Color Mixing

```html
<!-- Color mixing with blend modes -->
<div class="bg-blue-500 mix-blend-multiply">Color mixing</div>
<div class="bg-red-500 mix-blend-screen">Color mixing</div>
<div class="bg-green-500 mix-blend-overlay">Color mixing</div>
```

### Color Filters

```html
<!-- Color filters on images -->
<img class="hue-rotate-90" src="/image.jpg" alt="Hue rotated">
<img class="saturate-150" src="/image.jpg" alt="Saturated">
<img class="brightness-125" src="/image.jpg" alt="Brightened">
<img class="contrast-125" src="/image.jpg" alt="High contrast">
```

### Color Inversion

```html
<!-- Color inversion for dark mode -->
<div class="invert">Inverted colors</div>
<div class="invert sepia">Inverted with sepia</div>
```

## Best Practices

### 1. Use Semantic Colors

```html
<!-- Good: Semantic color naming -->
<div class="bg-primary text-primary-foreground">
  Uses semantic color system
</div>

<!-- Avoid: Hardcoded colors -->
<div class="bg-blue-500 text-white">
  Hardcoded color values
</div>
```

### 2. Maintain Consistency

```html
<!-- Good: Consistent color usage -->
<div class="bg-primary hover:bg-primary/90">
  Consistent hover state
</div>

<!-- Avoid: Inconsistent colors -->
<div class="bg-primary hover:bg-blue-600">
  Inconsistent hover color
</div>
```

### 3. Ensure Accessibility

```html
<!-- Good: Accessible contrast -->
<div class="bg-primary text-primary-foreground">
  Guaranteed accessible contrast
</div>

<!-- Avoid: Poor contrast -->
<div class="bg-gray-200 text-gray-300">
  Poor contrast ratio
</div>
```

### 4. Use Color Purposefully

```html
<!-- Good: Meaningful color usage -->
<div class="bg-green-50 text-green-800 border-green-200">
  Success state with green colors
</div>

<div class="bg-red-50 text-red-800 border-red-200">
  Error state with red colors
</div>

<!-- Avoid: Random colors -->
<div class="bg-purple-500 text-yellow-300">
  Random color combination
</div>
```

## Resources

- [Tailwind CSS color documentation](https://tailwindcss.com/docs/colors)
- [Customizing colors guide](https://tailwindcss.com/docs/customizing-colors)
- [Color accessibility guide](https://tailwindcss.com/docs/accessibility)
- [Theme configuration](https://tailwindcss.com/docs/theme)
