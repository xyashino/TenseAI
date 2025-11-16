<<<<<<< HEAD:src/features/auth/hooks/use-logout.ts
import { apiClient } from "@/shared/api/client";
import { NavigationRoutes } from "@/shared/enums/navigation";
=======
import { apiClient } from "@/lib/api-client";
import { NavigationRoutes } from "@/lib/enums/navigation";
>>>>>>> e6634d2 (fix: update navigation in useLogout and useOnboarding hooks to use navigate function with appropriate routes):src/lib/hooks/use-logout.ts
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
