# Functions and Directives

This guide covers Tailwind CSS functions and directives for advanced CSS generation and customization.

## CSS Functions Overview

Tailwind CSS ^4 provides several CSS functions and directives for generating utilities, customizing themes, and creating dynamic styles.

## Theme Function

### Using @theme Directive

The `@theme` directive is used to define custom theme values in Tailwind CSS ^4.

```css
/* app.css */
@import "tailwindcss";

@theme {
  /* Custom colors */
  --color-brand: #3b82f6;
  --color-brand-50: #eff6ff;
  --color-brand-500: #3b82f6;
  --color-brand-900: #1e3a8a;
  
  /* Custom spacing scale */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
  
  /* Custom font families */
  --font-family-display: "Inter", system-ui, sans-serif;
  --font-family-mono: "Fira Code", ui-monospace, monospace;
  
  /* Custom border radius */
  --radius-4xl: 2rem;
  
  /* Custom shadows */
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.5);
  --shadow-inner-glow: inset 0 0 20px rgba(59, 130, 246, 0.3);
}
```

### Semantic Theme Values

```css
/* Semantic color definitions */
@theme {
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-card: 0 0% 100%;
  --color-card-foreground: 222.2 84% 4.9%;
  --color-popover: 0 0% 100%;
  --color-popover-foreground: 222.2 84% 4.9%;
  --color-primary: 220 90% 56%;
  --color-primary-foreground: 210 40% 98%;
  --color-secondary: 210 40% 96%;
  --color-secondary-foreground: 222.2 84% 4.9%;
  --color-muted: 210 40% 96%;
  --color-muted-foreground: 215.4 16.3% 46.9%;
  --color-accent: 210 40% 96%;
  --color-accent-foreground: 222.2 84% 4.9%;
  --color-destructive: 0 84.2% 60.2%;
  --color-destructive-foreground: 210 40% 98%;
  --color-border: 214.3 31.8% 91.4%;
  --color-input: 214.3 31.8% 91.4%;
  --color-ring: 220 90% 56%;
}
```

## Utility Directive

### Creating Custom Utilities

The `@utility` directive creates new utility classes that can be used like built-in Tailwind utilities.

```css
/* Custom button utilities */
@layer utilities {
  @utility btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors;
  }
  
  @utility btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition-colors;
  }
  
  @utility btn-outline {
    @apply border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded transition-colors;
  }
}
```

### Responsive Utilities

```css
/* Responsive utility definitions */
@layer utilities {
  @utility container-padding {
    @apply px-4 sm:px-6 md:px-8 lg:px-12;
  }
  
  @utility responsive-text {
    @apply text-sm sm:text-base md:text-lg lg:text-xl;
  }
  
  @utility card-shadow {
    @apply shadow-sm sm:shadow-md md:shadow-lg lg:shadow-xl;
  }
}
```

### State-Based Utilities

```css
/* Interactive utilities */
@layer utilities {
  @utility interactive-card {
    @apply bg-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200;
  }
  
  @utility focus-input {
    @apply border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none;
  }
  
  @utility link-hover {
    @apply text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-4 hover:decoration-blue-800 transition-colors;
  }
}
```

### Complex Utilities

```css
/* Advanced utility definitions */
@layer utilities {
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
  
  @utility neon-glow {
    @apply bg-blue-500 text-white;
    box-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f6, 0 0 30px #3b82f6;
  }
  
  @utility morphing-card {
    @apply bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl p-6;
    position: relative;
    overflow: hidden;
  }
  
  @utility morphing-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: rotate(45deg);
    animation: shine 3s infinite;
  }
}
```

## Layer Directive

### Organizing CSS with Layers

The `@layer` directive organizes CSS into logical layers for better control over specificity.

```css
/* Base layer - resets and base styles */
@layer base {
  /* Custom font faces */
  @font-face {
    font-family: 'Custom Font';
    src: url('/fonts/custom-font.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
  }
  
  /* Base element styles */
  html {
    font-family: 'Custom Font', system-ui, sans-serif;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-full;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-400;
  }
}
```

```css
/* Components layer - component-specific styles */
@layer components {
  .card {
    @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
  }
  
  .card-header {
    @apply border-b border-gray-200 pb-4 mb-4;
  }
  
  .card-title {
    @apply text-lg font-semibold text-gray-900;
  }
  
  .card-description {
    @apply text-gray-600 mt-2;
  }
  
  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800;
  }
}
```

```css
/* Utilities layer - custom utilities */
@layer utilities {
  @utility text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  @utility text-shadow-lg {
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  @utility backdrop-blur-xs {
    backdrop-filter: blur(2px);
  }
  
  @utility backdrop-blur-3xl {
    backdrop-filter: blur(64px);
  }
}
```

