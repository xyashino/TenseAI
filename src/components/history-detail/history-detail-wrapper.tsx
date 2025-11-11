import { transformSessionDataToChatComponents } from "@/lib/utils";
import type { DifficultyLevel, SessionDetailResponseDTO, TenseName } from "@/types";
import { useMemo } from "react";
import { HistoryChatLogArea } from "./history-chat-log-area";
import { HistoryDetailHeader } from "./history-detail-header";

export interface HistoryDetailWrapperProps {
  sessionData: SessionDetailResponseDTO;
  userName: string | null;
}

export function HistoryDetailWrapper({ sessionData, userName }: HistoryDetailWrapperProps) {
  const chatComponents = useMemo(() => {
    if (!sessionData || !sessionData.rounds || !sessionData.summary) {
      return [];
    }

    try {
      return transformSessionDataToChatComponents(
        sessionData.rounds,
        sessionData.summary,
        sessionData.training_session.final_feedback
      );
    } catch {
      return [];
    }
  }, [sessionData]);

  const tense: TenseName = sessionData.training_session.tense;
  const difficulty: DifficultyLevel = sessionData.training_session.difficulty;
  const completedAt = sessionData.training_session.completed_at ?? sessionData.training_session.started_at;

  return (
    <>
      <HistoryDetailHeader tense={tense} completedAt={completedAt} />
      <div className="flex flex-col h-full px-4">
        <HistoryChatLogArea
          chatComponents={chatComponents}
          userName={userName}
          tense={tense}
          difficulty={difficulty}
          summary={sessionData.summary}
        />
      </div>
    </>
  );
}
