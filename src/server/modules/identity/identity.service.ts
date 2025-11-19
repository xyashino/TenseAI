import type { Database } from "@/db/database.types";
import { AuthenticationError, BadRequestError, UnauthorizedError } from "@/server/errors/api-errors";
import type { SupabaseClient } from "@/db/supabase.client";
import { IdentityRepository } from "./identity.repository";
import type { AuthUser, ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from "./identity.types";

export class IdentityService {
  private repo: IdentityRepository;

  constructor(supabase: SupabaseClient) {
    this.repo = new IdentityRepository(supabase);
  }

  async register(input: RegisterInput): Promise<AuthUser> {
    try {
      return await this.repo.register(input);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw new BadRequestError("Failed to create user");
    }
  }

  async login(input: LoginInput): Promise<AuthUser> {
    try {
      return await this.repo.login(input);
    } catch (error) {
      if (error instanceof Error) {
        throw new AuthenticationError("Invalid credentials");
      }
      throw new AuthenticationError("Invalid credentials");
    }
  }

  async logout(): Promise<void> {
    try {
      await this.repo.logout();
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw new BadRequestError("Failed to sign out");
    }
  }

  async forgotPassword(input: ForgotPasswordInput, origin: string): Promise<void> {
    const redirectTo = `${origin}/auth/reset-password`;

    try {
      await this.repo.sendPasswordResetEmail(input.email, redirectTo);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError("Failed to send password reset email");
      }
      throw new BadRequestError("Failed to send password reset email");
    }
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const user = await this.repo.getCurrentUser();

    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }

    try {
      await this.repo.resetPassword(input);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError("Failed to reset password");
      }
      throw new BadRequestError("Failed to reset password");
    }
  }

  async getCurrentUser(): Promise<AuthUser> {
    const user = await this.repo.getCurrentUser();

    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }

    return user;
  }

  async exchangeCodeForSession(code: string): Promise<void> {
    try {
      await this.repo.exchangeCodeForSession(code);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestError("Invalid authorization code");
      }
      throw new BadRequestError("Invalid authorization code");
    }
  }
}
