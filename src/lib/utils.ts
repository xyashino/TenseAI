import type {
  ChatComponent,
  QuestionReview,
  QuestionWithoutAnswer,
  RoundDetailDTO,
  SessionDetailResponseDTO,
} from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a unique ID for a question option
 * @param questionId - The ID of the question
 * @param index - The index of the option
 * @returns A unique ID string in format: `${questionId}-option-${index}`
 */
export const getOptionId = (questionId: string, index: number): string => {
  return `${questionId}-option-${index}`;
};

/**
 * Scrolls to an element by ID and focuses it
 * @param elementId - The ID of the element to scroll to
 */
export const scrollToElement = (elementId: string) => {
  const elementToFocus = document.getElementById(elementId);
  if (!elementToFocus) return;
  requestAnimationFrame(() => {
    elementToFocus.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  });
};

/**
 * Generates a Zod schema for validating a single question answer
 * @param question - The question object without the answer
 * @returns A Zod string schema with validation for the question
 */
export const getQuestionSchema = (question: QuestionWithoutAnswer) => {
  return z
    .string()
    .min(1, "Please select an answer")
    .refine((value) => question.options.includes(value), {
      message: "Selected answer must be one of the available options",
    });
};

/**
 * Generates a Zod schema for validating a form with multiple questions
 * @param questions - Array of questions without answers
 * @param totalQuestions - Total number of questions that must be answered
 * @returns A Zod object schema with validation for all questions
 */
export const getFormSchema = (questions: QuestionWithoutAnswer[], totalQuestions: number) => {
  const schemaObject = questions.reduce((acc, question) => {
    acc[question.id] = getQuestionSchema(question);
    return acc;
  }, {} as Record<string, z.ZodString>);

  return z.object(schemaObject).refine(
    (data) => {
      const answeredCount = Object.values(data).filter((value) => value !== "").length;
      return answeredCount === totalQuestions;
    },
    {
      message: "Please answer all questions before continuing",
    }
  );
};

/**
 * Transforms SessionDetailResponseDTO into ChatComponent[] for rendering in read-only mode.
 *
 * For each completed round, creates:
 * 1. A read-only question list component with review data
 * 2. A read-only round summary component
 *
 * After all rounds, creates a final feedback component if available.
 *
 * @param rounds - Array of round details with questions and user answers
 * @param summary - Session summary statistics
 * @param finalFeedback - Final feedback text from the session
 * @returns Array of chat components in chronological order
 * @throws Error if data transformation fails
 */
export function transformSessionDataToChatComponents(
  rounds: RoundDetailDTO[],
  summary: SessionDetailResponseDTO["summary"],
  finalFeedback: string | null
): ChatComponent[] {
  const chatComponents: ChatComponent[] = [];
  const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number);
  for (const round of sortedRounds) {
    const questionsReview: QuestionReview[] = round.questions.map((q) => ({
      question_number: q.question_number,
      question_text: q.question_text,
      options: q.options,
      user_answer: q.user_answer.selected_answer,
      correct_answer: q.correct_answer,
      is_correct: q.user_answer.is_correct,
    }));

    const questionsForReadOnly: QuestionWithoutAnswer[] = round.questions.map((q) => ({
      id: q.id,
      question_number: q.question_number,
      question_text: q.question_text,
      options: q.options,
    }));

    chatComponents.push({
      type: "selectQuestionList",
      id: `questions-readonly-${round.id}`,
      data: {
        questions: questionsForReadOnly,
        roundNumber: round.round_number,
        totalQuestions: round.questions.length,
        isReadOnly: true,
        questionsReview,
      },
    });
    chatComponents.push({
      type: "roundSummary",
      id: `summary-${round.id}`,
      data: {
        roundNumber: round.round_number,
        score: round.score,
        totalQuestions: round.questions.length,
        feedback: round.round_feedback,
        questionsReview,
        isReadOnly: true,
      },
    });
  }

  if (finalFeedback) {
    const totalScore = summary.rounds_scores.reduce((sum, score) => sum + score, 0);
    const totalQuestions = summary.total_questions;
    const accuracyPercentage = summary.accuracy_percentage;
    const perfectScore = summary.rounds_scores.every((score) => score === 10);

    chatComponents.push({
      type: "finalFeedback",
      id: "final-feedback",
      data: {
        roundsScores: summary.rounds_scores,
        totalScore: `${totalScore}/${totalQuestions}`,
        accuracyPercentage,
        perfectScore,
        finalFeedback,
      },
    });
  }

  return chatComponents;
}
