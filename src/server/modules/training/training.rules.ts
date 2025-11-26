import { BadRequestError } from "@/server/errors/api-errors";
import type { SessionStatus, TrainingSession } from "@/types";

interface RoundInfo {
  id: string;
  round_number: number;
  completed_at: string | null;
}

export const TrainingRules = {
  /**
   * Validates if a new round can be created for a session
   */
  canCreateRound(session: TrainingSession | null, existingRounds: RoundInfo[], nextRoundNumber: number): void {
    if (!session) {
      throw new BadRequestError("Session not found");
    }

    if (session.status !== "active") {
      throw new BadRequestError("Cannot create round for a completed session");
    }

    if (nextRoundNumber > 3) {
      throw new BadRequestError("Cannot create more than 3 rounds per session");
    }

    if (nextRoundNumber > 1) {
      const previousRound = existingRounds.find((r) => r.round_number === nextRoundNumber - 1);
      if (!previousRound?.completed_at) {
        throw new BadRequestError(`Cannot create round ${nextRoundNumber}. Previous round is not completed.`);
      }
    }
  },

  /**
   * Validates if a session can be completed
   */
  canCompleteSession(sessionStatus: SessionStatus, roundsCount: number, completedRoundsCount: number): void {
    if (sessionStatus !== "active") {
      throw new BadRequestError("This session has already been completed");
    }

    if (roundsCount !== 3) {
      throw new BadRequestError("All 3 rounds must be completed first", {
        completed_rounds: roundsCount,
        required_rounds: 3,
      });
    }

    if (completedRoundsCount !== 3) {
      throw new BadRequestError("All 3 rounds must be completed first", {
        completed_rounds: completedRoundsCount,
        required_rounds: 3,
      });
    }
  },

  /**
   * Validates if a round can be completed
   */
  canCompleteRound(roundCompletedAt: string | null, questionsCount: number): void {
    if (roundCompletedAt !== null) {
      throw new BadRequestError("Round is already completed");
    }

    if (questionsCount !== 10) {
      throw new BadRequestError("Data integrity error: round does not have exactly 10 questions");
    }
  },
};
