import { apiGet, apiPatch } from "@/lib/api-client";
import type { ProfileDTO, UpdateProfileDTO } from "@/types";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

export function useProfile() {
  return useSuspenseQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      return apiGet<ProfileDTO>("/api/profile");
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileDTO) => {
      return apiPatch<ProfileDTO>("/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
