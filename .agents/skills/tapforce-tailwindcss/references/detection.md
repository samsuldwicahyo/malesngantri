# Detecting Classes in Source Files

This guide covers how Tailwind CSS detects and processes utility classes in your source files.

## Content Detection Overview

Tailwind CSS automatically scans your source files to find utility classes and generates only the CSS you actually use. This keeps your final CSS bundle small and efficient.

## Default Content Sources

### Automatic Detection

Tailwind CSS ^4 automatically scans these file types:

```javascript
// Default scan patterns (handled automatically)
[
  '**/*.html',
  '**/*.js',
  '**/*.ts',
  '**/*.jsx',
  '**/*.tsx',
  '**/*.svelte',
  '**/*.vue',
  '**/*.md',
  '**/*.mdx'
]
```

### Content Configuration

For custom configuration, you can specify content sources:

```css
/* app.css */
@import "tailwindcss";

/* Content detection configuration */
@config "./tailwind.config.js";
```

```javascript
// tailwind.config.js (if needed)
export default {
  content: [
    './src/**/*.{html,js,svelte,ts,jsx,tsx}',
    './pages/**/*.{html,js,svelte,ts,jsx,tsx}',
    './components/**/*.{html,js,svelte,ts,jsx,tsx}',
  ],
}
```

## Class Detection Patterns

### Standard Class Detection

Tailwind detects classes in these contexts:

```html
<!-- HTML attributes -->
<div class="bg-blue-500 text-white p-4">Content</div>

<!-- Template literals -->
<div class={`${isActive ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>
  Dynamic classes
</div>

<!-- JavaScript variables -->
<script>
  const buttonClass = 'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded';
</script>
```

### Dynamic Class Detection

```javascript
// JavaScript/TypeScript
// Template literals
const classes = `bg-blue-500 text-white p-4 rounded-lg`;

// String concatenation
const buttonClass = 'bg-blue-500 hover:bg-blue-600 ' + 'text-white font-bold';

// Array joining
const cardClasses = [
  'bg-white',
  'rounded-lg',
  'shadow-md',
  'p-6'
].join(' ');

// Conditional classes
const isActive = true;
const classes = `btn ${isActive ? 'bg-blue-500' : 'bg-gray-500'}`;
```

```jsx
// React JSX
function Button({ variant, children }) {
  const baseClasses = 'px-4 py-2 rounded font-medium';
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
  };
  
  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
}
```

```svelte
<!-- Svelte components -->
<script>
  export let variant = 'primary';
  
  $: buttonClass = [
    'px-4 py-2 rounded font-medium',
    variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600 text-white' : '',
    variant === 'secondary' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : ''
  ].filter(Boolean).join(' ');
</script>

<button class={buttonClass}>
  <slot />
</button>
```

## Advanced Detection Techniques

### Class Name Extraction

```javascript
// Complex class extraction
function getButtonClasses(size, variant, disabled) {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };
  
  const states = {
    disabled: 'opacity-50 cursor-not-allowed'
  };
  
  return [
    sizes[size],
    variants[variant],
    disabled ? states.disabled : ''
  ].filter(Boolean).join(' ');
}

// Usage
const buttonClasses = getButtonClasses('md', 'primary', false);
// Result: "px-4 py-2 text-base bg-blue-500 hover:bg-blue-600 text-white"
```

### Framework-Specific Patterns

#### Vue.js

```vue
<template>
  <button :class="buttonClasses">
    {{ text }}
  </button>
</template>

<script>
export default {
  props: {
    variant: String,
    size: String
  },
  computed: {
    buttonClasses() {
      return [
        'px-4 py-2 rounded font-medium',
        this.variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600 text-white' : '',
        this.size === 'large' ? 'px-6 py-3 text-lg' : ''
      ].filter(Boolean).join(' ');
    }
  }
}
</script>
```

#### Angular

```typescript
// component.ts
@Component({
  selector: 'app-button',
  template: `
    <button [class]="buttonClasses">
      {{ text }}
    </button>
  `
})
export class ButtonComponent {
  @Input() variant = 'primary';
  @Input() size = 'medium';
  
