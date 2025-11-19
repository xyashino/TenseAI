import { AccountForm } from "@/features/account";
import * as accountHook from "@/features/account";
import type { ProfileDTO } from "@/types";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../test-utils";

vi.mock("@/features/account", async () => {
  const actual = await vi.importActual("@/features/account");
  return {
    ...actual,
    useUpdateProfile: vi.fn(),
  };
});

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
      isPending: false,
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
    const submitButton = screen.getByRole("button", { name: /save changes/i });

    await user.clear(nameInput);
    await user.type(nameInput, "Jane Doe");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        name: "Jane Doe",
        default_difficulty: "Basic",
      });
    });
  });

  it("should allow changing difficulty level", async () => {
    render(<AccountForm initialProfile={mockProfile} />);

    const difficultySelect = screen.getByLabelText(/default difficulty/i);
    const submitButton = screen.getByRole("button", { name: /save changes/i });

    await user.click(difficultySelect);
    const advancedOption = screen.getByRole("option", { name: /advanced \(b2\)/i });
    await user.click(advancedOption);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        name: "John Doe",
        default_difficulty: "Advanced",
      });
    });
  });

  it("should disable submit button when form is not dirty", () => {
    render(<AccountForm initialProfile={mockProfile} />);

    const submitButton = screen.getByRole("button", { name: /save changes/i });
    expect(submitButton).toBeDisabled();
  });

  it("should disable form fields and button when loading", () => {
    vi.mocked(accountHook.useUpdateProfile).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as ReturnType<typeof accountHook.useUpdateProfile>);

    render(<AccountForm initialProfile={mockProfile} />);

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole("button", { name: /save changes/i });

    expect(nameInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("should handle null initial profile", () => {
    render(<AccountForm initialProfile={null} />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(nameInput.value).toBe("");
  });
});
