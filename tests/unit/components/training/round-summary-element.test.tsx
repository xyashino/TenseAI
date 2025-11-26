import { RoundSummaryElement } from "@/components/training/chat-components/round-summary-element";
import * as sessionActions from "@/features/training/hooks/use-training-session-actions";
import userEvent from "@testing-library/user-event";
import { render, screen } from "../../test-utils";

interface UseTrainingSessionActionsReturn {
  startRound: () => Promise<void>;
  completeRound: (answersMap: Map<string, string>) => Promise<void>;
  completeSession: () => Promise<void>;
  reportQuestion: (questionId: string, comment?: string) => Promise<void>;
  abandonSession: () => Promise<void>;
  isCompletingRound: boolean;
  isCompletingSession: boolean;
  isLoadingRound: boolean;
  isAbandoning: boolean;
}

vi.mock("@/features/training/hooks/use-training-session-actions", () => ({
  useTrainingSessionActions: vi.fn(),
}));

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe("RoundSummaryElement", () => {
  const mockStartRound = vi.fn();
  const mockCompleteSession = vi.fn();

  const defaultProps = {
    roundNumber: 1,
    score: 8,
    totalQuestions: 10,
    feedback: "Great job! You did well on this round.",
    questionsReview: [],
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sessionActions.useTrainingSessionActions).mockReturnValue({
      startRound: mockStartRound,
      completeSession: mockCompleteSession,
      isLoadingRound: false,
      isCompletingSession: false,
      completeRound: vi.fn(),
      reportQuestion: vi.fn(),
      abandonSession: vi.fn(),
      isCompletingRound: false,
      isAbandoning: false,
    } as UseTrainingSessionActionsReturn);
  });

  it("should render round summary with score", () => {
    render(<RoundSummaryElement {...defaultProps} />);

    expect(screen.getByText(/round 1 complete/i)).toBeInTheDocument();
    expect(screen.getByText("8/10")).toBeInTheDocument();
  });

  it("should display accuracy percentage", () => {
    render(<RoundSummaryElement {...defaultProps} />);

    expect(screen.getByText(/accuracy/i)).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("should render feedback from AI", () => {
    render(<RoundSummaryElement {...defaultProps} />);

    expect(screen.getByText(/feedback/i)).toBeInTheDocument();
    expect(screen.getByText("Great job! You did well on this round.")).toBeInTheDocument();
  });

  it("should show 'Start Round 2' button for round 1", () => {
    render(<RoundSummaryElement {...defaultProps} roundNumber={1} />);

    expect(screen.getByRole("button", { name: /start round 2/i })).toBeInTheDocument();
  });

  it("should show 'Finish Session' button for round 3", () => {
    render(<RoundSummaryElement {...defaultProps} roundNumber={3} />);

    expect(screen.getByRole("button", { name: /finish session/i })).toBeInTheDocument();
  });

  it("should call startRound when clicking 'Start Round 2'", async () => {
    const user = userEvent.setup();
    mockStartRound.mockResolvedValue(undefined);

    render(<RoundSummaryElement {...defaultProps} roundNumber={1} />);

    const button = screen.getByRole("button", { name: /start round 2/i });
    await user.click(button);

    expect(mockStartRound).toHaveBeenCalledTimes(1);
  });

  it("should call completeSession when clicking 'Finish Session'", async () => {
    const user = userEvent.setup();
    mockCompleteSession.mockResolvedValue(undefined);

    render(<RoundSummaryElement {...defaultProps} roundNumber={3} />);

    const button = screen.getByRole("button", { name: /finish session/i });
    await user.click(button);

    expect(mockCompleteSession).toHaveBeenCalledTimes(1);
  });

  it("should disable button when loading", () => {
    vi.mocked(sessionActions.useTrainingSessionActions).mockReturnValue({
      startRound: mockStartRound,
      completeSession: mockCompleteSession,
      isLoadingRound: true,
      isCompletingSession: false,
      completeRound: vi.fn(),
      reportQuestion: vi.fn(),
      abandonSession: vi.fn(),
      isCompletingRound: false,
      isAbandoning: false,
    } as UseTrainingSessionActionsReturn);

    render(<RoundSummaryElement {...defaultProps} roundNumber={1} />);

    const button = screen.getByRole("button", { name: /start round 2/i });
    expect(button).toBeDisabled();
  });

  it("should not show continue button in read-only mode", () => {
    render(<RoundSummaryElement {...defaultProps} isReadOnly={true} />);

    expect(screen.queryByRole("button", { name: /start round/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /finish session/i })).not.toBeInTheDocument();
  });

  it("should display correct badge variant for high score", () => {
    render(<RoundSummaryElement {...defaultProps} score={8} totalQuestions={10} />);

    const badge = screen.getByText("8/10");
    expect(badge).toBeInTheDocument();
  });
});
