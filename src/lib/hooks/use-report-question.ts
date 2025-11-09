import { apiPost } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import type { CreateQuestionReportDTO } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useReportQuestion() {
  return useMutation(
    {
      mutationFn: async (data: CreateQuestionReportDTO) => {
        return apiPost("/api/question-reports", data);
      },
      onSuccess: () => {
        toast.success("Thank you for your feedback! We will review this question.");
      },
      onError: () => {
        toast.error("Failed to submit report. Please try again.");
      },
    },
    queryClient
  );
}
