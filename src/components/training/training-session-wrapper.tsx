import { useTrainingSession } from "@/lib/hooks/use-training-session";
import { useTrainingSessionStore } from "@/lib/stores/training-session-store";
import type { DifficultyLevel, RoundDetailDTO, SessionStatus, SessionSummary, TenseName } from "@/types";
import { useEffect, useRef } from "react";
import { TrainingSessionView } from "./training-session-view";

interface TrainingSessionWrapperProps {
  sessionId: string;
  tense: TenseName;
  difficulty: DifficultyLevel;
  status: SessionStatus;
  userName?: string | null;
  rounds: RoundDetailDTO[];
  summary?: SessionSummary;
  finalFeedback?: string | null;
}

/**
 * Wrapper component that initializes the Zustand store with SSR data
 * and manages the training session lifecycle
 */
export function TrainingSessionWrapper({
  sessionId,
  tense,
  difficulty,
  status,
  userName,
  rounds,
  summary,
  finalFeedback,
}: TrainingSessionWrapperProps) {
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
    <TrainingSessionView
      tense={tense}
      difficulty={difficulty}
      chatComponents={chatComponents}
      sessionId={sessionId}
      userName={userName}
    />
  );
}