  get buttonClasses(): string {
    const baseClasses = 'px-4 py-2 rounded font-medium';
    const variantClasses = this.variant === 'primary' 
      ? 'bg-blue-500 hover:bg-blue-600 text-white'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800';
    const sizeClasses = this.size === 'large' 
      ? 'px-6 py-3 text-lg'
      : '';
    
    return [baseClasses, variantClasses, sizeClasses].join(' ');
  }
}
```

## Content Configuration

### File Pattern Matching

```javascript
// tailwind.config.js
export default {
  content: [
    // Basic patterns
    './src/**/*.{html,js}',
    
    // Multiple directories
    './pages/**/*.{html,js}',
    './components/**/*.{html,js}',
    './layouts/**/*.{html,js}',
    
    // Specific files
    './index.html',
    './main.js',
    
    // Negation patterns
    './src/**/*.{html,js}',
    '!./src/vendor/**/*',
    
    // Complex patterns
    './src/**/*.{html,js,jsx,ts,tsx,svelte,vue}',
    './content/**/*.md',
    './scripts/**/*.js'
  ],
}
```

### Advanced Content Options

```javascript
// tailwind.config.js
export default {
  content: [
    {
      // Raw content
      raw: '<div class="bg-blue-500 text-white p-4">Hello</div>',
      extension: 'html'
    },
    {
      // Custom extraction
      content: () => {
        return fs.readFileSync('./dynamic-classes.txt', 'utf8');
      },
      extension: 'js'
    }
  ],
}
```

## Class Extraction Issues

### Common Detection Problems

#### Dynamic Class Generation

```javascript
// Problem: Classes generated at runtime
function generateClasses(color) {
  return `bg-${color}-500 text-white`;
}

// Solution: Use predefined class sets
const colorClasses = {
  blue: 'bg-blue-500 text-white',
  red: 'bg-red-500 text-white',
  green: 'bg-green-500 text-white'
};

function getClasses(color) {
  return colorClasses[color] || 'bg-gray-500 text-white';
}
```

#### String Concatenation

```javascript
// Problem: Classes built from variables
const prefix = 'bg-';
const color = 'blue';
const suffix = '-500';
const classes = prefix + color + suffix; // "bg-blue-500"

// Solution: Use complete class names
const classes = 'bg-blue-500';
```

#### External Class Sources

```javascript
// Problem: Classes from external sources
const externalClasses = getClassesFromAPI(); // Not detected

// Solution: Include external sources in content
export default {
  content: [
    './src/**/*.{js,ts}',
    './external-classes.txt' // Include external class definitions
  ]
}
```

## Debugging Class Detection

### Verifying Detected Classes

```bash
# Check what classes are being generated
npx tailwindcss --help

# Build with verbose output
npx tailwindcss -i ./src/app.css -o ./dist/output.css --verbose

# Check content scanning
npx tailwindcss -i ./src/app.css -o ./dist/output.css --content "./src/**/*.{html,js}"
```

### Testing Class Extraction

```javascript
// Test class extraction
const testClasses = [
  'bg-blue-500',
  'text-white',
  'p-4',
  'rounded-lg',
  'hover:bg-blue-600'
];

// Verify classes are in final CSS
const css = fs.readFileSync('./dist/output.css', 'utf8');
testClasses.forEach(className => {
  if (css.includes(className)) {
    console.log(`✓ ${className} found in CSS`);
  } else {
    console.log(`✗ ${className} NOT found in CSS`);
  }
});
```

## Performance Optimization

### Content Scanning Optimization

```javascript
// Optimize content paths
export default {
  content: [
    // Be specific about what to scan
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{js,jsx,ts,tsx}',
    
    // Exclude unnecessary files
    '!./src/**/*.test.{js,jsx,ts,tsx}',
    '!./src/**/*.stories.{js,jsx,ts,tsx}',
    '!./src/vendor/**/*'
  ],
}
```

### Caching Strategy

```javascript
// Enable caching for faster builds
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  // Cache configuration
  cache: true
}
```

## Best Practices

### 1. Use Complete Class Names

```javascript
// Good: Complete class names
const buttonClass = 'bg-blue-500 hover:bg-blue-600 text-white';

// Avoid: Dynamic class generation
const buttonClass = `bg-${color}-500 hover:bg-${color}-600 text-white`;
```

### 2. Organize Class Logic

```javascript
// Good: Organized class utilities
const buttonVariants = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white'
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

function getButtonClasses(variant, size) {
  return `${buttonVariants[variant]} ${buttonSizes[size]}`;
}
```

### 3. Use Type Safety

```typescript
// TypeScript for class safety
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white'
};

function getButtonClasses(variant: ButtonVariant, size: ButtonSize): string {
  return `${buttonVariants[variant]} ${buttonSizes[size]}`;
}
```

### 4. Test Class Generation

```javascript
// Test that classes are detected
function testClassDetection() {
  const testElement = document.createElement('div');
  testElement.className = 'bg-blue-500 text-white p-4';
  
  const computedStyle = window.getComputedStyle(testElement);
  const backgroundColor = computedStyle.backgroundColor;
  
  console.log('Background color:', backgroundColor);
  // Should be rgb(59, 130, 246) for blue-500
}
```

## Resources

- [Tailwind CSS content configuration](https://tailwindcss.com/docs/content-configuration)
- [Optimizing for production](https://tailwindcss.com/docs/optimizing-for-production)
- [Controlling file size](https://tailwindcss.com/docs/optimizing-for-production#removing-unused-css)
- [Build performance](https://tailwindcss.com/docs/build-performance)
