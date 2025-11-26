import { expect, type Locator, type Page } from "@playwright/test";
import { QuestionCard } from "../components/question-card";
import { RoundSummary } from "../components/round-summary";

export class TrainingSessionPage {
  constructor(private readonly page: Page) {}

  async waitForPageLoad(): Promise<void> {
    await expect(this.page.getByTestId("training-session-view")).toBeVisible({ timeout: 15000 });
  }

  async waitForQuestionsToLoad(roundNumber = 1): Promise<void> {
    try {
      const loadingElement = this.page.getByTestId("loading-element");
      await loadingElement.waitFor({ state: "hidden", timeout: 30000 }).catch(() => {
        // Ignore errors during loading element wait
      });
    } catch {
      // Ignore errors during loading element wait
    }

    const testId = `round-${roundNumber}-question-1`;
    const firstQuestionLocator = this.page.getByTestId(testId);

    if (roundNumber > 1) {
      await this.page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {
        // Ignore network idle wait errors
      });

      await firstQuestionLocator.waitFor({ state: "attached", timeout: 30000 });

      await firstQuestionLocator.scrollIntoViewIfNeeded({ timeout: 10000 });

      await this.page.waitForTimeout(500);

      await expect(firstQuestionLocator).toBeVisible({ timeout: 30000 });
    } else {
      await firstQuestionLocator.waitFor({ state: "attached", timeout: 30000 });
      await firstQuestionLocator.scrollIntoViewIfNeeded();
      await expect(firstQuestionLocator).toBeVisible({ timeout: 30000 });
    }

    const questionCard = this.getQuestionCard(roundNumber, 1);
    await questionCard.waitForVisible();
    await questionCard.verifyQuestionText();
  }

  getQuestionCard(roundNumber: number, questionNumber: number): QuestionCard {
    const testId = `round-${roundNumber}-question-${questionNumber}`;
    const locator = this.page.getByTestId(testId);
    return new QuestionCard(locator, roundNumber, questionNumber);
  }

  getSubmitButton(roundNumber: number): Locator {
    return this.page.getByTestId(`submit-round-${roundNumber}-button`);
  }

  getRoundSummary(roundNumber: number): RoundSummary {
    const locator = this.page.getByTestId(`round-summary-${roundNumber}`);
    return new RoundSummary(locator, roundNumber);
  }

  getStartRoundButton(roundNumber: number): Locator {
    return this.page.getByTestId(`start-round-${roundNumber}-button`);
  }

  async startRound(roundNumber: number): Promise<void> {
    const button = this.getStartRoundButton(roundNumber);
    await expect(button).toBeVisible({ timeout: 10000 });
    await expect(button).toBeEnabled({ timeout: 10000 });
    await button.click();

    try {
      const loadingElement = this.page.getByTestId("loading-element");
      await loadingElement.waitFor({ state: "visible", timeout: 5000 });
    } catch {
      // Ignore loading element visibility errors
    }

    await this.waitForQuestionsToLoad(roundNumber);
  }

  async answerAllQuestions(roundNumber: number): Promise<void> {
    const firstQuestion = this.getQuestionCard(roundNumber, 1);
    await firstQuestion.waitForVisible();

    for (let i = 1; i <= 10; i++) {
      const questionCard = this.getQuestionCard(roundNumber, i);
      await questionCard.waitForVisible();

      const optionCount = await questionCard.getAnswerOptionCount();
      if (optionCount > 0) {
        await questionCard.selectFirstAnswer();
      }
    }
  }

  async submitRound(roundNumber: number): Promise<void> {
    const submitButton = this.getSubmitButton(roundNumber);
    await expect(submitButton).toBeVisible({ timeout: 10000 });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    try {
      const loadingElement = this.page.getByTestId("loading-element");
      await loadingElement.waitFor({ state: "visible", timeout: 5000 });
    } catch {
      // Loading element might not appear or disappear quickly
    }

    // Wait for loading element to disappear before looking for round summary
    try {
      const loadingElement = this.page.getByTestId("loading-element");
      await loadingElement.waitFor({ state: "hidden", timeout: 30000 });
    } catch {
      // Loading element might disappear quickly or not be present
    }
  }

  async completeRound(roundNumber: number): Promise<void> {
    if (roundNumber > 1) {
      await this.startRound(roundNumber);
    }

    await this.answerAllQuestions(roundNumber);
    await this.submitRound(roundNumber);

    // Wait for round summary to appear after loading completes
    const roundSummary = this.getRoundSummary(roundNumber);
    await roundSummary.waitForVisible();
    await roundSummary.verifyScore();
  }

  async verifyFinalFeedback(): Promise<void> {
    await expect(this.page.getByText(/final|podsumowanie|summary/i)).toBeVisible({ timeout: 10000 });
  }

  getViewHistoryButton(): Locator {
    return this.page.getByTestId("view-history-button");
  }

  getStartNewSessionButton(): Locator {
    return this.page.getByTestId("start-new-session-button");
  }

  async verifySessionCompletionActions(): Promise<void> {
    const viewHistoryButton = this.getViewHistoryButton();
    const startNewButton = this.getStartNewSessionButton();
    await expect(viewHistoryButton.or(startNewButton)).toBeVisible({ timeout: 5000 });
  }
}
