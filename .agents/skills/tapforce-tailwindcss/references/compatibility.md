# Tailwind CSS ^4 Compatibility Guide

This guide covers the breaking changes and compatibility considerations when migrating to or using Tailwind CSS ^4.

## Breaking Changes from Tailwind ^3

### 1. Configuration Format

**Tailwind ^3:**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        brand: '#3b82f6',
      }
    }
  },
  plugins: [],
}
```

**Tailwind ^4:**
```css
/* app.css */
@import "tailwindcss";

@theme {
  --color-brand: #3b82f6;
}
```

### 2. CSS Import Syntax

**Tailwind ^3:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Tailwind ^4:**
```css
@import "tailwindcss";
```

### 3. Color Format Changes

**Tailwind ^3:**
- Used RGB format for colors
- Hex values in configuration

**Tailwind ^4:**
- Uses HSL format by default
- CSS custom properties approach

```css
/* HSL format */
:root {
  --color-blue-500: 220 90% 56%;
}
```

### 4. Plugin System

**Tailwind ^3:**
```javascript
module.exports = {
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

**Tailwind ^4:**
- Many plugins integrated into core
- Simplified plugin API
- CSS-first approach

### 5. Content Detection

**Tailwind ^3:**
```javascript
module.exports = {
  content: [
    './src/**/*.{html,js}',
    './pages/**/*.{html,js}',
  ],
}
```

**Tailwind ^4:**
- Automatic detection in most cases
- CSS-based configuration when needed
- Improved scanning algorithms

## Compatibility Checklist

### Before Migrating

1. **Check current Tailwind version:**
```bash
npm list tailwindcss
```

2. **Backup configuration:**
```bash
cp tailwind.config.js tailwind.config.js.backup
```

3. **Review custom plugins:**
- Check if plugins are still needed
- Verify plugin compatibility
- Test alternative approaches

### Migration Steps

1. **Update Tailwind CSS:**
```bash
pnpm add -D tailwindcss@^4.0.0
```

2. **Migrate configuration:**
```css
/* Move from tailwind.config.js to CSS */
@import "tailwindcss";

@theme {
  /* Custom theme values */
}
```

3. **Update CSS imports:**
```css
/* Replace @tailwind directives */
@import "tailwindcss";
```

4. **Test utilities:**
- Verify all custom utilities work
- Check responsive variants
- Test state variants

### Post-Migration Verification

1. **Build process:**
```bash
pnpm run build
```

2. **Development server:**
```bash
pnpm run dev
```

3. **Visual testing:**
- Check all UI components
- Verify responsive behavior
- Test interactive states

## Framework-Specific Compatibility

### SvelteKit

**Compatible features:**
- Vite integration
- PostCSS support
- CSS-in-JS components

**Migration notes:**
```css
/* src/app.css */
@import "tailwindcss";

@theme {
  --color-primary: 220 90% 56%;
}
```

### Next.js

**Compatible features:**
- CSS modules
- Server-side rendering
- Static generation

**Migration notes:**
```css
/* styles/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: 220 90% 56%;
}
```

### Nuxt.js

**Compatible features:**
- Vue integration
- SSR support
- Auto-imports

**Migration notes:**
```css
/* assets/app.css */
@import "tailwindcss";

@theme {
  --color-primary: 220 90% 56%;
}
```

## Known Issues and Solutions

### Issue 1: Custom Plugins Not Working

**Problem:** Third-party plugins from Tailwind ^3 don't work

**Solution:**
- Check if functionality is now built-in
- Use CSS-based alternatives
- Contact plugin maintainer for ^4 support

### Issue 2: Color Format Mismatch

**Problem:** Colors appear different after migration

**Solution:**
```css
/* Ensure consistent color format */
:root {
  --color-brand: 220 90% 56%; /* HSL format */
}
```

### Issue 3: Build Performance

**Problem:** Slower build times after migration

**Solution:**
- Optimize content detection
- Use CSS-based configuration
- Enable caching in build tools

### Issue 4: TypeScript Errors

**Problem:** Type definitions not working

**Solution:**
```bash
# Update TypeScript types
pnpm add -D @types/tailwindcss
```

## Browser Compatibility

### Supported Browsers

Tailwind CSS ^4 supports:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### CSS Feature Support

**Required features:**
- CSS custom properties
- HSL color format
- CSS calc() function
- Media queries

**Fallbacks:**
```css
/* Provide fallbacks for older browsers */
@supports not (color: hsl(0 0% 0%)) {
  .fallback {
    color: #000;
  }
}
```

## Performance Considerations

### Build Performance

**Improvements in ^4:**
- Faster content scanning
- Optimized CSS generation
- Better caching

**Best practices:**
- Use CSS-based configuration
- Limit content scanning scope
- Enable incremental builds

### Runtime Performance

**Optimizations:**
- Smaller CSS bundles
- Better tree-shaking
- Improved utility priority

## Testing Compatibility

### Unit Tests

```javascript
// Test custom utilities
test('custom utility works', () => {
  const element = document.createElement('div');
  element.className = 'btn-primary';
  expect(element).toHaveStyle({
    backgroundColor: 'rgb(59, 130, 246)',
  });
});
```

### Visual Regression Tests

```bash
# Use tools like Playwright or Cypress
pnpm add -D @playwright/test
```

### Integration Tests

```javascript
// Test framework integration
test('Tailwind works with Next.js', async () => {
  const page = await browser.newPage();
  await page.goto('/');
  await expect(page.locator('.text-blue-500')).toBeVisible();
});
```

## Resources

- [Official migration guide](https://tailwindcss.com/docs/upgrade-guide)
- [Breaking changes documentation](https://tailwindcss.com/docs/v4-beta)
- [Community discussions](https://github.com/tailwindlabs/tailwindcss/discussions)
- [Plugin compatibility list](https://tailwindcss.com/docs/v4-beta#plugins)
