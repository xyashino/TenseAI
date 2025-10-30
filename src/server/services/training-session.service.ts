import type { SupabaseClient } from "@/db/supabase.client";
import { buildPaginationMeta } from "@/server/utils/pagination";
import type {
  CreateSessionDTO,
  PaginationMeta,
  QuestionInsert,
  QuestionWithoutAnswer,
  RoundInsert,
  SessionStatus,
  SessionWithRoundDTO,
  TrainingSessionInsert,
  TrainingSessionsListResponseDTO,
} from "@/types";
import { TrainingSessionRepository } from "../repositories/training-session.repository";
import { mockAiQuestionGeneratorService } from "./ai-question-generator.service";

export class TrainingSessionService {
  private repository: TrainingSessionRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new TrainingSessionRepository(supabase);
  }

  /**
   * Create a new training session with the first round and 10 questions
   * @param userId - The authenticated user's ID
   * @param dto - Session creation data (tense and difficulty)
   * @returns Session with first round and questions (without correct answers)
   * @throws Error if any step fails (session, round, or question creation)
   */
  async createSession(userId: string, dto: CreateSessionDTO): Promise<SessionWithRoundDTO> {
    const sessionData: TrainingSessionInsert = {
      user_id: userId,
      tense: dto.tense,
      difficulty: dto.difficulty,
      status: "active",
      started_at: new Date().toISOString(),
    };

    const session = await this.repository.createSession(sessionData);

    let roundId: string | null = null;

    try {
      const roundData: RoundInsert = {
        session_id: session.id,
        round_number: 1,
        started_at: new Date().toISOString(),
      };

      const round = await this.repository.createRound(roundData);
      roundId = round.id;

      const generatedQuestions = await mockAiQuestionGeneratorService.generateQuestions(dto.tense, dto.difficulty, 10);
      const questionsToInsert: QuestionInsert[] = generatedQuestions.map((q, index) => ({
        round_id: round.id,
        question_number: index + 1,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
      }));

      const insertedQuestions = await this.repository.createQuestions(questionsToInsert);
      const questionsWithoutAnswer: QuestionWithoutAnswer[] = insertedQuestions.map((q) => ({
        id: q.id,
        question_number: q.question_number,
        question_text: q.question_text,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
      }));

      return {
        training_session: {
          id: session.id,
          user_id: session.user_id,
          tense: session.tense,
          difficulty: session.difficulty,
          status: session.status,
          started_at: session.started_at,
          created_at: session.created_at,
        },
        current_round: {
          id: round.id,
          session_id: round.session_id,
          round_number: round.round_number,
          started_at: round.started_at,
          questions: questionsWithoutAnswer,
        },
      };
    } catch (error) {
      await this.rollbackDatabaseOperations(session.id, roundId);
      throw error;
    }
  }

  private async rollbackDatabaseOperations(sessionId: string, roundId: string | null): Promise<void> {
    if (roundId) {
      await this.repository.deleteRound(roundId);
    }
    await this.repository.deleteSession(sessionId);
    return;
  }

  /**
   * Get a paginated list of training sessions with their summaries
   * @param userId - The authenticated user's ID
   * @param status - Filter by session status ("active" or "completed")
   * @param page - Page number (1-based)
   * @param limit - Number of items per page (1-100)
   * @param sortOrder - Sort order for started_at field
   * @returns Paginated list of session summaries
   * @throws Error if database query fails
   */
  async getSessionsList(
    userId: string,
    status: SessionStatus,
    page: number,
    limit: number,
    sortOrder: "started_at_desc" | "started_at_asc"
  ): Promise<TrainingSessionsListResponseDTO> {
    const { sessions, total } = await this.repository.getSessionsWithRounds(userId, status, page, limit, sortOrder);

    const pagination: PaginationMeta = buildPaginationMeta({
      totalItems: total,
      page,
      limit,
    });

    return {
      "training-sessions": sessions,
      pagination,
    };
  }
}
