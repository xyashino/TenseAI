import type { Page } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

export interface TestUser {
  email: string;
  password: string;
  userId?: string;
  name?: string;
}

function getTestUserFromEnv(): TestUser {
  const email = process.env.E2E_USERNAME || "test@example.com";
  const password = process.env.E2E_PASSWORD || "TestPassword123!";
  const userId = process.env.E2E_USERNAME_ID;
  const name = process.env.E2E_USERNAME?.split("@")[0] || "Test User";

  return {
    email,
    password,
    userId,
    name,
  };
}

export const DEFAULT_TEST_USER: TestUser = getTestUserFromEnv();

export async function loginUser(page: Page, user: TestUser = DEFAULT_TEST_USER): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(user);
}

export async function registerUser(page: Page, user: TestUser): Promise<void> {
  await page.goto("/register");
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  if (user.name) {
    await page.fill('input[name="name"]', user.name);
  }
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/check-email|\/login/, { timeout: 10000 });
}

export const createTestUser = registerUser;

export async function isUserLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.goto("/app/training");
    const url = page.url();
    return url.includes("/app/");
  } catch {
    return false;
  }
}
