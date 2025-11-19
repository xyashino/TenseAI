import { TrainingService } from "@/server/modules/training";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { completeSessionParamsSchema } from "@/shared/schema/training.schema";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const { sessionId } = completeSessionParamsSchema.parse({
      sessionId: context.params.sessionId,
    });

    const trainingService = new TrainingService(supabase);
    const result = await trainingService.completeSession(userId, sessionId);

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
