# TenseAI Database Schema Plan

## 1. Tables, Columns, Data Types, and Constraints

### 1.1. `profiles`
**Purpose**: Stores custom user data beyond what Supabase Auth provides.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `user_id` | `UUID` | PRIMARY KEY, FOREIGN KEY → `auth.users(id)` ON DELETE CASCADE | Links to Supabase auth user |
| `name` | `TEXT` | NOT NULL | User's display name (collected during onboarding) |
| `default_difficulty` | `difficulty_level` | NOT NULL | User's preferred difficulty level |
| `onboarding_completed` | `BOOLEAN` | NOT NULL DEFAULT FALSE | Tracks whether user has completed onboarding |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | Profile creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | Profile last update timestamp |

---

### 1.2. `training_sessions`
**Purpose**: Represents a complete training session consisting of 3 rounds.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | `UUID` | PRIMARY KEY DEFAULT gen_random_uuid() | Unique session identifier |
| `user_id` | `UUID` | NOT NULL, FOREIGN KEY → `profiles(user_id)` ON DELETE CASCADE | Session owner |
| `tense` | `tense_name` | NOT NULL | Grammar tense being practiced |
| `difficulty` | `difficulty_level` | NOT NULL | Difficulty level for this session |
| `status` | `session_status` | NOT NULL DEFAULT 'active' | Current session state |
| `final_feedback` | `TEXT` | NULL | AI-generated detailed analysis (Markdown format) |
| `started_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | Session start timestamp |
| `completed_at` | `TIMESTAMPTZ` | NULL | Session completion timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | Record last update timestamp |

**Constraints**:
- `CHECK (status = 'active' OR (status = 'completed' AND completed_at IS NOT NULL))` - Ensures completed sessions have a completion timestamp

---

### 1.3. `rounds`
**Purpose**: Stores data for individual rounds within a training session (3 rounds per session).

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | `UUID` | PRIMARY KEY DEFAULT gen_random_uuid() | Unique round identifier |
| `session_id` | `UUID` | NOT NULL, FOREIGN KEY → `training_sessions(id)` ON DELETE CASCADE | Parent session |
| `round_number` | `INTEGER` | NOT NULL, CHECK (round_number >= 1 AND round_number <= 3) | Round sequence (1, 2, or 3) |
| `score` | `INTEGER` | NULL, CHECK (score >= 0 AND score <= 10) | Number of correct answers (0-10) |
| `round_feedback` | `TEXT` | NULL | Brief AI-generated feedback for this round |
| `started_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | Round start timestamp |
| `completed_at` | `TIMESTAMPTZ` | NULL | Round completion timestamp |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | Record last update timestamp |

**Constraints**:
- `UNIQUE (session_id, round_number)` - Each session can only have one round with a given number

---

### 1.4. `questions`
**Purpose**: Stores AI-generated multiple-choice questions for each round.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | `UUID` | PRIMARY KEY DEFAULT gen_random_uuid() | Unique question identifier |
| `round_id` | `UUID` | NOT NULL, FOREIGN KEY → `rounds(id)` ON DELETE CASCADE | Parent round |
| `question_number` | `INTEGER` | NOT NULL, CHECK (question_number >= 1 AND question_number <= 10) | Question sequence within round (1-10) |
| `question_text` | `TEXT` | NOT NULL | The question prompt |
| `options` | `JSONB` | NOT NULL | Multiple-choice options (array of strings) |
| `correct_answer` | `TEXT` | NOT NULL | The correct answer from options |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | Record creation timestamp |

**Constraints**:
- `UNIQUE (round_id, question_number)` - Each round can only have one question with a given number
- `CHECK (jsonb_array_length(options) >= 2)` - Ensures at least 2 options exist

**Note**: The `options` JSONB column structure will be:
```json
["Option A", "Option B", "Option C", "Option D"]
```

---

