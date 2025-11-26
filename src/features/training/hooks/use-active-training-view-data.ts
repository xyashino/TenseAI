import { accountApi } from "@/features/account";
import type { TrainingSessionsListResponseDTO } from "@/features/training/types";
import { apiGet } from "@/shared/api/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useActiveTrainingViewData() {
  const { data: trainingsData } = useSuspenseQuery({
    queryKey: ["training-sessions", "active"],
    queryFn: async () => {
      return apiGet<TrainingSessionsListResponseDTO>("/api/training-sessions?status=active");
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const { data: profile } = useSuspenseQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      return accountApi.getProfile();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const sessions = trainingsData?.["training-sessions"] || [];

  return {
    sessions,
    defaultDifficulty: profile?.default_difficulty,
  };
}


