import type { SessionProgressViewModel } from "@/types";

/**
 * Calculates session progress from rounds data
 * @param rounds Array of rounds with completion status
 * @returns SessionProgressViewModel with calculated progress metrics
 */
export function calculateSessionProgress(
  rounds: { round_number: number; completed_at: string | null }[]
): SessionProgressViewModel {
  const totalRounds = 3;
  const completedRounds = rounds.filter((round) => round.completed_at !== null).length;

  // Find the first incomplete round, or use the next round number if all are complete
  const firstIncompleteRound = rounds.find((round) => round.completed_at === null);
  const currentRound = firstIncompleteRound
    ? firstIncompleteRound.round_number
    : Math.min(rounds.length + 1, totalRounds);

  const progressText = `Round ${currentRound}/${totalRounds}`;
  const progressPercentage = Math.round((completedRounds / totalRounds) * 100);

  return {
    currentRound,
    totalRounds,
    completedRounds,
    progressText,
    progressPercentage,
  };
}
