import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import * as onboardingHook from "@/features/onboarding/hooks/use-onboarding";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../test-utils";

vi.mock("@/features/onboarding/hooks/use-onboarding", () => ({
  useOnboarding: vi.fn(),
}));

describe("OnboardingForm", () => {
  const mockUpdateProfile = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(onboardingHook.useOnboarding).mockReturnValue({
      mutateAsync: mockUpdateProfile,
      isPending: false,
    } as ReturnType<typeof onboardingHook.useOnboarding>);
  });

  it("should render onboarding form with name and difficulty fields", () => {
    render(<OnboardingForm />);

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/choose your path/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /finish setup/i })).toBeInTheDocument();
  });

  it("should display validation error for empty name", async () => {
    render(<OnboardingForm />);

    const submitButton = screen.getByRole("button", { name: /finish setup/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name cannot be empty/i)).toBeInTheDocument();
    });
  });

  it("should call updateProfile mutation with correct data on valid submit", async () => {
    mockUpdateProfile.mockResolvedValue({});

    render(<OnboardingForm />);

    const nameInput = screen.getByLabelText(/your name/i);
    const submitButton = screen.getByRole("button", { name: /finish setup/i });

    await user.type(nameInput, "John Doe");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: "John Doe",
        default_difficulty: "Basic",
      });
    });
  });

  it("should allow changing difficulty level", async () => {
    mockUpdateProfile.mockResolvedValue({});

    render(<OnboardingForm />);

    const nameInput = screen.getByLabelText(/your name/i);
    const difficultySelect = screen.getByLabelText(/choose your path/i);
    const submitButton = screen.getByRole("button", { name: /finish setup/i });

    await user.type(nameInput, "John Doe");
    await user.click(difficultySelect);

    const advancedOption = screen.getByRole("option", { name: /advanced - for those who want a challenge/i });
    await user.click(advancedOption);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: "John Doe",
        default_difficulty: "Advanced",
      });
    });
  });

  it("should disable form fields and button when loading", () => {
    vi.mocked(onboardingHook.useOnboarding).mockReturnValue({
      mutateAsync: mockUpdateProfile,
      isPending: true,
    } as ReturnType<typeof onboardingHook.useOnboarding>);

    render(<OnboardingForm />);

    const nameInput = screen.getByLabelText(/your name/i);
    const submitButton = screen.getByRole("button", { name: /finish setup/i });

    expect(nameInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});
