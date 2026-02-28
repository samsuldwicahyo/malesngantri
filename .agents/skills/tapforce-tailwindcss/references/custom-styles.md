# Adding Custom Styles

This guide covers how to add custom CSS styles when Tailwind utilities aren't sufficient, while maintaining the utility-first approach.

## When to Add Custom Styles

### Use Custom Styles For:

- Complex animations not possible with utilities
- Browser-specific CSS hacks
- Third-party component library overrides
- Performance-critical custom properties
- Complex pseudo-elements

### Avoid Custom Styles For:

- Simple styling that utilities can handle
- Component-specific styles that could be utilities
- Layout that can be achieved with flex/grid utilities

## Custom CSS Integration

### Adding Custom CSS to Root File

```css
/* app.css */
@import "tailwindcss";

/* Custom base styles */
@layer base {
  /* Custom font loading */
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

### Component-Style Overrides

```css
/* Third-party component overrides */
@layer components {
  /* Override Bootstrap styles */
  .btn {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded;
  }
  
  /* Override Material-UI */
  .MuiButton-root {
    @apply bg-blue-500 hover:bg-blue-600 text-white;
  }
  
  /* Override date picker */
  .react-datepicker {
    @apply border border-gray-300 rounded-lg shadow-lg;
  }
}
```

## Advanced Custom Styles

### Complex Animations

```css
/* Custom animations */
@layer utilities {
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
}
```

### Custom Pseudo-Elements

```css
/* Custom pseudo-elements */
@layer components {
  .custom-input {
    @apply border border-gray-300 rounded-md px-3 py-2;
  }
  
  .custom-input::placeholder {
    @apply text-gray-500 italic;
  }
  
  .custom-input:focus {
    @apply border-blue-500 ring-2 ring-blue-200 outline-none;
  }
  
  /* Custom checkbox */
  .custom-checkbox {
    @apply w-4 h-4 border border-gray-300 rounded text-blue-600 
           focus:ring-blue-500 focus:ring-2;
  }
  
  .custom-checkbox:checked {
    @apply bg-blue-600 border-blue-600;
  }
  
  /* Custom radio button */
  .custom-radio {
    @apply w-4 h-4 border border-gray-300 rounded-full 
           text-blue-600 focus:ring-blue-500 focus:ring-2;
  }
  
  .custom-radio:checked {
    @apply bg-blue-600 border-blue-600;
  }
}
```

### Complex Selectors

```css
/* Complex selector patterns */
@layer components {
  /* Nested selectors */
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
  
  .card:hover .card-title {
    @apply text-blue-600;
  }
  
  .card:hover .card-description {
    @apply text-gray-600;
  }
  
  /* Adjacent selectors */
  .form-group + .form-group {
    @apply mt-4;
  }
  
  /* Attribute selectors */
  input[type="email"] {
    @apply border-blue-300 focus:border-blue-500;
  }
  
  input[type="password"] {
    @apply border-red-300 focus:border-red-500;
  }
  
  /* State-based selectors */
  .error-message {
    @apply text-red-600 text-sm mt-1 hidden;
  }
  
  .input-error + .error-message {
    @apply block;
  }
}
```

## CSS Custom Properties

### Dynamic Theming

```css
/* CSS custom properties for theming */
:root {
  --primary-h: 220;
  --primary-s: 90%;
  --primary-l: 56%;
  
  --primary-color: hsl(var(--primary-h), var(--primary-s), var(--primary-l));
  --primary-hover: hsl(var(--primary-h), var(--primary-s), calc(var(--primary-l) - 10%));
  --primary-active: hsl(var(--primary-h), var(--primary-s), calc(var(--primary-l) - 20%));
}

/* Use custom properties in components */
@layer components {
  .btn-primary {
    background-color: var(--primary-color);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 600;
    transition: background-color 0.2s;
  }
  
  .btn-primary:hover {
    background-color: var(--primary-hover);
  }
  
  .btn-primary:active {
    background-color: var(--primary-active);
  }
}
```

### Responsive Custom Properties

```css
/* Responsive custom properties */
@media (min-width: 768px) {
  :root {
    --font-size-base: 16px;
    --spacing-unit: 1rem;
  }
}

@media (min-width: 1024px) {
  :root {
    --font-size-base: 18px;
    --spacing-unit: 1.25rem;
  }
}

/* Use responsive properties */
.text-responsive {
  font-size: var(--font-size-base);
}

