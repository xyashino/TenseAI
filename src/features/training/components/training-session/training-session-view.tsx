import { withQueryClient } from "@/components/providers/with-query-client";
import { useTrainingSession } from "@/lib/hooks/use-training-session";
import { useTrainingSessionStore } from "@/lib/stores/training-session-store";
import type { DifficultyLevel, RoundDetailDTO, SessionStatus, SessionSummary, TenseName } from "@/types";
import { useEffect, useRef } from "react";
import { ChatLogArea } from "./chat-log-area";
import { FocusHeader } from "./focus-header";

interface TrainingSessionViewProps {
  sessionId: string;
  tense: TenseName;
  difficulty: DifficultyLevel;
  status: SessionStatus;
  userName?: string | null;
  rounds: RoundDetailDTO[];
  summary?: SessionSummary;
  finalFeedback?: string | null;
}

export function TrainingSessionView({
  sessionId,
  tense,
  difficulty,
  status,
  userName,
  rounds,
  summary,
  finalFeedback,
}: TrainingSessionViewProps) {
  const initialize = useTrainingSessionStore((state) => state.initialize);
  const restoreFromRounds = useTrainingSessionStore((state) => state.restoreFromRounds);
  const chatComponents = useTrainingSessionStore((state) => state.chatComponents);
  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (initializedRef.current === sessionId) {
      return;
    }

    initialize(sessionId, tense, difficulty, status);

    if (rounds.length > 0) {
      restoreFromRounds(rounds, summary, finalFeedback);
    }

    initializedRef.current = sessionId;
  }, [sessionId, tense, difficulty, status, rounds, summary, finalFeedback, initialize, restoreFromRounds]);

  useTrainingSession({ sessionId });

  return (
    <div className="flex flex-col h-full" data-test-id="training-session-view">
      <FocusHeader tense={tense} sessionId={sessionId} />
      <ChatLogArea chatComponents={chatComponents} userName={userName} tense={tense} difficulty={difficulty} />
    </div>
  );
}

export const TrainingSessionViewWithQueryClient = withQueryClient(TrainingSessionView);
