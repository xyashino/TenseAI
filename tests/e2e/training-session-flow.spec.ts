import { test, type Page } from "@playwright/test";
import { DEFAULT_TEST_USER, loginUser } from "./helpers/auth.helper";
import { cleanupActiveSessions, cleanupUserTestData } from "./helpers/db-cleanup.helper";
import { TrainingPage, TrainingSessionPage } from "./pages";

test.describe("Training Session Flow", () => {
  test.beforeEach(async ({ page }) => {
    if (DEFAULT_TEST_USER.userId) {
      await cleanupActiveSessions(DEFAULT_TEST_USER.userId);
    }
    await loginUser(page, DEFAULT_TEST_USER);

    const trainingPage = new TrainingPage(page);
    await trainingPage.goto();
  });

  test.afterEach(async () => {
    if (DEFAULT_TEST_USER.userId) {
      await cleanupUserTestData(DEFAULT_TEST_USER.userId, false);
    }
  });

  async function startTrainingSession(page: Page) {
    const trainingPage = new TrainingPage(page);
    const startDialog = await trainingPage.clickStartNewTraining();
    await startDialog.startTraining("Present Simple", "Basic");

    const sessionPage = new TrainingSessionPage(page);
    await sessionPage.waitForPageLoad();
    await sessionPage.waitForQuestionsToLoad();
    return sessionPage;
  }

  test("TC-SESS-FULL-001: Complete single round and verify round summary", async ({ page }) => {
    const sessionPage = await startTrainingSession(page);
    await sessionPage.completeRound(1);

    const roundSummary = sessionPage.getRoundSummary(1);
    await roundSummary.verifyVisible();
    await roundSummary.verifyScore();
    await roundSummary.verifyFeedback();
    await roundSummary.verifyContinueButton();
  });

  test("TC-SESS-FULL-002: Verify question navigation and answer selection", async ({ page }) => {
    const sessionPage = await startTrainingSession(page);

    const firstQuestion = sessionPage.getQuestionCard(1, 1);
    await firstQuestion.waitForVisible();
    await firstQuestion.verifyQuestionText();
    await firstQuestion.verifyAnswerOptions();
    await firstQuestion.selectFirstAnswer();
    await firstQuestion.verifyAnswerSelected();
  });
});
