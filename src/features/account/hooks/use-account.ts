import type { UpdateProfileDTO } from "@/types";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { accountApi } from "../api/account.api";

export function useProfile() {
  return useSuspenseQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      return accountApi.getProfile();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileDTO) => {
      return accountApi.updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
