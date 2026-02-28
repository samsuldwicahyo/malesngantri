# Hover, Focus, and Other States

This guide covers how to use Tailwind CSS state variants for interactive and dynamic styling.

## State Variants Overview

Tailwind provides prefixes to style elements based on their state, such as hover, focus, active, and more.

## Interactive States

### Hover State

```html
<!-- Basic hover -->
<button class="bg-blue-500 hover:bg-blue-600 text-white">
  Hover me
</button>

<!-- Multiple hover effects -->
<button class="bg-blue-500 hover:bg-blue-600 hover:scale-105 text-white transition-all">
  Scale on hover
</button>

<!-- Hover on child elements -->
<div class="group">
  <p class="text-gray-600 group-hover:text-blue-600">
    Text changes on parent hover
  </p>
</div>
```

### Focus State

```html
<!-- Focus styles for inputs -->
<input class="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
       type="text" placeholder="Focus me">

<!-- Focus styles for buttons -->
<button class="bg-blue-500 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
  Focus button
</button>

<!-- Focus visible (only when keyboard focused) -->
<button class="focus-visible:ring-2 focus-visible:ring-blue-500">
  Keyboard focus only
</button>
```

### Active State

```html
<!-- Active (mouse down) state -->
<button class="bg-blue-500 active:bg-blue-800 text-white">
  Press me
</button>

<!-- Active with transform -->
<button class="transform active:scale-95">
  Press effect
</button>
```

## Form States

### Focus States

```html
<!-- Form input states -->
<input class="border border-gray-300 rounded-md px-3 py-2 
               focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
               focus:outline-none" 
       type="text" placeholder="Email">

<!-- Textarea focus -->
<textarea class="border border-gray-300 rounded-md px-3 py-2 
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
          placeholder="Message"></textarea>
```

### Disabled State

```html
<!-- Disabled button -->
<button class="bg-blue-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed">
  Disabled Button
</button>

<!-- Disabled input -->
<input class="border border-gray-300 disabled:bg-gray-100 disabled:text-gray-500" 
       type="text" disabled placeholder="Disabled input">
```

### Required and Invalid States

```html
<!-- Required input -->
<input class="border border-gray-300 required:border-red-500" 
       type="email" required placeholder="Required email">

<!-- Invalid state -->
<input class="border border-gray-300 invalid:border-red-500 invalid:text-red-600" 
       type="email" placeholder="Invalid style">
```

## Browser and Device States

### Dark Mode

```html
<!-- Dark mode variants -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Adaptive content
</div>

<!-- Dark mode with preferences -->
<button class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
  Dark mode button
</button>
```

### Reduced Motion

```html
<!-- Respect user motion preferences -->
<div class="transform motion-safe:hover:scale-105">
  Only animates if user prefers motion
</div>

<div class="motion-reduce:transform-none">
  Disable animations for users who prefer reduced motion
</div>
```

### Print Styles

```html
<!-- Print-specific styles -->
<div class="text-gray-600 print:text-black">
  Different color when printing
</div>

<div class="hidden print:block">
  Only visible when printing
</div>
```

## Positional States

### Group States

```html
<!-- Parent hover affects children -->
<div class="group">
  <div class="bg-gray-200 group-hover:bg-blue-200">
    Changes on parent hover
  </div>
  <div class="text-gray-600 group-hover:text-blue-600">
    Text changes on parent hover
  </div>
</div>

<!-- Group focus -->
<div class="group">
  <input class="group-focus:border-blue-500" type="text">
  <label class="group-focus:text-blue-600">Label changes on input focus</label>
</div>
```

### Peer States

```html
<!-- Peer states (sibling relationships) -->
<div class="space-y-2">
  <input class="peer" type="checkbox" id="checkbox">
  <label class="peer-checked:text-blue-600 peer-checked:font-bold" for="checkbox">
    Check me to change label style
  </label>
</div>

<!-- Peer invalid -->
<div class="space-y-2">
  <input class="peer" type="email" id="email" required>
  <label class="peer-invalid:text-red-600" for="email">
    Email (invalid state affects label)
  </label>
</div>
```

## Media Query States

### Responsive Variants

```html
<!-- Responsive hover states -->
<button class="bg-blue-500 hover:bg-blue-600 md:hover:bg-blue-700 lg:hover:bg-blue-800">
  Different hover effects at different breakpoints
</button>

<!-- Responsive focus -->
<input class="focus:ring-2 md:focus:ring-4 lg:focus:ring-8 focus:ring-blue-300">
  Different ring sizes at different breakpoints
</button>
```

### Orientation States

```html
<!-- Landscape vs portrait -->
<div class="landscape:flex landscape:justify-center">
  Flex layout in landscape mode
</div>

<div class="portrait:block portrait:text-center">
  Block layout in portrait mode
</div>
```

