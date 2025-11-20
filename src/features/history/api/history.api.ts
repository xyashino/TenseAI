import { apiGet } from "@/shared/api/client";
import type { SessionDetailResponseDTO, TrainingSessionsListResponseDTO } from "@/types";

export interface GetHistorySessionsResponse {
  data: TrainingSessionsListResponseDTO;
}

export const historyApi = {
  async getHistorySessions(): Promise<TrainingSessionsListResponseDTO> {
    return apiGet<TrainingSessionsListResponseDTO>(`/api/training-sessions?status=completed`);
  },
  async getSessionDetail(sessionId: string): Promise<SessionDetailResponseDTO> {
    return apiGet<SessionDetailResponseDTO>(`/api/training-sessions/${sessionId}`);
  },
};
