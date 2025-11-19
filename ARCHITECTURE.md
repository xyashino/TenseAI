# Architecture Guidelines - TenseAI

This project follows a **Modular / Vertical Slice Architecture** designed to keep complexity manageable as the application grows.

## 1. Core Philosophy
Instead of grouping code by "technical layer" (e.g., all controllers together, all components together), we group code by **Business Domain (Feature)**.

- **Goal**: Minimize coupling between unrelated features.
- **Benefit**: To work on "Training", you only need to look at the `training` folder.
- **Scalability**: Adding a new feature (e.g., "Billing") means adding a new folder, not touching 10 shared files.

## 2. Directory Structure

```text
src/
├── features/             <-- FRONTEND Vertical Slices
│   ├── training/         <-- "Training" Feature (Frontend)
│   │   ├── components/   <-- Smart Components (Stateful)
│   │   ├── hooks/        <-- Logic & State Management
│   │   ├── api/          <-- Feature-specific API calls
│   │   ├── types.ts      <-- Feature-specific types
│   │   └── index.ts      <-- Public Interface
│   └── auth/             <-- "Auth" Feature
│
├── server/
│   └── modules/          <-- BACKEND Vertical Slices
│       ├── training/     <-- "Training" Feature (Backend)
│       │   ├── training.rules.ts   <-- Pure Business Logic (The "Brain")
│       │   ├── training.service.ts <-- Orchestration (The "Manager")
│       │   ├── training.repo.ts    <-- Data Access (The "Worker")
│       │   └── index.ts            <-- Public Interface
│       └── identity/
│
├── shared/               <-- SHARED KERNEL (Frontend & Backend)
│   ├── api/              <-- Base API Client config (no specific calls)
│   ├── schema/           <-- Zod Schemas (shared validation)
│   ├── types/            <-- Global Types (User, Entity IDs)
│   └── ui/               <-- Dumb UI Components (Buttons, Inputs)
│
├── pages/                <-- ROUTING (Astro)
│   ├── api/              <-- API Routes (thin wrappers around Server Modules)
│   └── app/              <-- App Pages (thin wrappers around Feature Components)
└── lib/                  <-- Legacy code (to be refactored)
```

## 3. Dependency Rules

1.  **Strict Hierarchy**:
    *   `features/` can import from `shared/`.
    *   `server/modules/` can import from `shared/`.
    *   `shared/` **CANNOT** import from `features/` or `server/`.
2.  **Backend Isolation**:
    *   `features/` (Frontend) **CANNOT** import from `server/`.
    *   Communication happens **ONLY** via API calls.
3.  **Feature Isolation**:
    *   `features/training/` should generally not import deeply from `features/auth/`.
    *   Use the `index.ts` Public Interface if cross-feature communication is needed.

## 4. Implementation Details

### Frontend Feature (`src/features/training`)
- **Components**: "Smart" components that connect to stores/API.
- **API**: `api/training.api.ts` contains `getSession`, `submitAnswer`.
- **Hooks**: `hooks/useTrainingSession.ts` contains the logic.

### Backend Module (`src/server/modules/training`)
- **Rules (`*.rules.ts`)**: Optional. Pure functions for complex business logic only. `if (round > 3) throw Error`. **Only create when you have non-trivial business rules to extract.** Simple null checks or schema validation don't need rules files.
- **Service (`*.service.ts`)**: Coordinates. `repo.get()` -> `rules.validate()` (if needed) -> `ai.generate()` -> `repo.save()`. Handles simple validation directly.
- **Repository (`*.repo.ts`)**: Raw SQL/Supabase queries.

### Shared Kernel (`src/shared`)
- **Schemas**: Define Zod schemas here (`shared/schema/training.ts`) so both the Frontend Form and Backend API validate using the exact same definition.
- **Client**: `shared/api/client.ts` sets up Axios/Fetch with base URL and headers.

## 5. Refactoring Workflow
When moving legacy code to this structure:
1.  **Identify the Domain**: Is this "Auth", "Training", or "History"?
2.  **Move Backend Logic**:
    *   Extract logic `if` statements to `rules.ts`.
    *   Move DB calls to `repo.ts`.
    *   Wire up in `service.ts`.
3.  **Move Frontend Logic**:
    *   Move specific components to `features/<domain>/components`.
    *   Extract `useQuery` / `fetch` calls to `features/<domain>/hooks` & `api`.
4.  **Centralize Types/Schemas**: Move shared interfaces to `src/shared`.
