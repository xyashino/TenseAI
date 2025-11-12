import { apiPost, type ApiClientError } from "@/lib/api-client";
import { NavigationRoutes } from "@/lib/enums/navigation";
import { useMutation } from "@tanstack/react-query";
import { navigate } from "astro:transitions/client";
import { toast } from "sonner";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token?: string;
  password: string;
}

interface ResetEmailRequest {
  email: string;
}

interface AuthResponse {
  message?: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      return apiPost<AuthResponse>("/api/auth/login", data);
    },
    onSuccess: () => {
      navigate(NavigationRoutes.TRAINING);
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      return apiPost<AuthResponse>("/api/auth/register", data);
    },
    onSuccess: () => {
      navigate(NavigationRoutes.AUTH_CONFIRM);
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      return apiPost<AuthResponse>("/api/auth/forgot-password", data);
    },
    onSuccess: () => {
      toast.success("Password reset link sent! Check your email for instructions.");
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      return apiPost<AuthResponse>("/api/auth/reset-password", { password: data.password });
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message);
    },
  });
}

export function useResetEmail() {
  return useMutation({
    mutationFn: async (data: ResetEmailRequest) => {
      return apiPost<AuthResponse>("/api/auth/reset-email", data);
    },
    onError: (error: ApiClientError) => {
      toast.error(error.message);
    },
  });
}
