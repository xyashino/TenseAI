import type { TrainingSessionWithRounds } from "@/features/training/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { historyApi } from "../api/history.api";

export function useHistorySessions() {
  const queryResult = useQuery({
    queryKey: ["training-sessions", "completed"],
    queryFn: async () => {
      return historyApi.getHistorySessions();
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
