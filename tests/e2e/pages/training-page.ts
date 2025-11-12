import { expect, type Page, type Locator } from "@playwright/test";
import { StartTrainingDialog } from "../components/start-training-dialog";

export class TrainingPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/app/training");
    await this.page.waitForLoadState("networkidle");
  }

  getStartNewTrainingButton(): Locator {
    return this.page.getByTestId("start-new-training-button");
  }

  async clickStartNewTraining(): Promise<StartTrainingDialog> {
    const button = this.getStartNewTrainingButton();
    await expect(button).toBeVisible({ timeout: 10000 });
    await button.click();
    return new StartTrainingDialog(this.page);
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.getStartNewTrainingButton()).toBeVisible({ timeout: 10000 });
  }
}
