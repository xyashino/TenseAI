import { expect, type Locator } from "@playwright/test";

export class QuestionCard {
  constructor(
    private readonly locator: Locator,
    private readonly roundNumber: number,
    private readonly questionNumber: number
  ) {}

  async waitForVisible(): Promise<void> {
    await this.locator.waitFor({ state: "attached", timeout: 15000 });
    await expect(this.locator).toBeVisible({ timeout: 15000 });
  }

  getQuestionText(): Locator {
    return this.locator.getByTestId("question-text");
  }

  async verifyQuestionText(): Promise<void> {
    const questionTextLocator = this.getQuestionText();
    await expect(questionTextLocator).toBeVisible({ timeout: 5000 });
    const text = await questionTextLocator.textContent();
    expect(text).toBeTruthy();
    expect(text?.trim().length).toBeGreaterThan(0);
  }

  getAnswerOptions(): Locator {
    return this.locator.getByTestId(/answer-option-\d+/).or(this.locator.locator('[role="radio"]'));
  }

  getAnswerLabels(): Locator {
    return this.locator.getByTestId(/answer-label-\d+/).or(this.locator.locator("label"));
  }

  async getAnswerOptionCount(): Promise<number> {
    return await this.getAnswerOptions().count();
  }

  async verifyAnswerOptions(): Promise<void> {
    const optionCount = await this.getAnswerOptionCount();
    expect(optionCount).toBeGreaterThanOrEqual(2);
  }

  async selectFirstAnswer(): Promise<void> {
    const firstOption = this.getAnswerOptions().first();
    await firstOption.waitFor({ state: "visible" });
    await firstOption.click();
    await this.verifyAnswerSelected(0);
  }

  async selectAnswerByIndex(index: number): Promise<void> {
    const option = this.getAnswerOptions().nth(index);
    await option.waitFor({ state: "visible" });
    await option.click();
    await this.verifyAnswerSelected(index);
  }

  async verifyAnswerSelected(index = 0): Promise<void> {
    const radio = this.getAnswerOptions().nth(index);
    try {
      await expect(radio).toHaveAttribute("aria-checked", "true");
    } catch {
      await expect(radio).toBeChecked();
    }
  }
}
