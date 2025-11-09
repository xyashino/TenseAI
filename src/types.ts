import type { Enums, Tables, TablesInsert, TablesUpdate } from "./db/database.types";

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

export type DifficultyLevel = Enums<"difficulty_level">;
export type SessionStatus = Enums<"session_status">;
export type TenseName = Enums<"tense_name">;

export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

export type ProfileDTO = Profile;

export interface UpdateProfileDTO {
  name?: string;
  default_difficulty?: DifficultyLevel;
  onboarding_completed?: boolean;
}

export type QuestionWithoutAnswer = Omit<Question, "correct_answer" | "created_at" | "round_id"> & {
  options: string[];
};

export type QuestionWithAnswer = Omit<Question, "created_at" | "round_id"> & {
  options: string[];
};

export interface QuestionReview {
  question_number: number;
  question_text: string;
  options: string[];
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

export interface QuestionProgress extends QuestionWithoutAnswer {
  user_answer?: string;
}

export interface CreateSessionDTO {
  tense: TenseName;
  difficulty: DifficultyLevel;
}

export type TrainingSessionDTO = Pick<
  TrainingSession,
  "id" | "user_id" | "tense" | "difficulty" | "status" | "started_at" | "created_at"
>;

export type CompletedTrainingSessionDTO = Pick<
  TrainingSession,
  "id" | "tense" | "difficulty" | "status" | "final_feedback" | "started_at" | "completed_at"
>;

export type RoundDTO = Pick<Round, "id" | "session_id" | "round_number" | "started_at">;

export type CompletedRoundDTO = Pick<
  Round,
  "id" | "round_number" | "score" | "completed_at" | "round_feedback" | "started_at"
>;

export interface RoundWithQuestionsDTO {
  round: RoundDTO;
  questions: QuestionWithoutAnswer[];
}

export interface SessionWithRoundDTO {
  training_session: TrainingSessionDTO;
  current_round?: {
    id: string;
    session_id: string;
    round_number: number;
    started_at: string;
    questions: QuestionWithoutAnswer[];
  };
  completed_rounds?: {
    id: string;
    round_number: number;
    score: number;
    round_feedback: string;
    questions_review: QuestionReview[];
  }[];
}

export interface SessionProgress {
  current_round: number;
  total_rounds: number;
  completed_questions: number;
  total_questions: number;
}

export interface CompletedRoundSummary {
  id: string;
  round_number: number;
  score: number;
  completed_at: string;
  round_feedback: string;
}

export interface InProgressRoundSummary {
  id: string;
  round_number: number;
  score: null;
  completed_at: null;
  questions: QuestionProgress[];
}

export interface ActiveSessionDTO {
  training_session: TrainingSessionDTO;
  rounds: (CompletedRoundSummary | InProgressRoundSummary)[];
  progress: SessionProgress;
}

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

export interface SessionSummary {
  total_questions: number;
  correct_answers: number;
  accuracy_percentage: number;
  rounds_scores: number[];
}

export interface SessionDetailResponseDTO {
  training_session: CompletedTrainingSessionDTO;
  rounds: RoundDetailDTO[];
  summary: SessionSummary;
}

export interface CompletedSessionSummary {
  rounds_scores: number[];
  total_score: string;
  accuracy_percentage: number;
  incorrect_count: number;
  perfect_score: boolean;
}

export interface CompleteSessionResponseDTO {
  training_session: CompletedTrainingSessionDTO;
  summary: CompletedSessionSummary;
}

export interface CompleteRoundResponseDTO {
  round: CompletedRoundDTO;
  questions_review: QuestionReview[];
}

export interface CreateQuestionReportDTO {
  question_id: string;
  report_comment?: string;
}

export type QuestionReportDTO = QuestionReport;

export interface QuestionReportWithPreview extends QuestionReport {
  question_preview: {
    question_text: string;
    tense: TenseName;
  };
}

export interface QuestionReportsListResponseDTO {
  reports: QuestionReportWithPreview[];
  pagination: PaginationMeta;
}

export interface RateLimitErrorResponse extends ErrorResponse {
  retry_after: number;
}

export interface ValidationErrorResponse extends ErrorResponse {
  details: Record<string, string>;
}

export interface TrainingSessionWithRounds {
  id: string;
  tense: TenseName;
  difficulty: DifficultyLevel;
  status: SessionStatus;
  started_at: string;
  completed_at: string | null;
  rounds: {
    id: string;
    round_number: number;
    score: number | null;
    completed_at: string | null;
  }[];
}

export interface TrainingSessionsListResponseDTO {
  "training-sessions": TrainingSessionWithRounds[];
  pagination: PaginationMeta;
}

/**
 * Navigation item configuration for rendering nav links
 */
export interface NavigationItemConfig {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isConditional?: boolean;
  badge?: number;
}

/**
 * Minimal user data for layout rendering
 */
export interface LayoutUser {
  id: string;
  email: string;
  name: string | null;
}

export interface TenseCardData {
  name: TenseName;
  slug: string;
  description: string;
  icon?: string;
}

export interface TheoryFrontmatter {
  title: string;
  tense: TenseName;
  description: string;
  order: number;
}

/**
 * ViewModel for displaying session progress in the Practice dashboard
 */
export interface SessionProgressViewModel {
  currentRound: number; // The round number currently in progress (1-3)
  totalRounds: number; // Always 3
  completedRounds: number; // Number of completed rounds (0-3)
  progressText: string; // Human-readable text, e.g., "Round 2/3"
  progressPercentage: number; // Percentage completion (0-100)
}

/**
 * Form data for starting a new training session
 */
export interface StartSessionFormData {
  tense: TenseName;
  difficulty: DifficultyLevel;
}

/**
 * Response from POST /api/training-sessions
 */
export interface CreateSessionResponse {
  training_session: TrainingSessionDTO;
}

/**
 * Represents a chat component in the training session interface
 */
export type ChatComponent =
  | SelectQuestionListChatComponent
  | RoundSummaryChatComponent
  | FinalFeedbackChatComponent
  | LoadingChatComponent;

export interface SelectQuestionListChatComponent {
  type: "selectQuestionList";
  id: string; // Unique identifier for React key
  data: {
    questions: QuestionWithoutAnswer[];
    roundNumber: number;
    totalQuestions: number;
    isReadOnly?: boolean; // For historical rounds
    questionsReview?: QuestionReview[]; // For read-only view with correct/incorrect indicators
  };
}

export interface RoundSummaryChatComponent {
  type: "roundSummary";
  id: string;
  data: {
    roundNumber: number;
    score: number;
    totalQuestions: number;
    feedback: string; // Markdown
    questionsReview: QuestionReview[];
  };
}

export interface FinalFeedbackChatComponent {
  type: "finalFeedback";
  id: string;
  data: {
    roundsScores: number[];
    totalScore: string;
    accuracyPercentage: number;
    perfectScore: boolean;
    finalFeedback: string; // Markdown
  };
}

export interface LoadingChatComponent {
  type: "loading";
  id: string;
  data: {
    message: string;
  };
}

/**
 * Training session state for the view
 */
export interface TrainingSessionState {
  sessionId: string;
  tense: TenseName;
  difficulty: DifficultyLevel;
  status: SessionStatus;
  currentRoundNumber: number; // 1, 2, or 3
  chatComponents: ChatComponent[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Answer submission for round completion
 */
export interface AnswerSubmission {
  question_id: string;
  selected_answer: string;
}

/**
 * Base props shared by question card components (form and read-only variants)
 */
export interface QuestionCardBaseProps {
  questionNumber: number;
  roundNumber: number;
  totalQuestions: number;
}
