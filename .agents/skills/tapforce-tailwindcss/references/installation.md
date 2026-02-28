# Tailwind CSS Installation Guide

This guide provides detailed installation instructions for Tailwind CSS ^4 based on project type.

## Installation Methods

### 1. Vite Projects

**Documentation**: https://tailwindcss.com/docs/installation/using-vite

**Installation steps:**
```bash
# Install Tailwind CSS and dependencies
pnpm add -D tailwindcss@^4.0.0

# Create CSS file
echo '@import "tailwindcss";' > src/app.css

# Import CSS in main entry point
# For main.js: import './app.css'
# For main.ts: import './app.css'
```

**Configuration:**
```javascript
// vite.config.js
export default {
  css: {
    postcss: {
      plugins: [
        // No additional plugins needed for Tailwind CSS ^4
      ],
    },
  },
}
```

### 2. PostCSS Projects

**Documentation**: https://tailwindcss.com/docs/installation/using-postcss

**Installation steps:**
```bash
# Install Tailwind CSS
pnpm add -D tailwindcss@^4.0.0

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    // Tailwind CSS ^4 works without additional plugins
  },
}
EOF

# Create CSS file
echo '@import "tailwindcss";' > src/app.css
```

### 3. Tailwind CLI

**Documentation**: https://tailwindcss.com/docs/installation/tailwind-cli

**Installation steps:**
```bash
# Install Tailwind CSS
pnpm add -D tailwindcss@^4.0.0

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,svelte,ts,jsx,tsx}",
  ],
}
EOF

# Build CSS
npx tailwindcss -i ./src/app.css -o ./dist/output.css --watch
```

### 4. Framework Guides

**Documentation**: https://tailwindcss.com/docs/installation/framework-guides

#### SvelteKit

**Installation:**
```bash
# Create new SvelteKit project
pnpm dlx sv create my-project --install pnpm
cd my-project

# Install Tailwind CSS
pnpm add -D tailwindcss@^4.0.0

# Create app.css
echo '@import "tailwindcss";' > src/app.css

# Import in app.html
# Add: <link rel="stylesheet" href="%sveltekit.assets%/app.css" />
```

#### Next.js

**Installation:**
```bash
# Create new Next.js project
pnpm create next-app@latest my-project
cd my-project

# Install Tailwind CSS
pnpm add -D tailwindcss@^4.0.0 postcss

# Create app.css
echo '@import "tailwindcss";' > src/app.css

# Import in layout
# Add: import './app.css' to your layout component
```

#### Nuxt.js

**Installation:**
```bash
# Create new Nuxt project
pnpm create nuxt@latest my-project
cd my-project

# Install Tailwind CSS
pnpm add -D tailwindcss@^4.0.0

# Configure nuxt.config.ts
cat > nuxt.config.ts << 'EOF'
export default defineNuxtConfig({
  css: ['~/app.css'],
})
EOF

# Create app.css
echo '@import "tailwindcss";' > app.css
```

### 5. Play CDN

**Documentation**: https://tailwindcss.com/docs/installation/play-cdn

**Usage:**
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {},
      }
    }
  </script>
</head>
<body>
  <h1 class="text-3xl font-bold text-blue-600">
    Hello Tailwind CSS!
  </h1>
</body>
</html>
```

## Project Setup Preferences

### Preferred Stack

For best practices, use this stack:
- **Node.js**: ^20.0.0
- **Package Manager**: pnpm ^10.0.0
- **Framework**: SvelteKit (default if not specified)
- **CSS Framework**: Tailwind CSS ^4.0.0

### Alternative Frameworks

If user specifies a different framework:
- **Next.js**: React-based, excellent for SSR
- **Nuxt.js**: Vue-based, great for SEO
- **Vite**: Generic, framework-agnostic
- **Astro**: Content-focused, multiple frameworks

## Verification Steps

After installation:

1. **Check Tailwind version:**
```bash
npx tailwindcss --version
# Should output 4.x.x
```

2. **Test basic utilities:**
```html
<div class="bg-blue-500 text-white p-4 rounded">
  If this is blue with white text, Tailwind is working!
</div>
```

3. **Verify build process:**
```bash
# For Vite projects
pnpm run dev

# For Next.js projects
pnpm run dev

# For Tailwind CLI
npx tailwindcss -i ./src/app.css -o ./dist/output.css --watch
```

## Troubleshooting

### Common Issues

**Tailwind classes not working:**
- Check CSS file import
- Verify @import "tailwindcss" is present
- Ensure build process is running

**Version conflicts:**
- Remove old Tailwind versions
- Clear package cache: `pnpm store prune`
- Reinstall dependencies

**Build errors:**
- Check Node.js version (requires ^20.0.0)
- Verify pnpm version (requires ^10.0.0)
- Check for incompatible plugins

### Migration from Tailwind ^3

**Key changes:**
- Configuration moved to CSS file
- New @import syntax
- Updated plugin system
- Changed color format (HSL)

**Migration steps:**
1. Backup existing config
2. Update to Tailwind ^4
3. Migrate configuration to CSS
4. Update import statements
5. Test all utilities
