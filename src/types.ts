/**
 * DTO (Data Transfer Object) and Command Model Types
 *
 * This file contains all type definitions for API request/response DTOs and command models.
 * All types are derived from the database schema types to ensure type safety.
 */

import type { Enums, Tables, TablesInsert, TablesUpdate } from "./db/database.types";

// ============================================================================
// Database Entity Type Aliases (for convenience)
// ============================================================================

export type Profile = Tables<"profiles">;
export type TrainingSession = Tables<"training_sessions">;
export type Round = Tables<"rounds">;
export type Question = Tables<"questions">;
export type UserAnswer = Tables<"user_answers">;
export type QuestionReport = Tables<"question_reports">;

export type ProfileInsert = TablesInsert<"profiles">;
export type TrainingSessionInsert = TablesInsert<"training_sessions">;
export type RoundInsert = TablesInsert<"rounds">;
export type QuestionInsert = TablesInsert<"questions">;
export type UserAnswerInsert = TablesInsert<"user_answers">;
export type QuestionReportInsert = TablesInsert<"question_reports">;

export type ProfileUpdate = TablesUpdate<"profiles">;
export type TrainingSessionUpdate = TablesUpdate<"training_sessions">;
export type RoundUpdate = TablesUpdate<"rounds">;
export type QuestionUpdate = TablesUpdate<"questions">;
export type UserAnswerUpdate = TablesUpdate<"user_answers">;
export type QuestionReportUpdate = TablesUpdate<"question_reports">;

// ============================================================================
// Enum Type Aliases
// ============================================================================

export type DifficultyLevel = Enums<"difficulty_level">;
export type SessionStatus = Enums<"session_status">;
export type TenseName = Enums<"tense_name">;

// ============================================================================
// Common Utility Types
// ============================================================================

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Profile DTOs
// ============================================================================

/**
 * Profile DTO - returned by GET /api/profile
 * Maps directly to the profiles table row
 */
export type ProfileDTO = Profile;

/**
 * Update Profile Command Model - used by PATCH /api/profile
 * All fields are optional as users can update specific fields
 */
export interface UpdateProfileDTO {
  name?: string;
  default_difficulty?: DifficultyLevel;
  onboarding_completed?: boolean;
}

// ============================================================================
// Question DTOs
// ============================================================================

/**
 * Question without correct answer - used when displaying questions to users
 * before they submit answers (security: don't expose correct_answer)
 */
export type QuestionWithoutAnswer = Omit<Question, "correct_answer" | "created_at" | "round_id"> & {
  options: string[]; // Type-narrowed from Json to string[]
};

/**
 * Question with correct answer - used after round completion
 */
export type QuestionWithAnswer = Omit<Question, "created_at" | "round_id"> & {
  options: string[]; // Type-narrowed from Json to string[]
};

/**
 * Question with user's answer and validation - used in round completion response
 */
