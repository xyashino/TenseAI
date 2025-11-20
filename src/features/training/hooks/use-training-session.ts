import { useTrainingSessionStore } from "@/features/training/stores/training-session-store";
import { useEffect, useRef } from "react";
import { useTrainingSessionActions } from "./use-training-session-actions";

interface UseTrainingSessionProps {
  sessionId: string;
}

export function useTrainingSession({ sessionId }: UseTrainingSessionProps): void {
  const sessionIdFromState = useTrainingSessionStore((state) => state.sessionId);
  const currentRoundId = useTrainingSessionStore((state) => state.currentRoundId);
  const hasAutoStarted = useTrainingSessionStore((state) => state.hasAutoStarted);
  const chatComponents = useTrainingSessionStore((state) => state.chatComponents);
  const checkAndAutoStart = useTrainingSessionStore((state) => state.checkAndAutoStart);
  const actions = useTrainingSessionActions();

  const autoStartAttemptedRef = useRef<string | null>(null);
  const startRoundRef = useRef(actions.startRound);
  const checkAndAutoStartRef = useRef(checkAndAutoStart);

  useEffect(() => {
    startRoundRef.current = actions.startRound;
    checkAndAutoStartRef.current = checkAndAutoStart;

    if (autoStartAttemptedRef.current !== null && autoStartAttemptedRef.current !== sessionId) {
      autoStartAttemptedRef.current = null;
    }

    if (autoStartAttemptedRef.current === sessionId) {
      return;
    }

    if (
      sessionIdFromState === sessionId &&
      !currentRoundId &&
      !hasAutoStarted &&
      !actions.isLoadingRound &&
      chatComponents.length === 0
    ) {
      autoStartAttemptedRef.current = sessionId;
      checkAndAutoStartRef.current(startRoundRef.current);
    }
  }, [
    sessionIdFromState,
    sessionId,
    currentRoundId,
    hasAutoStarted,
    actions.isLoadingRound,
    chatComponents.length,
    actions.startRound,
    checkAndAutoStart,
  ]);
}
