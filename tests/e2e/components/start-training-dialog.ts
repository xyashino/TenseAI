import { expect, type Locator, type Page } from "@playwright/test";

export class StartTrainingDialog {
  constructor(private readonly page: Page) {}

  async waitForDialog(): Promise<void> {
    const dialog = this.page.getByTestId("start-training-dialog");
    await expect(dialog).toBeVisible({ timeout: 10000 });
  }

  async verifyTitle(): Promise<void> {
    await this.waitForDialog();
    await expect(this.page.getByTestId("start-training-dialog-title")).toBeVisible({ timeout: 10000 });
  }

  getTenseSelect(): Locator {
    return this.page.getByTestId("tense-select");
  }

  getDifficultySelect(): Locator {
    return this.page.getByTestId("difficulty-select");
  }

  async selectTense(tenseName: string): Promise<void> {
    const tenseSelect = this.getTenseSelect();
    await tenseSelect.click();
    const tenseOptionId = `tense-option-${tenseName.toLowerCase().replace(/\s+/g, "-")}`;
    await this.page.getByTestId(tenseOptionId).click();
  }

  async selectDifficulty(difficultyName: string): Promise<void> {
    const difficultySelect = this.getDifficultySelect();
    await difficultySelect.click();
    const difficultyOptionId = `difficulty-option-${difficultyName.toLowerCase()}`;
    await this.page.getByTestId(difficultyOptionId).click();
  }

  getStartButton(): Locator {
    return this.page.getByTestId("start-training-button");
  }

  async clickStartTraining(): Promise<void> {
    const button = this.getStartButton();
    await expect(button).toBeVisible({ timeout: 10000 });
    await expect(button).toBeEnabled({ timeout: 10000 });
    await button.click();
  }

  async startTraining(tense: string, difficulty: string): Promise<void> {
    await this.waitForDialog();
    await this.verifyTitle();
    await this.selectTense(tense);
    await this.selectDifficulty(difficulty);
    await this.clickStartTraining();
  }
}
