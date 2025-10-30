# TenseAI REST API Plan

## 1. Overview

This REST API plan defines all endpoints required for the TenseAI MVP application. The API is designed to work with:

  - **Frontend**: Astro 5 + React 19 + TypeScript 5
  - **Backend**: Supabase (PostgreSQL + Auth + BaaS)
  - **AI Service**: Openrouter.ai for question generation and feedback
  - **Authentication**: Supabase Auth with JWT tokens

All endpoints use Row-Level Security (RLS) to ensure users can only access their own data. The API follows RESTful principles with some RPC-style endpoints for complex business operations.

-----

## 2. Base URL and Common Headers

**Base URL**: `/api` (relative to application root)

**Common Request Headers**:

```
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

**Common Response Headers**:

```
Content-Type: application/json
```

-----

## 3. Authentication

### 3.1. Authentication Mechanism

The API uses **Supabase Auth** for authentication. All authentication operations (registration, login, password reset) are handled directly through Supabase client SDK, not through custom API endpoints.

**Authentication Flow**:

1.  User registers/logs in via Supabase Auth SDK
2.  Supabase returns a JWT token
3.  Client includes JWT token in `Authorization` header for all API requests
4.  API validates token and extracts `user_id` from `auth.uid()`
5.  RLS policies enforce data access control based on `user_id`

**Supabase Auth Operations** (handled by Supabase SDK, not custom endpoints):

  - Registration: `supabase.auth.signUp()`
  - Login: `supabase.auth.signInWithPassword()`
  - Password Reset: `supabase.auth.resetPasswordForEmail()`
  - Logout: `supabase.auth.signOut()`

### 3.2. Authorization

All API endpoints require a valid JWT token in the `Authorization` header. Users can only access their own data due to RLS policies:

  - **profiles**: `auth.uid() = user_id`
  - **training\_sessions**: `auth.uid() = user_id`
  - **rounds/questions/answers**: Accessible if user owns the parent session
  - **question\_reports**: `auth.uid() = user_id`

-----

## 4. Resources

### 4.1. Resource List

| Resource | Database Table | Description |
|----------|---------------|-------------|
| **Profile** | `profiles` | User profile data (name, preferences, onboarding status) |
| **Sessions** | `training_sessions` | Training sessions with 3 rounds each |
| **Rounds** | `rounds` | Individual rounds within a session (3 per session) |
| **Questions** | `questions` | AI-generated multiple-choice questions (10 per round) |
| **Answers** | `user_answers` | User's answers to questions |
| **Question Reports** | `question_reports` | User-reported question errors |

-----

## 5. API Endpoints

### 5.1. Profile Endpoints

#### GET /api/profile

Get the current user's profile.

**Authentication**: Required

**Query Parameters**: None

**Request Body**: None

**Response (200 OK)**:

```json
{
  "user_id": "uuid",
  "name": "string",
  "default_difficulty": "Basic" | "Advanced",
  "onboarding_completed": boolean,
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

**Error Responses**:

  - `401 Unauthorized`: Missing or invalid authentication token
  - `404 Not Found`: Profile not found (should not happen if trigger works correctly)

-----

#### PATCH /api/profile

Update the current user's profile (used for onboarding and preference changes).

**Authentication**: Required

**Query Parameters**: None

**Request Body**:

```json
{
  "name": "string (optional)",
  "default_difficulty": "Basic" | "Advanced (optional)",
  "onboarding_completed": boolean (optional)
}
```

**Validation**:

  - `name`: Non-empty string if provided
  - `default_difficulty`: Must be "Basic" or "Advanced" if provided

**Response (200 OK)**:

```json
{
  "user_id": "uuid",
  "name": "string",
  "default_difficulty": "Basic" | "Advanced",
  "onboarding_completed": boolean,
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

**Error Responses**:

  - `400 Bad Request`: Invalid request body or validation failure
    ```json
    {
      "error": "Validation error",
      "details": {
        "field": "error message"
      }
    }
    ```
  - `401 Unauthorized`: Missing or invalid authentication token

-----

### 5.2. Training Session Endpoints

#### POST /api/training-sessions

Create a new training session. This endpoint also creates the first round and generates 10 AI questions for it.

**Authentication**: Required

**Query Parameters**: None

**Request Body**:

```json
{
  "tense": "Present Simple" | "Past Simple" | "Present Perfect" | "Future Simple",
  "difficulty": "Basic" | "Advanced"
}
```

**Validation**:

  - `tense`: Must be one of the four supported tenses
  - `difficulty`: Must be "Basic" or "Advanced"

**Business Logic**:

1.  Rate limit check: Verify user hasn't exceeded session creation limit (2 per minute)
2.  Create new training\_session record with status 'active'
3.  Create round \#1 for the session
4.  Call AI service to generate 10 questions for round \#1
5.  Save questions to database
6.  Return session with first round data

**Response (201 Created)**:

```json
{
  "training_session": {
    "id": "uuid",
    "user_id": "uuid",
    "tense": "string",
    "difficulty": "string",
    "status": "active",
    "started_at": "ISO 8601 datetime",
    "created_at": "ISO 8601 datetime"
  },
  "current_round": {
    "id": "uuid",
    "session_id": "uuid",
    "round_number": 1,
    "started_at": "ISO 8601 datetime",
    "questions": [
      {
        "id": "uuid",
        "question_number": 1,
        "question_text": "string",
        "options": ["string", "string", "string", "string"]
      },
      // ... 9 more questions (correct_answer not included)
    ]
  }
}
```

**Error Responses**:

  - `400 Bad Request`: Invalid tense or difficulty
  - `401 Unauthorized`: Missing or invalid authentication token
  - `429 Too Many Requests`: Rate limit exceeded
    ```json
    {
      "error": "Rate limit exceeded",
      "message": "You can create up to 2 sessions per minute. Please try again later.",
      "retry_after": 60
    }
    ```
  - `500 Internal Server Error`: AI service failure
    ```json
    {
      "error": "Failed to generate questions",
      "message": "AI service is currently unavailable. Please try again later."
    }
    ```


#### GET /api/training-sessions

Get a paginated list of the user's training sessions (summaries).
*Used for both the "History" page and the "Active Sessions" page.*

**Authentication**: Required

**Query Parameters**:

  - `status` (optional): Filter by status ("active" | "completed"). **Default: "completed"**
  - `page` (optional): Page number (1-based). Default: 1
  - `limit` (optional): Items per page (1-100). Default: 20
  - `sort` (optional): Sort order ("started\_at\_desc" | "started\_at\_asc"). Default: "started\_at\_desc"

**Request Body**: None

**Response (200 OK)**:
*Returns a paginated list of session summaries. The structure is THE SAME for 'active' and 'completed'.*

```json
{
  "training-sessions": [
    {
      "id": "uuid",
      "tense": "string",
      "difficulty": "string",
      "status": "completed", // or "active"
      "started_at": "ISO 8601 datetime",
      "completed_at": "ISO 8601 datetime", // will be null if status is "active"
      "rounds_summary": [
        {
          "id": "string",
          "round_number": "number",
          "score": "number | null",
          "completed_at": "string | null",
        }
      ]
    },
    // ... more sessions
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 87,
    "items_per_page": 20,
    "has_next": true,
    "has_previous": false
  }
}
```

**Note**: The frontend will use `GET /api/training-sessions?status=completed` for the History page and `GET /api/training-sessions?status=active` for the Active Sessions page.

**Error Responses**:

  - `400 Bad Request`: Invalid query parameters
  - `401 Unauthorized`: Missing or invalid authentication token

-----
#### GET /api/training-sessions/{sessionId}

Get detailed information about a specific training session, including all rounds, questions, and answers.

**Authentication**: Required

**Path Parameters**:

  - `sessionId`: UUID of the session

**Query Parameters**: None

**Request Body**: None

**Response (200 OK)**:

```json
{
  "training_session": {
    "id": "uuid",
    "tense": "string",
    "difficulty": "string",
    "status": "completed",
    "final_feedback": "string (Markdown, null if not completed)",
    "started_at": "ISO 8601 datetime",
    "completed_at": "ISO 8601 datetime"
  },
  "rounds": [
    {
      "id": "uuid",
      "round_number": 1,
      "score": 7,
      "round_feedback": "string (Markdown)",
      "started_at": "ISO 8601 datetime",
      "completed_at": "ISO 8601 datetime",
      "questions": [
        {
          "id": "uuid",
          "question_number": 1,
          "question_text": "string",
          "options": ["string", "string", "string", "string"],
          "correct_answer": "string",
          "user_answer": {
            "selected_answer": "string",
            "is_correct": boolean,
            "answered_at": "ISO 8601 datetime"
          }
        },
        // ... 9 more questions
      ]
    },
    // ... 2 more rounds
  ],
  "summary": {
    "total_questions": 30,
    "correct_answers": 24,
    "accuracy_percentage": 80,
    "rounds_scores": [7, 8, 9]
  }
}
```

**Error Responses**:

  - `401 Unauthorized`: Missing or invalid authentication token
  - `403 Forbidden`: Session does not belong to the current user (RLS blocks this)
  - `404 Not Found`: Session with given ID does not exist

-----

#### DELETE /api/training-sessions/{sessionId}

Delete a training session (abandon an active training session).

**Authentication**: Required

**Path Parameters**:

  - `sessionId`: UUID of the session

**Query Parameters**: None

**Request Body**: None

**Response (204 No Content)**:
No response body.

**Error Responses**:

  - `401 Unauthorized`: Missing or invalid authentication token
  - `403 Forbidden`: Session does not belong to the current user
  - `404 Not Found`: Session with given ID does not exist

**Note**: Cascading deletes will remove all related rounds, questions, and answers.

-----

### 5.3. Round Endpoints

#### POST /api/training-sessions/{sessionId}/rounds

Create and start the next round in a training session.

**Authentication**: Required

**Path Parameters**:

  - `sessionId`: UUID of the session

**Query Parameters**: None

**Request Body**: None

**Validation**:

  - Session must belong to current user
  - Session must have status 'active'
  - Previous round (if any) must be completed
  - Session must have fewer than 3 rounds

**Business Logic**:

1.  Determine next round number (2 or 3)
2.  Create new round record
3.  Call AI service to generate 10 questions
4.  Save questions to database
5.  Return round with questions

**Response (201 Created)**:

```json
{
  "round": {
    "id": "uuid",
    "session_id": "uuid",
    "round_number": 2,
    "started_at": "ISO 8601 datetime"
  },
  "questions": [
    {
      "id": "uuid",
      "question_number": 1,
      "question_text": "string",
      "options": ["string", "string", "string", "string"]
    },
    // ... 9 more questions
  ]
}
```

**Error Responses**:

  - `400 Bad Request`: Cannot create round (previous round not completed, or already have 3 rounds)
    ```json
    {
      "error": "Cannot create round",
      "message": "Previous round must be completed first"
    }
    ```
  - `401 Unauthorized`: Missing or invalid authentication token
  - `403 Forbidden`: Session does not belong to current user
  - `404 Not Found`: Session not found
  - `500 Internal Server Error`: AI service failure

-----

#### POST /api/rounds/{roundId}/complete

Complete a round by submitting all 10 answers, calculate score, and generate AI feedback.

**Authentication**: Required

**Path Parameters**:

  - `roundId`: UUID of the round

**Query Parameters**: None

**Request Body**:

```json
{
  "answers": [
    { "question_id": "uuid", "selected_answer": "string" },
    { "question_id": "uuid", "selected_answer": "string" }
    // ... exactly 10 items total
  ]
}
```

**Validation**:

  - Round must belong to a session owned by current user
  - Request must include exactly 10 answers
  - Each `question_id` must belong to this `roundId` and be unique within the payload
  - Each `selected_answer` must match one of the question's `options`
  - Round must not already be completed

**Business Logic**:

1.  Fetch questions for the round and validate the payload against them (count, membership, and options)
2.  For each answer, determine correctness by comparing to the question's `correct_answer`
3.  Persist all answers to `user_answers` in a single transaction (enforce one answer per question)
4.  Calculate score (count correct answers)
5.  Call AI service to generate brief round feedback (send only incorrect answers for context)
6.  Update round with score, feedback, and `completed_at`
7.  Return round summary with all questions and validation results

**Response (200 OK)**:

```json
{
  "round": {
    "id": "uuid",
    "session_id": "uuid",
    "round_number": 1,
    "score": 7,
    "round_feedback": "string (Markdown)",
    "completed_at": "ISO 8601 datetime"
  },
  "questions_review": [
    {
      "question_number": 1,
      "question_text": "string",
      "options": ["string", "string", "string", "string"],
      "user_answer": "string",
      "correct_answer": "string",
      "is_correct": true
    },
    {
      "question_number": 2,
      "question_text": "string",
      "options": ["string", "string", "string", "string"],
      "user_answer": "string",
      "correct_answer": "string",
      "is_correct": true
    },
    {
      "question_number": 3,
      "question_text": "string",
      "options": ["string", "string", "string", "string"],
      "user_answer": "string",
      "correct_answer": "string",
      "is_correct": false
    }
    // ... all 10 questions with validation results
  ]
}
```

**Note**: This endpoint returns ALL 10 questions with their correct answers and validation results. This is the first time the user sees whether their answers were correct or not.

**Error Responses**:

  - `400 Bad Request`: Invalid payload (wrong count, invalid question, or option), or round already completed
    ```json
    {
      "error": "Cannot complete round",
      "message": "Payload must contain exactly 10 valid answers belonging to this round"
    }
    ```
  - `401 Unauthorized`: Missing or invalid authentication token
  - `403 Forbidden`: Round does not belong to user's session
  - `404 Not Found`: Round not found
  - `500 Internal Server Error`: AI service failure

-----

### 5.4. Training Session Completion Endpoint

#### POST /api/training-sessions/{sessionId}/complete

Complete a training session after all 3 rounds are finished. Generates comprehensive AI feedback.

**Authentication**: Required

**Path Parameters**:

  - `sessionId`: UUID of the session

**Query Parameters**: None

**Request Body**: None

**Validation**:

  - Session must belong to current user
  - Session status must be 'active'
  - All 3 rounds must be completed

**Business Logic**:

1.  Verify all 3 rounds are completed
2.  Collect all incorrect answers across all rounds
3.  If all answers were correct, generate congratulations message
4.  Otherwise, call AI service to generate detailed feedback analyzing errors
5.  Update session: status = 'completed', completed\_at = NOW(), final\_feedback = AI response
6.  Return complete session summary

**Response (200 OK)**:

```json
{
  "training_session": {
    "id": "uuid",
    "tense": "string",
    "difficulty": "string",
    "status": "completed",
    "final_feedback": "string (Markdown)",
    "started_at": "ISO 8601 datetime",
    "completed_at": "ISO 8601 datetime"
  },
  "summary": {
    "rounds_scores": [7, 8, 9],
    "total_score": "24/30",
    "accuracy_percentage": 80,
    "incorrect_count": 6,
    "perfect_score": false
  }
}
```

**Error Responses**:

  - `400 Bad Request`: Not all rounds completed or session already completed
    ```json
    {
      "error": "Cannot complete session",
      "message": "All 3 rounds must be completed first",
      "completed_rounds": 2
    }
    ```
  - `401 Unauthorized`: Missing or invalid authentication token
  - `403 Forbidden`: Session does not belong to current user
  - `404 Not Found`: Session not found
  - `500 Internal Server Error`: AI service failure

-----

### 5.5. Question Report Endpoints

#### POST /api/question-reports

Report a question as potentially incorrect.

**Authentication**: Required

**Query Parameters**: None

**Request Body**:

```json
{
  "question_id": "uuid",
  "report_comment": "string (optional)"
}
```

**Validation**:

  - `question_id`: Must be a valid UUID
  - `report_comment`: Optional string, max 1000 characters

**Response (201 Created)**:

```json
{
  "report": {
    "id": "uuid",
    "question_id": "uuid",
    "user_id": "uuid",
    "report_comment": "string or null",
    "status": "pending",
    "created_at": "ISO 8601 datetime"
  },
  "message": "Thank you for your feedback! We will review this question."
}
```

**Error Responses**:

  - `400 Bad Request`: Invalid question\_id or validation failure
  - `401 Unauthorized`: Missing or invalid authentication token
  - `404 Not Found`: Question not found

-----

#### GET /api/question-reports

Get current user's question reports.

**Authentication**: Required

**Query Parameters**:

  - `page` (optional): Page number (1-based). Default: 1
  - `limit` (optional): Items per page (1-100). Default: 20
  - `status` (optional): Filter by status ("pending" | "reviewed" | "resolved")

**Request Body**: None

**Response (200 OK)**:

```json
{
  "reports": [
    {
      "id": "uuid",
      "question_id": "uuid",
      "report_comment": "string or null",
      "status": "pending",
      "created_at": "ISO 8601 datetime",
      "reviewed_at": "ISO 8601 datetime or null",
      "reviewed_by": "string or null",
      "question_preview": {
        "question_text": "string",
        "tense": "string"
      }
    },
    // ... more reports
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 2,
    "total_items": 23,
    "items_per_page": 20,
    "has_next": true,
    "has_previous": false
  }
}
```

**Error Responses**:

  - `400 Bad Request`: Invalid query parameters
  - `401 Unauthorized`: Missing or invalid authentication token

-----

## 6. Validation Rules

### 6.1. Field-Level Validations

| Field | Rules |
|-------|-------|
| `name` | Required (for onboarding), non-empty string, max 255 chars |
| `tense` | Required, must be one of: "Present Simple", "Past Simple", "Present Perfect", "Future Simple" |
| `difficulty` | Required, must be "Basic" or "Advanced" |
| `round_number` | Integer, must be 1, 2, or 3 |
| `score` | Integer, must be 0-10 |
| `question_number` | Integer, must be 1-10 |
| `options` | Array, must have at least 2 items |
| `answers` | Array, must contain exactly 10 items when completing a round |
| `answers[].question_id` | Required UUID; must belong to the specified round |
| `answers[].selected_answer` | Required; must match one of the question's options |
| `report_comment` | Optional string, max 1000 chars |
| `page` | Integer, min 1 |
| `limit` | Integer, min 1, max 100 |

### 6.2. Business Rule Validations

1.  **Rate limiting on AI generation**: Maximum 2 sessions or rounds created per minute to prevent abuse of expensive AI calls
2.  **Rounds must be created in order**: Cannot create round 3 before round 2
3.  **Previous round must be completed**: Before starting next round
4.  **All questions must be answered**: Before completing a round
5.  **All rounds must be completed**: Before completing a session
6.  **Question can only be answered once**: Enforced by UNIQUE constraint
7.  **Completed session must have completed\_at**: Enforced by CHECK constraint
8.  **Each round has exactly 10 questions**: Enforced during question generation
9.  **Each session has exactly 3 rounds**: Enforced by application logic

-----

## 7. Error Response Format

All error responses follow a consistent format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {
    // Optional: Additional context
  }
}
```

### 7.1. Standard HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200 OK` | Success | Successful GET, PATCH, or action endpoints |
| `201 Created` | Resource created | Successful POST creating new resource |
| `204 No Content` | Success, no response | Successful DELETE |
| `400 Bad Request` | Invalid input | Validation errors, business rule violations |
| `401 Unauthorized` | Authentication required | Missing or invalid JWT token |
| `403 Forbidden` | Permission denied | RLS blocks access (user doesn't own resource) |
| `404 Not Found` | Resource not found | Requested resource doesn't exist |
| `409 Conflict` | Conflict | Duplicate resource (e.g., user already answered a question) |
| `422 Unprocessable Entity` | Semantic errors | Request is valid but semantically incorrect |
| `500 Internal Server Error` | Server error | Unexpected errors, AI service failures |

-----

## 8. Business Logic Implementation

### 8.1. Session Flow

**Starting a Training Session**:

1.  Check rate limit (2 per minute) → return 429 if exceeded
2.  Create training\_sessions record with status 'active'
3.  Create round \#1
4.  Generate 10 questions via AI
5.  Save questions to database
6.  Return training session + round + questions

**During a Round**:

1.  User selects answers client-side; no immediate API calls are made
2.  User does NOT see if an answer is correct (no feedback yet)
3.  The client prepares a batch of 10 answers for submission at round completion

**Completing a Round**:

1.  Client calls POST /api/rounds/{roundId}/complete with all 10 answers
2.  Server validates payload, persists answers, and calculates score
3.  Server retrieves questions and correct answers to build validation results
4.  Server generates brief round feedback via AI (using incorrect answers as context)
5.  Server saves score, feedback, and `completed_at` to database
6.  Server returns round summary with ALL questions showing correct/incorrect validation
7.  This is the first time user sees which answers were right or wrong

**Starting Next Round**:

1.  Verify previous round completed
2.  Create round \#2 or \#3
3.  Generate 10 new questions via AI
4.  Return round + questions

**Completing a Training Session**:

1.  Verify all 3 rounds completed
2.  Collect all incorrect answers across rounds
3.  Generate comprehensive feedback via AI (or congratulations if perfect)
4.  Update training session: status='completed', completed\_at=NOW(), final\_feedback
5.  Return complete summary

### 8.2. AI Integration Points

The API calls OpenRouter.ai at three specific points:

1.  **Question Generation** (POST /api/training-sessions, POST /api/training-sessions/{id}/rounds):

      - Input: tense, difficulty, round context
      - Output: 10 multiple-choice questions with options and correct answers
      - Tone: Friendly, contextual, vocabulary-appropriate

2.  **Round Feedback** (POST /api/rounds/{id}/complete):

      - Input: round number, score, incorrect answers with questions
      - Output: Brief encouraging feedback (2-3 sentences)
      - Tone: Supportive "friendly coach"

3.  **Final Training Session Feedback** (POST /api/training-sessions/{id}/complete):

      - Input: All rounds scores, all incorrect answers with full context
      - Output: Detailed analysis in Markdown (patterns, explanations, tips)
      - Tone: Encouraging but informative

**AI Error Handling**:

  - If AI service fails, return 500 error
  - Consider retry logic with exponential backoff
  - Log failures for monitoring
  - Provide user-friendly error messages

### 8.3. Resume Logic

When user returns to app:

1.  Frontend calls `GET /api/training-sessions?status=active`
2.  If the `sessions` array in the response is not empty:
      - Frontend displays a list of all active sessions (e.g., "Present Simple - Round 2/3", "Past Simple - Round 1/3").
      - User selects which session to resume.
      - Frontend loads the data for the selected session.
      - Check which round is current (last incomplete round).
      - Load current round's questions.
      - Restore any locally cached in-round answers (client-side) and resume from the next unanswered question.
3.  If the `sessions` array is empty:
      - Show "Start New Training Session" screen.

-----

## 9. Performance Considerations

### 9.1. Database Optimization

  - **Indexes**: Already defined in schema (user\_id, session\_id, round\_id, etc.)
  - **RLS**: Postgres policies filter at database level (efficient)
  - **Pagination**: Implemented on history and reports endpoints
  - **Eager Loading**: When fetching session details, use joins to get rounds, questions, answers in single query

### 9.2. Caching Strategy

**Recommended Caching**:

1.  **Profile**: Cache on client, invalidate on update
2.  **Active Training Session List**: Short-lived cache (1-2 minutes) or no cache, frequently refresh.
3.  **Training Session History**: Cache list, invalidate when new training session completed
4.  **Training Session Details**: Cache completed training sessions (immutable)

### 9.3. Rate Limiting

Recommended rate limits per authenticated user:

  - **Standard endpoints**: 100 requests/minute
  - **Training session creation** (POST /api/training-sessions): 2 requests/minute (expensive AI calls - generates first round with 10 questions)
  - **Report submission**: 10 requests/minute

**Note**: No rate limit on POST /api/training-sessions/{id}/rounds as it's part of normal training session flow (users need to progress through 3 rounds sequentially).

-----

## 10. Implementation with Astro & Supabase

### 10.1. Astro API Routes Structure

```
src/pages/api/
├── profile/
│   └── index.ts                    # GET, PATCH /api/profile
├── training-sessions/
│   ├── index.ts                    # GET, POST /api/training-sessions
│   ├── [sessionId].ts              # GET, DELETE /api/training-sessions/{sessionId}
│   ├── [sessionId]/
│   │   ├── rounds.ts               # POST /api/training-sessions/{sessionId}/rounds
│   │   └── complete.ts             # POST /api/training-sessions/{sessionId}/complete
├── rounds/
│   └── [roundId]/
│       └── complete.ts             # POST /api/rounds/{roundId}/complete
└── question-reports/
    └── index.ts                    # GET, POST /api/question-reports
```

### 10.2. Supabase Client Usage

Each API route should:

1.  Initialize Supabase client with user's JWT from Authorization header
2.  Let RLS handle authorization automatically
3.  Use Supabase client for database operations

Example:

```typescript
import { createServerClient } from '@supabase/auth-helpers-shared'

// This is a simplified example; actual implementation depends on Astro middleware
const supabase = createServerClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    cookies: {
      get: (name) => request.headers.get('cookie')
      // ... set/remove
    }
  }
)

// Example logic for GET /api/training-sessions
const status = url.searchParams.get('status') || 'completed';

if (status === 'active') {
  // Fetch detailed active sessions
} else {
  // Fetch paginated completed sessions
}
```

### 10.3. TypeScript Types

Create shared types from database schema:

```typescript
// src/types.ts
export type DifficultyLevel = 'Basic' | 'Advanced'
export type TenseName = 'Present Simple' | 'Past Simple' | 'Present Perfect' | 'Future Simple'
export type SessionStatus = 'active' | 'completed'

export interface Profile {
  user_id: string
  name: string
  default_difficulty: DifficultyLevel
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface TrainingSession {
  id: string
  user_id: string
  tense: TenseName
  difficulty: DifficultyLevel
  status: SessionStatus
  final_feedback: string | null
  started_at: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ... more types
```

-----

## 11. Testing Considerations

### 11.1. Endpoint Testing Checklist

For each endpoint, test:

  - ✅ Success case with valid data
  - ✅ Authentication failure (missing/invalid token)
  - ✅ Authorization failure (accessing other user's data)
  - ✅ Validation failures (invalid input data)
  - ✅ Business rule violations
  - ✅ Resource not found cases
  - ✅ Edge cases (boundary values, empty responses)

### 11.2. Integration Testing Scenarios

**Complete Training Session Flow**:

1.  Create user and profile
2.  Start training session → verify round 1 created
3.  Answer 10 questions
4.  Complete round 1 → verify score calculated
5.  Start round 2 → verify questions generated
6.  Answer 10 questions
7.  Complete round 2
8.  Start round 3
9.  Answer 10 questions
10. Complete round 3
11. Complete training session → verify final feedback
12. Fetch history (`GET /api/training-sessions?status=completed`) → verify training session appears
13. Fetch training session details → verify all data present

**Resume Training Session Flow**:

1.  Start training session
2.  Answer 5 questions in round 1
3.  Close app (simulate by not completing round)
4.  Fetch active training sessions list (`GET /api/training-sessions?status=active`)
5.  Verify the session is in the list (status = active)
6.  Restore 5 previously selected answers from client-side cache
7.  Answer remaining 5 questions
8.  Complete round normally

**Multiple Active Sessions Flow**:

1.  Start "Present Simple" session (Session A)
2.  Answer 2 questions in Session A, Round 1
3.  Start "Past Simple" session (Session B)
4.  Answer 3 questions in Session B, Round 1
5.  Call `GET /api/training-sessions?status=active`
6.  Verify response contains *two* sessions (A and B)
7.  Resume and complete Session A
8.  Call `GET /api/training-sessions?status=active` again
9.  Verify response contains only Session B

-----

## 12. Security Best Practices

### 12.1. Input Sanitization

  - Validate all user inputs against expected types and ranges
  - Escape user-provided content before storing (prevent XSS)
  - Use parameterized queries (Supabase handles this)
  - Validate UUIDs are valid format

### 12.2. Authorization

  - Never trust client-provided user\_id
  - Always use `auth.uid()` from JWT token
  - Rely on RLS policies for data access control
  - Double-check business logic prevents unauthorized actions

### 12.3. Data Exposure

  - Never return `correct_answer` in question lists (GET questions)
  - Never return `is_correct` or correctness signals during the round
  - Only reveal `correct_answer` and `is_correct` after round completion (POST /api/rounds/{id}/complete)
  - Also return correct answers in completed training session views (GET /api/training-sessions/{id} for completed training sessions)
  - Filter sensitive fields in API responses
  - Don't expose internal error details in production

### 12.4. Rate Limiting & Abuse Prevention

  - Implement rate limiting per user
  - Monitor for suspicious patterns (rapid answer submissions)
  - Log all question reports for review
  - Consider CAPTCHA for sensitive operations

-----

## 13. Monitoring & Logging

### 13.1. Recommended Logging

Log the following events:

  - All authentication failures
  - AI service calls (with response times)
  - AI service failures
  - Question report submissions
  - Training session completions
  - Error responses (4xx, 5xx)

### 13.2. Metrics to Track

  - API response times (p50, p95, p99)
  - AI service response times
  - Active training sessions count (per user and total)
  - Completed training sessions per day
  - Question reports per day
  - Error rates by endpoint

-----

## 15. Summary

This REST API plan provides a complete, production-ready specification for the TenseAI MVP. It includes:

✅ All required endpoints for user profile, onboarding, training sessions, and history
✅ Comprehensive request/response formats with TypeScript-friendly structures
✅ Validation rules matching database constraints
✅ Business logic for session flow and AI integration
✅ Authentication and authorization via Supabase Auth + RLS
✅ Error handling with consistent response format
✅ Performance considerations (caching, pagination, rate limiting)
✅ Implementation guidance for Astro API routes
✅ Testing and security best practices

The API is designed to be:

  - **RESTful** where appropriate (resource CRUD operations)
  - **RPC-style** for complex business operations (complete round/session)
  - **Secure** through Supabase Auth and RLS policies
  - **Performant** with strategic indexes and caching
  - **Developer-friendly** with clear documentation and TypeScript types
  - **Scalable** to accommodate future features

All 27 functional requirements from the PRD are supported by these endpoints, and all database constraints and relationships are properly enforced through validation and business logic.