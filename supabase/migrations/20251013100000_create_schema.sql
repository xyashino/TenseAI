-- =====================================================================
-- Migration: Initial Schema Setup - Types, Tables, and Indexes
-- =====================================================================
-- Description: Creates the core database schema for TenseAI including:
--   - Custom ENUM types for difficulty levels, tenses, and session status
--   - All application tables (profiles, training_sessions, rounds, questions, user_answers, question_reports)
--   - Primary keys, foreign keys, and check constraints
--   - Indexes for query optimization
--
-- Affected Tables: profiles, training_sessions, rounds, questions, user_answers, question_reports
-- Dependencies: Requires Supabase Auth (auth.users table)
-- Safety: This is the initial schema creation - safe to run on empty database
-- =====================================================================

-- =====================================================================
-- Section 1: Custom ENUM Types
-- =====================================================================

-- difficulty_level: Defines vocabulary complexity levels for training sessions
-- Basic: A2/B1 vocabulary level for beginners
-- Advanced: B2 vocabulary level for intermediate learners
create type difficulty_level as enum ('Basic', 'Advanced');

-- tense_name: Defines the four grammar tenses available for practice
-- Each tense represents a distinct grammatical concept in English
create type tense_name as enum (
  'Present Simple',
  'Past Simple',
  'Present Perfect',
  'Future Simple'
);

-- session_status: Tracks the lifecycle state of a training session
-- active: Session is in progress or paused, user can resume
-- completed: All 3 rounds finished, final feedback generated
create type session_status as enum ('active', 'completed');

-- =====================================================================
-- Section 2: Tables
-- =====================================================================

