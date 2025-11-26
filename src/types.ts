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

export interface RateLimitErrorResponse extends ErrorResponse {
  retry_after: number;
}

export interface ValidationErrorResponse extends ErrorResponse {
  details: Record<string, string>;
}

export interface NavigationItemConfig {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isConditional?: boolean;
  badge?: number;
}

export interface LayoutUser {
  id: string;
  email: string;
  name: string | null;
}
