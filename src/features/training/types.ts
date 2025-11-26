import type {
  DifficultyLevel,
  PaginationMeta,
  Question,
  QuestionReport,
  Round,
  SessionStatus,
  TenseName,
  TrainingSession,
} from "@/types";

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

export interface SessionProgressViewModel {
  currentRound: number;
  totalRounds: number;
  completedRounds: number;
  progressText: string;
  progressPercentage: number;
}

export interface StartSessionFormData {
  tense: TenseName;
  difficulty: DifficultyLevel;
}

export interface CreateSessionResponse {
  training_session: TrainingSessionDTO;
}

export type ChatComponent =
  | SelectQuestionListChatComponent
  | RoundSummaryChatComponent
  | FinalFeedbackChatComponent
  | LoadingChatComponent;

export interface SelectQuestionListChatComponent {
  type: "selectQuestionList";
  id: string;
  data: {
    questions: QuestionWithoutAnswer[];
    roundNumber: number;
    totalQuestions: number;
    isReadOnly?: boolean;
    questionsReview?: QuestionReview[];
  };
}

export interface RoundSummaryChatComponent {
  type: "roundSummary";
  id: string;
  data: {
    roundNumber: number;
    score: number;
    totalQuestions: number;
    feedback: string;
    questionsReview: QuestionReview[];
    isReadOnly?: boolean;
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
    finalFeedback: string;
  };
}

export interface LoadingChatComponent {
  type: "loading";
  id: string;
  data: {
    message: string;
  };
}

export interface TrainingSessionState {
  sessionId: string;
  tense: TenseName;
  difficulty: DifficultyLevel;
  status: SessionStatus;
  currentRoundNumber: number;
  chatComponents: ChatComponent[];
  isLoading: boolean;
  error: string | null;
}

export interface AnswerSubmission {
  question_id: string;
  selected_answer: string;
}

export interface QuestionCardBaseProps {
  questionNumber: number;
  roundNumber: number;
  totalQuestions: number;
}

