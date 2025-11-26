import { RegisterForm } from "@/features/auth";
import * as authMutations from "@/features/auth/hooks/use-auth-mutations";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../test-utils";

vi.mock("@/features/auth/hooks/use-auth-mutations", () => ({
  useRegister: vi.fn(),
}));

describe("RegisterForm", () => {
  const mockRegister = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMutations.useRegister).mockReturnValue({
      mutateAsync: mockRegister,
      isPending: false,
    } as ReturnType<typeof authMutations.useRegister>);
  });

  it("should render register form with all required fields", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("should display validation error for empty email", async () => {
    render(<RegisterForm />);

    const submitButton = screen.getByRole("button", { name: /create account/i });
    await user.click(submitButton);

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
  });

  it("should display validation error for invalid email format", async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "invalid-email");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Please enter a valid email address")).toBeInTheDocument();
  });

  it("should display validation error for weak password", async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "weak");
    await user.type(confirmPasswordInput, "weak");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it("should display validation error when password doesn't match", async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");
    await user.type(confirmPasswordInput, "Different123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("should call register mutation with correct data on valid submit", async () => {
    mockRegister.mockResolvedValue({});

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");
    await user.type(confirmPasswordInput, "Password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123",
      });
    });
  });

  it("should disable form fields and button when loading", () => {
    vi.mocked(authMutations.useRegister).mockReturnValue({
      mutateAsync: mockRegister,
      isPending: true,
    } as ReturnType<typeof authMutations.useRegister>);

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(confirmPasswordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("should display link to login page", () => {
    render(<RegisterForm />);

    const loginLink = screen.getByText(/log in/i);
    expect(loginLink).toBeInTheDocument();
  });
});
