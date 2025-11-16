import { TrainingSessionService } from "@/server/services/training-session.service";
import { authenticateUser } from "@/server/utils/auth";
import { handleApiError } from "@/server/utils/error-handler";
import { deleteSessionParamsSchema, getSessionDetailParamsSchema } from "@/server/validation/session.validation";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const { sessionId } = getSessionDetailParamsSchema.parse({
      sessionId: context.params.sessionId,
    });

    const service = new TrainingSessionService(supabase);
    const sessionDetail = await service.getSessionDetail(userId, sessionId);

    return new Response(JSON.stringify(sessionDetail), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    const supabase = context.locals.supabase;
    const userId = await authenticateUser(supabase);

    const { sessionId } = deleteSessionParamsSchema.parse({
      sessionId: context.params.sessionId,
    });

    const service = new TrainingSessionService(supabase);
    await service.deleteSession(userId, sessionId);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
