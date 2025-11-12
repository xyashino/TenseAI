import { expect, type Page, type Locator } from "@playwright/test";
import type { TestUser } from "../helpers/auth.helper";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/login");
    await this.page.waitForLoadState("networkidle");
  }

  getEmailInput(): Locator {
    return this.page.locator('input[type="email"]');
  }

  getPasswordInput(): Locator {
    return this.page.locator('input[type="password"]');
  }

  getSubmitButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  getForgotPasswordLink(): Locator {
    return this.page.getByRole("link", { name: /forgot.*password/i });
  }

  getSignUpLink(): Locator {
    return this.page.getByRole("link", { name: /sign up/i });
  }

  async fillEmail(email: string): Promise<void> {
    const emailInput = this.getEmailInput();
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    const passwordInput = this.getPasswordInput();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill(password);
  }

  async fillForm(user: TestUser): Promise<void> {
    await this.fillEmail(user.email);
    await this.fillPassword(user.password);
  }

  async submit(): Promise<void> {
    const submitButton = this.getSubmitButton();
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
  }

  async login(user: TestUser): Promise<void> {
    await this.fillForm(user);

    await Promise.all([
      this.page.waitForResponse((response) => {
        return response.url().includes("/api/auth/login") && response.status() === 200;
      }),
      this.submit(),
    ]);

    await this.page.waitForURL(/\/app\//, { timeout: 10000 });
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.getEmailInput()).toBeVisible({ timeout: 10000 });
    await expect(this.getPasswordInput()).toBeVisible({ timeout: 10000 });
    await expect(this.getSubmitButton()).toBeVisible({ timeout: 10000 });
  }

  async verifyErrorMessage(): Promise<void> {
    await expect(this.page.getByText(/invalid|error|incorrect/i)).toBeVisible({ timeout: 5000 });
  }

  async clickForgotPassword(): Promise<void> {
    const link = this.getForgotPasswordLink();
    await expect(link).toBeVisible({ timeout: 5000 });
    await link.click();
    await this.page.waitForURL(/\/forgot-password/, { timeout: 5000 });
  }

  async clickSignUp(): Promise<void> {
    const link = this.getSignUpLink();
    await expect(link).toBeVisible({ timeout: 5000 });
    await link.click();
    await this.page.waitForURL(/\/register/, { timeout: 5000 });
  }
}
