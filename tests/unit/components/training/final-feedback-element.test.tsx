import { render, screen } from "../../test-utils";
import { FinalFeedbackElement } from "@/components/training/chat-components/final-feedback-element/final-feedback-element";

vi.mock("@/components/training/chat-components/final-feedback-element/final-feedback-header", () => ({
  FinalFeedbackHeader: ({ perfectScore }: { perfectScore: boolean }) => (
    <div data-testid="feedback-header">Perfect Score: {perfectScore ? "Yes" : "No"}</div>
  ),
}));

vi.mock("@/components/training/chat-components/final-feedback-element/rounds-scores-display", () => ({
  RoundsScoresDisplay: ({ roundsScores }: { roundsScores: number[] }) => (
    <div data-testid="rounds-scores">Scores: {roundsScores.join(", ")}</div>
  ),
}));

vi.mock("@/components/training/chat-components/final-feedback-element/stats-grid", () => ({
  StatsGrid: ({ totalScore, accuracyPercentage }: { totalScore: string; accuracyPercentage: number }) => (
    <div data-testid="stats-grid">
      Total: {totalScore}, Accuracy: {accuracyPercentage}%
    </div>
  ),
}));

vi.mock("@/components/training/chat-components/final-feedback-element/detailed-analysis", () => ({
  DetailedAnalysis: ({ finalFeedback }: { finalFeedback: string }) => (
    <div data-testid="detailed-analysis">{finalFeedback}</div>
  ),
}));

vi.mock("@/components/training/chat-components/final-feedback-element/final-feedback-actions", () => ({
  FinalFeedbackActions: () => <div data-testid="feedback-actions">Actions</div>,
}));

describe("FinalFeedbackElement", () => {
  const defaultProps = {
    roundsScores: [8, 7, 9],
    totalScore: "24/30",
    accuracyPercentage: 80,
    perfectScore: false,
    finalFeedback: "Overall, you performed well across all rounds.",
  };

  it("should render final feedback element with all rounds scores", () => {
    render(<FinalFeedbackElement {...defaultProps} />);

    expect(screen.getByTestId("rounds-scores")).toHaveTextContent("Scores: 8, 7, 9");
  });

  it("should display total score and accuracy", () => {
    render(<FinalFeedbackElement {...defaultProps} />);

    expect(screen.getByTestId("stats-grid")).toHaveTextContent("Total: 24/30, Accuracy: 80%");
  });

  it("should render final feedback from AI", () => {
    render(<FinalFeedbackElement {...defaultProps} />);

    expect(screen.getByTestId("detailed-analysis")).toHaveTextContent(
      "Overall, you performed well across all rounds."
    );
  });

  it("should display perfect score indicator when perfectScore is true", () => {
    render(<FinalFeedbackElement {...defaultProps} perfectScore={true} />);

    expect(screen.getByTestId("feedback-header")).toHaveTextContent("Perfect Score: Yes");
  });

  it("should display perfect score indicator when perfectScore is false", () => {
    render(<FinalFeedbackElement {...defaultProps} perfectScore={false} />);

    expect(screen.getByTestId("feedback-header")).toHaveTextContent("Perfect Score: No");
  });

  it("should render feedback actions", () => {
    render(<FinalFeedbackElement {...defaultProps} />);

    expect(screen.getByTestId("feedback-actions")).toBeInTheDocument();
  });

  it("should handle empty feedback gracefully", () => {
    render(<FinalFeedbackElement {...defaultProps} finalFeedback="" />);

    expect(screen.getByTestId("rounds-scores")).toBeInTheDocument();
  });
});