### 1.5. `user_answers`
**Purpose**: Records user responses to questions during training sessions.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | `UUID` | PRIMARY KEY DEFAULT gen_random_uuid() | Unique answer identifier |
| `question_id` | `UUID` | NOT NULL, FOREIGN KEY → `questions(id)` ON DELETE CASCADE | The question being answered |
| `session_id` | `UUID` | NOT NULL, FOREIGN KEY → `training_sessions(id)` ON DELETE CASCADE | Session context |
| `selected_answer` | `TEXT` | NOT NULL | User's selected option |
| `is_correct` | `BOOLEAN` | NOT NULL | Whether the answer was correct |
| `answered_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | When the answer was submitted |

**Constraints**:
- `UNIQUE (question_id)` - Each question can only be answered once

**Note**: Answers are inserted in a single batch when a round is completed via `POST /api/rounds/{roundId}/complete`. In-round answers are not persisted to the database; they are kept client-side until submission.

---

### 1.6. `question_reports`
**Purpose**: Captures user-submitted feedback on potentially incorrect questions.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | `UUID` | PRIMARY KEY DEFAULT gen_random_uuid() | Unique report identifier |
| `question_id` | `UUID` | NOT NULL, FOREIGN KEY → `questions(id)` ON DELETE CASCADE | Reported question |
| `user_id` | `UUID` | NOT NULL, FOREIGN KEY → `profiles(user_id)` ON DELETE CASCADE | User who reported |
| `report_comment` | `TEXT` | NULL | Optional user comment about the issue |
| `status` | `TEXT` | NOT NULL DEFAULT 'pending' | Report status (pending, reviewed, resolved) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() | Report creation timestamp |
| `reviewed_at` | `TIMESTAMPTZ` | NULL | When the report was reviewed |
| `reviewed_by` | `TEXT` | NULL | Admin/developer who reviewed |

---

## 2. Custom PostgreSQL Types (ENUMs)

### 2.1. `difficulty_level`
```sql
CREATE TYPE difficulty_level AS ENUM ('Basic', 'Advanced');
```
- **Basic**: A2/B1 vocabulary level
- **Advanced**: B2 vocabulary level

### 2.2. `tense_name`
```sql
CREATE TYPE tense_name AS ENUM (
  'Present Simple',
  'Past Simple',
  'Present Perfect',
  'Future Simple'
);
```

### 2.3. `session_status`
```sql
CREATE TYPE session_status AS ENUM ('active', 'completed');
```
- **active**: Session is in progress or paused
- **completed**: Session has been fully completed (all 3 rounds)

---

## 3. Relationships Between Tables

### 3.1. `auth.users` ↔ `profiles`
- **Type**: One-to-One
- **Relationship**: One user account has exactly one profile
- **Implementation**: `profiles.user_id` is both PRIMARY KEY and FOREIGN KEY to `auth.users(id)`

### 3.2. `profiles` ↔ `training_sessions`
- **Type**: One-to-Many
- **Relationship**: One user can have multiple training sessions
- **Implementation**: `training_sessions.user_id` → `profiles(user_id)`

### 3.3. `training_sessions` ↔ `rounds`
- **Type**: One-to-Many (specifically, 1:3)
- **Relationship**: Each training session has exactly 3 rounds
- **Implementation**: `rounds.session_id` → `training_sessions(id)`
- **Constraint**: `UNIQUE (session_id, round_number)` with `round_number` CHECK (1-3)

### 3.4. `rounds` ↔ `questions`
- **Type**: One-to-Many (specifically, 1:10)
- **Relationship**: Each round has exactly 10 questions
- **Implementation**: `questions.round_id` → `rounds(id)`
- **Constraint**: `UNIQUE (round_id, question_number)` with `question_number` CHECK (1-10)

### 3.5. `questions` ↔ `user_answers`
- **Type**: One-to-One
- **Relationship**: Each question receives exactly one answer from the user
- **Implementation**: `user_answers.question_id` → `questions(id)` with UNIQUE constraint

### 3.6. `training_sessions` ↔ `user_answers`
- **Type**: One-to-Many
- **Relationship**: Each session has multiple user answers (30 answers for 3 rounds × 10 questions)
- **Implementation**: `user_answers.session_id` → `training_sessions(id)`
- **Purpose**: Provides direct access to all answers for a session without joining through rounds

### 3.7. `questions` ↔ `question_reports`
- **Type**: One-to-Many
- **Relationship**: A question can be reported multiple times by different users
- **Implementation**: `question_reports.question_id` → `questions(id)`

### 3.8. `profiles` ↔ `question_reports`
- **Type**: One-to-Many
- **Relationship**: A user can submit multiple question reports
- **Implementation**: `question_reports.user_id` → `profiles(user_id)`

---

## 4. Indexes

### 4.1. Primary Purpose Indexes

| Index Name | Table | Column(s) | Type | Purpose |
|------------|-------|-----------|------|---------|
| `idx_training_sessions_user_id` | `training_sessions` | `user_id` | B-tree | Fast retrieval of user's session history |
| `idx_training_sessions_status` | `training_sessions` | `status` | B-tree | Quick lookup of active sessions |
| `idx_rounds_session_id` | `rounds` | `session_id` | B-tree | Fast retrieval of session rounds |
| `idx_questions_round_id` | `questions` | `round_id` | B-tree | Fast retrieval of round questions |
| `idx_user_answers_session_id` | `user_answers` | `session_id` | B-tree | Fast retrieval of all answers for a session |
| `idx_user_answers_question_id` | `user_answers` | `question_id` | B-tree | Quick lookup of answer for a specific question |
| `idx_question_reports_user_id` | `question_reports` | `user_id` | B-tree | Fast retrieval of reports by user |
| `idx_question_reports_status` | `question_reports` | `status` | B-tree | Quick filtering of pending reports |

### 4.2. Composite Indexes

| Index Name | Table | Column(s) | Type | Purpose |
|------------|-------|-----------|------|---------|
| `idx_training_sessions_user_status` | `training_sessions` | `user_id, status` | B-tree | Efficiently find user's active sessions |
| `idx_rounds_session_number` | `rounds` | `session_id, round_number` | B-tree | Fast ordered retrieval of session rounds |

**Note**: PostgreSQL automatically creates indexes on PRIMARY KEY and UNIQUE constraints, so no explicit indexes are needed for those.

---

## 5. Row-Level Security (RLS) Policies

RLS will be enabled on all tables containing user-specific data. Users can only access their own data through policies that match `user_id` with `auth.uid()`.

### 5.1. `profiles` Table Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: System can insert profiles (for trigger)
CREATE POLICY "System can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);
```

