import { apiClient } from "@/lib/api-client";
import { NavigationRoutes } from "@/lib/enums/navigation";
import { useMutation } from "@tanstack/react-query";
import { navigate } from "astro:transitions/client";

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await apiClient("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      navigate(NavigationRoutes.LOGIN);
    },
    onError: () => {
      navigate(NavigationRoutes.LOGIN);
    },
  });
}
