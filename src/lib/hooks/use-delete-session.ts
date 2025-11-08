import { apiDelete } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";

export function useDeleteSession() {
  return useMutation(
    {
      mutationFn: async (sessionId: string) => {
        await apiDelete(`/api/training-sessions/${sessionId}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["training-sessions", "active"] });
      },
    },
    queryClient
  );
}
