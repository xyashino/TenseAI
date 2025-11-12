import { apiPatch } from "@/lib/api-client";
import { NavigationRoutes } from "@/lib/enums/navigation";
import type { ProfileDTO, UpdateProfileDTO } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { navigate } from "astro:transitions/client";

export function useOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileDTO) => {
      return apiPatch<ProfileDTO>("/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate(NavigationRoutes.TRAINING);
    },
  });
}
