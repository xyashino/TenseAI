# 10x Astro Starter

A modern, opinionated starter template for building fast, accessible, and AI-friendly web applications.

## Tech Stack

### Frontend

- **[Astro 5](https://astro.build/)** - Fast, performant website framework with minimal JavaScript
- **[React 19](https://react.dev/)** - Interactive UI components where needed
- **[TypeScript 5](https://www.typescriptlang.org/)** - Static typing and enhanced IDE support
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework for rapid styling
- **[Shadcn/ui](https://ui.shadcn.com/)** - Accessible, customizable React component library

### Backend

- **[Supabase](https://supabase.com/)**
  - PostgreSQL database
  - Backend-as-a-Service with SDKs
  - Built-in user authentication
  - Open-source solution with flexible hosting options

### AI Integration

- **[Openrouter.ai](https://openrouter.ai/)**
  - Access to multiple AI models (OpenAI, Anthropic, Google, and more)
  - Cost optimization through model selection
  - Financial limits on API keys

### CI/CD & Hosting

- **GitHub Actions** - Automated CI/CD pipelines
- **DigitalOcean** - Application hosting via Docker containers
- **Automated Deployment** - Automatic Docker reset on VPS when changes are pushed to main branch

## Getting Started Locally

### Prerequisites

- **Node.js**: Version `22.14.0` (use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions)
- **pnpm**: Package manager (install via `npm install -g pnpm`)
- **Supabase Account**: For database and authentication
- **Openrouter.ai API Key**: For AI model access

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/TenseAI.git
   cd TenseAI
   ```

2. **Set the correct Node version**

   ```bash
   nvm use
   ```

   If you don't have the required version installed:

   ```bash
   nvm install 22.14.0
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Set up environment variables**

   Create a `.env` file in the project root with the following variables:

   ```env
   # Supabase Configuration
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Openrouter AI Configuration
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

5. **Run the development server**

   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:4321`

## Available Scripts

| Command         | Description                            |
| --------------- | -------------------------------------- |
| `pnpm dev`      | Start the development server           |
| `pnpm build`    | Build the production-ready application |
| `pnpm preview`  | Preview the production build locally   |
| `pnpm astro`    | Run Astro CLI commands                 |
| `pnpm lint`     | Check code for linting errors          |
| `pnpm lint:fix` | Automatically fix linting errors       |
| `pnpm format`   | Format code using Prettier             |

## Deployment

For detailed deployment instructions, including Docker setup and automated VPS deployment, see [deploy/README.md](deploy/README.md).

## Project Scope

### In Scope for MVP

- ✅ User registration, login, and password management
- ✅ 4 grammar tenses: Present Simple, Past Simple, Present Perfect, Future Simple
- ✅ Multiple-choice question training mode
- ✅ Two difficulty levels: Basic (A2/B1) and Advanced (B2)
- ✅ AI-generated questions and feedback
- ✅ Manually created theory content in Markdown
- ✅ History of completed sessions with detailed summaries
- ✅ Session pause and resume functionality
- ✅ User-facing mechanism for reporting question errors

### Out of Scope for MVP

- ❌ Additional training modes (fill-in-the-blanks, sentence construction)
- ❌ Gamification elements (points, streaks, badges, leaderboards)
- ❌ Spaced repetition system for reviewing questions
- ❌ Coverage of all English grammar tenses
- ❌ More granular difficulty levels
- ❌ Social features (friend lists, sharing results)
- ❌ Data export features (save summary as PDF)
- ❌ Advanced user statistics or progress charts
- ❌ Monetization features (subscriptions, ads, in-app purchases)

## Project Status

**Current Version**: 0.0.1 (MVP Development Phase)

TenseAI is currently in active development. The Minimum Viable Product (MVP) is being built to validate the core concept: AI-driven practice can significantly improve grammar acquisition for English language learners.

### Success Metrics

- **Primary Goal**: Launch a functional, stable MVP version
- **Qualitative Goal**: Gather feedback from at least 10 test users with 70% positive reception
- **Quantitative Metric**: Track total number of completed training sessions across all users

## License

License information to be determined.

---

**Note**: This is a hobby project focused on creating an effective learning tool for English language learners. Contributions and feedback are welcome!
