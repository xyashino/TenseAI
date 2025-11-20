import { apiDelete, apiPost } from "@/shared/api/client";
import { useTrainingSessionStore } from "@/features/training/stores/training-session-store";
import type {
  AnswerSubmission,
  CompleteRoundResponseDTO,
  CompleteSessionResponseDTO,
  CreateQuestionReportDTO,
  RoundWithQuestionsDTO,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useTrainingSessionActions() {
  const queryClient = useQueryClient();
  const setQuestions = useTrainingSessionStore((state) => state.setQuestions);
  const setError = useTrainingSessionStore((state) => state.setError);
  const removeChatComponent = useTrainingSessionStore((state) => state.removeChatComponent);
  const setRoundComplete = useTrainingSessionStore((state) => state.setRoundComplete);
  const setSessionComplete = useTrainingSessionStore((state) => state.setSessionComplete);
  const addChatComponent = useTrainingSessionStore((state) => state.addChatComponent);

  const sessionId = useTrainingSessionStore((state) => state.sessionId);
  const currentRoundId = useTrainingSessionStore((state) => state.currentRoundId);

  const createRoundMutation = useMutation({
    mutationFn: async () => {
      return apiPost<RoundWithQuestionsDTO>(`/api/training-sessions/${sessionId}/rounds`, {});
    },
    onSuccess: (data) => {
      const { round, questions } = data;
      setQuestions(questions, round.id, round.round_number);
    },
    onError: (err) => {
      setError(err as Error);
      removeChatComponent((c) => c.type === "loading");
    },
  });

  const completeRoundMutation = useMutation({
    mutationFn: async (answersArray: AnswerSubmission[]) => {
      if (!currentRoundId) {
        throw new Error("No current round ID");
      }
      return apiPost<CompleteRoundResponseDTO>(`/api/rounds/${currentRoundId}/complete`, {
        answers: answersArray,
      });
    },
    onSuccess: (data) => {
      setRoundComplete(data);
    },
    onError: (err) => {
      setError(err as Error);
      removeChatComponent((c) => c.type === "loading");
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: async () => {
      return apiPost<CompleteSessionResponseDTO>(`/api/training-sessions/${sessionId}/complete`, {});
    },
    onSuccess: (data) => {
      setSessionComplete(data);
      queryClient.invalidateQueries({ queryKey: ["training-sessions"] });
    },
    onError: (err) => {
      setError(err as Error);
      removeChatComponent((c) => c.type === "loading");
    },
  });

  const reportQuestionMutation = useMutation({
    mutationFn: async (data: CreateQuestionReportDTO) => {
      return apiPost("/api/question-reports", data);
    },
    onError: (err) => {
      setError(err as Error);
    },
  });

  const abandonSessionMutation = useMutation({
    mutationFn: async () => {
      await apiDelete(`/api/training-sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-sessions"] });
    },
    onError: (err) => {
      setError(err as Error);
    },
  });

  const startRound = useCallback(async () => {
    addChatComponent({
      type: "loading",
      id: `loading-${Date.now()}`,
      data: { message: "Generating questions..." },
    });
    await createRoundMutation.mutateAsync();
  }, [addChatComponent, createRoundMutation]);

  const completeRound = useCallback(
    async (answersMap: Map<string, string>) => {
      const answersArray: AnswerSubmission[] = Array.from(answersMap.entries()).map(
        ([question_id, selected_answer]) => ({
          question_id,
          selected_answer,
        })
      );

      addChatComponent({
        type: "loading",
        id: `loading-${Date.now()}`,
        data: { message: "Checking your answers..." },
      });
      await completeRoundMutation.mutateAsync(answersArray);
    },
    [addChatComponent, completeRoundMutation]
  );

  const completeSession = useCallback(async () => {
    addChatComponent({
      type: "loading",
      id: `loading-${Date.now()}`,
      data: { message: "Analyzing your performance..." },
    });
    await completeSessionMutation.mutateAsync();
  }, [addChatComponent, completeSessionMutation]);

  const reportQuestion = useCallback(
    async (questionId: string, comment?: string) => {
      await reportQuestionMutation.mutateAsync({
        question_id: questionId,
        report_comment: comment,
      });
    },
    [reportQuestionMutation]
  );

  const abandonSession = useCallback(async () => {
    await abandonSessionMutation.mutateAsync();
  }, [abandonSessionMutation]);

  return {
    startRound,
    completeRound,
    completeSession,
    reportQuestion,
    abandonSession,
    isCompletingRound: completeRoundMutation.isPending,
    isCompletingSession: completeSessionMutation.isPending,
    isLoadingRound: createRoundMutation.isPending,
    isAbandoning: abandonSessionMutation.isPending,
  };
}