## Complex State Combinations

### Multiple States

```html
<!-- Hover and focus together -->
<button class="bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:ring-2 focus:ring-blue-300">
  Multiple states
</button>

<!-- Dark mode with hover -->
<div class="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
  Hover in both light and dark modes
</button>

<!-- Responsive states -->
<button class="bg-blue-500 hover:bg-blue-600 md:bg-green-500 md:hover:bg-green-600">
  Different base and hover colors at different breakpoints
</button>
```

### State Stacking

```html
<!-- Stacked state variants -->
<div class="group">
  <button class="bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 
                 group-hover:bg-red-500 group-hover:hover:bg-red-600">
    Complex state interactions
  </button>
</div>
```

## Form Validation States

### HTML5 Validation

```html
<!-- Form with validation states -->
<form class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-gray-700">Email</label>
    <input class="border border-gray-300 rounded-md px-3 py-2 
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                   invalid:border-red-500 invalid:text-red-600" 
           type="email" required placeholder="Enter your email">
    <p class="text-red-600 text-sm mt-1 hidden peer-invalid:block">
      Please enter a valid email address
    </p>
  </div>
  
  <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
    Submit
  </button>
</form>
```

### Custom Validation

```html
<!-- Custom validation with JavaScript -->
<div class="space-y-2">
  <input class="border border-gray-300 rounded-md px-3 py-2 
                 data-invalid:border-red-500 data-invalid:text-red-600" 
         type="text" id="custom-input">
  <p class="text-red-600 text-sm hidden" id="error-message">
    Custom error message
  </p>
</div>
```

## Accessibility Considerations

### Focus Management

```html
<!-- Ensure focus indicators are visible -->
<button class="bg-blue-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2">
  Accessible focus styles
</button>

<!-- Skip links -->
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-500 text-white px-4 py-2 rounded">
  Skip to main content
</a>
```

### Reduced Motion Support

```html
<!-- Respect motion preferences -->
<div class="transform transition-transform motion-safe:hover:scale-105 motion-reduce:transform-none">
  Scales on hover only if user prefers motion
</div>

<!-- Animations with reduced motion -->
<div class="animate-spin motion-reduce:animate-none">
  Spinning animation that stops for reduced motion users
</div>
```

## Best Practices

### 1. Always Provide Focus Indicators

```html
<!-- Good: Clear focus styles -->
<button class="bg-blue-500 focus:ring-2 focus:ring-blue-300 focus:ring-offset-2">
  Clear focus indicator
</button>

<!-- Avoid: No focus styles -->
<button class="bg-blue-500 focus:outline-none">
  No focus indicator (bad for accessibility)
</button>
```

### 2. Use Semantic State Variants

```html
<!-- Good: Semantic use of states -->
<input class="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
  Focus indicates interactive state

<!-- Avoid: Arbitrary state use -->
<div class="hover:bg-blue-500">
  Hover on non-interactive element (confusing)
</div>
```

### 3. Consider Dark Mode

```html
<!-- Good: Dark mode variants -->
<button class="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700">
  Works in both light and dark modes
</button>

<!-- Avoid: Light mode only -->
<button class="bg-blue-500 hover:bg-blue-600">
  May not work well in dark mode
</button>
```

### 4. Test State Transitions

```html
<!-- Good: Smooth transitions -->
<button class="bg-blue-500 hover:bg-blue-600 transition-colors duration-200">
  Smooth color transition
</button>

<!-- Avoid: Abrupt changes -->
<button class="bg-blue-500 hover:bg-blue-600">
  Abrupt color change
</button>
```

## Advanced Patterns

### State-Based Component Variants

```html
<!-- Button with multiple states -->
<button class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 
               focus:bg-blue-700 focus:ring-2 focus:ring-blue-300
               disabled:bg-gray-300 disabled:cursor-not-allowed
               transition-colors duration-200">
  Comprehensive state handling
</button>
```

### Interactive Card Components

```html
<!-- Card with hover effects -->
<div class="bg-white rounded-lg shadow-md hover:shadow-lg 
               transform hover:scale-105 transition-all duration-200">
  <img class="w-full h-48 object-cover rounded-t-lg" src="/image.jpg">
  <div class="p-6">
    <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
      Card Title
    </h3>
    <p class="text-gray-600 mt-2">
      Card description with hover effects
    </p>
  </div>
</div>
```

## Resources

- [Tailwind CSS state documentation](https://tailwindcss.com/docs/hover-focus-and-other-states)
- [Dark mode documentation](https://tailwindcss.com/docs/dark-mode)
- [Responsive design documentation](https://tailwindcss.com/docs/responsive-design)
- [Accessibility guide](https://tailwindcss.com/docs/accessibility)
