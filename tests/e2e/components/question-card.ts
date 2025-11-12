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
    return this.locator.locator("h3").or(this.locator.getByText(/\?/));
  }

  async verifyQuestionText(): Promise<void> {
    const questionTextLocator = this.getQuestionText();
    await expect(questionTextLocator).toBeVisible({ timeout: 5000 });
    const text = await questionTextLocator.textContent();
    expect(text).toBeTruthy();
    expect(text?.trim().length).toBeGreaterThan(0);
  }

  getAnswerOptions(): Locator {
    return this.locator.locator('[role="radio"]').or(this.locator.locator('input[type="radio"]'));
  }

  getAnswerLabels(): Locator {
    return this.locator.locator("label");
  }

  async getAnswerOptionCount(): Promise<number> {
    return await this.getAnswerOptions().count();
  }

  async verifyAnswerOptions(): Promise<void> {
    const optionCount = await this.getAnswerOptionCount();
    expect(optionCount).toBeGreaterThanOrEqual(2);
  }

  async selectFirstAnswer(): Promise<void> {
    const labels = this.getAnswerLabels();
    const labelCount = await labels.count();
    if (labelCount > 0) {
      await labels.first().click();
    } else {
      await this.getAnswerOptions().first().click();
    }
  }

  async selectAnswerByIndex(index: number): Promise<void> {
    const labels = this.getAnswerLabels();
    const labelCount = await labels.count();
    if (labelCount > index) {
      await labels.nth(index).click();
    } else {
      await this.getAnswerOptions().nth(index).click();
    }
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
