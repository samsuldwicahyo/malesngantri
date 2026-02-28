# Dark Mode

This guide covers how to implement and style dark mode using Tailwind CSS utilities.

## Dark Mode Strategies

Tailwind CSS supports two main strategies for implementing dark mode:

1. **Media Strategy**: Uses `prefers-color-scheme` media query
2. **Class Strategy**: Uses a class on the root element (recommended)

## Setup Configuration

### Media Strategy (System Preference)

```css
/* tailwind.config.js or CSS configuration */
@import "tailwindcss";

/* Media strategy is default - no additional config needed */
```

### Class Strategy (Manual Toggle)

```css
/* app.css */
@import "tailwindcss";

/* Class strategy requires CSS configuration */
@custom-variant dark (.dark);
```

Or in JavaScript configuration:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media' for system preference
  // ... other config
}
```

## Dark Mode Utilities

### Basic Dark Mode Variants

```html
<!-- Text colors -->
<p class="text-gray-900 dark:text-gray-100">
  Light text in light mode, dark text in dark mode
</p>

<!-- Background colors -->
<div class="bg-white dark:bg-gray-900">
  White background in light mode, dark background in dark mode
</div>

<!-- Border colors -->
<div class="border border-gray-300 dark:border-gray-700">
  Light border in light mode, dark border in dark mode
</div>
```

### Component Dark Mode Styling

```html
<!-- Button with dark mode -->
<button class="bg-blue-500 hover:bg-blue-600 text-white 
               dark:bg-blue-600 dark:hover:bg-blue-700">
  Dark mode button
</button>

<!-- Card with dark mode -->
<div class="bg-white rounded-lg shadow-md p-6 
               dark:bg-gray-800 dark:shadow-lg">
  <h3 class="text-gray-900 dark:text-gray-100">
    Card Title
  </h3>
  <p class="text-gray-600 dark:text-gray-300">
    Card content that adapts to dark mode
  </p>
</div>

<!-- Input with dark mode -->
<input class="border border-gray-300 bg-white text-gray-900 
               placeholder-gray-500 
               dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 
               dark:placeholder-gray-400" 
       type="text" placeholder="Enter text">
```

## Dark Mode Implementation

### Toggle Implementation

```html
<!-- Dark mode toggle button -->
<button id="dark-mode-toggle" class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
  <svg class="w-6 h-6 text-gray-800 dark:text-gray-200 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
  <svg class="w-6 h-6 text-gray-800 dark:text-gray-200 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
</button>

<script>
  // Dark mode toggle JavaScript
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const html = document.documentElement;
  
  // Check for saved preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'light';
  html.classList.toggle('dark', currentTheme === 'dark');
  
  darkModeToggle.addEventListener('click', () => {
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      html.classList.toggle('dark', e.matches);
    }
  });
</script>
```

### System Preference Detection

```html
<!-- Auto-detect system preference -->
<script>
  // Detect system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Apply system preference if no manual setting
  if (!localStorage.getItem('theme')) {
    document.documentElement.classList.toggle('dark', prefersDark);
  }
</script>
```

## Dark Mode Color Schemes

### Semantic Color Variables

```css
/* Define semantic colors for dark mode */
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

### Using Semantic Colors

```html
<!-- Use semantic color variables -->
<div class="bg-background text-foreground border-border">
  <h1 class="text-foreground">Main heading</h1>
  <p class="text-muted-foreground">Muted text</p>
  <button class="bg-primary text-primary-foreground hover:bg-primary/90">
    Primary button
  </button>
  <button class="bg-secondary text-secondary-foreground hover:bg-secondary/80">
    Secondary button
  </button>
</div>
```

## Dark Mode Components

### Navigation Bar

```html
<!-- Responsive navigation with dark mode -->
<nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          Logo
        </h1>
      </div>
      <div class="flex items-center space-x-4">
        <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          Home
        </a>
        <a href="#" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          About
        </a>
        <button class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
          <!-- Dark mode toggle icon -->
        </button>
      </div>
    </div>
  </div>
</nav>
```

### Card Component

```html
<!-- Card with comprehensive dark mode support -->
<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-700 p-6">
  <div class="flex items-center mb-4">
    <img class="w-12 h-12 rounded-full mr-4" src="/avatar.jpg" alt="Avatar">
    <div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        John Doe
      </h3>
      <p class="text-gray-600 dark:text-gray-300 text-sm">
        Software Engineer
      </p>
    </div>
  </div>
  <p class="text-gray-700 dark:text-gray-200 mb-4">
    This card adapts perfectly to dark mode with proper contrast and readability.
  </p>
  <div class="flex space-x-2">
    <button class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md">
      Follow
    </button>
    <button class="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-md">
      Message
    </button>
  </div>
</div>
```

### Form Components

```html
<!-- Form with dark mode -->
<form class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Email Address
    </label>
    <input class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   placeholder-gray-500 dark:placeholder-gray-400
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   dark:focus:ring-blue-400 dark:focus:border-blue-400" 
           type="email" placeholder="your@email.com">
  </div>
  
  <div>
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      Message
    </label>
    <textarea class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                        placeholder-gray-500 dark:placeholder-gray-400
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        dark:focus:ring-blue-400 dark:focus:border-blue-400" 
              rows="4" placeholder="Your message..."></textarea>
  </div>
  
  <button class="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
    Send Message
  </button>
</form>
```

## Advanced Dark Mode Techniques

### Gradient Dark Mode

```html
<!-- Gradient backgrounds with dark mode -->
<div class="bg-gradient-to-r from-blue-500 to-purple-600 
                dark:from-blue-700 dark:to-purple-800 text-white p-8 rounded-lg">
  <h2 class="text-2xl font-bold mb-4">Gradient Header</h2>
  <p>Gradient that adapts to dark mode</p>
</div>
```

### Image Dark Mode

```html
<!-- Images with dark mode filters -->
<img class="w-full h-64 object-cover rounded-lg opacity-90 dark:opacity-75" 
     src="/image.jpg" alt="Description">

<!-- Or use different images for dark/light mode -->
<picture>
  <source srcset="/image-dark.jpg" media="(prefers-color-scheme: dark)">
  <img src="/image-light.jpg" alt="Description">
</picture>
```

### SVG Dark Mode

```html
<!-- SVG icons with dark mode -->
<svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
</svg>
```

## Best Practices

### 1. Ensure Sufficient Contrast

```html
<!-- Good: High contrast in both modes -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  High contrast text
</div>

<!-- Avoid: Low contrast in dark mode -->
<div class="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-500">
  Low contrast text (hard to read)
</div>
```

### 2. Use Semantic Colors

```html
<!-- Good: Semantic color variables -->
<div class="bg-background text-foreground">
  Uses semantic color system
</div>

<!-- Avoid: Hardcoded colors -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Hardcoded color values
</div>
```

### 3. Test All Interactive States

```html
<!-- Good: All states have dark mode variants -->
<button class="bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 
               dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:bg-blue-800">
  Complete dark mode support
</button>
```

### 4. Consider Accessibility

```html
<!-- Respect user preferences -->
<script>
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Apply reduced motion in dark mode transitions
  if (prefersReducedMotion) {
    document.documentElement.classList.add('motion-reduce');
  }
</script>
```

## Resources

- [Tailwind CSS dark mode documentation](https://tailwindcss.com/docs/dark-mode)
- [Color customization guide](https://tailwindcss.com/docs/customizing-colors)
- [Accessibility best practices](https://tailwindcss.com/docs/accessibility)
- [CSS custom properties guide](https://tailwindcss.com/docs/functions-and-directives)
