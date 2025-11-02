# UI Architecture for TenseAI

## 1. UI Structure Overview

The TenseAI user interface is designed as a responsive Single-Page Application (SPA) built with Astro and React. The architecture prioritizes a dynamic and engaging user experience, centered around a unique chat-based interface for training sessions.

- **Technology**: Astro is used for the overall structure and static content (like theory pages), while React is used for interactive "islands" of functionality, such as the main training session view, forms, and data display components.
- **Layout**: The application uses a **hybrid layout model**.
  - A persistent **Main Layout** ("Hub") provides consistent navigation across most authenticated sections (Practice, History, Theory). This layout features a sidebar on desktop and a collapsible top navigation bar on mobile.
  - The core **Training Session view** uses a separate, minimalist **Session Layout** ("Focus Mode"). This layout **removes the main navigation** to maximize focus and provide an immersive, app-like experience.
- **State Management**: Client-side state, particularly for the active training round, is managed within React components. Global server state, caching, and data fetching are handled by TanStack Query (React Query) to ensure a robust and efficient connection with the backend API.
- **Component Library**: The UI is built using the Shadcn/ui component library, ensuring a consistent, accessible, and modern design system, styled with Tailwind CSS.

## 2. View List

### Public Views (Unauthenticated)

- **View name**: Landing Page (Business Card)
- **View path**: `/`
- **Main purpose**: To serve as the public-facing homepage and "business card" for TenseAI. It introduces the application to new users and provides clear calls-to-action (CTAs) to either register or log in.
- **Key information to display**:
  - Hero section with the app name (TenseAI) and a clear tagline (e.g., "Master English tenses with AI-powered practice.").
  - A brief description of the product, explaining how it solves user problems with personalized feedback and engaging exercises (derived from PRD).
  - Primary CTA buttons: "Get Started" (links to `/register`) and "Login" (links to `/login`).
- **Key view components**: This will be a static Astro page, not a React island, to ensure fast load times. It will use simple layout blocks and `Button` components.
- **UX, accessibility, and security considerations**: This page is the first impression. It must be lightweight, fully responsive, and accessible, with high-contrast text and clear focus states for the CTAs.

- **View name**: Login
- **View path**: `/login`
- **Main purpose**: To allow registered users to authenticate and access the application.
- **Key information to display**: Email and password input fields, a submit button.
- **Key view components**: `Card`, `Form`, `Input`, `Button`, `Link` (to Register and Forgot Password).
- **UX, accessibility, and security considerations**: The form will provide clear validation messages. All fields will be properly labeled for screen readers.

- **View name**: Register
- **View path**: `/register`
- **Main purpose**: To allow new users to create an account.
- **Key information to display**: Name, email, and password input fields.
- **Key view components**: `Card`, `Form`, `Input`, `Button`, `Link` (to Login).
- **UX, accessibility, and security considerations**: Password strength requirements will be clearly indicated. Form includes client-side validation before submission.

- **View name**: Forgot Password
- **View path**: `/forgot-password`
- **Main purpose**: To initiate the password reset process.
- **Key information to display**: Email input field.
- **Key view components**: `Card`, `Form`, `Input`, `Button`.
- **UX, accessibility, and security considerations**: A success message will confirm that a reset link has been sent if the email exists, without revealing whether the account is registered.

### Private Views (Authenticated)

- **View name**: Practice (Dashboard)
- **View path**: `/app/practice`
- **Main purpose**: To serve as the main entry point for starting a new training session.
- **Key information to display**: Welcome message with user's name, selectors for tense and difficulty.
- **Key view components**: `Select` or `RadioGroup` for tense, `ToggleGroup` for difficulty, `Button` to start the session.
- **UX, accessibility, and security considerations**: The user's default difficulty from onboarding will be pre-selected. All controls will be keyboard accessible.