### 5.2. `training_sessions` Table Policies

```sql
-- Enable RLS
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON training_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own sessions
CREATE POLICY "Users can create own sessions"
  ON training_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON training_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON training_sessions FOR DELETE
  USING (auth.uid() = user_id);
```

### 5.3. `rounds` Table Policies

```sql
-- Enable RLS
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view rounds from their own sessions
CREATE POLICY "Users can view own session rounds"
  ON rounds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM training_sessions
      WHERE training_sessions.id = rounds.session_id
      AND training_sessions.user_id = auth.uid()
    )
  );

-- Policy: Users can create rounds for their own sessions
CREATE POLICY "Users can create own session rounds"
  ON rounds FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_sessions
      WHERE training_sessions.id = rounds.session_id
      AND training_sessions.user_id = auth.uid()
    )
  );

-- Policy: Users can update rounds in their own sessions
CREATE POLICY "Users can update own session rounds"
  ON rounds FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM training_sessions
      WHERE training_sessions.id = rounds.session_id
      AND training_sessions.user_id = auth.uid()
    )
  );
```

### 5.4. `questions` Table Policies

```sql
-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view questions from their own sessions
CREATE POLICY "Users can view own session questions"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rounds
      JOIN training_sessions ON training_sessions.id = rounds.session_id
      WHERE rounds.id = questions.round_id
      AND training_sessions.user_id = auth.uid()
    )
  );

-- Policy: Users can create questions for their own sessions
CREATE POLICY "Users can create own session questions"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rounds
      JOIN training_sessions ON training_sessions.id = rounds.session_id
      WHERE rounds.id = questions.round_id
      AND training_sessions.user_id = auth.uid()
    )
  );
```

### 5.5. `user_answers` Table Policies

```sql
-- Enable RLS
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own answers
CREATE POLICY "Users can view own answers"
  ON user_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM training_sessions
      WHERE training_sessions.id = user_answers.session_id
      AND training_sessions.user_id = auth.uid()
    )
  );

-- Policy: Users can create answers for their own sessions
CREATE POLICY "Users can create own answers"
  ON user_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_sessions
      WHERE training_sessions.id = user_answers.session_id
      AND training_sessions.user_id = auth.uid()
    )
  );
```

### 5.6. `question_reports` Table Policies

```sql
-- Enable RLS
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON question_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own reports
CREATE POLICY "Users can create own reports"
  ON question_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Only admins should be able to update/delete reports
-- Admin policies would be added separately with a role-based system
```

---

## 6. Database Triggers and Functions

### 6.1. Auto-create Profile on User Registration

**Purpose**: Automatically create a profile entry when a new user is registered in Supabase Auth.

```sql
-- Function to create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, default_difficulty, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'Basic',
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 6.2. Update `updated_at` Timestamp

**Purpose**: Automatically update the `updated_at` column when records are modified.

```sql
-- Generic function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_training_sessions
  BEFORE UPDATE ON training_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_rounds
  BEFORE UPDATE ON rounds
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

## 7. Additional Design Notes and Considerations

### 7.1. Normalization Level
The schema follows **Third Normal Form (3NF)**, which provides a good balance between data integrity and query performance for the MVP:
- No partial dependencies (all non-key attributes depend on the entire primary key)
- No transitive dependencies (non-key attributes depend only on the primary key)
- Minimal data redundancy

