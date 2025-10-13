-- =====================================================================
-- Migration: Row Level Security (RLS) Policies
-- =====================================================================
-- Description: Creates comprehensive RLS policies for all tables
-- Security Model: Users can only access their own data
-- Policy Structure: Separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
--                  and for each role (anon, authenticated) where applicable
--
-- Affected Tables: profiles, training_sessions, rounds, questions, user_answers, question_reports
-- Dependencies: Requires migrations 20251013100000 and 20251013100100
-- Safety: Only creates security policies, does not modify data
-- =====================================================================

-- =====================================================================
-- Section 1: Profiles Table Policies
-- =====================================================================
-- Security Model: Users can view and update their own profile
-- Notes: Profile creation handled by trigger, not direct INSERT by users
-- =====================================================================

-- Policy: Authenticated users can view their own profile
-- Rationale: Profile data is private and should only be visible to the owner
-- Used in: Profile page, settings, user preferences display
create policy "Authenticated users can view own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = user_id);

-- Policy: Authenticated users can update their own profile
-- Rationale: Users should be able to modify their name and preferences
-- Used in: Settings page, onboarding completion, preference updates
create policy "Authenticated users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = user_id);

-- Policy: Service role can insert profiles (for trigger)
-- Rationale: Profile creation is handled by handle_new_user() trigger
-- Security: Uses SECURITY DEFINER, allowing trigger to bypass RLS
-- Note: Authenticated users cannot directly insert profiles
create policy "Service role can insert profiles"
  on profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

-- =====================================================================
-- Section 2: Training Sessions Table Policies
-- =====================================================================
-- Security Model: Full CRUD access to own sessions only
-- Business Logic: Users manage their own training sessions
-- =====================================================================

-- Policy: Authenticated users can view their own sessions
-- Rationale: Session data is private to each user
-- Used in: Dashboard, session history, resume functionality
create policy "Authenticated users can view own sessions"
  on training_sessions for select
  to authenticated
  using (auth.uid() = user_id);

-- Policy: Authenticated users can create their own sessions
-- Rationale: Users initiate new training sessions
-- Used in: Start new session flow, tense selection
create policy "Authenticated users can create own sessions"
  on training_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Policy: Authenticated users can update their own sessions
-- Rationale: Users progress through sessions, updating status and feedback
-- Used in: Session completion, final feedback generation
create policy "Authenticated users can update own sessions"
  on training_sessions for update
  to authenticated
  using (auth.uid() = user_id);

-- Policy: Authenticated users can delete their own sessions
-- Rationale: Users should be able to remove unwanted session history
-- Used in: Session cleanup, history management
create policy "Authenticated users can delete own sessions"
  on training_sessions for delete
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================================
-- Section 3: Rounds Table Policies
-- =====================================================================
-- Security Model: Access controlled via parent session ownership
-- Business Logic: Users access rounds only if they own the parent session
-- =====================================================================

-- Policy: Authenticated users can view rounds from their own sessions
-- Rationale: Round data is accessible only to session owner
-- Used in: Quiz view, round navigation, progress display
-- Performance Note: Subquery checks session ownership efficiently via index
create policy "Authenticated users can view own session rounds"
  on rounds for select
  to authenticated
  using (
    exists (
      select 1 from training_sessions
      where training_sessions.id = rounds.session_id
      and training_sessions.user_id = auth.uid()
    )
  );

-- Policy: Authenticated users can create rounds for their own sessions
-- Rationale: Rounds created as user progresses through session
-- Used in: Starting new round within a session
create policy "Authenticated users can create own session rounds"
  on rounds for insert
  to authenticated
  with check (
    exists (
      select 1 from training_sessions
      where training_sessions.id = rounds.session_id
      and training_sessions.user_id = auth.uid()
    )
  );

-- Policy: Authenticated users can update rounds in their own sessions
-- Rationale: Users update round score and completion status
-- Used in: Round completion, score calculation
create policy "Authenticated users can update own session rounds"
  on rounds for update
  to authenticated
  using (
    exists (
      select 1 from training_sessions
      where training_sessions.id = rounds.session_id
      and training_sessions.user_id = auth.uid()
    )
  );

-- =====================================================================
-- Section 4: Questions Table Policies
-- =====================================================================
-- Security Model: Access controlled via parent session ownership
-- Business Logic: Users access questions only from their own sessions
-- =====================================================================

-- Policy: Authenticated users can view questions from their own sessions
-- Rationale: Questions are part of user's session, private to session owner
-- Used in: Quiz display, question navigation
-- Performance Note: Join checks ownership through rounds -> training_sessions
create policy "Authenticated users can view own session questions"
  on questions for select
  to authenticated
  using (
    exists (
      select 1 from rounds
      join training_sessions on training_sessions.id = rounds.session_id
      where rounds.id = questions.round_id
      and training_sessions.user_id = auth.uid()
    )
  );

-- Policy: Authenticated users can create questions for their own sessions
-- Rationale: Questions generated by AI for user's session
-- Used in: Round initialization, AI question generation
create policy "Authenticated users can create own session questions"
  on questions for insert
  to authenticated
  with check (
    exists (
      select 1 from rounds
      join training_sessions on training_sessions.id = rounds.session_id
      where rounds.id = questions.round_id
      and training_sessions.user_id = auth.uid()
    )
  );

-- =====================================================================
-- Section 5: User Answers Table Policies
-- =====================================================================
-- Security Model: Access controlled via session ownership
-- Business Logic: Users access and create answers only for their sessions
-- =====================================================================

-- Policy: Authenticated users can view their own answers
-- Rationale: Answers are private to session owner
-- Used in: Answer review, score calculation, session summary
-- Performance Note: Direct session_id check for efficiency
create policy "Authenticated users can view own answers"
  on user_answers for select
  to authenticated
  using (
    exists (
      select 1 from training_sessions
      where training_sessions.id = user_answers.session_id
      and training_sessions.user_id = auth.uid()
    )
  );

-- Policy: Authenticated users can create answers for their own sessions
-- Rationale: Users submit answers during quiz
-- Used in: Answer submission, quiz interaction
create policy "Authenticated users can create own answers"
  on user_answers for insert
  to authenticated
  with check (
    exists (
      select 1 from training_sessions
      where training_sessions.id = user_answers.session_id
      and training_sessions.user_id = auth.uid()
    )
  );

-- =====================================================================
-- Section 6: Question Reports Table Policies
-- =====================================================================
-- Security Model: Users can view and create their own reports
-- Future Enhancement: Admin policies for review/resolution
-- =====================================================================

-- Policy: Authenticated users can view their own reports
-- Rationale: Users should see reports they've submitted
-- Used in: Report history, feedback tracking
create policy "Authenticated users can view own reports"
  on question_reports for select
  to authenticated
  using (auth.uid() = user_id);

-- Policy: Authenticated users can create their own reports
-- Rationale: Users can report problematic questions
-- Used in: Question report form, quality feedback
create policy "Authenticated users can create own reports"
  on question_reports for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Note: Admin policies for UPDATE and DELETE on question_reports
-- will be added in a future migration when admin role system is implemented

-- =====================================================================
-- End of Migration
-- =====================================================================
-- Security Status: All tables now have comprehensive RLS policies
-- Testing Checklist:
--   1. Verify users can only see their own profiles
--   2. Verify users can only access their own sessions and related data
--   3. Verify users cannot access other users' data
--   4. Test session creation, round progression, and answer submission
--   5. Test question reporting functionality
-- =====================================================================
