import type { Database } from "@/db/database.types";
import type { SupabaseClient } from "@/db/supabase.client";
import type { AuthUser, LoginInput, RegisterInput, ResetPasswordInput } from "./identity.types";

export class IdentityRepository {
  constructor(private supabase: SupabaseClient) {}

  async register(input: RegisterInput): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("Failed to create user");
    }

    return {
      id: data.user.id,
      email: data.user.email,
    };
  }

  async login(input: LoginInput): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword(input);

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("Failed to authenticate user");
    }

    return {
      id: data.user.id,
      email: data.user.email,
    };
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, redirectTo: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      throw error;
    }
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: input.password,
    });

    if (error) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error) {
      throw error;
    }

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  async exchangeCodeForSession(code: string): Promise<void> {
    const { error } = await this.supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }
  }
}
