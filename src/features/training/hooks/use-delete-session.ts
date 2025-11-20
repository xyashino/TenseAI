import { apiDelete } from "@/shared/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await apiDelete(`/api/training-sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-sessions", "active"] });
    },
  });
}