- **View name**: Training Session
- **View path**: `/app/training-session/:sessionId`
- **Main purpose**: The core interactive learning experience, presented as a chat with an AI coach.
- **Key information to display**: A continuous chat log of AI questions, user answers, round separators, and feedback.
- **Key view components**: `ChatContainer`, `AIMessageBubble`, `UserMessageBubble`, `QuestionBubble` (with option `Button`s), `RoundSeparator`, `RoundSummaryMessage`, `FinalSummaryCard`, `ReportQuestionButton`, `SessionExitButton`.
- **UX, accessibility, and security considerations**:

  - **Layout**: This view uses the **"Focus Mode" layout**. The main application sidebar/navigation is **hidden** to create an immersive, distraction-free environment. Navigation out of the session (e.g., "Zakończ i wróć do pulpitu") is handled by controls _within_ this view.
  - The chat interface will be fully responsive.
  - During the "review" step, answer bubbles become interactive and fully accessible.
  - An "AI is typing..." indicator will manage user expectations during loading.
  - API errors will be displayed as chat messages.

- **View name**: Active Sessions
- **View path**: `/app/training-sessions/active`
- **Main purpose**: To allow users to view, resume, or abandon in-progress training sessions.
- **Key information to display**: A list of active sessions showing tense, difficulty, and current progress.
- **Key view components**: `CardList`, `Button` (Resume), `AlertDialog` (for Abandon confirmation).
- **UX, accessibility, and security considerations**: This view will feature an "empty state" message if no sessions are active. The link to this page in the main navigation is only visible when there's at least one active session.

- **View name**: Theory List
- **View path**: `/app/theory`
- **Main purpose**: To provide a directory of grammar theory articles.
- **Key information to display**: A grid of cards, each representing a grammar tense article. Each card will show the tense name and a brief description.
- **Key view components**: `CardList` (a grid container), `Card`.
- **UX, accessibility, and security considerations**: Cards will have sufficient padding and clear focus states to be easily interactive on all devices.

- **View name**: Theory Article
- **View path**: `/app/theory/:tenseSlug`
- **Main purpose**: To display educational content about a specific grammar tense.
- **Key information to display**: The article content, formatted from Markdown.
- **Key view components**: A custom component for rendering Markdown to styled HTML.
- **UX, accessibility, and security considerations**: Content will be well-structured with headings for readability and screen reader navigation.

- **View name**: History
- **View path**: `/app/history`
- **Main purpose**: To provide a chronological overview of all completed training sessions.
- **Key information to display**: A paginated list of sessions with date, tense, and final score trend.
- **Key view components**: `DataTable` or `CardList`, `PaginationControls`.
- **UX, accessibility, and security considerations**: An "empty state" for new users. Each history item links to the detailed summary view.

- **View name**: History Session Detail
- **View path**: `/app/history/:sessionId`
- **Main purpose**: To allow users to review the detailed results of a past session.
- **Key information to display**: The full, final session summary, including score trends and the AI's detailed error analysis.
- **Key view components**: `FinalSummaryCard` (reused from the Training Session view).
- **UX, accessibility, and security considerations**: This view is read-only.

### Modals

- **Modal name**: Onboarding
- **Trigger**: First login for a new user.
- **Main purpose**: To personalize the user experience.
- **Key information to display**: A two-step flow: 1. Input for user's name. 2. Selection for default difficulty.
- **Key view components**: `Dialog`, `Form`, `Input`, `ToggleGroup`, `Button`.

## 3. User Journey Map

The user journey is designed to be intuitive, guiding the user from setup to practice and review seamlessly.

1.  **Registration & Onboarding**:

    - A new user navigates from the `Register View` to the `Login View` after activating their account via email.
    - Upon first login, the `Onboarding Modal` is displayed. After completion, they are directed to the `Practice View`.

2.  **Core Training Loop**:

    - From the `Practice View` (which includes the main sidebar), the user selects a tense and difficulty, which navigates them to the `Training Session View`.
    - **The UI transitions to "Focus Mode", hiding the main navigation** and presenting the chat interface in full-screen.
    - The user interacts with the AI in a chat format, answering 10 questions per round for 3 rounds.
    - After each round, the user can review and change their answers before submitting them in bulk to the API.
    - The round summary is displayed in the chat, and questions from the completed round become locked.
    - After 3 rounds, a final, detailed summary is displayed as a large card in the chat.

