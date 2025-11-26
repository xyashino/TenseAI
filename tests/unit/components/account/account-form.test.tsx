import { AccountForm } from "@/features/account";
import * as accountHook from "@/features/account/hooks/use-account";
import type { ProfileDTO } from "@/types";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../test-utils";

vi.mock("@/features/account/hooks/use-account", () => ({
  useUpdateProfile: vi.fn(),
  useProfile: vi.fn(),
}));

describe("AccountForm", () => {
  const mockMutate = vi.fn();
  const user = userEvent.setup();

  const mockProfile: ProfileDTO = {
    user_id: "user-1",
    name: "John Doe",
    default_difficulty: "Basic",
    onboarding_completed: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(accountHook.useUpdateProfile).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      isError: false,
      isSuccess: false,
      data: undefined,
      error: null,
      reset: vi.fn(),
      status: "idle",
    } as ReturnType<typeof accountHook.useUpdateProfile>);
  });

  it("should render account form with pre-filled data", () => {
    render(<AccountForm initialProfile={mockProfile} />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(nameInput.value).toBe("John Doe");
  });

  it("should display validation error for empty name", async () => {
    render(<AccountForm initialProfile={mockProfile} />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/name cannot be empty/i)).toBeInTheDocument();
    });
  });

  it("should call updateProfile mutation with correct data on valid submit", async () => {
    render(<AccountForm initialProfile={mockProfile} />);

    const nameInput = screen.getByLabelText(/name/i);

    await user.clear(nameInput);
    await user.type(nameInput, "Jane Doe");
    await user.tab();

    const submitButton = await waitFor(() => {
      const button = screen.getByRole("button", { name: /save changes/i });
      expect(button).not.toBeDisabled();
      return button;
    });

    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockMutate).toHaveBeenCalledWith({
          name: "Jane Doe",
          default_difficulty: "Basic",
        });
      },
      { timeout: 3000 }
    );
  });

  it("should allow changing difficulty level", async () => {
    render(<AccountForm initialProfile={mockProfile} />);

    const difficultySelect = screen.getByLabelText(/default difficulty/i);

    await user.click(difficultySelect);
    const advancedOption = await screen.findByRole("option", { name: /advanced \(b2\)/i });
    await user.click(advancedOption);

    // Wait for select to close and form to be dirty
    await waitFor(() => {
      expect(screen.queryByRole("option", { name: /advanced \(b2\)/i })).not.toBeInTheDocument();
    });

    // Wait for form to be dirty and get fresh button reference
    const submitButton = await waitFor(() => {
      const button = screen.getByRole("button", { name: /save changes/i });
      expect(button).not.toBeDisabled();
      return button;
    });

    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockMutate).toHaveBeenCalledWith({
          name: "John Doe",
          default_difficulty: "Advanced",
        });
      },
      { timeout: 3000 }
    );
  });

  it("should disable submit button when form is not dirty", () => {
    render(<AccountForm initialProfile={mockProfile} />);

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    expect(submitButton).toBeDisabled();
  });

  it("should disable form fields and button when loading", () => {
    vi.mocked(accountHook.useUpdateProfile).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: true,
      isError: false,
      isSuccess: false,
      data: undefined,
      error: null,
      reset: vi.fn(),
      status: "pending",
    } as ReturnType<typeof accountHook.useUpdateProfile>);

    render(<AccountForm initialProfile={mockProfile} />);

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole("button", { name: /save changes/i });

    // Input should be disabled when isPending is true
    expect(nameInput).toBeDisabled();
    // Button should be disabled when isPending is true (even if form is dirty)
    expect(submitButton).toBeDisabled();
  });

  it("should handle null initial profile", () => {
    render(<AccountForm initialProfile={null} />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(nameInput.value).toBe("");
  });
});
