import type {
  ChatComponent,
  QuestionReview,
  QuestionWithoutAnswer,
  RoundDetailDTO,
  SessionDetailResponseDTO,
} from "@/types";

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