export interface QuestionReview {
  question_number: number;
  question_text: string;
  options: string[];
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

/**
 * Minimal question data for display in active sessions
 */
export interface QuestionProgress extends QuestionWithoutAnswer {
  user_answer?: string; // Present if user has answered this question
}

// ============================================================================
// Session DTOs
// ============================================================================

/**
 * Create Session Command Model - used by POST /api/sessions
 */
export interface CreateSessionDTO {
  tense: TenseName;
  difficulty: DifficultyLevel;
}

/**
 * Training Session DTO - basic session information
 */
export type TrainingSessionDTO = Pick<
  TrainingSession,
  "id" | "user_id" | "tense" | "difficulty" | "status" | "started_at" | "created_at"
>;

/**
 * Training Session with completion data
 */
export type CompletedTrainingSessionDTO = Pick<
  TrainingSession,
  "id" | "tense" | "difficulty" | "status" | "final_feedback" | "started_at" | "completed_at"
>;

/**
 * Round DTO - basic round information
 */
export type RoundDTO = Pick<Round, "id" | "session_id" | "round_number" | "started_at">;

/**
 * Completed Round DTO - includes score and feedback
 */
export type CompletedRoundDTO = Pick<
  Round,
  "id" | "round_number" | "score" | "completed_at" | "round_feedback" | "started_at"
>;

/**
 * Round with questions - returned by POST /api/sessions (first round)
 * and POST /api/sessions/{sessionId}/rounds (subsequent rounds)
 */
export interface RoundWithQuestionsDTO {
  round: RoundDTO;
  questions: QuestionWithoutAnswer[];
}

/**
 * Session with first round and questions - returned by POST /api/sessions
 */
export interface SessionWithRoundDTO {
  training_session: TrainingSessionDTO;
  current_round: {
    id: string;
    session_id: string;
    round_number: number;
    started_at: string;
    questions: QuestionWithoutAnswer[];
  };
}

/**
 * Progress summary for a session
 */
export interface SessionProgress {
  current_round: number;
  total_rounds: number;
  completed_questions: number;
  total_questions: number;
}

/**
 * Round summary in active session (completed)
 */
export interface CompletedRoundSummary {
  id: string;
  round_number: number;
  score: number;
  completed_at: string;
  round_feedback: string;
}

/**
 * Round summary in active session (in progress)
 */
export interface InProgressRoundSummary {
  id: string;
  round_number: number;
  score: null;
  completed_at: null;
  questions: QuestionProgress[];
}

/**
 * Active session with rounds and progress - returned by GET /api/sessions/active
 */
export interface ActiveSessionDTO {
  training_session: TrainingSessionDTO;
  rounds: (CompletedRoundSummary | InProgressRoundSummary)[];
  progress: SessionProgress;
}

/**
 * Response containing all active sessions
 */
export interface ActiveSessionsResponseDTO {
  active_sessions: ActiveSessionDTO[];
}

/**
 * Session list item with summary - used in history
 */
export interface SessionListItemDTO {
  id: string;
  tense: TenseName;
  difficulty: DifficultyLevel;
  status: SessionStatus;
  started_at: string;
  completed_at: string | null;
  rounds_summary: {
    round_1_score: number | null;
    round_2_score: number | null;
    round_3_score: number | null;
  };
  total_score: string; // Format: "24/30"
}

/**
 * Paginated sessions list - returned by GET /api/sessions
 */
export interface SessionsListResponseDTO {
  training_sessions: SessionListItemDTO[];
  pagination: PaginationMeta;
}

/**
 * Round with all questions and answers - used in session detail
 */
export interface RoundDetailDTO {
  id: string;
  round_number: number;
  score: number;
  round_feedback: string;
  started_at: string;
  completed_at: string;
  questions: {
    id: string;
    question_number: number;
    question_text: string;
    options: string[];
    correct_answer: string;
    user_answer: {
      selected_answer: string;
      is_correct: boolean;
      answered_at: string;
    };
  }[];
}

/**
 * Session summary statistics
 */
export interface SessionSummary {
  total_questions: number;
  correct_answers: number;
  accuracy_percentage: number;
  rounds_scores: number[];
}

/**
 * Complete session details - returned by GET /api/sessions/{sessionId}
 */
export interface SessionDetailResponseDTO {
  training_session: CompletedTrainingSessionDTO;
  rounds: RoundDetailDTO[];
  summary: SessionSummary;
}

/**
 * Completed session summary - returned by POST /api/sessions/{sessionId}/complete
 */
export interface CompletedSessionSummary {
  rounds_scores: number[];
  total_score: string; // Format: "24/30"
  accuracy_percentage: number;
  incorrect_count: number;
  perfect_score: boolean;
}

/**
 * Complete session response
 */
export interface CompleteSessionResponseDTO {
  training_session: CompletedTrainingSessionDTO;
  summary: CompletedSessionSummary;
}

// ============================================================================
// Round DTOs
// ============================================================================

/**
 * Complete round response - returned by POST /api/rounds/{roundId}/complete
 * Contains the round data and all questions with validation results
 */
export interface CompleteRoundResponseDTO {
  round: CompletedRoundDTO;
  questions_review: QuestionReview[];
}

// ============================================================================
// Answer DTOs
// ============================================================================

/**
 * Submit Answer Command Model - used by POST /api/answers
 */
export interface SubmitAnswerDTO {
  question_id: string;
  selected_answer: string;
}

/**
 * Answer response - returned by POST /api/answers
 * Note: is_correct is not included (revealed only after round completion)
 */
export interface AnswerResponseDTO {
  answer: {
    id: string;
    question_id: string;
    session_id: string;
    selected_answer: string;
    answered_at: string;
  };
  message: string;
}

// ============================================================================
// Question Report DTOs
// ============================================================================

/**
 * Create Question Report Command Model - used by POST /api/question-reports
 */
export interface CreateQuestionReportDTO {
  question_id: string;
  report_comment?: string;
}

/**
 * Question Report DTO - returned by POST /api/question-reports
 */
export type QuestionReportDTO = QuestionReport;

/**
 * Question report with question preview - used in reports list
 */
export interface QuestionReportWithPreview extends QuestionReport {
  question_preview: {
    question_text: string;
    tense: TenseName;
  };
}

/**
 * Paginated question reports list - returned by GET /api/question-reports
 */
export interface QuestionReportsListResponseDTO {
  reports: QuestionReportWithPreview[];
  pagination: PaginationMeta;
}

// ============================================================================
// Rate Limiting Error DTO
// ============================================================================

/**
 * Rate limit error response
 */
export interface RateLimitErrorResponse extends ErrorResponse {
  retry_after: number;
}

// ============================================================================
// Validation Error DTO
// ============================================================================

/**
 * Validation error response with field-specific errors
 */
export interface ValidationErrorResponse extends ErrorResponse {
  details: Record<string, string>;
}
