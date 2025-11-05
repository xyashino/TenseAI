import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import type { ProfileDTO, UpdateProfileDTO } from "@/types";

/**
 * Custom hook for fetching the current user's profile.
 *
 * @returns Query result with profile data, loading, and error states
 *
 * @example
 * const { data: profile, isLoading } = useProfile();
 */
export function useProfile() {
  return useQuery(
    {
      queryKey: ["profile"],
      queryFn: async () => {
        return apiGet<ProfileDTO>("/api/profile");
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
    queryClient
  );
}

/**
 * Custom hook for updating the user's profile.
 *
 * Automatically invalidates the profile query cache on success
 * to ensure the UI reflects the latest data.
 *
 * @returns Mutation result with mutate function, loading, and error states
 *
 * @example
 * const updateProfile = useUpdateProfile();
 * updateProfile.mutate({ name: "John Doe" });
 */
export function useUpdateProfile() {
  return useMutation(
    {
      mutationFn: async (data: UpdateProfileDTO) => {
        return apiPatch<ProfileDTO>("/api/profile", data);
      },
      onSuccess: () => {
        // Invalidate profile query to refresh data
        queryClient.invalidateQueries({ queryKey: ["profile"] });

        // Optionally invalidate layout user data if name changed
        queryClient.invalidateQueries({ queryKey: ["user"] });
      },
    },
    queryClient
  );
}
