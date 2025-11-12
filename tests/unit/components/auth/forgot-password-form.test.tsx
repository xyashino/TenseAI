import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import * as authMutations from "@/lib/hooks/use-auth-mutations";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../test-utils";

vi.mock("@/lib/hooks/use-auth-mutations", () => ({
  useForgotPassword: vi.fn(),
}));

describe("ForgotPasswordForm", () => {
  const mockForgotPassword = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMutations.useForgotPassword).mockReturnValue({
      mutateAsync: mockForgotPassword,
      isPending: false,
    } as ReturnType<typeof authMutations.useForgotPassword>);
  });

  it("should render forgot password form with email field", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  it("should display validation error for empty email", async () => {
    render(<ForgotPasswordForm />);

    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    await user.click(submitButton);

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
  });

  it("should display validation error for invalid email format", async () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "invalid-email");
    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    await user.click(submitButton);

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
  });

  it("should call forgotPassword mutation with correct data on valid submit", async () => {
    mockForgotPassword.mockResolvedValue({});

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith({
        email: "test@example.com",
      });
    });
  });

  it("should disable form fields and button when loading", () => {
    vi.mocked(authMutations.useForgotPassword).mockReturnValue({
      mutateAsync: mockForgotPassword,
      isPending: true,
    } as ReturnType<typeof authMutations.useForgotPassword>);

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });

    expect(emailInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("should display link to login page", () => {
    render(<ForgotPasswordForm />);

    const loginLink = screen.getByText(/log in/i);
    expect(loginLink).toBeInTheDocument();
  });
});
