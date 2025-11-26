import { InternalServerError } from "@/server/errors/api-errors";
import { OpenRouterService } from "@/server/services/open-router-service";
import { PromptLoader } from "@/server/utils/prompt-loader";
import { getEnv } from "@/server/utils/env";
import type { DifficultyLevel, TenseName } from "@/types";
import path from "node:path";
import { z } from "zod";

interface GeneratedQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
}

const questionSchema = z.object({
  question_text: z.string().describe("The question text with a blank represented by '___'"),
  options: z.array(z.string()).length(4).describe("Exactly 4 multiple-choice options"),
  correct_answer: z.string().describe("The correct answer (must be one of the options)"),
});

const questionsResponseSchema = z.object({
  questions: z.array(questionSchema).describe("Array of generated questions"),
});

export class TrainingAIService {
  private openRouterService: OpenRouterService;
  private promptLoader: PromptLoader;
  private readonly model = "openai/gpt-4o-mini";

  constructor() {
    this.openRouterService = new OpenRouterService();

    const isDev = getEnv("NODE_ENV") !== "production";
    const promptsBaseDir = isDev
      ? path.resolve(process.cwd(), "src/server/modules/training/prompts")
      : path.resolve(process.cwd(), "dist/server/modules/training/prompts");

    this.promptLoader = new PromptLoader(promptsBaseDir);
  }

  private async getCompletionFromPrompt(
    promptName: string,
    variables: Record<string, string>,
    options: {
      responseFormat?: z.ZodType;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    try {
      const { system, user } = await this.promptLoader.loadPrompt(promptName);

      const systemPrompt = PromptLoader.substituteVariables(system, variables);
      const userPrompt = PromptLoader.substituteVariables(user, variables);

      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: userPrompt },
      ];

      const completion = await this.openRouterService.getChatCompletion({
        model: this.model,
        messages,
        responseFormat: options.responseFormat,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      });

      if (!completion || typeof completion !== "string") {
        throw new InternalServerError("No completion content from AI");
      }

      return completion;
    } catch (error) {
      if (error instanceof InternalServerError) {
        throw error;
      }
      // Wrap unknown errors
      throw new InternalServerError(`AI Service Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async generateQuestions(tense: TenseName, difficulty: DifficultyLevel, count: number): Promise<GeneratedQuestion[]> {
    if (count <= 0 || count > 20) {
      throw new InternalServerError("Count must be between 1 and 20");
    }
    try {
      const completion = await this.getCompletionFromPrompt(
        "generate-questions",
        {
          tense,
          difficulty,
          count: count.toString(),
        },
        {
          responseFormat: questionsResponseSchema,
          temperature: 0.7,
          maxTokens: 2000,
        }
      );

      const parsed = questionsResponseSchema.parse(JSON.parse(completion));
      return parsed.questions;
    } catch (error) {
      if (error instanceof InternalServerError) throw error;
      throw new InternalServerError(
        `Failed to generate questions: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generateRoundFeedback(
    incorrectAnswers: {
      question_text: string;
      user_answer: string;
      correct_answer: string;
    }[],
    tense: TenseName,
    difficulty: DifficultyLevel,
    score: number
  ): Promise<string> {
    if (score < 0 || score > 10) {
      throw new InternalServerError("Score must be between 0 and 10");
    }
    try {
      const incorrectAnswersJson = JSON.stringify(incorrectAnswers);
      const feedback = await this.getCompletionFromPrompt(
        "round-feedback",
        {
          tense,
          difficulty,
          score: score.toString(),
          incorrect_answers_json: incorrectAnswersJson,
        },
        {
          temperature: 0.8,
          maxTokens: 500,
        }
      );
      return feedback.trim();
    } catch (error) {
      if (error instanceof InternalServerError) throw error;
      throw new InternalServerError(
        `Failed to generate round feedback: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generateFinalFeedback(
    incorrectAnswers: {
      question_text: string;
      user_answer: string;
      correct_answer: string;
      round_number: number;
      question_number: number;
    }[],
    tense: TenseName,
    difficulty: DifficultyLevel,
    roundsScores: number[]
  ): Promise<string> {
    try {
      const totalQuestions = 30;
      const correctAnswers = totalQuestions - incorrectAnswers.length;
      const accuracyPercentage = Math.round((correctAnswers / totalQuestions) * 100);

      const incorrectAnswersJson = JSON.stringify(incorrectAnswers);

      const completion = await this.getCompletionFromPrompt(
        "final-feedback",
        {
          tense,
          difficulty,
          total_correct: correctAnswers.toString(),
          accuracy_percentage: accuracyPercentage.toString(),
          rounds_scores: roundsScores.join(" → "),
          incorrect_count: incorrectAnswers.length.toString(),
          incorrect_answers_json: incorrectAnswersJson,
        },
        {
          temperature: 0.8,
          maxTokens: 2000,
        }
      );
      return completion.trim();
    } catch (error) {
      if (error instanceof InternalServerError) throw error;
      throw new InternalServerError(
        `Failed to generate final feedback: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export const trainingAIService = new TrainingAIService();