### 7.2. Data Integrity Measures
1. **Foreign Key Constraints**: All relationships use `ON DELETE CASCADE` to maintain referential integrity and automatically clean up related data when a user or session is deleted.
2. **Check Constraints**: Ensure data validity (e.g., scores 0-10, round numbers 1-3, question numbers 1-10).
3. **Unique Constraints**: Prevent duplicate rounds or questions within a session/round.
4. **Not Null Constraints**: Enforce required fields at the database level.
5. **ENUM Types**: Restrict values to predefined sets for `difficulty_level`, `tense_name`, and `session_status`.

### 7.3. Performance Considerations
1. **Indexes**: Strategically placed on foreign keys and frequently queried columns.
2. **JSONB for Options**: More flexible than multiple columns and allows efficient querying if needed in the future.
3. **Composite Indexes**: `(user_id, status)` on `training_sessions` for the common "find user's active session" query.
4. **Denormalized session_id in user_answers**: Avoids complex joins when fetching all answers for a session summary.

### 7.4. Security Architecture
1. **Row-Level Security (RLS)**: Primary security mechanism ensuring data isolation between users.
2. **Policy-Based Access**: Explicit policies for SELECT, INSERT, UPDATE, and DELETE operations.
3. **Secure Functions**: The `handle_new_user()` function uses `SECURITY DEFINER` to allow the trigger to insert into profiles even though it runs in the context of the auth schema.

### 7.5. Scalability Path
While designed for MVP scale, the schema supports future enhancements:
- **Question Bank**: A separate `question_bank` table could be added later without modifying the current structure.
- **Additional Tenses**: Simply add values to the `tense_name` ENUM.
- **More Difficulty Levels**: Add values to the `difficulty_level` ENUM.
- **Statistics/Analytics**: The current structure supports complex queries for user progress tracking.

### 7.6. Theory Content Management
As per requirements, theory articles will be stored as **static Markdown files** in the Astro frontend project, not in the database. The frontend will be responsible for:
- Loading and rendering Markdown files
- Mapping tense names to their respective theory files
- Providing navigation between theory articles

### 7.7. Session Resume Logic
The application logic will:
1. Query for sessions with `status = 'active'` for the current user
2. If found, determine the last completed round by checking `rounds.completed_at`
3. Resume from the appropriate point (mid-round or between rounds). In-round progress is restored from client-side cache; the database does not store partial answers until the round is completed.
4. Update the session to `status = 'completed'` when all 3 rounds are finished

### 7.8. AI Integration Points
The schema supports AI integration at three key points:
1. **Question Generation**: Populate `questions` table with AI-generated content (question text, options, correct answer)
2. **Round Feedback**: Store brief AI feedback in `rounds.round_feedback`
3. **Final Analysis**: Store detailed, Markdown-formatted feedback in `training_sessions.final_feedback`

### 7.9. Metrics Collection
For the success metric tracking mentioned in the PRD:
- **Completed Sessions**: `SELECT COUNT(*) FROM training_sessions WHERE status = 'completed'`
- **Per-User Completion**: `SELECT user_id, COUNT(*) FROM training_sessions WHERE status = 'completed' GROUP BY user_id`
- **Completion Rates**: Can be calculated by comparing active vs completed sessions

### 7.10. Future Considerations (Post-MVP)
The schema is designed to accommodate future features without major restructuring:
- **Spaced Repetition**: Could add a `review_schedule` table linking to questions
- **Gamification**: Could add `achievements` and `user_points` tables
- **Social Features**: Could add `user_connections` and `shared_results` tables
- **Advanced Statistics**: Current structure supports complex analytical queries

---

## 8. Migration Order

When implementing this schema, create database objects in the following order to respect dependencies:

1. Custom ENUM types (`difficulty_level`, `tense_name`, `session_status`)
2. `profiles` table
3. `training_sessions` table
4. `rounds` table
5. `questions` table
6. `user_answers` table
7. `question_reports` table
8. Indexes (can be created after tables or concurrently)
9. Triggers and functions (`handle_new_user`, `handle_updated_at`)
10. RLS policies (enable RLS first, then create policies)

---

## 9. Summary

This database schema provides a robust foundation for the TenseAI MVP. It balances:
- **Data Integrity**: Through constraints, foreign keys, and ENUM types
- **Security**: Via comprehensive Row-Level Security policies
- **Performance**: With strategic indexes and efficient data structures
- **Scalability**: Designed to accommodate future features without major refactoring
- **Simplicity**: Focused on MVP requirements while maintaining professional standards

The schema directly supports all functional requirements from the PRD (REQ-01 through REQ-27) and implements all decisions from the database planning session. It's ready to be translated into SQL migration files and deployed to a Supabase PostgreSQL database.
