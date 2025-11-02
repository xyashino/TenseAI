import { apiClient } from "@/lib/api-client";
import type { TrainingSessionsListResponseDTO } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../query-client";

export function useActiveSessionsCount() {
  return useQuery(
    {
      queryKey: ["active-sessions-count"],
      queryFn: async () => {
        const response = await apiClient<TrainingSessionsListResponseDTO>(
          "/api/training-sessions?status=active&limit=1"
        );
        return response.pagination.total_items;
      },
      staleTime: 60000,
      refetchInterval: 120000,
      retry: 1,
      placeholderData: 0,
    },
    queryClient
  );
}
