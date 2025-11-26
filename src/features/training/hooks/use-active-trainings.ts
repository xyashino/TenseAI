import type { TrainingSessionsListResponseDTO } from "@/features/training/types";
import { apiGet } from "@/shared/api/client";
import { useQuery } from "@tanstack/react-query";

export function useActiveTrainings() {
  return useQuery({
    queryKey: ["training-sessions", "active"],
    queryFn: async () => {
      return apiGet<TrainingSessionsListResponseDTO>("/api/training-sessions?status=active");
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}
