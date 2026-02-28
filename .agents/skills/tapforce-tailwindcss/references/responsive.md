# Responsive Design

This guide covers how to create responsive designs using Tailwind CSS breakpoint utilities.

## Breakpoint System

Tailwind CSS uses a mobile-first responsive design approach with these breakpoints:

| Breakpoint | Min-width | CSS media query |
|------------|-----------|-----------------|
| `sm`       | 640px     | `(min-width: 640px)` |
| `md`       | 768px     | `(min-width: 768px)` |
| `lg`       | 1024px    | `(min-width: 1024px)` |
| `xl`       | 1280px    | `(min-width: 1280px)` |
| `2xl`      | 1536px    | `(min-width: 1536px)` |

## Mobile-First Approach

Tailwind uses a mobile-first approach, meaning unprefixed utilities apply to all screen sizes, and prefixed utilities override at larger breakpoints.

```html
<!-- Mobile-first responsive text -->
<h1 class="text-xl md:text-2xl lg:text-3xl xl:text-4xl">
  Responsive heading
</h1>

<!-- Mobile-first responsive layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- 1 column on mobile, 2 on tablet, 3 on desktop -->
</div>
```

## Responsive Utilities

### Responsive Spacing

```html
<!-- Responsive padding -->
<div class="p-4 md:p-6 lg:p-8">
  Padding increases with screen size
</div>

<!-- Responsive margins -->
<div class="m-2 md:m-4 lg:m-6">
  Margins increase with screen size
</div>

<!-- Responsive gaps -->
<div class="grid grid-cols-2 gap-2 md:gap-4 lg:gap-6">
  Grid gaps increase with screen size
</div>
```

### Responsive Layout

```html
<!-- Responsive flex direction -->
<div class="flex flex-col md:flex-row">
  <div class="flex-1">Column on mobile, row on desktop</div>
  <div class="flex-1">Column on mobile, row on desktop</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  <!-- 1, 2, 3, 4 columns across breakpoints -->
</div>

<!-- Responsive container -->
<div class="container mx-auto px-4 sm:px-6 lg:px-8">
  Responsive container padding
</div>
```

### Responsive Typography

```html
<!-- Responsive font sizes -->
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Responsive heading
</h1>

<p class="text-sm sm:text-base md:text-lg">
  Responsive paragraph text
</p>

<!-- Responsive font weights -->
<p class="font-normal md:font-semibold lg:font-bold">
  Responsive font weight
</p>
```

### Responsive Colors and Effects

```html
<!-- Responsive colors -->
<div class="bg-gray-100 sm:bg-gray-200 md:bg-gray-300">
  Background changes with screen size
</div>

<!-- Responsive shadows -->
<div class="shadow-sm md:shadow lg:shadow-lg">
  Shadow increases with screen size
</div>

<!-- Responsive borders -->
<div class="border-2 md:border-4 lg:border-8">
  Border width increases with screen size
</div>
```

## Common Responsive Patterns

### Responsive Navigation

```html
<!-- Mobile hamburger, desktop horizontal nav -->
<nav class="bg-white shadow-lg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <h1 class="text-xl font-bold">Logo</h1>
      </div>
      
      <!-- Mobile menu button -->
      <div class="flex items-center md:hidden">
        <button class="text-gray-500 hover:text-gray-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <!-- Desktop menu -->
      <div class="hidden md:flex items-center space-x-8">
        <a href="#" class="text-gray-700 hover:text-blue-600">Home</a>
        <a href="#" class="text-gray-700 hover:text-blue-600">About</a>
        <a href="#" class="text-gray-700 hover:text-blue-600">Services</a>
      </div>
    </div>
  </div>
</nav>
```

### Responsive Card Grid

```html
<!-- Responsive card layout -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold mb-2">Card 1</h3>
    <p class="text-gray-600">Responsive card content</p>
  </div>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold mb-2">Card 2</h3>
    <p class="text-gray-600">Responsive card content</p>
  </div>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold mb-2">Card 3</h3>
    <p class="text-gray-600">Responsive card content</p>
  </div>
</div>
```

### Responsive Hero Section

```html
<!-- Responsive hero section -->
<section class="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
  <div class="container mx-auto px-4 py-16 sm:py-20 md:py-24 lg:py-32">
    <div class="text-center">
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
        Responsive Hero Title
      </h1>
      <p class="text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
        Responsive hero description that adapts to screen size
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
          Primary Action
        </button>
        <button class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
          Secondary Action
        </button>
      </div>
    </div>
  </div>
</section>
```

### Responsive Sidebar Layout

