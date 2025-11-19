import type { SupabaseClient } from "@/db/supabase.client";
import { BadRequestError, NotFoundError } from "@/server/errors/api-errors";
import { trainingAIService } from "./training.ai.service";
import { buildPaginationMeta } from "@/server/utils/pagination";
import type {
  CompleteRoundResponseDTO,
  CompleteSessionResponseDTO,
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
import { TrainingRepository } from "./training.repository";
import { TrainingRules } from "./training.rules";

export class TrainingService {
  private repo: TrainingRepository;

  constructor(supabase: SupabaseClient) {
    this.repo = new TrainingRepository(supabase);
  }

  async createSession(userId: string, dto: CreateSessionDTO): Promise<{ training_session: TrainingSessionDTO }> {
    const sessionData: TrainingSessionInsert = {
      user_id: userId,
      tense: dto.tense,
      difficulty: dto.difficulty,
      status: "active",
      started_at: new Date().toISOString(),
    };

    const session = await this.repo.createSession(sessionData);

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

  async createRound(userId: string, sessionId: string): Promise<RoundWithQuestionsDTO> {
    const sessionData = await this.repo.getSessionById(userId, sessionId);
    const existingRounds = await this.repo.getRoundsBySessionId(sessionId);
    const nextRoundNumber = existingRounds.length + 1;

    TrainingRules.canCreateRound(sessionData, existingRounds, nextRoundNumber);

    if (!sessionData) {
      throw new NotFoundError("Session not found");
    }

    let roundId: string | null = null;

    try {
      const roundData: RoundInsert = {
        session_id: sessionId,
        round_number: nextRoundNumber,
        started_at: new Date().toISOString(),
      };

      const round = await this.repo.createRound(roundData);
      roundId = round.id;

      const generatedQuestions = await trainingAIService.generateQuestions(
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

      const insertedQuestions = await this.repo.createQuestions(questionsToInsert);
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
      if (roundId) {
        await this.repo.deleteRound(roundId);
      }
      throw error;
    }
  }

  async getSessionsList(
    userId: string,
    status: SessionStatus,
    page: number,
    limit: number,
    sortOrder: "started_at_desc" | "started_at_asc"
  ): Promise<TrainingSessionsListResponseDTO> {
    const { sessions, total } = await this.repo.getSessionsWithRounds(userId, status, page, limit, sortOrder);

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

  async getSessionDetail(userId: string, sessionId: string): Promise<SessionDetailResponseDTO> {
    const sessionData = await this.repo.getSessionWithDetails(userId, sessionId);

    if (!sessionData) {
      throw new NotFoundError("Session not found");
    }

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
            let userAnswer = q.user_answer;
            if (Array.isArray(userAnswer)) {
              userAnswer = userAnswer.length > 0 ? userAnswer[0] : null;
            }

            let options: string[];
            try {
              options = Array.isArray(q.options) ? q.options : JSON.parse(q.options as string);
            } catch {
              options = [];
            }

            return {
              id: q.id,
              question_number: q.question_number,
              question_text: q.question_text,
              options,
              correct_answer: q.correct_answer,
              user_answer: {
                selected_answer: userAnswer?.selected_answer ?? "",
                is_correct: userAnswer?.is_correct ?? false,
                answered_at: userAnswer?.answered_at ?? "",
              },
            };
          }),
      }));

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

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    const deleted = await this.repo.deleteSessionWithAuth(userId, sessionId);
    if (!deleted) {
      throw new NotFoundError("Session not found");
    }
  }

  async completeRound(
    userId: string,
    roundId: string,
    answers: { question_id: string; selected_answer: string }[]
  ): Promise<CompleteRoundResponseDTO> {
    const roundWithSession = await this.repo.getRoundWithSession(roundId);

    if (!roundWithSession) {
      throw new NotFoundError("Round not found");
    }

    if (roundWithSession.session.user_id !== userId) {
      throw new NotFoundError("Round not found");
    }

    const questions = await this.repo.getQuestionsWithAnswers(roundId);

    TrainingRules.canCompleteRound(roundWithSession.completed_at, questions.length);

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
        throw new BadRequestError(`Missing answer for question ${question.id}`);
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
    await this.repo.createUserAnswers(userAnswersToInsert);

    let feedback = "";
    try {
      const incorrectAnswers = questionsReview
        .filter((q) => !q.is_correct)
        .map((q) => ({
          question_text: q.question_text,
          user_answer: q.user_answer,
          correct_answer: q.correct_answer,
        }));

      feedback = await trainingAIService.generateRoundFeedback(
        incorrectAnswers,
        roundWithSession.session.tense as TenseName,
        roundWithSession.session.difficulty as DifficultyLevel,
        correctCount
      );
    } catch {
      feedback = `You scored ${correctCount}/10. Review your answers and try the next round!`;
    }
    const completedRound = await this.repo.updateRoundCompletion(roundId, correctCount, feedback);

    return {
      round: completedRound,
      questions_review: questionsReview,
    };
  }

  async completeSession(userId: string, sessionId: string): Promise<CompleteSessionResponseDTO> {
    const sessionData = await this.repo.getSessionWithDetails(userId, sessionId);

    if (!sessionData) {
      throw new NotFoundError("Training session not found");
    }

    const rounds = sessionData.rounds;
    const completedRounds = rounds.filter((r) => r.completed_at !== null);

    TrainingRules.canCompleteSession(sessionData.status as SessionStatus, rounds.length, completedRounds.length);

    const roundsScores = rounds.sort((a, b) => a.round_number - b.round_number).map((r) => r.score ?? 0);

    const totalScore = roundsScores.reduce((sum, score) => sum + score, 0);
    const totalQuestions = 30;
    const incorrectCount = totalQuestions - totalScore;
    const accuracyPercentage = Math.round((totalScore / totalQuestions) * 100);
    const perfectScore = totalScore === totalQuestions;

    const incorrectAnswers: {
      question_text: string;
      user_answer: string;
      correct_answer: string;
      round_number: number;
      question_number: number;
    }[] = [];

    for (const round of rounds) {
      for (const question of round.questions) {
        const userAnswer = question.user_answer;
        if (userAnswer && !userAnswer.is_correct) {
          incorrectAnswers.push({
            question_text: question.question_text,
            user_answer: userAnswer.selected_answer,
            correct_answer: question.correct_answer,
            round_number: round.round_number,
            question_number: question.question_number,
          });
        }
      }
    }

    let finalFeedback = "";
    try {
      finalFeedback = await trainingAIService.generateFinalFeedback(
        incorrectAnswers,
        sessionData.tense as TenseName,
        sessionData.difficulty as DifficultyLevel,
        roundsScores
      );
    } catch (error) {
      throw new Error(`Failed to generate final feedback: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    let updatedSession;
    try {
      updatedSession = await this.repo.updateSessionCompletion(sessionId, finalFeedback);
    } catch (error) {
      if (error instanceof Error && error.message.includes("already completed")) {
        throw new BadRequestError("This session has already been completed", {
          completed_at: sessionData.completed_at,
        });
      }
      throw error;
    }

    return {
      training_session: {
        id: updatedSession.id,
        tense: updatedSession.tense as TenseName,
        difficulty: updatedSession.difficulty as DifficultyLevel,
        status: updatedSession.status,
        final_feedback: updatedSession.final_feedback,
        started_at: updatedSession.started_at,
        completed_at: updatedSession.completed_at,
      },
      summary: {
        rounds_scores: roundsScores,
        total_score: `${totalScore}/30`,
        accuracy_percentage: accuracyPercentage,
        incorrect_count: incorrectCount,
        perfect_score: perfectScore,
      },
    };
  }
}
