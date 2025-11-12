import { LoginForm } from "@/components/auth/login-form";
import * as authMutations from "@/lib/hooks/use-auth-mutations";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../test-utils";

vi.mock("@/lib/hooks/use-auth-mutations", () => ({
  useLogin: vi.fn(),
}));

describe("LoginForm", () => {
  const mockLogin = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMutations.useLogin).mockReturnValue({
      mutateAsync: mockLogin,
      isPending: false,
    } as ReturnType<typeof authMutations.useLogin>);
  });

  it("should render login form with email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("should display validation error for empty email", async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
  });

  it("should display validation error for invalid email format", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "invalid-email");
    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
  });

  it("should display validation error for empty password", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("should call login mutation with correct data on valid submit", async () => {
    mockLogin.mockResolvedValue({});

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("should disable form fields and button when loading", () => {
    vi.mocked(authMutations.useLogin).mockReturnValue({
      mutateAsync: mockLogin,
      isPending: true,
    } as ReturnType<typeof authMutations.useLogin>);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("should display link to forgot password", () => {
    render(<LoginForm />);

    const forgotPasswordLink = screen.getByText(/forgot your password/i);
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest("a")).toHaveAttribute("href", "/forgot-password");
  });

  it("should display link to register page", () => {
    render(<LoginForm />);

    const registerLink = screen.getByText(/sign up/i);
    expect(registerLink).toBeInTheDocument();
  });
});
