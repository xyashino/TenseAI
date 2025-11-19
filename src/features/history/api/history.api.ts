import { apiGet } from "@/lib/api-client";
import type { TrainingSessionsListResponseDTO } from "@/types";

export interface GetHistorySessionsResponse {
  data: TrainingSessionsListResponseDTO;
}

export const historyApi = {
  async getHistorySessions(): Promise<TrainingSessionsListResponseDTO> {
    return apiGet<TrainingSessionsListResponseDTO>(`/api/training-sessions?status=completed`);
  },
};
