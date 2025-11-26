# Frontend Feature Architecture

For the frontend (React/Astro), we use a **Feature-Based Architecture**. This aligns with the backend's "Vertical Slices" by grouping all code related to a specific domain feature into a single directory.

## Directory Structure

We introduce a `src/features/` directory. Logic previously scattered across `src/components`, `src/lib/hooks`, and `src/lib/api-client.ts` has been consolidated here.

```text
src/
├── features/
│   ├── training/              <-- The Feature Module
│   │   ├── components/        <-- "Smart" Components (Connect to hooks/state)
│   │   │   ├── TrainingSessionView.tsx
│   │   │   └── QuestionCard.tsx
│   │   ├── hooks/             <-- State & Logic (Custom Hooks)
│   │   │   ├── useTrainingSession.ts
│   │   │   └── useSubmitAnswer.ts
│   │   ├── api/               <-- API calls specific to this feature
│   │   │   └── training-api.ts
│   │   ├── types.ts           <-- Feature-specific types
│   │   └── index.ts           <-- Public API (Exports for Pages)
│   └── auth/
│       └── ...
├── components/
│   ├── ui/                    <-- Shared "Dumb" UI (Shadcn - Button, Input)
│   └── layout/                <-- Layout components (Header, Sidebar)
└── pages/                     <-- Astro Pages (Route definitions only)
```

## The Rules

### 1. Colocation
If a hook or component is **only** used by the Training feature, it belongs in `src/features/training/`. It should not be in shared directories or `src/components/common`.

### 2. "Smart" vs "Dumb" Components
*   **Feature Components** (`src/features/*/components`): These are "Smart". They use custom hooks, manage state, and fetch data.
*   **UI Components** (`src/components/ui`): These are "Dumb". They receive props and render HTML/Styles. They know nothing about "Training" or "Users".

### 3. Public Interface (`index.ts`)
Each feature should have an `index.ts` file. Only components exported from here should be used by Astro Pages or other features.

```typescript
// src/features/training/index.ts
export { TrainingSessionView } from './components/TrainingSessionView';
export { useTrainingSession } from './hooks/useTrainingSession';
```

## Refactoring Guide

To refactor the existing `Training` domain:

1.  **Create Directory**: `mkdir -p src/features/training/{components,hooks,api}`
2.  **Move Components**: Move `src/components/training/*` to `src/features/training/components/`.
3.  **Move Logic**: Move `src/lib/hooks/use-training-session.ts` to `src/features/training/hooks/`.
4.  **Extract API**: Extract training-related fetch calls from `src/lib/api-client.ts` to `src/features/training/api/training.api.ts`.
5.  **Update Imports**: Update file paths.

## Example: Training Feature

**`src/features/training/api/training.api.ts`**
```typescript
import { apiClient } from "@/shared/api/client"; // Base fetcher

export const TrainingApi = {
  getSession: (id: string) => apiClient.get(\`/training-sessions/\${id}\`),
  submitAnswer: (id: string, answer: any) => apiClient.post(\`/rounds/\${id}/complete\`, answer)
};
```

**`src/features/training/hooks/useTrainingSession.ts`**
```typescript
import { TrainingApi } from "../api/training.api";

export function useTrainingSession(sessionId: string) {
  // Logic previously in src/lib/hooks/use-training-session.ts
  const { data, error } = useQuery(...)
  return { session: data, ... };
}
```
