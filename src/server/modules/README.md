# Modular Architecture (Vertical Slices)

This project follows a **Modular Architecture** (also known as Vertical Slices) for the backend (`src/server`). Instead of organizing code by technical layers (e.g., all services in one folder, all repositories in another), we organize code by **Domain/Feature**.

## Why this pattern?

1.  **Cohesion**: Everything related to a feature (Business Logic, Database Queries, Types) is in one place.
2.  **Scalability**: New features are added as new modules without polluting existing shared folders.
3.  **Testability**: Business logic is extracted into pure functions (`*.rules.ts`), making it easy to unit test without mocking database calls.
4.  **Simplicity**: It avoids the complexity of full Domain-Driven Design (DDD) while solving the "Fat Service" problem.

## Directory Structure

```text
src/server/modules/
├── training/                  <-- Feature Module
│   ├── training.rules.ts      <-- "The Brain": Pure Business Logic
│   ├── training.service.ts    <-- "The Manager": Orchestration
│   ├── training.repository.ts <-- "The Worker": Data Access
│   └── training.types.ts      <-- Domain specific types
├── identity/                  <-- Another Module
│   └── ...
└── README.md                  <-- This file
```

## Component Roles

### 1. Rules (`*.rules.ts`)
**"The Brain"**
- Contains **Pure Functions** only.
- **NO** database dependencies, **NO** API calls, **NO** side effects.
- Responsible for validating state transitions and calculations.
- **Testing**: High coverage unit tests.

```typescript
// training.rules.ts
export const TrainingRules = {
  canCreateRound(session: Session, roundCount: number) {
    if (session.status === 'completed') throw new Error("Session ended");
    if (roundCount >= 3) throw new Error("Max rounds reached");
  }
}
```

### 2. Service (`*.service.ts`)
**"The Manager"**
- Orchestrates the flow of data.
- Calls the **Repository** to get data.
- Calls **Rules** to validate decisions.
- Calls external providers (e.g., AI Service).
- **Testing**: Integration tests or mocked unit tests.

```typescript
// training.service.ts
export class TrainingService {
  async createRound(sessionId: string) {
    const session = await this.repo.getSession(sessionId);

    // Delegate decision to the Rules
    TrainingRules.canCreateRound(session, session.rounds.length);

    // Proceed if rules pass
    return this.repo.addRound(sessionId);
  }
}
```

### 3. Repository (`*.repository.ts`)
**"The Worker"**
- Handles all interactions with the database (Supabase).
- Maps database rows to domain types if necessary.
- **Testing**: Integration tests against a real/local DB.

### 4. Types (`*.types.ts`)
- TypeScript interfaces specific to this module.
- Can import shared types from `@/types` but extends them for internal module use.

## Implementation Guide

When refactoring or adding a new feature:

1.  **Create the Module**: New folder in `src/server/modules/`.
2.  **Write Rules First**: Define the business logic constraints in `rules.ts`.
3.  **Implement Data Access**: Add necessary queries in `repository.ts`.
4.  **Connect in Service**: Wire them together in `service.ts`.
5.  **Expose**: Use the Service in your API routes (`src/pages/api/...`).
