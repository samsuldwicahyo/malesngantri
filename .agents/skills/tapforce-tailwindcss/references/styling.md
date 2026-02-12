# Styling with Utility Classes

This guide covers how to effectively use Tailwind CSS utility classes for styling components and layouts.

## Utility-First Philosophy

Tailwind CSS provides low-level utility classes that map directly to CSS properties. Instead of writing custom CSS, you compose these utilities to build designs.

## Basic Utility Categories

### Layout Utilities

**Display:**
```html
<div class="block">Block element</div>
<div class="inline">Inline element</div>
<div class="inline-block">Inline block</div>
<div class="flex">Flex container</div>
<div class="grid">Grid container</div>
<div class="hidden">Hidden element</div>
```

**Positioning:**
```html
<div class="static">Static positioning</div>
<div class="relative">Relative positioning</div>
<div class="absolute">Absolute positioning</div>
<div class="fixed">Fixed positioning</div>
<div class="sticky">Sticky positioning</div>
```

**Flexbox:**
```html
<div class="flex flex-row">Row direction</div>
<div class="flex flex-col">Column direction</div>
<div class="flex justify-center">Center horizontally</div>
<div class="flex items-center">Center vertically</div>
<div class="flex justify-between">Space between</div>
```

**Grid:**
```html
<div class="grid grid-cols-3">3 columns</div>
<div class="grid grid-rows-2">2 rows</div>
<div class="grid gap-4">Grid gap</div>
<div class="grid grid-cols-1 md:grid-cols-3">Responsive grid</div>
```

### Spacing Utilities

**Padding:**
```html
<div class="p-4">All sides padding</div>
<div class="px-4">Horizontal padding</div>
<div class="py-4">Vertical padding</div>
<div class="pt-4">Top padding</div>
<div class="pl-4">Left padding</div>
```

**Margin:**
```html
<div class="m-4">All sides margin</div>
<div class="mx-auto">Center horizontally</div>
<div class="my-4">Vertical margin</div>
<div class="mt-4">Top margin</div>
<div class="mb-4">Bottom margin</div>
```

**Gap (for flex/grid):**
```html
<div class="flex gap-4">Flex gap</div>
<div class="grid gap-4">Grid gap</div>
<div class="grid gap-x-4 gap-y-2">Different gaps</div>
```

### Sizing Utilities

**Width:**
```html
<div class="w-full">Full width</div>
<div class="w-1/2">50% width</div>
<div class="w-64">Fixed width (256px)</div>
<div class="w-auto">Auto width</div>
<div class="min-w-0">Min width 0</div>
```

**Height:**
```html
<div class="h-full">Full height</div>
<div class="h-screen">Viewport height</div>
<div class="h-64">Fixed height (256px)</div>
<div class="h-auto">Auto height</div>
```

### Typography Utilities

**Font Size:**
```html
<p class="text-xs">Extra small text</p>
<p class="text-sm">Small text</p>
<p class="text-base">Base text</p>
<p class="text-lg">Large text</p>
<p class="text-xl">Extra large text</p>
<p class="text-2xl">2XL text</p>
```

**Font Weight:**
```html
<p class="font-thin">Thin weight</p>
<p class="font-light">Light weight</p>
<p class="font-normal">Normal weight</p>
<p class="font-medium">Medium weight</p>
<p class="font-semibold">Semibold weight</p>
<p class="font-bold">Bold weight</p>
```

**Text Alignment:**
```html
<p class="text-left">Left aligned</p>
<p class="text-center">Center aligned</p>
<p class="text-right">Right aligned</p>
<p class="text-justify">Justified</p>
```

### Color Utilities

**Text Color:**
```html
<p class="text-red-500">Red text</p>
<p class="text-blue-600">Blue text</p>
<p class="text-green-700">Green text</p>
<p class="text-gray-900">Gray text</p>
```

**Background Color:**
```html
<div class="bg-red-500">Red background</div>
<div class="bg-blue-600">Blue background</div>
<div class="bg-green-700">Green background</div>
<div class="bg-gray-100">Light gray background</div>
```

**Border Color:**
```html
<div class="border border-red-500">Red border</div>
<div class="border-2 border-blue-600">Blue border</div>
<div class="border-t-4 border-green-700">Green top border</div>
```

### Border Utilities

**Border Width:**
```html
<div class="border">Default border</div>
<div class="border-2">2px border</div>
<div class="border-4">4px border</div>
<div class="border-8">8px border</div>
```

**Border Radius:**
```html
<div class="rounded">Rounded corners</div>
<div class="rounded-md">Medium rounded</div>
<div class="rounded-lg">Large rounded</div>
<div class="rounded-full">Fully rounded</div>
<div class="rounded-t-lg">Top rounded</div>
```