.spacing-responsive {
  padding: var(--spacing-unit);
}
```

## Browser-Specific Styles

### Vendor Prefixes

```css
/* Browser-specific styles */
@layer utilities {
  /* Backdrop filters with prefixes */
  .backdrop-blur-custom {
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
  
  /* Custom scrollbars */
  .scrollbar-custom {
    -webkit-overflow-scrolling: touch;
  }
  
  .scrollbar-custom::-webkit-scrollbar {
    width: 6px;
  }
  
  .scrollbar-custom::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  .scrollbar-custom::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  /* Touch device styles */
  @media (hover: none) {
    .hover-only {
      display: none;
    }
  }
}
```

### Progressive Enhancement

```css
/* Progressive enhancement with feature queries */
@layer components {
  /* Basic button */
  .btn-enhanced {
    @apply bg-blue-500 text-white px-4 py-2 rounded;
  }
  
  /* Enhanced with CSS Grid support */
  @supports (display: grid) {
    .btn-enhanced {
      display: grid;
      place-items: center;
    }
  }
  
  /* Enhanced with backdrop-filter support */
  @supports (backdrop-filter: blur(10px)) {
    .glass-effect {
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);
      @apply bg-white/20;
    }
  }
}
```

## Performance Optimization

### CSS Optimization

```css
/* Performance-optimized custom styles */
@layer utilities {
  /* Use transform instead of changing position */
  .slide-in {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .slide-in.active {
    transform: translateX(0);
  }
  
  /* Use opacity for fade effects */
  .fade-in {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .fade-in.active {
    opacity: 1;
  }
  
  /* Use will-change for animations */
  .animated-element {
    will-change: transform;
  }
  
  /* Contain paint for complex elements */
  .complex-component {
    contain: paint;
  }
}
```

### Critical CSS

```css
/* Critical CSS for above-the-fold content */
@layer base {
  /* Critical typography */
  body {
    @apply text-gray-900 bg-white;
    font-family: system-ui, sans-serif;
    line-height: 1.6;
  }
  
  h1 {
    @apply text-3xl font-bold;
  }
  
  /* Critical layout */
  .container {
    @apply max-w-7xl mx-auto px-4;
  }
  
  /* Critical components */
  .btn {
    @apply px-4 py-2 rounded font-medium;
  }
}
```

## Framework Integration

### Svelte Integration

```svelte
<!-- CustomButton.svelte -->
<style lang="postcss">
  @reference "../app.css";
  
  .custom-button {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded;
    transition: all 0.2s ease;
  }
  
  .custom-button:active {
    transform: scale(0.98);
  }
  
  /* Scoped custom styles */
  .icon {
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
  }
</style>

<button class="custom-button" on:click>
  <slot name="icon" class="icon" />
  <slot />
</button>
```

### React Integration

```jsx
// CustomButton.jsx
import './CustomButton.css';

const CustomButton = ({ children, variant = 'primary' }) => {
  return (
    <button className={`btn btn-${variant}`}>
      {children}
    </button>
  );
};

export default CustomButton;
```

```css
/* CustomButton.css */
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
  
  .btn-outline {
    @apply border border-gray-300 hover:bg-gray-50 text-gray-700;
  }
}
```

## Best Practices

### 1. Use CSS Layers

```css
/* Good: Organized with layers */
@layer base {
  /* Base styles */
}

@layer components {
  /* Component styles */
}

@layer utilities {
  /* Utility styles */
}

/* Avoid: Unorganized CSS */
.btn { /* ... */ }
.card { /* ... */ }
```

### 2. Keep Custom Styles Minimal

```css
/* Good: Minimal custom CSS */
.custom-component {
  @apply bg-white rounded-lg shadow-md;
  /* Only what utilities can't do */
  backdrop-filter: blur(10px);
}

/* Avoid: Over-customization */
.custom-component {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin: 0.5rem;
  /* All of this could be utilities */
}
```

### 3. Document Complex Styles

```css
/* Custom animations for loading spinner */
@layer utilities {
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .spinner {
    /* Custom animation for loading state */
    animation: spin 1s linear infinite;
    
    /* Ensure smooth animation */
    transform-origin: center;
    
    /* Performance optimization */
    will-change: transform;
  }
}
```

### 4. Test Across Browsers

```css
/* Cross-browser compatible styles */
@layer components {
  .flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
    
    /* Fallback for older browsers */
    display: -webkit-box;
    -webkit-box-align: center;
    -webkit-box-pack: center;
  }
}
```

## Resources

- [Tailwind CSS functions and directives](https://tailwindcss.com/docs/functions-and-directives)
- [CSS layers documentation](https://tailwindcss.com/docs/adding-custom-styles#using-css-layers)
- [Performance optimization guide](https://tailwindcss.com/docs/optimizing-for-production)
- [Browser compatibility guide](https://tailwindcss.com/docs/browser-support)
