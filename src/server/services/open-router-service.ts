import { getEnv, requireEnv } from "@/server/utils/env";
import { OpenRouter } from "@openrouter/sdk";
import { z } from "zod";

const RETRY_CONFIG = {
  attempts: 3,
  initialDelayMs: 1000,
};

export const chatCompletionParamsSchema = z.object({
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
