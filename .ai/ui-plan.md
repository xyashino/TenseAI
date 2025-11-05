# UI Architecture for TenseAI

## 1. UI Structure Overview

The TenseAI UI is a responsive web application built with **Astro 5** and **React 19**. It uses Astro for static content (like theory pages) and server-side rendered (SSR) shells, while leveraging React "islands" for dynamic, interactive components (like the training session).

The architecture is centered around three main layouts:

1.  **Public Layout:** A minimal layout for unauthenticated users (Login, Register, Forgot Password).
2.  **Main App Layout:** The primary layout for authenticated users, featuring responsive navigation: a desktop **sidebar** and a mobile **bottom-bar**.
3.  **Focus Mode Layout:** A distraction-free layout used exclusively for the `/training/[sessionId]` view, which hides the main navigation.

State management is handled by **React Query** for all server state (API interactions) and **React Hook Form** / **useState** for client-side form and UI state. All UI components are based on the **Shadcn/ui** library.

---

## 2. View List

### Public & Auth Views

- **View:** Login

  - **Path:** `/login`
  - **Main Purpose:** Authenticate an existing user (`US-003`).
  - **Key Information:** Email and password fields.
  - **Key View Components:** `Card`, `Form` (React Hook Form), `Input`, `Button` ("Login"), `Alert` (for errors), Link to `/register` and `/forgot-password`.
  - **UX/Security:** On success, Supabase SDK sets an auth cookie. The main layout loader will then fetch `/api/profile` to determine the next step (Onboarding or Practice).

- **View:** Register

  - **Path:** `/register`
  - **Main Purpose:** Register a new user (`US-001`).
  - **Key Information:** Name, email, and password fields.
  - **Key View Components:** `Card`, `Form`, `Input`, `Button` ("Register"), `Alert`, Link to `/login`.
  - **UX/Security:** On success (`US-001`), redirects to `/check-email`.

- **View:** Check Email

  - **Path:** `/check-email`
  - **Main Purpose:** Instruct user to activate their account via email (`REQ-03`).
  - **Key Information:** Static "Check your email" message.
  - **Key View Components:** `Card`, Text.

- **View:** Update Password
  - **Path:** `/update-password`
  - **Main Purpose:** Allow a user to set a new password from a reset link (`US-004`).
  - **Key Information:** New password and confirm password fields.
  - **Key View Components:** `Card`, `Form`, `Input` (password type), `Button` ("Set New Password").
  - **UX/Security:** This page uses the Supabase SDK to handle the password update logic from the URL token.

### Onboarding

- **View:** Onboarding
  - **Path:** `/onboarding`
  - **Main Purpose:** Mandatory 2-step setup for new users (`REQ-06`, `US-005`).
  - **Key Information:** User's name, default difficulty choice.
  - **Key View Components:** Full-screen layout (no nav), `Card` (for steps), `Input` (for name, `REQ-07`), large clickable `Card`s or `RadioGroup` (for difficulty, `REQ-08`), `Button` ("Continue" / "Finish").
  - **UX/Security:** This view is shown via a redirect from the main layout if `GET /api/profile` returns `onboarding_completed: false`. On submit, it calls `PATCH /api/profile` and redirects to `/practice`.

### Main Application Views

- **View:** Practice (Dashboard)

  - **Path:** `/` or `/practice`
  - **Main Purpose:** Main app dashboard. Displays active sessions (`US-011`) and allows starting new ones (`US-008`). _This view replaces the separate "Active Sessions" page._
  - **Key Information:** List of active sessions from `GET /api/training-sessions?status=active`.
  - **Key View Components:**
    - `Button` ("Start New Session"): Opens the "Start Session" `Dialog`.
    - `Dialog` (Modal): Contains a `Form` with `RadioGroup` for Tense and `RadioGroup` for Difficulty.
    - `Card` (List): A responsive list of active session cards.
    - **Active Session Card:** Displays Tense, Progress (e.g., "Round 2/3"), "Resume" `Button`, and "Delete" `Button` (with trash icon).
    - `AlertDialog`: Confirms session deletion (abandoning).
    - **Empty State Component:** Shown if no active sessions exist.

