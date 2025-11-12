export function generateTestEmail(): string {
  const email = process.env.E2E_USERNAME;
  if (!email) {
    throw new Error("E2E_USERNAME environment variable is required");
  }
  return email;
}

export function generateTestPassword(): string {
  const password = process.env.E2E_PASSWORD;
  if (!password) {
    throw new Error("E2E_PASSWORD environment variable is required");
  }
  return password;
}

export function generateTestName(): string {
  const name = process.env.E2E_USERNAME_NAME;
  if (name) {
    return name;
  }
  const email = process.env.E2E_USERNAME;
  if (email) {
    return email.split("@")[0] || "Test User";
  }
  throw new Error("E2E_USERNAME environment variable is required");
}

export const TEST_TENSES = ["present-simple", "present-continuous", "past-simple", "past-continuous"] as const;
export const TEST_DIFFICULTY_LEVELS = ["basic", "advanced"] as const;

export type TestTense = (typeof TEST_TENSES)[number];
export type TestDifficulty = (typeof TEST_DIFFICULTY_LEVELS)[number];