```html
<!-- Responsive sidebar and main content -->
<div class="flex flex-col md:flex-row min-h-screen">
  <!-- Sidebar -->
  <aside class="w-full md:w-64 bg-gray-800 text-white p-6">
    <h2 class="text-xl font-bold mb-6">Sidebar</h2>
    <nav class="space-y-2">
      <a href="#" class="block py-2 px-3 rounded hover:bg-gray-700">Dashboard</a>
      <a href="#" class="block py-2 px-3 rounded hover:bg-gray-700">Profile</a>
      <a href="#" class="block py-2 px-3 rounded hover:bg-gray-700">Settings</a>
    </nav>
  </aside>
  
  <!-- Main content -->
  <main class="flex-1 bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-bold mb-6">Main Content</h1>
      <div class="bg-white rounded-lg shadow-md p-6">
        <p class="text-gray-700">Content area that adapts to screen size</p>
      </div>
    </div>
  </main>
</div>
```

## Advanced Responsive Techniques

### Responsive Display Utilities

```html
<!-- Show/hide elements at different breakpoints -->
<div class="hidden md:block">
  Only visible on medium screens and up
</div>

<div class="block md:hidden">
  Only visible on mobile screens
</div>

<div class="hidden lg:block xl:hidden">
  Only visible on large screens
</div>
```

### Responsive Positioning

```html
<!-- Responsive positioning -->
<div class="relative static md:absolute md:top-0 md:right-0">
  Static on mobile, absolute on desktop
</div>

<!-- Responsive z-index -->
<div class="z-10 md:z-20 lg:z-30">
  Z-index changes with screen size
</div>
```

### Responsive Transforms

```html
<!-- Responsive transforms -->
<div class="transform scale-75 md:scale-100 lg:scale-110">
  Scale changes with screen size
</div>

<!-- Responsive rotations -->
<div class="transform rotate-0 md:rotate-45 lg:rotate-90">
  Rotation changes with screen size
</div>
```

## Container Utilities

### Responsive Containers

```html
<!-- Responsive container with max-widths -->
<div class="container mx-auto px-4">
  <div class="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
    Content with responsive max-width
  </div>
</div>

<!-- Fixed container sizes -->
<div class="container-sm mx-auto">Small container</div>
<div class="container-md mx-auto">Medium container</div>
<div class="container-lg mx-auto">Large container</div>
<div class="container-xl mx-auto">Extra large container</div>
```

## Best Practices

### 1. Start Mobile-First

```html
<!-- Good: Mobile-first approach -->
<div class="text-center md:text-left">
  Centered on mobile, left-aligned on desktop
</div>

<!-- Avoid: Desktop-first approach -->
<div class="text-left md:text-center">
  Left-aligned on mobile, centered on desktop (less intuitive)
</div>
```

### 2. Use Semantic Breakpoints

```html
<!-- Good: Logical breakpoint usage -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns -->
</div>

<!-- Avoid: Arbitrary breakpoint usage -->
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
  <!-- Large gap between tablet and desktop layouts -->
</div>
```

### 3. Maintain Consistency

```html
<!-- Good: Consistent responsive pattern -->
<div class="p-4 md:p-6 lg:p-8">
  <h2 class="text-lg md:text-xl lg:text-2xl">
    Consistent scaling across elements
  </h2>
</div>

<!-- Avoid: Inconsistent scaling -->
<div class="p-4 md:p-8 lg:p-6">
  <h2 class="text-lg md:text-2xl lg:text-xl">
    Inconsistent scaling
  </h2>
</div>
```

### 4. Test Across Breakpoints

```html
<!-- Good: Well-tested responsive design -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <!-- Tested at all breakpoints -->
</div>

<!-- Ensure content works at all sizes -->
<div class="text-sm md:text-base lg:text-lg">
  Text remains readable at all screen sizes
</div>
```

## Responsive Debugging

### Visualizing Breakpoints

```html
<!-- Development helper to show current breakpoint -->
<div class="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded text-sm">
  <span class="block sm:hidden">Mobile</span>
  <span class="hidden sm:block md:hidden">Tablet</span>
  <span class="hidden md:block lg:hidden">Desktop</span>
  <span class="hidden lg:block xl:hidden">Large</span>
  <span class="hidden xl:block">Extra Large</span>
</div>
```

### Responsive Testing Tools

```html
<!-- Responsive testing container -->
<div class="border-2 border-dashed border-gray-300">
  <div class="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
    <div class="bg-gray-100 p-4">
      <p class="text-center text-sm text-gray-600">
        Responsive testing area
      </p>
    </div>
  </div>
</div>
```

## Resources

- [Tailwind CSS responsive documentation](https://tailwindcss.com/docs/responsive-design)
- [Breakpoint system reference](https://tailwindcss.com/docs/breakpoint-system)
- [Responsive design best practices](https://tailwindcss.com/docs/responsive-design#mobile-first)
- [Container utilities](https://tailwindcss.com/docs/container)
