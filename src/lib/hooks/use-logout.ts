import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../query-client";

export function useLogout() {
  return useMutation(
    {
      mutationFn: async () => {
        await apiClient("/api/auth/logout", {
          method: "POST",
        });
      },
      onSuccess: () => {
        // Redirect after successful logout
        window.location.assign("/login");
      },
      onError: () => {
        // Even on error, redirect to login as auth is likely cleared
        window.location.assign("/login");
      },
    },
    queryClient
  );
}
