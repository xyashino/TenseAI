import { apiGet } from "@/lib/api-client";
import type { TrainingSessionWithRounds, TrainingSessionsListResponseDTO } from "@/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useHistorySessions() {
  const queryResult = useSuspenseQuery({
    queryKey: ["training-sessions", "completed"],
    queryFn: async () => {
      return apiGet<TrainingSessionsListResponseDTO>(`/api/training-sessions?status=completed`);
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const { data } = queryResult;

  const sessions: TrainingSessionWithRounds[] = useMemo(() => {
    if (!data?.["training-sessions"] || !Array.isArray(data["training-sessions"])) {
      return [];
    }

    return data["training-sessions"].filter(
      (session): session is TrainingSessionWithRounds =>
        session !== null && session !== undefined && session.id !== undefined && session.completed_at !== null
    );
  }, [data]);

  return {
    ...queryResult,
    sessions,
  };
}
