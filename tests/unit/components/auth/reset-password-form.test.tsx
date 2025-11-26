import { ResetPasswordForm } from "@/features/auth";
import * as authMutations from "@/features/auth/hooks/use-auth-mutations";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../test-utils";

vi.mock("@/features/auth/hooks/use-auth-mutations", () => ({
  useResetPassword: vi.fn(),
}));

describe("ResetPasswordForm", () => {
  const mockResetPassword = vi.fn();
  const user = userEvent.setup();
  const testToken = "test-reset-token";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMutations.useResetPassword).mockReturnValue({
      mutateAsync: mockResetPassword,
      isPending: false,
    } as ReturnType<typeof authMutations.useResetPassword>);
  });

  it("should render reset password form with password fields", () => {
    render(<ResetPasswordForm token={testToken} />);

    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  });

  it("should display validation error for weak password", async () => {
    render(<ResetPasswordForm token={testToken} />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

    await user.type(passwordInput, "weak");
    await user.type(confirmPasswordInput, "weak");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it("should display validation error when passwords don't match", async () => {
    render(<ResetPasswordForm token={testToken} />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

    await user.type(passwordInput, "Password123");
    await user.type(confirmPasswordInput, "Different123");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("should call resetPassword mutation with correct data on valid submit", async () => {
    mockResetPassword.mockResolvedValue({});

    render(<ResetPasswordForm token={testToken} />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    await user.type(passwordInput, "NewPassword123");
    await user.type(confirmPasswordInput, "NewPassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        token: testToken,
        password: "NewPassword123",
      });
    });
  });

  it("should disable form fields and button when loading", () => {
    vi.mocked(authMutations.useResetPassword).mockReturnValue({
      mutateAsync: mockResetPassword,
      isPending: true,
    } as ReturnType<typeof authMutations.useResetPassword>);

    render(<ResetPasswordForm token={testToken} />);

    const passwordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm New Password");
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("should display link to login page", () => {
    render(<ResetPasswordForm token={testToken} />);

    const loginLink = screen.getByText(/log in/i);
    expect(loginLink).toBeInTheDocument();
  });
});
