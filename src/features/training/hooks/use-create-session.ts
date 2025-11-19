import { apiPost } from "@/lib/api-client";
import type { CreateSessionDTO, CreateSessionResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { navigate } from "astro/virtual-modules/transitions-router.js";

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSessionDTO) => {
      return apiPost<CreateSessionResponse>("/api/training-sessions", data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["training-sessions", "active"] });
      navigate(`/app/training/${response.training_session.id}`);
    },
  });
}
