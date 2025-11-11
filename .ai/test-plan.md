# Test Plan for TenseAI Project

## 1. Introduction and Testing Goals

### 1.1. Introduction

This document outlines the testing strategy for the TenseAI project, an application designed to help users learn English tenses through interactive, AI-powered training sessions. The plan covers the scope, types of tests, tools, and processes that will be used to ensure the application's quality, reliability, and performance.

### 1.2. Testing Goals

The primary goals of the testing process are:

- To verify that all functional requirements are implemented correctly.
- To ensure the application is secure, especially the authentication and user data handling parts.
- To guarantee a stable, reliable, and smooth user experience.
- To identify and fix bugs before the application is deployed to production.
- To ensure the application performs well under expected user load.
- To validate the correctness of integrations with external services like Supabase and Openrouter.ai.

## 2. Scope of Tests

### 2.1. In Scope

- **User Authentication:** Registration, login, logout, password reset, session management, and route protection.
- **Onboarding Flow:** The entire process for new users after registration.
- **Core Training Functionality:** Creating, participating in, and completing training sessions.
- **AI Interaction:** Communication with the AI model, including question generation and response evaluation.
- **User Account Management:** Viewing and updating user profile information.
- **Training History:** Viewing and inspecting past training sessions.
- **API Endpoints:** All backend APIs for functionality, data retrieval, and mutations.
- **User Interface (UI):** Responsiveness, usability, and visual consistency across different devices and browsers.
- **Error Handling:** Both client-side and server-side error management.

### 2.2. Out of Scope

- Testing the underlying infrastructure (Supabase infrastructure, Openrouter.ai service uptime), although we will test our integration with them.
- Testing the `shadcn/ui` components in isolation. We will only test their integration into our application.
- Third-party libraries and dependencies, unless they are integral to a specific feature being tested.
- Performance testing under extreme load (stress testing), although basic load testing is in scope.

## 3. Types of Tests to be Performed

A multi-layered testing approach will be used:

### 3.1. Unit Tests

- **Goal:** To test individual functions, components, and modules in isolation.
- **Scope:**
  - React components (UI rendering based on props, user interactions).
  - Utility functions (`src/lib/utils`, `src/server/utils`).
  - Zustand store logic (`src/lib/stores`).
  - Zod validation schemas (`src/server/validation`).
- **Tools:** Vitest, React Testing Library.

### 3.2. Integration Tests

- **Goal:** To test the interaction between different parts of the application.
- **Scope:**
  - React components interacting with their state (Zustand stores) and hooks.
  - Frontend components making API calls to the backend.
  - Backend services interacting with the repository layer.
  - Repository layer making calls to a test database.
- **Tools:** Vitest, React Testing Library, Mock Service Worker (for mocking APIs), a dedicated test Supabase instance.

### 3.3. End-to-End (E2E) Tests

- **Goal:** To simulate real user scenarios and test the entire application flow from the user's perspective.
- **Scope:**
  - User registration, onboarding, and login flow.
  - Starting a training session, answering questions, and finishing the session.
- Viewing training history.
  - Updating account information.
  - Middleware redirects for authenticated/unauthenticated users.
- **Tools:** Playwright or Cypress.

### 3.4. Visual Regression Testing

- **Goal:** To automatically detect unintended UI changes.
- **Scope:** Key pages and components, especially after styling changes.
- **Tools:** Playwright with visual comparison or a dedicated service like Chromatic/Percy.

### 3.5. API Testing

- **Goal:** To test API endpoints directly for correctness, performance, and security.
- **Scope:** All API routes in `src/pages/api`.
- **Tools:** Postman, or automated tests using Vitest with `supertest`.

## 4. Test Scenarios for Key Functionalities

### 4.1. Authentication and Onboarding

- A new user can successfully register with a valid email and password.
- A registered user can log in with correct credentials.
- A user cannot log in with incorrect credentials.
- An authenticated user is redirected from auth pages to the app.
- An unauthenticated user is redirected from app pages to the login page.
- A new user is forced to complete the onboarding process.
- A user who has completed onboarding is not shown the onboarding page again.

### 4.2. Training Session

- An authenticated user can start a new training session.
- The user receives AI-generated questions in the chat interface.
- The user can submit answers.
- The application correctly saves session progress.
- The user can see their progress (e.g., percentage complete).
- The user can end a session and view a summary.
- The completed session appears in the user's history.

### 4.3. Account Management

- A user can navigate to the account page.
- A user can successfully update their profile information.
- A user can change their password.

## 5. Test Environment

- **Local Development:** Developers will run unit and integration tests locally.
- **Staging/Preview Environment:** A dedicated environment that mirrors production. E2E tests will run here automatically on every push to the main branch. This environment will be connected to a separate Supabase test project.
- **Production Environment:** Manual smoke testing will be performed after each deployment.

## 6. Testing Tools

- **Test Runner/Framework:** Vitest
- **Component Testing:** React Testing Library
- **E2E Testing:** Playwright
- **API Mocking:** Mock Service Worker (MSW)
- **API Testing (Manual):** Postman
- **CI/CD:** GitHub Actions (to automate running tests)

## 7. Test Schedule

- Unit and integration tests will be written alongside development (TDD/BDD approach is encouraged).
- E2E tests will be created for major features once they are stable.
- All tests will be run automatically via GitHub Actions on every pull request to the `main` branch.
- Regression testing (running the full E2E suite) will be performed before each release.

## 8. Test Acceptance Criteria

### 8.1. For a Feature to be "Done"

- All new code must be covered by meaningful unit and/or integration tests.
- Code coverage must not fall below a predefined threshold (e.g., 80%).
- All related E2E tests must pass.
- No critical or major bugs are found related to the feature.

### 8.2. For a Release

- The full suite of unit, integration, and E2E tests must pass in the staging environment.
- No known critical bugs.
- Successful completion of manual smoke tests in the production environment.

## 9. Roles and Responsibilities

- **Developers:** Responsible for writing unit and integration tests for their code. Also responsible for fixing bugs found during testing.
- **QA Engineer (this role):** Responsible for creating and maintaining the test plan, writing and maintaining E2E tests, performing manual exploratory testing, and managing the bug reporting process.
- **DevOps/Platform Engineer:** Responsible for maintaining the test environments and CI/CD pipelines.

## 10. Bug Reporting Procedures

- **Tool:** GitHub Issues will be used for bug tracking.
- **Bug Template:** All bug reports must follow a template that includes:
  - A clear and descriptive title.
  - Steps to reproduce the bug.
  - Expected behavior.
  - Actual behavior.
  - Screenshots or video recordings, if applicable.
  - Environment details (e.g., browser, OS).
- **Priority Levels:**
  - `P0 - Critical`: Blocks application functionality, no workaround.
  - `P1 - Major`: Major functionality is broken, but a workaround exists.
  - `P2 - Minor`: Minor functionality is broken, or a UI issue.
  - `P3 - Trivial`: Cosmetic issue.
- **Process:**
  1.  A bug is found and reported in GitHub Issues.
  2.  The bug is triaged and prioritized.
  3.  The bug is assigned to a developer.
  4.  The developer fixes the bug and creates a pull request. The PR must include tests that reproduce the bug and verify the fix.
  5.  The fix is deployed to the staging environment and verified by the QA engineer.
  6.  The bug ticket is closed.
