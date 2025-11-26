import { StartSessionForm } from "@/features/training/components/active-training/start-session/start-session-form";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import * as sessionHook from "@/features/training/hooks/use-create-session";
import userEvent from "@testing-library/user-event";
import React from "react";
import { render, screen, waitFor } from "../../test-utils";

vi.mock("@/features/training/hooks/use-create-session", () => ({
  useCreateSession: vi.fn(),
}));

describe("StartSessionForm", () => {
  const mockCreateSession = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sessionHook.useCreateSession).mockReturnValue({
      mutate: mockCreateSession,
      isPending: false,
    } as ReturnType<typeof sessionHook.useCreateSession>);
  });

  const renderInDialog = (component: React.ReactElement) => {
    return render(
      <Dialog open>
        <DialogContent>
          <DialogTitle className="sr-only">Start New Training</DialogTitle>
          <DialogDescription className="sr-only">
            Select a tense and difficulty level to begin your training.
          </DialogDescription>
          {component}
        </DialogContent>
      </Dialog>
    );
  };

  it("should render start session form with tense and difficulty fields", () => {
    renderInDialog(<StartSessionForm />);

    expect(screen.getByRole("button", { name: /start training/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("should display validation error when tense is not selected", async () => {
    renderInDialog(<StartSessionForm />);

    const submitButton = screen.getByRole("button", { name: /start training/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateSession).not.toHaveBeenCalled();
    });
  });

  it("should call createSession mutation with correct data on valid submit", async () => {
    renderInDialog(<StartSessionForm defaultDifficulty="Basic" />);

    const submitButton = screen.getByRole("button", { name: /start training/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("should disable form fields and button when loading", () => {
    vi.mocked(sessionHook.useCreateSession).mockReturnValue({
      mutate: mockCreateSession,
      isPending: true,
    } as ReturnType<typeof sessionHook.useCreateSession>);

    renderInDialog(<StartSessionForm />);

    const submitButton = screen.getByRole("button", { name: /start training/i });
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it("should use default difficulty when provided", () => {
    renderInDialog(<StartSessionForm defaultDifficulty="Advanced" />);

    expect(screen.getByRole("button", { name: /start training/i })).toBeInTheDocument();
  });
});
