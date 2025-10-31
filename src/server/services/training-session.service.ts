import type { SupabaseClient } from "@/db/supabase.client";
import { NotFoundError } from "@/server/errors/api-errors";
import { buildPaginationMeta } from "@/server/utils/pagination";
import type {
  CreateSessionDTO,
  DifficultyLevel,
  PaginationMeta,
  QuestionInsert,
  QuestionWithoutAnswer,
  RoundDetailDTO,
  RoundInsert,
  SessionDetailResponseDTO,
  SessionStatus,
  SessionWithRoundDTO,
  TenseName,
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

  /**
   * Get detailed information about a specific training session
   * @param userId - The authenticated user's ID
   * @param sessionId - The session ID to retrieve
   * @returns Complete session details with rounds, questions, answers, and summary
   * @throws NotFoundError if session doesn't exist or doesn't belong to user
   * @throws Error if database query fails
   */
  async getSessionDetail(userId: string, sessionId: string): Promise<SessionDetailResponseDTO> {
    const sessionData = await this.repository.getSessionWithDetails(userId, sessionId);

    if (!sessionData) {
      throw new NotFoundError("Session not found");
    }

    // Transform data to match response DTO
    const rounds: RoundDetailDTO[] = sessionData.rounds
      .sort((a, b) => a.round_number - b.round_number)
      .map((round) => ({
        id: round.id,
        round_number: round.round_number,
        score: round.score ?? 0,
        round_feedback: round.round_feedback ?? "",
        started_at: round.started_at,
        completed_at: round.completed_at ?? "",
        questions: round.questions
          .sort((a, b) => a.question_number - b.question_number)
          .map((q) => {
            // User answer is a One-to-One relationship (each question has one answer)
            const userAnswer = q.user_answer;

            return {
              id: q.id,
              question_number: q.question_number,
              question_text: q.question_text,
              options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
              correct_answer: q.correct_answer,
              user_answer: {
                selected_answer: userAnswer?.selected_answer ?? "",
                is_correct: userAnswer?.is_correct ?? false,
                answered_at: userAnswer?.answered_at ?? "",
              },
            };
          }),
      }));

    // Calculate summary statistics
    const total_questions = rounds.length * 10;
    const correct_answers = rounds.reduce((sum, round) => sum + round.score, 0);
    const accuracy_percentage = Math.round((correct_answers / total_questions) * 100);
    const rounds_scores = rounds.map((r) => r.score);

    return {
      training_session: {
        id: sessionData.id,
        tense: sessionData.tense as TenseName,
        difficulty: sessionData.difficulty as DifficultyLevel,
        status: sessionData.status as SessionStatus,
        final_feedback: sessionData.final_feedback,
        started_at: sessionData.started_at,
        completed_at: sessionData.completed_at,
      },
      rounds,
      summary: {
        total_questions,
        correct_answers,
        accuracy_percentage,
        rounds_scores,
      },
    };
  }

  /**
   * Delete a training session
   * @param userId - The authenticated user's ID
   * @param sessionId - The session ID to delete
   * @throws NotFoundError if session doesn't exist or doesn't belong to user
   * @throws Error if database query fails
   */
  async deleteSession(userId: string, sessionId: string): Promise<void> {
    const deleted = await this.repository.deleteSessionWithAuth(userId, sessionId);

    if (!deleted) {
      throw new NotFoundError("Session not found");
    }
  }
}
