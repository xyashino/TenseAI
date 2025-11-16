import { getEnv, requireEnv } from "@/server/utils/env";
import { OpenRouter } from "@openrouter/sdk";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const RETRY_CONFIG = {
  attempts: 3,
  initialDelayMs: 1000,
};

const chatCompletionParamsSchema = z.object({
  model: z.string().min(1),
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      })
    )
    .min(1),
  responseFormat: z.any().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
});

export type ChatCompletionParams = z.infer<typeof chatCompletionParamsSchema>;

const chatCompletionFromPromptParamsSchema = chatCompletionParamsSchema.omit({ messages: true }).extend({
  promptName: z.string().min(1),
  variables: z.record(z.string(), z.string()).optional(),
});

export type ChatCompletionFromPromptParams = z.infer<typeof chatCompletionFromPromptParamsSchema>;

export class OpenRouterService {
  private client: OpenRouter;

  constructor() {
    const apiKey = requireEnv("OPENROUTER_API_KEY");

    this.client = new OpenRouter({
      apiKey,
    });
  }

  public async getChatCompletion(params: ChatCompletionParams) {
    const validationResult = chatCompletionParamsSchema.safeParse(params);
    if (!validationResult.success) {
      throw new Error(`Invalid chat completion parameters: ${validationResult.error.message}`);
    }

    const { model, messages, responseFormat, temperature, maxTokens } = validationResult.data;
    const formattedResponseFormat = this.createJsonSchemaResponseFormat(responseFormat);

    for (let i = 0; i < RETRY_CONFIG.attempts; i++) {
      try {
        const requestPayload = {
          model,
          messages: messages as Parameters<typeof this.client.chat.send>[0]["messages"],
          responseFormat: formattedResponseFormat ?? responseFormat,
          temperature,
          maxTokens,
        };
        const completion = await this.client.chat.send(requestPayload, {
          headers: {
            "HTTP-Referer": getEnv("PUBLIC_SITE_URL") ?? "",
            "X-Title": "Tensei",
          },
        });
        return completion.choices[0]?.message?.content;
      } catch (error) {
        if (i === RETRY_CONFIG.attempts - 1) {
          throw error;
        }
        const delay = RETRY_CONFIG.initialDelayMs * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("An unexpected error occurred during chat completion retries.");
  }

  public async getChatCompletionFromPrompt(params: ChatCompletionFromPromptParams) {
    const validationResult = chatCompletionFromPromptParamsSchema.safeParse(params);
    if (!validationResult.success) {
      throw new Error(`Invalid parameters: ${validationResult.error.message}`);
    }

    const { promptName, variables, ...restOfParams } = validationResult.data;

    const { system, user } = await this.loadPrompt(promptName);

    const systemPrompt = this.substituteVariables(system, variables ?? {});
    const userPrompt = this.substituteVariables(user, variables ?? {});

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    const completion = await this.getChatCompletion({
      ...restOfParams,
      messages,
    });
    if (!completion || typeof completion !== "string") {
      throw new Error("No completion content from AI");
    }
    return completion;
  }

  private async loadPrompt(promptName: string) {
    try {
      const isDev = getEnv("NODE_ENV") !== "production";
      const promptsDir = isDev
        ? path.resolve(process.cwd(), "src/server/prompts")
        : path.resolve(process.cwd(), "dist/server/prompts");

      const systemPath = path.join(promptsDir, promptName, "system.md");
      const userPath = path.join(promptsDir, promptName, "user.md");

      const [system, user] = await Promise.all([fs.readFile(systemPath, "utf-8"), fs.readFile(userPath, "utf-8")]);

      return { system, user };
    } catch {
      throw new Error(
        `Could not load prompt files for "${promptName}". Make sure the directory and system.md/user.md files exist.`
      );
    }
  }

  private substituteVariables(template: string, variables: Record<string, string>): string {
    return template.replace(/{{(\w+)}}/g, (placeholder, key) => {
      return variables[key] || placeholder;
    });
  }

  private createJsonSchemaResponseFormat(schema: z.ZodType | undefined) {
    if (!schema) {
      return undefined;
    }
    const jsonSchema = z.toJSONSchema(schema);
    return {
      type: "json_schema" as const,
      jsonSchema: {
        name: "ResponseSchema",
        schema: jsonSchema,
        strict: true,
      },
    };
  }
}
