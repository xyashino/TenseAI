import { expect, type Locator } from "@playwright/test";

export class RoundSummary {
  constructor(
    private readonly locator: Locator,
    private readonly roundNumber: number
  ) {}

  getLocator(): Locator {
    return this.locator;
  }

  async waitForVisible(): Promise<void> {
    await expect(this.locator).toBeVisible({ timeout: 15000 });
  }

  getTitle(): Locator {
    return this.locator.getByText(new RegExp(`round ${this.roundNumber}.*complete`, "i"));
  }

  async verifyVisible(): Promise<void> {
    await this.waitForVisible();
  }

  getScore(): Locator {
    return this.locator.getByTestId(`round-summary-score-${this.roundNumber}`);
  }

  async verifyScore(): Promise<void> {
    await expect(this.getScore()).toBeVisible({ timeout: 5000 });
  }

  getFeedback(): Locator {
    return this.locator.getByTestId(`round-summary-feedback-${this.roundNumber}`);
  }

  async verifyFeedback(): Promise<void> {
    await expect(this.getFeedback()).toBeVisible({ timeout: 5000 });
  }

  getStartNextRoundButton(): Locator {
    return this.locator.getByTestId(`start-round-${this.roundNumber + 1}-button`);
  }

  getFinishSessionButton(): Locator {
    return this.locator.getByTestId("finish-session-button");
  }

  async clickContinue(): Promise<void> {
    if (this.roundNumber < 3) {
      const button = this.getStartNextRoundButton();
      await expect(button).toBeVisible({ timeout: 10000 });
      await button.click();
    } else {
      const button = this.getFinishSessionButton();
      await expect(button).toBeVisible({ timeout: 10000 });
      await button.click();
    }
  }

  async verifyContinueButton(): Promise<void> {
    if (this.roundNumber < 3) {
      await expect(this.getStartNextRoundButton()).toBeVisible({ timeout: 5000 });
    } else {
      await expect(this.getFinishSessionButton()).toBeVisible({ timeout: 5000 });
    }
  }
}
