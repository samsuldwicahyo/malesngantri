---
name: arbitrary-values
description: Rules for using arbitrary values when built-in Tailwind utilities are insufficient
---

# Arbitrary Values Rule

## Description

When UI needs customization that Tailwind's built-in classes don't support, use arbitrary values to write custom styles while maintaining the utility-first approach.

## Guidelines

### Use Arbitrary Values For

- Custom spacing not in the default scale
- Specific colors not in the palette
- Custom font sizes or weights
- Unique dimensions or positions
- Custom animation durations or delays

### Syntax Patterns

**Square bracket notation:**
```html
<!-- Custom spacing -->
<div class="p-[7px] m-[3.5rem]">

<!-- Custom colors -->
<div class="bg-[#1a1a1a] text-[rgb(255,255,255)]">

<!-- Custom dimensions -->
<div class="w-[350px] h-[calc(100vh-200px)]">

<!-- Custom properties -->
<div class="opacity-[0.75] scale-[1.1]">
```

**Property modifiers:**
```html
<!-- CSS custom properties -->
<div class="bg-[var(--custom-color)]">

<!-- calc() functions -->
<div class="w-[calc(100%-2rem)]">

<!-- CSS functions -->
<div class="text-[hsl(200,100%,50%)]">
```

### Examples

**Custom spacing:**
```html
<div class="p-[2.5rem] mb-[18px] gap-[7px]">
  <!-- Content with non-standard spacing -->
</div>
```

**Custom colors:**
```html
<button class="bg-[#6366f1] hover:bg-[#4f46e5] text-[#f8fafc]">
  Custom branded button
</button>
```

**Custom typography:**
```html
<h1 class="text-[2.125rem] leading-[1.2] font-[450]">
  Custom heading specifications
</h1>
```

**Custom animations:**
```html
<div class="animate-[bounce_1s_ease-in-out_infinite]">
  <!-- Custom animation timing -->
</div>
```

## Best Practices

- Use arbitrary values sparingly - prefer built-in utilities when possible
- Document frequently used arbitrary values in component libraries
- Consider adding custom values to tailwind.config.js for reuse
- Use semantic class names when combining multiple arbitrary values
- Test arbitrary values across different browsers for compatibility

## When to Avoid

- When built-in utilities provide equivalent functionality
- For complex multi-property styles (consider @utility instead)
- When performance is critical (arbitrary values can increase CSS size)