3.  **Session Persistence & Resumption**:

    - If a user leaves a session midway, their progress is saved.
    - Upon their next visit, the "Active Sessions" link in the navigation will be visible.
    - They can navigate to the `Active Sessions View`, select the session, and click "Resume" to return to the `Training Session View` and continue where they left off.

4.  **Review and Reinforcement**:
    - After completing a session, the user can navigate to the `History View`.
    - From here, they can see a list of all past sessions.
    - Clicking on any session takes them to the `History Session Detail View` to review their performance and the AI's feedback.
    - Users can also visit the `Theory` views at any time to reinforce their understanding of grammar rules.

## 4. Layout Strategy: Hub & Focus Mode

### 4.1. Main Layout (The "Hub")

- **Description**: A primary layout component wraps all authenticated "hub" views (e.g., `/app/practice`, `/app/history`, `/app/theory`). It contains the navigation elements and the main content area.
- **Desktop Navigation**: A static sidebar on the left provides primary navigation between:
  - `Practice` (`/app/practice`)
  - `Active Sessions` (`/app/training-sessions/active`) - _Conditionally rendered_
  - `Theory` (`/app/theory`)
  - `History` (`/app/history`)
  - A user profile menu at the bottom provides access to account settings and logout functionality.
- **Mobile Navigation**: On smaller screens, the sidebar is replaced by a responsive top app bar containing the application logo and a hamburger menu icon. The menu opens a drawer with the same navigation links as the desktop sidebar.

### 4.2. Session Layout ("Focus Mode")

- **Description**: To create an immersive, app-like experience, the **`Training Session View` (`/app/training-session/:sessionId`) uses a separate, minimalist layout.**
- **Behavior**:
  - In this layout, the main `SidebarNav` and `MobileNav` are **hidden entirely**.
  - The user is fully focused on the chat interface.
  - Navigation (e.g., "Zakończ sesję" or "Wróć do pulpitu") is handled by specific UI controls _within_ the session view itself, not by a persistent global navigation bar.

### 4.3. Routing

- **Description**: The application uses file-based routing provided by Astro.
- **Public Routes**:
  - The root path `/` displays the public **Landing Page**.
  - Unauthenticated users can also access `/login`, `/register`, and `/forgot-password`.
- **Private Routes**:
  - All authenticated application views are nested under the `/app` prefix (e.g., `/app/practice`).
  - If an _unauthenticated_ user attempts to access any `/app/*` route, they are redirected to the `/login` page.
- **Redirects**:
  - If an _authenticated_ user visits the public routes (`/`, `/login`, `/register`), they are redirected to their main dashboard at `/app/practice`.

## 5. Key Components

- **Chat Components**:
  - `ChatContainer`: The main scrollable area for the conversation.
  - `AIMessageBubble` / `UserMessageBubble`: Visually distinct components for displaying messages from the AI and the user.
  - `QuestionBubble`: A specialized AI bubble that includes interactive buttons for multiple-choice options.
- **Summary Cards**:
  - `RoundSummaryMessage`: A message bubble that displays the score and brief feedback for a completed round.
  - `FinalSummaryCard`: A large, detailed `Card` component used at the end of a session and in the `History Session Detail View` to display comprehensive results and AI analysis.
- **Navigation**:
  - `SidebarNav`: The main desktop navigation component, **used in the Main Layout ("Hub")**.
  - `MobileNav`: The responsive top bar and drawer for mobile devices, **also used in the Main Layout**.
- **Forms & Controls**: Standardized components from Shadcn/ui (`Form`, `Input`, `Button`, `Select`, `Dialog`) will be used for all user input to ensure consistency and accessibility.
- **Data Display**:
  - `DataTable` / `CardList`: Used in the `History` and `Active Sessions` views to present lists of sessions in a clear, organized manner.
  - `PaginationControls`: Component for navigating paginated results from the API (e.g., in the `History` view).
