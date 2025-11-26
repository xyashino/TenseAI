// Components
export { AuthCard, AuthFooterLink, LegalFooter } from "./components/common";
export { ForgotPasswordForm, ForgotPasswordFormWithQueryClient } from "./components/forgot-password-form";
export { LoginForm, LoginFormWithQueryClient } from "./components/login-form";
export { LogoutDialog, LogoutDialogWithQueryClient } from "./components/logout-dialog";
export { RegisterForm, RegisterFormWithQueryClient } from "./components/register-form";
export { ResetPasswordForm, ResetPasswordFormWithQueryClient } from "./components/reset-password-form";

// Hooks
export { useForgotPassword, useLogin, useRegister, useResetPassword } from "./hooks/use-auth-mutations";
export { useLogout } from "./hooks/use-logout";

// API
export { authApi } from "./api/auth.api";
export type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "./api/auth.api";

// Types
export type { ForgotPasswordFormValues, LoginFormValues, RegisterFormValues, ResetPasswordFormValues } from "./types";