-- ---------------------------------------------------------------------
-- Table: profiles
-- ---------------------------------------------------------------------
-- Purpose: Extends Supabase Auth users with application-specific data
-- Relationship: One-to-one with auth.users
-- Notes: Profile is automatically created via trigger when user signs up
-- ---------------------------------------------------------------------
create table profiles (
  -- Primary key and foreign key to auth.users
  -- ON DELETE CASCADE ensures profile is removed when auth user is deleted
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- User's display name collected during onboarding
  name text not null,

  -- User's preferred difficulty level for new training sessions
  default_difficulty difficulty_level not null,

  -- Tracks onboarding completion to determine app entry point
  onboarding_completed boolean not null default false,

  -- Timestamp tracking
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on profiles table
-- Users should only access their own profile data
alter table profiles enable row level security;

-- ---------------------------------------------------------------------
-- Table: training_sessions
-- ---------------------------------------------------------------------
-- Purpose: Represents a complete training session consisting of 3 rounds
-- Relationship: Many-to-one with profiles (one user has many sessions)
-- Business Logic: Session remains 'active' until all rounds are completed
-- ---------------------------------------------------------------------
create table training_sessions (
  -- Unique session identifier
  id uuid primary key default gen_random_uuid(),

  -- Owner of the session
  -- ON DELETE CASCADE ensures sessions are removed when user is deleted
  user_id uuid not null references profiles(user_id) on delete cascade,

  -- Grammar tense being practiced in this session
  tense tense_name not null,

  -- Difficulty level for this session
  difficulty difficulty_level not null,

  -- Current state of the session (active or completed)
  status session_status not null default 'active',

  -- AI-generated comprehensive analysis (Markdown format)
  -- Populated when session is completed
  final_feedback text,

  -- Timestamp tracking
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraint: Completed sessions must have a completion timestamp
  constraint completed_sessions_have_timestamp
    check (status = 'active' or (status = 'completed' and completed_at is not null))
);

-- Enable RLS on training_sessions table
-- Users should only access their own sessions
alter table training_sessions enable row level security;

-- ---------------------------------------------------------------------
-- Table: rounds
-- ---------------------------------------------------------------------
-- Purpose: Stores individual rounds within a training session
-- Relationship: Many-to-one with training_sessions (3 rounds per session)
-- Business Logic: Each session has exactly 3 rounds, numbered 1-3
-- ---------------------------------------------------------------------
create table rounds (
  -- Unique round identifier
  id uuid primary key default gen_random_uuid(),

  -- Parent training session
  -- ON DELETE CASCADE ensures rounds are removed when session is deleted
  session_id uuid not null references training_sessions(id) on delete cascade,

  -- Round sequence number (1, 2, or 3)
  round_number integer not null check (round_number >= 1 and round_number <= 3),

  -- Number of correct answers out of 10
  -- Populated when round is completed
  score integer check (score >= 0 and score <= 10),

  -- Brief AI-generated feedback for this round
  -- Helps user understand performance before continuing
  round_feedback text,

  -- Timestamp tracking
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraint: Each session can only have one round with a given number
  constraint unique_round_per_session unique (session_id, round_number)
);

-- Enable RLS on rounds table
-- Users should only access rounds from their own sessions
alter table rounds enable row level security;

-- ---------------------------------------------------------------------
-- Table: questions
-- ---------------------------------------------------------------------
-- Purpose: Stores AI-generated multiple-choice questions for each round
-- Relationship: Many-to-one with rounds (10 questions per round)
-- Business Logic: Questions are generated by AI when round starts
-- ---------------------------------------------------------------------
create table questions (
  -- Unique question identifier
  id uuid primary key default gen_random_uuid(),

  -- Parent round
  -- ON DELETE CASCADE ensures questions are removed when round is deleted
  round_id uuid not null references rounds(id) on delete cascade,

  -- Question sequence number within the round (1-10)
  question_number integer not null check (question_number >= 1 and question_number <= 10),

  -- The question prompt displayed to the user
  question_text text not null,

  -- Multiple-choice options stored as JSON array
  -- Example: ["Option A", "Option B", "Option C", "Option D"]
  -- Must have at least 2 options
  options jsonb not null check (jsonb_array_length(options) >= 2),

  -- The correct answer from the options array
  correct_answer text not null,

  -- Timestamp tracking
  created_at timestamptz not null default now(),

  -- Constraint: Each round can only have one question with a given number
  constraint unique_question_per_round unique (round_id, question_number)
);

-- Enable RLS on questions table
-- Users should only access questions from their own sessions
alter table questions enable row level security;

-- ---------------------------------------------------------------------
-- Table: user_answers
-- ---------------------------------------------------------------------
-- Purpose: Records user responses to questions during training
-- Relationship: One-to-one with questions, many-to-one with training_sessions
-- Business Logic: Each question can only be answered once
-- Design Note: Includes session_id for efficient querying of all session answers
-- ---------------------------------------------------------------------
create table user_answers (
  -- Unique answer identifier
  id uuid primary key default gen_random_uuid(),

  -- The question being answered
  -- ON DELETE CASCADE ensures answers are removed when question is deleted
  question_id uuid not null references questions(id) on delete cascade,

  -- Session context for efficient querying
  -- ON DELETE CASCADE ensures answers are removed when session is deleted
  -- This denormalization avoids complex joins when fetching session summaries
  session_id uuid not null references training_sessions(id) on delete cascade,

  -- User's selected option from the question's options array
  selected_answer text not null,

  -- Whether the selected answer matches the correct answer
  -- Calculated at answer submission time
  is_correct boolean not null,

  -- When the answer was submitted
  answered_at timestamptz not null default now(),

  -- Constraint: Each question can only be answered once
  constraint one_answer_per_question unique (question_id)
);

-- Enable RLS on user_answers table
-- Users should only access their own answers
alter table user_answers enable row level security;

-- ---------------------------------------------------------------------
-- Table: question_reports
-- ---------------------------------------------------------------------
-- Purpose: Captures user feedback on potentially incorrect questions
-- Relationship: Many-to-one with questions, many-to-one with profiles
-- Business Logic: Users can report problems with AI-generated questions
-- Future Use: Admins can review and resolve reports
-- ---------------------------------------------------------------------
create table question_reports (
  -- Unique report identifier
  id uuid primary key default gen_random_uuid(),

  -- The question being reported
  -- ON DELETE CASCADE ensures reports are removed when question is deleted
  question_id uuid not null references questions(id) on delete cascade,

  -- User who submitted the report
  -- ON DELETE CASCADE ensures reports are removed when user is deleted
  user_id uuid not null references profiles(user_id) on delete cascade,

  -- Optional user comment explaining the issue
  report_comment text,

  -- Report status for admin workflow
  -- pending: Awaiting review
  -- reviewed: Admin has reviewed but not resolved
  -- resolved: Issue has been addressed
  status text not null default 'pending',

  -- Timestamp tracking
  created_at timestamptz not null default now(),

  -- Admin review tracking
  reviewed_at timestamptz,
  reviewed_by text,

  -- Constraint: Status must be one of the valid values
  constraint valid_report_status check (status in ('pending', 'reviewed', 'resolved'))
);

-- Enable RLS on question_reports table
-- Users should only access their own reports
alter table question_reports enable row level security;

-- =====================================================================
-- Section 3: Indexes for Query Optimization
-- =====================================================================

-- ---------------------------------------------------------------------
-- Indexes for training_sessions table
-- ---------------------------------------------------------------------

-- Fast retrieval of all sessions for a specific user
-- Used in: Session history view, user dashboard
create index idx_training_sessions_user_id on training_sessions(user_id);

-- Quick lookup of active sessions
-- Used in: Resume session logic
create index idx_training_sessions_status on training_sessions(status);

-- Composite index for efficiently finding a user's active sessions
-- Used in: App entry point to determine if user has a session in progress
-- This is the most common query pattern in the app
create index idx_training_sessions_user_status on training_sessions(user_id, status);

-- ---------------------------------------------------------------------
-- Indexes for rounds table
-- ---------------------------------------------------------------------

-- Fast retrieval of all rounds for a specific session
-- Used in: Session detail view, progress calculation
create index idx_rounds_session_id on rounds(session_id);

-- Composite index for ordered retrieval of session rounds
-- Used in: Sequential round navigation, determining next round
create index idx_rounds_session_number on rounds(session_id, round_number);

-- ---------------------------------------------------------------------
-- Indexes for questions table
-- ---------------------------------------------------------------------

-- Fast retrieval of all questions for a specific round
-- Used in: Round quiz view, question navigation
create index idx_questions_round_id on questions(round_id);

-- ---------------------------------------------------------------------
-- Indexes for user_answers table
-- ---------------------------------------------------------------------

-- Fast retrieval of all answers for a specific session
-- Used in: Session summary, score calculation, analytics
-- This denormalized approach avoids joining through rounds
create index idx_user_answers_session_id on user_answers(session_id);

-- Quick lookup of answer for a specific question
-- Used in: Checking if question was already answered, fetching user's response
create index idx_user_answers_question_id on user_answers(question_id);

-- ---------------------------------------------------------------------
-- Indexes for question_reports table
-- ---------------------------------------------------------------------

-- Fast retrieval of all reports submitted by a specific user
-- Used in: User's report history
create index idx_question_reports_user_id on question_reports(user_id);

-- Quick filtering of reports by status
-- Used in: Admin dashboard to view pending reports
create index idx_question_reports_status on question_reports(status);

-- =====================================================================
-- End of Migration
-- =====================================================================
-- Next Steps:
--   1. Run migration: 20251013100100_create_functions_triggers.sql
--   2. Run migration: 20251013100200_enable_rls_policies.sql
-- =====================================================================