- **View:** Training Session

  - **Path:** `/training/[sessionId]`
  - **Main Purpose:** The core, interactive training loop (`US-009`, `US-010`, `US-012`).
  - **Key Information:** Current question, options, round summaries, and final feedback.
  - **Key View Components:**
    - **Focus Mode Layout:** Hides main nav.
    - **Sticky Header:** Contains Tense name, "Back" `Button`, and "Abandon Session" `Dropdown` (with `AlertDialog` confirmation).
    - **"Chat Log" Area:** A vertically scrolling container.
    - **Chat Components:** React components rendered from a `useState` array: `QuestionComponent`, `RoundSummaryComponent`, `FinalFeedbackComponent`, `LoadingComponent`.
    - **Question Component:** A `Form` (React Hook Form) with a `RadioGroup` for vertical MCQ options (`REQ-17a`). Includes a "Report Error" flag `Button`.
    - **Report Error Modal:** A `Dialog` that shows the question text and a `TextArea` for comments, calling `POST /api/question-reports`.
    - `react-markdown`: Used to render AI-generated feedback.

- **View:** Theory (List)

  - **Path:** `/theory`
  - **Main Purpose:** List available grammar tenses for study (`US-007`).
  - **Key Information:** The four tenses (Present Simple, Past Simple, etc.).
  - **Key View Components:** A grid of 4 large, clickable `Card` components.

- **View:** Theory (Detail)

  - **Path:** `/theory/[tenseSlug]`
  - **Main Purpose:** Display educational content for a specific tense (`REQ-12`, `US-007`).
  - **Key Information:** Rendered Markdown content.
  - **Key View Components:** A static Astro page that renders Markdown content, styled using `@tailwindcss/typography`.

- **View:** History (List)

  - **Path:** `/history`
  - **Main Purpose:** Display all _completed_ training sessions (`REQ-21`, `US-013`).
  - **Key Information:** List of completed sessions from `GET /api/training-sessions?status=completed`.
  - **Key View Components:**
    - `Card` (List): A paginated, responsive list of completed session cards.
    - **History Card:** Displays Tense, Date, and Score Trend (e.g., "6/10 → 7/10 → 8/10") (`REQ-22`).
    - **Empty State Component:** Shown if no sessions are completed (`US-016`).

- **View:** History (Detail)

  - **Path:** `/history/[sessionId]`
  - **Main Purpose:** Allow a user to review a past, completed session (`REQ-23`, `US-014`).
  - **Key Information:** All questions, answers, scores, and feedback for the session.
  - **Key View Components:**
    - **Read-Only "Chat Log" Area:** Renders the _entire_ session (fetched via `GET /api/training-sessions/{sessionId}`) in the same "chat-like" UI as the training view, but with no interactive elements.
    - `react-markdown`: Renders all feedback.

- **View:** Profile
  - **Path:** `/profile`
  - **Main Purpose:** Allow user to update their name and default difficulty.
  - **Key Information:** User's name and default difficulty.
  - **Key View Components:** `Form` (React Hook Form), `Input` (Name), `RadioGroup` (Difficulty), `Button` ("Save Changes").
  - **UX/Security:** Populated by `GET /api/profile` and submits via `PATCH /api/profile`.

---

## 3. User Journey Map

This map outlines the "golden path" for a new user, from registration to completing their first session.

