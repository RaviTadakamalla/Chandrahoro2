# Contributing to ChandraHoro V2.1

Thank you for contributing to ChandraHoro! This document provides guidelines for code quality, style, and development workflow.

## Table of Contents

1. [Code Style Guidelines](#code-style-guidelines)
2. [Running Linting](#running-linting)
3. [Pre-commit Hooks](#pre-commit-hooks)
4. [Common ESLint Errors](#common-eslint-errors)
5. [Formatting](#formatting)
6. [Development Workflow](#development-workflow)

---

## Code Style Guidelines

### TypeScript

- Use **strict mode** - all TypeScript files must compile with strict mode enabled
- Always provide **explicit return types** for functions (except arrow functions with obvious returns)
- Avoid `any` type - use proper TypeScript types instead
- Use `const` by default, `let` when needed, never use `var`
- Use **single quotes** for strings (enforced by Prettier)

### React

- Use **functional components** only (no class components)
- Use **React hooks** for state and side effects
- Always include **dependency arrays** in `useEffect`
- Use **TypeScript** for component props (no PropTypes)
- Keep components **small and focused** (max 300 lines)

### Naming Conventions

```typescript
// Components: PascalCase
export function UserProfile() { }

// Functions: camelCase
function calculateAspectIntensity() { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Private functions: _camelCase
function _internalHelper() { }

// Unused parameters: _paramName
function handler(_event: Event) { }
```

### Imports

- Group imports in this order:
  1. External packages (React, Next.js, etc.)
  2. Internal absolute imports (@/)
  3. Relative imports (../, ./)
  4. Side effects (CSS, etc.)

```typescript
import React from 'react';
import { useRouter } from 'next/router';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import './styles.css';
```

---

## Running Linting

### Check for Errors

```bash
npm run lint
```

### Auto-fix Errors

```bash
npm run lint:fix
```

### Check Formatting

```bash
npm run format:check
```

### Auto-format Code

```bash
npm run format
```

### Type Checking

```bash
npm run type-check
```

---

## Pre-commit Hooks

Husky automatically runs linting and formatting on staged files before each commit.

### What Happens on Commit

1. **lint-staged** runs on staged files only
2. **ESLint** checks for errors and auto-fixes when possible
3. **Prettier** formats code automatically
4. If errors remain, commit is **blocked**
5. Fix errors and try committing again

### Bypassing Hooks (Not Recommended)

```bash
git commit --no-verify
```

### Manual Hook Execution

```bash
npx lint-staged
```

---

## Common ESLint Errors

### 1. `no-console` Warning

**Error**: `console.log` found in production code

**Fix**: Remove console statements or use `console.warn`/`console.error` for logging

```typescript
// ❌ Bad
console.log('Debug info');

// ✅ Good
console.warn('Warning message');
console.error('Error message');
```

### 2. `no-unused-vars` Error

**Error**: Variable declared but never used

**Fix**: Remove unused variable or prefix with underscore if intentionally unused

```typescript
// ❌ Bad
const unused = 'value';

// ✅ Good
const _unused = 'value'; // Intentionally unused
```

### 3. `no-explicit-any` Error

**Error**: Using `any` type

**Fix**: Use proper TypeScript types

```typescript
// ❌ Bad
function process(data: any) { }

// ✅ Good
interface Data {
  id: string;
  name: string;
}
function process(data: Data) { }
```

### 4. `react-hooks/exhaustive-deps` Warning

**Error**: Missing dependency in useEffect

**Fix**: Add missing dependency or use useCallback

```typescript
// ❌ Bad
useEffect(() => {
  console.log(userId);
}, []); // Missing userId

// ✅ Good
useEffect(() => {
  console.log(userId);
}, [userId]);
```

### 5. `@typescript-eslint/no-non-null-assertion` Warning

**Error**: Using non-null assertion (!)

**Fix**: Use proper type guards or optional chaining

```typescript
// ❌ Bad
const value = data!.property;

// ✅ Good
const value = data?.property;
```

---

## Formatting

### Prettier Configuration

- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Trailing Commas**: ES5 compatible
- **Arrow Parens**: Always

### Tailwind Class Sorting

Prettier automatically sorts Tailwind CSS classes:

```typescript
// Before
<div className="p-4 text-white bg-saffron rounded-lg shadow-lg">

// After (automatically sorted)
<div className="rounded-lg bg-saffron p-4 shadow-lg text-white">
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following guidelines above
- Run `npm run lint:fix` to auto-fix issues
- Run `npm run format` to format code
- Run `npm run type-check` to verify types

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

Pre-commit hooks will automatically:
- Run ESLint
- Run Prettier
- Block commit if errors exist

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

### 5. PR Checks

- All tests must pass
- No ESLint errors
- Code coverage maintained
- Peer review approved

---

## VSCode Setup

### Recommended Extensions

Install from `.vscode/extensions.json`:

- **ESLint** - Real-time linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Class suggestions
- **TypeScript** - Language support
- **GitLens** - Git integration

### Auto-format on Save

Settings are configured in `.vscode/settings.json`:

- Format on save: **Enabled**
- ESLint auto-fix: **Enabled**
- Default formatter: **Prettier**

---

## Troubleshooting

### Prettier and ESLint Conflict

If Prettier and ESLint conflict, ESLint config extends `prettier` to disable conflicting rules.

### Pre-commit Hook Not Running

```bash
# Reinstall Husky
npm run prepare

# Verify hook exists
ls -la .husky/pre-commit
```

### Lint Errors After Commit

If errors slip through:

```bash
npm run lint:fix
git add .
git commit --amend --no-edit
```

---

## Questions?

Refer to:
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

---

**Last Updated**: October 26, 2025

