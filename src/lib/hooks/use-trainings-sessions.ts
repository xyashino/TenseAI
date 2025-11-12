import { apiGet } from "@/lib/api-client";
import type { TrainingSessionsListResponseDTO } from "@/types";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useActiveTrainings() {
  return useSuspenseQuery({
    queryKey: ["training-sessions", "active"],
    queryFn: async () => {
      return apiGet<TrainingSessionsListResponseDTO>("/api/training-sessions?status=active");
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}