1.  **Start:** User lands on `/register`.
2.  **Register:** Submits form -> Redirected to `/check-email`.
3.  **Activate:** User clicks email link -> Redirected to `/login`.
4.  **First Login:** Submits `/login` form -> App fetches `GET /api/profile`.
5.  **Onboarding:** `onboarding_completed: false` -> Redirect to `/onboarding`.
6.  **Setup:** User submits name and difficulty -> `PATCH /api/profile`.
7.  **Dashboard:** Redirected to `/practice` (main dashboard).
8.  **Start Session:** Clicks "Start New Session" -> Opens `Dialog` modal.
9.  **Configure:** Selects Tense & Difficulty -> Clicks "Start".
10. **Navigate & Load:** `POST /api/training-sessions` (fast) -> Navigate to `/training/[sessionId]`.
11. **Fetch Questions:** `/training/[sessionId]` page shows loader -> `POST /api/training-sessions/{sessionId}/rounds` (slow) to get Round 1 questions.
12. **Round 1:** Loader replaced by Question 1/10. User submits 10 answers (no feedback).
13. **Submit Round 1:** Clicks "Submit" -> `POST /api/rounds/{roundId}/complete`.
14. **Round 1 Summary:** Loader replaced by Round 1 Summary component (`REQ-18`).
15. **Rounds 2 & 3:** User clicks "Start Round 2" -> Repeats steps 11-14.
16. **Final Summary:** After Round 3 Summary, user clicks "Finish Session" -> `POST /api/training-sessions/{sessionId}/complete`.
17. **Session Complete:** Loader replaced by Final Session Summary (`REQ-19`).
18. **Review:** User navigates to `/history` -> Clicks new entry -> Navigates to `/history/[sessionId]` to see the read-only summary (`US-014`).

---

## 4. Layout and Navigation Structure

- **Layouts:** As defined in Section 1 (Public, Main App, Focus Mode).
- **Navigation:** Based on the "Main App Layout."
  - **Desktop (md: and up):** A fixed vertical **Sidebar**.
    - Logo (TenseAI)
    - "Practice" (Home)
    - "Theory"
    - "History"
    - "Profile" (at the bottom)
  - **Mobile (sm:):** A fixed **Bottom Bar**.
    - Icon: "Practice"
    - Icon: "Theory"
    - Icon: "History"
    - Icon: "Profile"
- **Transitions:** Astro View Transitions will be enabled to provide smooth, app-like cross-fade animations between page navigations.

---

## 5. Key Components

This list highlights reusable React components built with Shadcn/ui.

- **`AuthForm` (React):** A client-side component used for Login, Register, and Update Password, powered by React Hook Form.
- **`OnboardingWizard` (React):** A multi-step form component for the `/onboarding` view.
- **`SessionStarter` (React):** The "Start New Session" `Button` and its associated `Dialog` modal. Manages the `POST /api/training-sessions` mutation and subsequent navigation.
- **`ActiveSessionList` (React):** Fetches (`GET ...?status=active`) and displays the list of `Card`s on the `/practice` page. Handles "Resume" and "Delete" actions.
- **`HistoryList` (React):** Fetches (`GET ...?status=completed`) and displays the paginated list of completed sessions on the `/history` page.
- **`TrainingChat` (React):** The main component for `/training/[sessionId]`.
  - Manages the `messages: [object]` `useState` array.
  - Manages the "chat log" UI, mapping `messages` to components.
  - Handles all `React Query` mutations for `POST .../rounds`, `POST .../complete`.
  - Manages the child `QuestionForm`.
- **`QuestionForm` (React):** The form fixed to the bottom of the training view.
  - Powered by `React Hook Form` to collect 10 answers.
  - Displays one question at a time.
  - Handles the "Report Error" `Dialog`.
- **`ReadOnlyChat` (React):** The component for `/history/[sessionId]`. Fetches the full session (`GET /api/training-sessions/{sessionId}`) and renders the entire chat log statically.
- **`MarkdownRenderer` (React):** A simple wrapper for `react-markdown` and `@tailwindcss/typography` used in theory pages and feedback bubbles.
- **`EmptyState` (React):** A shared component displayed on `/practice` and `/history` when lists are empty (`US-016`).
- **`GlobalErrorHandler` (React):** An `<ErrorBoundary>` component that wraps the main app to catch client-side React errors and display a "friendly coach" message.
