# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Astro v5** - Server-side rendering framework with SSR enabled (`output: "server"`)
- **React v19** - For interactive components only
- **TypeScript v5** - Strict mode enabled
- **Tailwind CSS v4** - Utility-first styling with CSS variables
- **Shadcn/ui** - Component library (new-york style, neutral base color)
- **Node.js v22.14.0** - Runtime (see `.nvmrc`)

## Commands

### Development

```bash
pnpm dev             # Start dev server on port 3000
pnpm build           # Build for production
pnpm preview         # Preview production build
```

### Code Quality

```bash
pnpm lint            # Run ESLint
pnpm lint:fix        # Auto-fix ESLint issues
pnpm format          # Format with Prettier
```

### Shadcn/ui Components

```bash
pnpm dlx shadcn@latest add [component-name]  # Install new component
```

## Architecture

### Rendering Strategy

This is an **SSR (server-side rendered) application** with Astro's Node adapter in standalone mode. All routes are server-rendered by default. Use `export const prerender = false` explicitly for API routes.

### Component Philosophy

- Use **Astro components (.astro)** for static content and layouts
- Use **React components (.tsx)** only when interactivity is needed
- Never use `"use client"` or other Next.js directives - this is Astro, not Next.js

### Project Structure

```
./src
├── layouts/          # Astro layouts
├── pages/            # Astro pages (file-based routing)
│   └── api/          # API endpoints (server-side)
├── components/       # Astro & React components
│   ├── ui/           # Shadcn/ui components
│   └── hooks/        # Custom React hooks
├── server/           # Backend-only code (NEVER bundled for client)
│   ├── services/     # Business logic and data access layer
│   ├── utils/        # Backend utilities (auth, error-handler, etc.)
│   ├── validation/   # Zod schemas for request validation
│   └── errors/       # Custom API error classes
├── lib/              # Shared utilities (safe for client & server)
│   └── utils.ts      # UI utilities (e.g., cn function)
├── middleware/       # Astro middleware (index.ts)
├── db/               # Supabase clients and types
├── types.ts          # Shared types (Entities, DTOs)
└── assets/           # Static internal assets
```

### Path Aliases

TypeScript is configured with `@/*` alias pointing to `./src/*`:

```tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

## Coding Practices

### Error Handling Pattern

- Handle errors and edge cases at the beginning of functions
- Use early returns for error conditions (guard clauses)
- Place happy path last for readability
- Avoid unnecessary else statements

```typescript
// Example
function processData(data: Data) {
  if (!data) return handleError("Missing data");
  if (!data.isValid) return handleError("Invalid data");

  // Happy path here
  return result;
}
```

### API Routes (Astro)

- Use uppercase HTTP method handlers: `export async function POST(context)`
- Add `export const prerender = false` for dynamic routes
- Use Zod for input validation
- Extract business logic to `src/server/services`
- Access Supabase via `context.locals.supabase` (not direct import)
- Use `SupabaseClient` type from `src/db/supabase.client.ts`

### Backend Code Organization

- **ALL backend-only code MUST be in `src/server/`** - this directory is server-only and never bundled for the client
- `src/server/services/` - Business logic classes (e.g., `ProfileService`)
- `src/server/utils/` - Backend utilities (`auth.ts`, `api-response.ts`, `error-handler.ts`)
- `src/server/validation/` - Zod schemas for API request validation
- `src/server/errors/` - Custom error classes with `toResponse()` methods
- `src/lib/` - Only for code that is safe to share between frontend and backend
- **NEVER import from `src/server/` in client components** - this will cause bundling errors

### React Components

- Functional components with hooks only
- Extract reusable logic into custom hooks in `src/components/hooks`
- Use `React.memo()` for expensive components with stable props
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive calculations
- Use `useId()` for accessibility attributes
- Consider `useOptimistic` for optimistic UI updates
- Consider `useTransition` for non-urgent state updates

### Styling with Tailwind

- Use `@layer` directive for custom utilities
- Use arbitrary values with square brackets: `w-[123px]`
- Implement dark mode with `dark:` variant
- Use responsive variants: `sm:`, `md:`, `lg:`, etc.
- Use state variants: `hover:`, `focus-visible:`, `active:`

### Accessibility

- Use ARIA landmarks for page regions
- Set `aria-expanded` and `aria-controls` for expandable content
- Use `aria-live` regions for dynamic content updates
- Apply `aria-label` or `aria-labelledby` for elements without visible labels
- Avoid redundant ARIA that duplicates native HTML semantics

### Astro-Specific

- Use View Transitions API with ClientRouter for smooth navigation
- Use content collections with type safety
- Use `Astro.cookies` for server-side cookie management
- Use `import.meta.env` for environment variables
- Implement middleware for request/response modification

## Linting & Formatting

The project uses ESLint with:

- TypeScript strict + stylistic rules
- React compiler plugin (error level)
- React hooks rules
- JSX accessibility rules
- Astro plugin
- Prettier integration

Pre-commit hooks via Husky + lint-staged auto-fix issues on commit.
