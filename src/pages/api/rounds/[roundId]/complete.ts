import { TrainingService } from "@/server/modules/training";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { completeRoundBodySchema, completeRoundParamsSchema } from "@/shared/schema/training.schema";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const { roundId } = completeRoundParamsSchema.parse({
      roundId: context.params.roundId,
    });

    const body = await context.request.json();
    const { answers } = completeRoundBodySchema.parse(body);

    const trainingService = new TrainingService(supabase);
    const result = await trainingService.completeRound(userId, roundId, answers);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
