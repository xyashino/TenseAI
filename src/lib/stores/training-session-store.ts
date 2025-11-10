import type {
  ChatComponent,
  CompleteRoundResponseDTO,
  CompleteSessionResponseDTO,
  DifficultyLevel,
  QuestionReview,
  QuestionWithoutAnswer,
  RoundDetailDTO,
  SessionStatus,
  SessionSummary,
  TenseName,
} from "@/types";
import { create } from "zustand";

interface TrainingSessionState {
  sessionId: string;
  tense: TenseName;
  difficulty: DifficultyLevel;
  status: SessionStatus;

  currentRoundNumber: number;
  currentRoundId: string | null;
  currentQuestions: QuestionWithoutAnswer[];

  chatComponents: ChatComponent[];
  error: Error | null;
  hasAutoStarted: boolean;

  initialize: (sessionId: string, tense: TenseName, difficulty: DifficultyLevel, status: SessionStatus) => void;
  restoreFromRounds: (rounds: RoundDetailDTO[], summary?: SessionSummary, finalFeedback?: string | null) => void;
  setQuestions: (questions: QuestionWithoutAnswer[], roundId: string, roundNumber: number) => void;
  addChatComponent: (component: ChatComponent) => void;
  removeChatComponent: (predicate: (component: ChatComponent) => boolean) => void;
  setRoundComplete: (data: CompleteRoundResponseDTO) => void;
  setSessionComplete: (data: CompleteSessionResponseDTO) => void;
  setError: (error: Error | null) => void;
  checkAndAutoStart: (startRoundFn: () => Promise<void>) => void;
}

const initialState = {
  sessionId: "",
  tense: "Future Simple" as TenseName,
  difficulty: "Basic" as DifficultyLevel,
  status: "active" as SessionStatus,
  currentRoundNumber: 0,
  currentRoundId: null,
  currentQuestions: [],
  chatComponents: [],
  error: null,
  hasAutoStarted: false,
};

