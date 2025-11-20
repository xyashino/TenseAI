import * as React from "react";
import { HistoryList } from "@/features/history/components/history-list";
import type { TrainingSessionWithRounds } from "@/types";
import { render, screen } from "../../test-utils";

vi.mock("@/features/history/components/history-card", () => ({
  HistoryCard: ({ session }: { session: TrainingSessionWithRounds }) => (
    <div data-test-id="history-card">
      {session.tense} - {session.difficulty}
    </div>
  ),
}));

describe("HistoryList", () => {
  const mockSessions: TrainingSessionWithRounds[] = [
    {
      id: "session-1",
      tense: "Present Simple",
      difficulty: "Basic",
      status: "completed",
      started_at: "2024-01-01T00:00:00Z",
      completed_at: "2024-01-01T01:00:00Z",
      rounds: [],
    },
    {
      id: "session-2",
      tense: "Past Simple",
      difficulty: "Advanced",
      status: "completed",
      started_at: "2024-01-02T00:00:00Z",
      completed_at: "2024-01-02T01:00:00Z",
      rounds: [],
    },
  ];

  it("should render list of completed sessions", () => {
    render(<HistoryList sessions={mockSessions} />);

    const cards = screen.getAllByTestId("history-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Present Simple - Basic");
    expect(cards[1]).toHaveTextContent("Past Simple - Advanced");
  });

  it("should return null when sessions array is empty", () => {
    const { container } = render(<HistoryList sessions={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("should have proper aria-label for accessibility", () => {
    render(<HistoryList sessions={mockSessions} />);

    const list = screen.getByLabelText("Completed training sessions");
    expect(list).toBeInTheDocument();
  });

  it("should render correct number of list items", () => {
    render(<HistoryList sessions={mockSessions} />);

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(2);
  });
});
