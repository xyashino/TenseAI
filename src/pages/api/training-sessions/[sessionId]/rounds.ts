import { TrainingService } from "@/server/modules/training";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { createRoundParamsSchema } from "@/server/validation/session.validation";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const { sessionId } = createRoundParamsSchema.parse({
      sessionId: context.params.sessionId,
    });

    const trainingService = new TrainingService(supabase);
    const result = await trainingService.createRound(userId, sessionId);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        Location: `/api/training-sessions/${sessionId}/rounds/${result.round.round_number}`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
