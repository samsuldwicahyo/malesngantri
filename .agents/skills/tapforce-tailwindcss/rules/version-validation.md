---
name: version-validation
description: Rules for validating Tailwind CSS ^4 installation and project compatibility
---

# Version Validation Rule

## Description

Validate that projects use Tailwind CSS ^4.0.0 and ensure compatibility with the project type. Refuse to continue if version requirements are not met.

## Validation Process

### 1. Check Existing Installation

**Check package.json for Tailwind CSS:**
```bash
# Check if Tailwind CSS is installed
grep -E "(tailwindcss|@tailwindcss)" package.json

# Check version specifically
grep -E "\"tailwindcss\":\s*\"[^\"]+" package.json
```

**Validate version format:**
```bash
# Acceptable versions
"tailwindcss": "^4.0.0"
"tailwindcss": "4.0.0"
"tailwindcss": "4.1.0"
"tailwindcss": "~4.0.0"

# Unacceptable versions
"tailwindcss": "^3.0.0"  # Too old
"tailwindcss": "2.0.0"   # Too old
"tailwindcss": "latest"  # Ambiguous
```

### 2. Project Type Compatibility

**Supported project types:**
- Vite-based projects
- PostCSS integration
- Tailwind CLI usage
- Framework integrations (SvelteKit, Next.js, Nuxt.js, etc.)
- Play CDN (for development/prototyping)

**Unsupported scenarios:**
- Projects without Node.js support
- Static sites without build process (except Play CDN)
- Legacy build tools not compatible with Tailwind ^4

### 3. Environment Requirements

**Node.js version:**
```bash
# Check Node.js version
node --version

# Required: Node.js ^20.0.0
# Acceptable: v20.0.0, v20.15.0, v22.0.0, etc.
# Unacceptable: v18.0.0, v16.0.0, etc.
```

**Package manager preference:**
```bash
# Preferred: pnpm ^10.0.0
pnpm --version

# Acceptable: npm ^9.0.0, yarn ^1.22.0
# Check package-lock.json, yarn.lock, or pnpm-lock.yaml
```

## Validation Rules

### Rule 1: Version Check

**If Tailwind CSS is installed:**
- Version must be ^4.0.0
- If version < 4.0.0, refuse to continue and recommend upgrade
- If version is ambiguous (e.g., "latest"), request clarification

**If Tailwind CSS is not installed:**
- Proceed with installation based on project type
- Install Tailwind CSS ^4.0.0 specifically

### Rule 2: Project Type Validation

**Validate project structure:**
```bash
# Check for build configuration files
ls -la | grep -E "(vite\.config|postcss\.config|tailwind\.config|package\.json)"

# Check for framework indicators
ls -la | grep -E "(svelte\.config|next\.config|nuxt\.config)"
```

**Framework-specific validation:**
- **SvelteKit**: Check for `svelte.config.js` and `vite.config.js`
- **Next.js**: Check for `next.config.js` and `tailwind.config.js`
- **Nuxt.js**: Check for `nuxt.config.ts` and `tailwind.config.js`
- **Vite**: Check for `vite.config.js` and `postcss.config.js`

### Rule 3: Compatibility Check

**Tailwind ^4 breaking changes:**
- CSS configuration format changes
- New @import syntax
- Updated plugin system
- Changed default color format (HSL)

**Verify compatibility:**
```bash
# Check for legacy configuration
if [ -f "tailwind.config.js" ]; then
  echo "Legacy config detected - may need migration"
fi

# Check for CSS imports
grep -r "@tailwind" src/ || echo "Legacy @tailwind directives found"
```

## Installation Validation

### New Installation Process

**1. Confirm project type:**
```bash
# Detect project type
if [ -f "svelte.config.js" ]; then
  echo "SvelteKit project detected"
elif [ -f "next.config.js" ]; then
  echo "Next.js project detected"
elif [ -f "nuxt.config.ts" ]; then
  echo "Nuxt.js project detected"
elif [ -f "vite.config.js" ]; then
  echo "Vite project detected"
else
  echo "Generic project - use PostCSS or Tailwind CLI"
fi
```

**2. Install Tailwind CSS ^4:**
```bash
# Using pnpm (preferred)
pnpm add -D tailwindcss@^4.0.0

# Using npm
npm install -D tailwindcss@^4.0.0

# Using yarn
yarn add -D tailwindcss@^4.0.0
```

**3. Verify installation:**
```bash
# Check installed version
pnpm list tailwindcss

# Verify Tailwind CLI works
npx tailwindcss --version
```

### Migration Validation

**From Tailwind ^3 to ^4:**
```bash
# Backup existing config
cp tailwind.config.js tailwind.config.js.backup

# Check for breaking changes
grep -E "(purge|content|darkMode)" tailwind.config.js && echo "Breaking changes detected"
```

## Error Handling

### Common Issues

**1. Version conflicts:**
```bash
# Error: Multiple Tailwind versions
npm ls tailwindcss

# Solution: Remove old versions
npm uninstall tailwindcss@3 tailwindcss@2
```

**2. Project type mismatch:**
```bash
# Error: Incompatible build tools
# Solution: Use appropriate installation method
```

**3. Node.js incompatibility:**
```bash
# Error: Node.js version too old
node --version

# Solution: Upgrade Node.js or use older Tailwind version
```

### Refusal Scenarios

**Refuse to continue when:**
- Tailwind CSS version < 4.0.0 is installed
- Project doesn't support Tailwind CSS ^4 features
- Node.js version < 20.0.0
- Build tools incompatible with Tailwind ^4

**Provide helpful guidance:**
- Explain version requirements
- Suggest upgrade paths
- Recommend alternative approaches
- Point to official documentation

## Success Criteria

**Valid installation when:**
- Tailwind CSS ^4.0.0 is installed
- Project type supports Tailwind ^4
- Node.js ^20.0.0 is available
- Build tools are compatible
- Configuration follows Tailwind ^4 patterns

**Ready to proceed when:**
- All validation checks pass
- Installation is successful
- Basic Tailwind utilities work in project
- Build process completes without errors
