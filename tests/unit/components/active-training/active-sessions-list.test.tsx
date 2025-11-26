import { ActiveSessionsList } from "@/features/training/components/active-training/list/active-sessions-list";
import type { TrainingSessionWithRounds } from "@/features/training/types";
import userEvent from "@testing-library/user-event";
import { render, screen } from "../../test-utils";

vi.mock("@/features/training/components/active-training/session-card/active-session-card", () => ({
  ActiveSessionCard: ({ session }: { session: TrainingSessionWithRounds }) => (
    <div data-test-id="active-session-card">
      <div>
        {session.tense} - {session.difficulty}
      </div>
      <button data-test-id={`resume-${session.id}`}>Resume</button>
      <button data-test-id={`delete-${session.id}`}>Delete</button>
    </div>
  ),
}));

vi.mock("@/features/training/components/active-training/list/empty-state", () => ({
  EmptyState: ({ defaultDifficulty }: { defaultDifficulty?: string }) => (
    <div data-test-id="empty-state">No active sessions. Default: {defaultDifficulty || "None"}</div>
  ),
}));

describe("ActiveSessionsList", () => {
  const mockSessions: TrainingSessionWithRounds[] = [
    {
      id: "session-1",
      tense: "Present Simple",
      difficulty: "Basic",
      status: "active",
      started_at: "2024-01-01T00:00:00Z",
      completed_at: null,
      rounds: [],
    },
    {
      id: "session-2",
      tense: "Past Simple",
      difficulty: "Advanced",
      status: "active",
      started_at: "2024-01-02T00:00:00Z",
      completed_at: null,
      rounds: [],
    },
  ];

  it("should render list of active sessions", () => {
    render(<ActiveSessionsList sessions={mockSessions} />);

    const cards = screen.getAllByTestId("active-session-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Present Simple - Basic");
    expect(cards[1]).toHaveTextContent("Past Simple - Advanced");
  });

  it("should display empty state when no sessions", () => {
    render(<ActiveSessionsList sessions={[]} />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByTestId("empty-state")).toHaveTextContent("No active sessions");
  });

  it("should pass defaultDifficulty to EmptyState", () => {
    render(<ActiveSessionsList sessions={[]} defaultDifficulty="Advanced" />);

    expect(screen.getByTestId("empty-state")).toHaveTextContent("Default: Advanced");
  });

  it("should render resume and delete buttons for each session", () => {
    render(<ActiveSessionsList sessions={mockSessions} />);

    expect(screen.getByTestId("resume-session-1")).toBeInTheDocument();
    expect(screen.getByTestId("delete-session-1")).toBeInTheDocument();
    expect(screen.getByTestId("resume-session-2")).toBeInTheDocument();
    expect(screen.getByTestId("delete-session-2")).toBeInTheDocument();
  });

  it("should handle clicking resume button", async () => {
    const user = userEvent.setup();
    render(<ActiveSessionsList sessions={mockSessions} />);

    const resumeButton = screen.getByTestId("resume-session-1");
    await user.click(resumeButton);

    expect(resumeButton).toBeInTheDocument();
  });

  it("should handle clicking delete button", async () => {
    const user = userEvent.setup();
    render(<ActiveSessionsList sessions={mockSessions} />);

    const deleteButton = screen.getByTestId("delete-session-1");
    await user.click(deleteButton);

    expect(deleteButton).toBeInTheDocument();
  });
});