export const useTrainingSessionStore = create<TrainingSessionState>((set, get) => ({
  ...initialState,
  initialize: (sessionId, tense, difficulty, status) =>
    set({
      sessionId,
      tense,
      difficulty,
      status,
      currentRoundNumber: 0,
      currentRoundId: null,
      currentQuestions: [],
      chatComponents: [],
      error: null,
      hasAutoStarted: false,
    }),

  restoreFromRounds: (rounds, summary, finalFeedback) =>
    set((state) => {
      const chatComponents: ChatComponent[] = [];
      let activeRoundId: string | null = null;
      let activeRoundNumber = 0;
      let activeQuestions: QuestionWithoutAnswer[] = [];

      for (const round of rounds) {
        const isCompleted = round.completed_at !== "";

        if (isCompleted) {
          // Convert questions to QuestionReview format
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
              isReadOnly: true, // All restored rounds are read-only
            },
          });
        } else {
          // This is the active (incomplete) round
          // Convert questions from RoundDetailDTO to QuestionWithoutAnswer
          activeQuestions = round.questions.map((q) => ({
            id: q.id,
            question_number: q.question_number,
            question_text: q.question_text,
            options: q.options,
          }));

          activeRoundId = round.id;
          activeRoundNumber = round.round_number;

          // Add question list component for active round
          chatComponents.push({
            type: "selectQuestionList",
            id: `questions-${round.id}`,
            data: {
              questions: activeQuestions,
              roundNumber: round.round_number,
              totalQuestions: round.questions.length,
            },
          });
        }
      }

      // If session is completed and we have summary and final feedback, add final feedback component
      if (state.status === "completed" && summary && finalFeedback) {
        const totalScore = `${summary.correct_answers}/${summary.total_questions}`;
        const perfectScore = summary.correct_answers === summary.total_questions;

        chatComponents.push({
          type: "finalFeedback",
          id: `final-${state.sessionId}`,
          data: {
            roundsScores: summary.rounds_scores,
            totalScore,
            accuracyPercentage: summary.accuracy_percentage,
            perfectScore,
            finalFeedback,
          },
        });
      }

      return {
        chatComponents,
        currentRoundId: activeRoundId,
        currentRoundNumber: activeRoundNumber,
        currentQuestions: activeQuestions,
        hasAutoStarted: activeRoundId !== null, // Mark as started if there's an active round
      };
    }),

  setQuestions: (questions, roundId, roundNumber) =>
    set((state) => {
      // Mark all previous roundSummary components as read-only
      const updatedComponents = state.chatComponents
        .filter((c) => c.type !== "loading")
        .map((component) => {
          if (component.type === "roundSummary" && !component.data.isReadOnly) {
            return {
              ...component,
              data: {
                ...component.data,
                isReadOnly: true,
              },
            };
          }
          return component;
        });

      return {
        currentQuestions: questions,
        currentRoundId: roundId,
        currentRoundNumber: roundNumber,
        chatComponents: [
          ...updatedComponents,
          {
            type: "selectQuestionList",
            id: `questions-${roundId}`,
            data: {
              questions,
              roundNumber,
              totalQuestions: questions.length,
            },
          },
        ],
      };
    }),

  addChatComponent: (component) =>
    set((state) => ({
      chatComponents: [...state.chatComponents, component],
    })),

  removeChatComponent: (predicate) =>
    set((state) => ({
      chatComponents: state.chatComponents.filter((c) => !predicate(c)),
    })),

  setRoundComplete: (data) =>
    set((state) => {
      const { round, questions_review } = data;

      const updatedComponents = state.chatComponents.map((component) => {
        if (
          component.type === "selectQuestionList" &&
          !component.data.isReadOnly &&
          component.data.roundNumber === round.round_number
        ) {
          return {
            ...component,
            id: `questions-readonly-${round.id}`,
            data: {
              ...component.data,
              isReadOnly: true,
              questionsReview: questions_review,
            },
          };
        }
        return component;
      });

      // Remove loading components
      const withoutLoading = updatedComponents.filter((c) => c.type !== "loading");

      // Add round summary component
      const summaryComponent: ChatComponent = {
        type: "roundSummary",
        id: `summary-${round.id}`,
        data: {
          roundNumber: round.round_number,
          score: round.score ?? 0,
          totalQuestions: questions_review.length,
          feedback: round.round_feedback ?? "",
          questionsReview: questions_review,
        },
      };

      return {
        chatComponents: [...withoutLoading, summaryComponent],
        currentRoundId: null,
        currentQuestions: [],
      };
    }),

  setSessionComplete: (data) =>
    set((state) => {
      const { summary } = data;

      // Mark all round summary components as read-only
      const updatedComponents = state.chatComponents
        .filter((c) => c.type !== "loading")
        .map((component) => {
          if (component.type === "roundSummary" && !component.data.isReadOnly) {
            return {
              ...component,
              data: {
                ...component.data,
                isReadOnly: true,
              },
            };
          }
          return component;
        });

      return {
        status: "completed",
        chatComponents: [
          ...updatedComponents,
          {
            type: "finalFeedback",
            id: `final-${Date.now()}`,
            data: {
              roundsScores: summary.rounds_scores,
              totalScore: summary.total_score,
              accuracyPercentage: summary.accuracy_percentage,
              perfectScore: summary.perfect_score,
              finalFeedback: data.training_session.final_feedback || "",
            },
          },
        ],
        currentRoundId: null,
        currentQuestions: [],
      };
    }),
  setError: (error) => set({ error }),
  checkAndAutoStart: async (startRoundFn) => {
    const state = get();
    if (!state.hasAutoStarted && !state.currentRoundId && state.chatComponents.length === 0) {
      set({ hasAutoStarted: true });
      await startRoundFn();
    }
  },
}));
