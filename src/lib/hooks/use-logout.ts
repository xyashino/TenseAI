import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await apiClient("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      window.location.assign("/login");
    },
    onError: () => {
      window.location.assign("/login");
    },
  });
}
