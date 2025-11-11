import type {
  ChatComponent,
  DifficultyLevel,
  QuestionReview,
  QuestionWithoutAnswer,
  RoundDetailDTO,
  SessionDetailResponseDTO,
  TenseName,
} from "@/types";
import { useMemo } from "react";
import { HistoryChatLogArea } from "./history-chat-log-area";
import { HistoryDetailHeader } from "./history-detail-header";

export interface HistoryDetailWrapperProps {
  sessionData: SessionDetailResponseDTO;
  userName: string | null;
}

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
function transformSessionDataToChatComponents(
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

export function HistoryDetailWrapper({ sessionData, userName }: HistoryDetailWrapperProps) {
  const chatComponents = useMemo(() => {
    if (!sessionData || !sessionData.rounds || !sessionData.summary) {
      return [];
    }

    try {
      return transformSessionDataToChatComponents(
        sessionData.rounds,
        sessionData.summary,
        sessionData.training_session.final_feedback
      );
    } catch {
      return [];
    }
  }, [sessionData]);

  const tense: TenseName = sessionData.training_session.tense;
  const difficulty: DifficultyLevel = sessionData.training_session.difficulty;
  const completedAt = sessionData.training_session.completed_at ?? sessionData.training_session.started_at;

  return (
    <div className="flex flex-col h-full">
      <HistoryDetailHeader tense={tense} completedAt={completedAt} />
      <HistoryChatLogArea
        chatComponents={chatComponents}
        userName={userName}
        tense={tense}
        difficulty={difficulty}
        summary={sessionData.summary}
      />
    </div>
  );
}