### Shadow Utilities

**Box Shadow:**
```html
<div class="shadow-sm">Small shadow</div>
<div class="shadow">Default shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
```

## Practical Examples

### Button Component

```html
<!-- Primary button -->
<button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
  Primary Button
</button>

<!-- Secondary button -->
<button class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded">
  Secondary Button
</button>

<!-- Outline button -->
<button class="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-semibold py-2 px-4 rounded">
  Outline Button
</button>
```

### Card Component

```html
<div class="bg-white rounded-lg shadow-md p-6 max-w-sm mx-auto">
  <div class="flex items-center mb-4">
    <img class="w-12 h-12 rounded-full mr-4" src="/avatar.jpg" alt="Avatar">
    <div>
      <h3 class="text-lg font-semibold text-gray-900">John Doe</h3>
      <p class="text-gray-600 text-sm">Software Engineer</p>
    </div>
  </div>
  <p class="text-gray-700 mb-4">
    This is a card component with utility classes for styling.
  </p>
  <div class="flex justify-between">
    <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
      Follow
    </button>
    <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded">
      Message
    </button>
  </div>
</div>
```

### Navigation Component

```html
<nav class="bg-white shadow-lg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <h1 class="text-xl font-bold text-gray-800">Logo</h1>
        </div>
        <div class="hidden sm:flex sm:ml-6 sm:space-x-8">
          <a href="#" class="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
            Home
          </a>
          <a href="#" class="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">
            About
          </a>
          <a href="#" class="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">
            Services
          </a>
        </div>
      </div>
      <div class="flex items-center">
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
          Sign In
        </button>
      </div>
    </div>
  </div>
</nav>
```

## Best Practices

### 1. Use Semantic Class Names

```html
<!-- Good: Descriptive utility combinations -->
<button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">
  Submit
</button>

<!-- Avoid: Random utility combinations -->
<button class="bg-blue-500 text-white px-4 py-2 font-bold hover:bg-blue-600 rounded">
  Submit
</button>
```

### 2. Group Related Utilities

```html
<!-- Good: Logical grouping -->
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <!-- Content -->
</div>

<!-- Avoid: Scattered utilities -->
<div class="p-4 flex bg-white items-center shadow-md justify-between rounded-lg">
  <!-- Content -->
</div>
```

### 3. Use Responsive Variants

```html
<!-- Responsive design -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards that adapt to screen size -->
</div>
```

### 4. Leverage State Variants

```html
<!-- Interactive states -->
<button class="bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 active:bg-blue-800 text-white transition-colors">
  Interactive Button
</button>
```

## Advanced Techniques

### Arbitrary Values

```html
<!-- Custom spacing -->
<div class="p-[7px] m-[3.5rem]">Custom spacing</div>

<!-- Custom colors -->
<div class="bg-[#1a1a1a] text-[rgb(255,255,255)]">Custom colors</div>

<!-- Custom sizes -->
<div class="w-[350px] h-[calc(100vh-200px)]">Custom dimensions</div>
```

### Important Modifier

```html
<!-- Override other styles -->
<div class="!mt-0">No margin top despite other styles</div>
```

### Stack Utilities

```html
<!-- Stack spacing for direct children -->
<div class="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<div class="space-x-2 flex">
  <button>Button 1</button>
  <button>Button 2</button>
  <button>Button 3</button>
</div>
```

## Common Patterns

### Centering Content

```html
<!-- Flex centering -->
<div class="flex items-center justify-center min-h-screen">
  <div class="text-center">Centered content</div>
</div>

<!-- Grid centering -->
<div class="grid place-items-center min-h-screen">
  <div class="text-center">Centered content</div>
</div>
```

### Aspect Ratios

```html
<!-- 16:9 aspect ratio -->
<div class="aspect-w-16 aspect-h-9">
  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" class="w-full h-full"></iframe>
</div>

<!-- Square aspect ratio -->
<div class="aspect-w-1 aspect-h-1">
  <img src="/image.jpg" class="w-full h-full object-cover">
</div>
```

### Truncating Text

```html
<!-- Single line truncation -->
<p class="truncate">This text will be truncated with an ellipsis if it's too long</p>

<!-- Multi-line truncation -->
<p class="line-clamp-3">This text will be truncated after 3 lines with an ellipsis</p>
```

## Resources

- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [Utility reference](https://tailwindcss.com/docs/utility-first-principles)
- [Responsive design](https://tailwindcss.com/docs/responsive-design)
- [Hover, focus, and other states](https://tailwindcss.com/docs/hover-focus-and-other-states)
