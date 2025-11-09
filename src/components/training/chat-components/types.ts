import type { QuestionReview } from "@/types";

/**
 * Props for RoundSummaryElement component
 */
export interface RoundSummaryElementProps {
  roundNumber: number;
  score: number;
  totalQuestions: number;
  feedback: string;
  questionsReview: QuestionReview[];
  onContinue: () => void;
  isLoading: boolean;
}

/**
 * Props for FinalFeedbackElement component
 */
export interface FinalFeedbackElementProps {
  roundsScores: number[];
  totalScore: string;
  accuracyPercentage: number;
  perfectScore: boolean;
  finalFeedback: string;
  onViewHistory: () => void;
  onStartNewSession: () => void;
}

/**
 * Props for LoadingElement component
 */
export interface LoadingElementProps {
  message: string;
}
