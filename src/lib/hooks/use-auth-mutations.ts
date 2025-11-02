import { apiPost } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { navigate } from "astro:transitions/client";

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
  token: string;
  password: string;
}

interface AuthResponse {
  message?: string;
}

export function useLogin() {
  return useMutation(
    {
      mutationFn: async (data: LoginRequest) => {
        return apiPost<AuthResponse>("/api/auth/login", data);
      },
      onSuccess: () => {
        navigate("/app");
      },
    },
    queryClient
  );
}

export function useRegister() {
  return useMutation(
    {
      mutationFn: async (data: RegisterRequest) => {
        return apiPost<AuthResponse>("/api/auth/register", data);
      },
      onSuccess: () => {
        navigate("/auth/confirm");
      },
    },
    queryClient
  );
}

export function useForgotPassword() {
  return useMutation(
    {
      mutationFn: async (data: ForgotPasswordRequest) => {
        return apiPost<AuthResponse>("/api/auth/forgot-password", data);
      },
    },
    queryClient
  );
}

export function useResetPassword() {
  return useMutation(
    {
      mutationFn: async (data: ResetPasswordRequest) => {
        return apiPost<AuthResponse>("/api/auth/reset-password", data);
      },
    },
    queryClient
  );
}