## Variant Directive

### Custom State Variants

The `@variant` directive creates custom state variants for utilities.

```css
/* Custom variants */
@variant dark-mode (&:where(.dark, .dark *));

@variant supports-backdrop-blur (&::backdrop);

@variant motion-safe (&:where(:not(.motion-reduce) *));

@variant motion-reduce (&:where(.motion-reduce *));

@variant hover-supported (&:where(:hover));

@variant touch-only (&:where(hover: none));

/* Usage with custom variants */
@layer utilities {
  @utility glass-effect {
    @apply bg-white/20 backdrop-blur-lg border border-white/20;
  }
  
  .supports-backdrop-blur\:glass-effect {
    backdrop-filter: blur(16px);
  }
  
  .motion-safe\:animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .motion-reduce\:animate-pulse {
    animation: none;
  }
}
```

## Apply Directive

### Using @apply for Style Composition

The `@apply` directive applies existing utility classes within custom CSS.

```css
/* Component styles with @apply */
@layer components {
  .custom-button {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors;
    
    /* Additional custom properties */
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .custom-input {
    @apply border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none;
    
    /* Custom focus styles */
    transition: all 0.2s ease;
  }
  
  .custom-card {
    @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
    
    /* Custom hover effect */
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .custom-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
}
```

### @apply with Important

```css
/* Using !important with @apply */
@layer components {
  .override-button {
    @apply !bg-red-500 !text-white !border-none;
  }
  
  .critical-notice {
    @apply !bg-red-100 !border-red-400 !text-red-700;
  }
}
```

## Config Directive

### External Configuration

The `@config` directive imports external configuration files.

```css
/* Import external configuration */
@config "./tailwind.config.js";

/* Or import multiple configs */
@config "./colors.config.js";
@config "./spacing.config.js";
```

## Reference Directive

### Referencing Other CSS Files

The `@reference` directive imports CSS without duplicating output.

```css
/* In component styles */
@reference "../app.css";

/* Component-specific styles */
.custom-component {
  @apply bg-white rounded-lg shadow-md;
}

/* This allows access to Tailwind utilities without duplication */
```

## Advanced Function Usage

### Mathematical Functions

```css
/* Using CSS calc() with Tailwind values */
@layer utilities {
  @utility full-viewport {
    height: calc(100vh - 4rem);
  }
  
  @utility half-container {
    width: calc(50% - 1rem);
  }
  
  @utility golden-ratio {
    aspect-ratio: 1.618 / 1;
  }
}
```

### Color Functions

```css
/* Advanced color manipulation */
@layer utilities {
  @utility color-mix {
    background-color: color-mix(in srgb, #3b82f6 50%, #10b981 50%);
  }
  
  @utility color-adjust {
    filter: hue-rotate(90deg) saturate(1.5);
  }
  
  @utility color-invert {
    filter: invert(1) hue-rotate(180deg);
  }
}
```

### Animation Functions

```css
/* Custom animations with keyframes */
@layer utilities {
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
  }
  
  @keyframes slide-in {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @utility animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  @utility animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  @utility animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
}
```

## Best Practices

### 1. Organize with Layers

```css
/* Good: Organized CSS structure */
@layer base {
  /* Base styles and resets */
}

@layer components {
  /* Component-specific styles */
}

@layer utilities {
  /* Custom utilities */
}

/* Avoid: Unorganized CSS */
.unorganized-style { /* ... */ }
.another-style { /* ... */ }
```

### 2. Use Semantic Naming

```css
/* Good: Semantic utility names */
@utility btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded;
}

/* Avoid: Non-semantic names */
@utility blue-button {
  @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded;
}
```

### 3. Keep Utilities Focused

```css
/* Good: Single-purpose utilities */
@utility btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded;
}

@utility btn-large {
  @apply px-6 py-3 text-lg;
}

/* Avoid: Multi-purpose utilities */
@utility btn-primary-large {
  @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded text-lg;
}
```

### 4. Use @apply Strategically

```css
/* Good: @apply for component variations */
@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800;
  }
}

/* Avoid: @apply for everything */
.btn {
  @apply px-4 py-2 rounded font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white;
}
```

## Resources

- [Tailwind CSS functions documentation](https://tailwindcss.com/docs/functions-and-directives)
- [@theme directive reference](https://tailwindcss.com/docs/theme)
- [@utility directive reference](https://tailwindcss.com/docs/functions-and-directives#utility)
- [CSS layers documentation](https://tailwindcss.com/docs/adding-custom-styles#using-css-layers)
