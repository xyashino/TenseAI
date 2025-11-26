import { apiPost } from "@/shared/api/client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
}

export interface AuthResponse {
  message?: string;
  data?: {
    id: string;
    email?: string;
  };
}

/**
 * API client for authentication operations
 */
export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiPost<AuthResponse>("/api/auth/login", data);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiPost<AuthResponse>("/api/auth/register", data);
  },

  async logout(): Promise<AuthResponse> {
    return apiPost<AuthResponse>("/api/auth/logout", {});
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
    return apiPost<AuthResponse>("/api/auth/forgot-password", data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    return apiPost<AuthResponse>("/api/auth/reset-password", data);
  },
};
