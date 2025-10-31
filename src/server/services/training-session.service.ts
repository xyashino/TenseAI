import type { SupabaseClient } from "@/db/supabase.client";
import { BadRequestError, NotFoundError } from "@/server/errors/api-errors";
import { TrainingSessionRepository } from "@/server/repositories/training-session.repository";
import { buildPaginationMeta } from "@/server/utils/pagination";
import type {
  CompleteRoundResponseDTO,
  CreateSessionDTO,
  DifficultyLevel,
  PaginationMeta,
  QuestionInsert,
  QuestionReview,
  QuestionWithoutAnswer,
  RoundDetailDTO,
  RoundInsert,
  RoundWithQuestionsDTO,
  SessionDetailResponseDTO,
  SessionStatus,
  TenseName,
  TrainingSessionDTO,
  TrainingSessionInsert,
  TrainingSessionsListResponseDTO,
  UserAnswerInsert,
} from "@/types";
import { mockAiGeneratorService } from "./ai-generator.service";

export class TrainingSessionService {
  private repository: TrainingSessionRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new TrainingSessionRepository(supabase);
  }

  /**
   * Create a new training session record only (without rounds or questions)
   * @param userId - The authenticated user's ID
   * @param dto - Session creation data (tense and difficulty)
   * @returns Session object only
   * @throws Error if session creation fails
   */
  async createSessionOnly(userId: string, dto: CreateSessionDTO): Promise<{ training_session: TrainingSessionDTO }> {
    const sessionData: TrainingSessionInsert = {
      user_id: userId,
      tense: dto.tense,
      difficulty: dto.difficulty,
      status: "active",
      started_at: new Date().toISOString(),
    };

    const session = await this.repository.createSession(sessionData);

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
    };
  }

  /**
   * Create a new round with 10 AI-generated questions for an existing session
   * @param userId - The authenticated user's ID
   * @param sessionId - The session ID to create a round for
   * @returns Round with questions (without correct answers)
   * @throws Error if any step fails (round or question creation)
   */
  async createRound(userId: string, sessionId: string): Promise<RoundWithQuestionsDTO> {
    // Verify session belongs to user and is active
    const sessionData = await this.repository.getSessionById(userId, sessionId);

    if (!sessionData) {
      throw new NotFoundError("Session not found");
    }

    if (sessionData.status !== "active") {
      throw new Error("Cannot create round for a completed session");
    }

    // Get existing rounds to determine next round number
    const existingRounds = await this.repository.getRoundsBySessionId(sessionId);
    const nextRoundNumber = existingRounds.length + 1;

    if (nextRoundNumber > 3) {
      throw new Error("Cannot create more than 3 rounds per session");
    }

    // Check if previous round is completed (if not round 1)
    if (nextRoundNumber > 1) {
      const previousRound = existingRounds.find((r) => r.round_number === nextRoundNumber - 1);
      if (!previousRound?.completed_at) {
        throw new Error(`Cannot create round ${nextRoundNumber}. Previous round is not completed.`);
      }
    }

    let roundId: string | null = null;

    try {
      const roundData: RoundInsert = {
        session_id: sessionId,
        round_number: nextRoundNumber,
        started_at: new Date().toISOString(),
      };

      const round = await this.repository.createRound(roundData);
      roundId = round.id;

      const generatedQuestions = await mockAiGeneratorService.generateQuestions(
        sessionData.tense,
        sessionData.difficulty,
        10
      );
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
        round: {
          id: round.id,
          session_id: round.session_id,
          round_number: round.round_number,
          started_at: round.started_at,
        },
        questions: questionsWithoutAnswer,
      };
    } catch (error) {
      // Rollback round creation if question generation fails
      if (roundId) {
        await this.repository.deleteRound(roundId);
      }
      throw error;
    }
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

  /**
   * Complete a round by validating and saving user answers, calculating score, and generating feedback
   * @param userId - The authenticated user's ID
   * @param roundId - The round ID to complete
   * @param answers - Array of user answers (10 items)
   * @returns Round completion data with questions review
   * @throws NotFoundError if round doesn't exist or doesn't belong to user
   * @throws BadRequestError if validation fails or round already completed
   * @throws Error if database operations fail
   */
  async completeRound(
    userId: string,
    roundId: string,
    answers: { question_id: string; selected_answer: string }[]
  ): Promise<CompleteRoundResponseDTO> {
    const roundWithSession = await this.repository.getRoundWithSession(roundId);

    if (!roundWithSession) {
      throw new NotFoundError("Round not found");
    }

    if (roundWithSession.session.user_id !== userId) {
      throw new NotFoundError("Round not found");
    }

    if (roundWithSession.completed_at !== null) {
      throw new BadRequestError("Round is already completed");
    }

    const questions = await this.repository.getQuestionsWithAnswers(roundId);

    if (questions.length !== 10) {
      throw new Error("Data integrity error: round does not have exactly 10 questions");
    }

    const answersMap = new Map(answers.map((a) => [a.question_id, a.selected_answer]));
    const questionsMap = new Map(questions.map((q) => [q.id, q]));

    for (const answer of answers) {
      const question = questionsMap.get(answer.question_id);
      if (!question) {
        throw new BadRequestError(`Invalid answer data: question ${answer.question_id} does not belong to this round`);
      }

      if (!question.options.includes(answer.selected_answer)) {
        throw new BadRequestError(
          `Selected answer '${answer.selected_answer}' is not a valid option for question ${question.question_number}`
        );
      }
    }

    const questionsReview: QuestionReview[] = [];
    const userAnswersToInsert: UserAnswerInsert[] = [];
    let correctCount = 0;

    for (const question of questions) {
      const userAnswer = answersMap.get(question.id);
      if (!userAnswer) {
        throw new Error(`Missing answer for question ${question.id}`);
      }

      const isCorrect = userAnswer === question.correct_answer;

      if (isCorrect) {
        correctCount++;
      }

      questionsReview.push({
        question_number: question.question_number,
        question_text: question.question_text,
        options: question.options,
        user_answer: userAnswer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
      });

      userAnswersToInsert.push({
        question_id: question.id,
        session_id: roundWithSession.session_id,
        selected_answer: userAnswer,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      });
    }
    await this.repository.createUserAnswers(userAnswersToInsert);

    let feedback = "";
    try {
      const incorrectAnswers = questionsReview
        .filter((q) => !q.is_correct)
        .map((q) => ({
          question_text: q.question_text,
          user_answer: q.user_answer,
          correct_answer: q.correct_answer,
        }));

      feedback = await mockAiGeneratorService.generateRoundFeedback(
        incorrectAnswers,
        roundWithSession.session.tense as TenseName,
        roundWithSession.session.difficulty as DifficultyLevel,
        correctCount
      );
    } catch (error) {
      console.error("Failed to generate round feedback:", error);
      feedback = `You scored ${correctCount}/10. Review your answers and try the next round!`;
    }
    const completedRound = await this.repository.updateRoundCompletion(roundId, correctCount, feedback);

    return {
      round: completedRound,
      questions_review: questionsReview,
    };
  }
}
