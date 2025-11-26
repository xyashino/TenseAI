import type { SupabaseClient } from "@/db/supabase.client";
import type {
  CompletedRoundDTO,
  TrainingSessionWithRounds,
} from "@/features/training/types";
import { getPaginationOffset } from "@/server/utils/pagination";
import type {
  DifficultyLevel,
  Question,
  QuestionInsert,
  Round,
  RoundInsert,
  SessionStatus,
  TenseName,
  TrainingSession,
  TrainingSessionInsert,
  UserAnswerInsert,
} from "@/types";

interface SessionWithDetailsData {
  id: string;
  user_id: string;
  tense: string;
  difficulty: string;
  status: SessionStatus;
  final_feedback: string | null;
  started_at: string;
  completed_at: string | null;
  rounds: {
    id: string;
    round_number: number;
    score: number | null;
    round_feedback: string | null;
    started_at: string;
    completed_at: string | null;
    questions: {
      id: string;
      question_number: number;
      question_text: string;
      options: string | string[];
      correct_answer: string;
      user_answer: {
        selected_answer: string;
        is_correct: boolean;
        answered_at: string;
      } | null;
    }[];
  }[];
}

interface RoundWithSessionData {
  id: string;
  session_id: string;
  round_number: number;
  score: number | null;
  round_feedback: string | null;
  started_at: string;
  completed_at: string | null;
  session: {
    id: string;
    user_id: string;
    tense: string;
    difficulty: string;
    status: SessionStatus;
  };
}

// Types for Supabase nested query results
interface SessionWithRoundsQueryResult {
  id: string;
  tense: TenseName;
  difficulty: DifficultyLevel;
  status: SessionStatus;
  started_at: string;
  completed_at: string | null;
  rounds:
    | {
        id: string;
        round_number: number;
        score: number | null;
        completed_at: string | null;
      }[]
    | null;
}

interface QuestionWithUserAnswerQueryResult {
  id: string;
  question_number: number;
  question_text: string;
  options: string | string[];
  correct_answer: string;
  user_answers:
    | {
        selected_answer: string;
        is_correct: boolean;
        answered_at: string;
      }[]
    | null;
}

interface RoundWithQuestionsQueryResult {
  id: string;
  round_number: number;
  score: number | null;
  round_feedback: string | null;
  started_at: string;
  completed_at: string | null;
  questions: QuestionWithUserAnswerQueryResult[] | null;
}

interface SessionWithDetailsQueryResult {
  id: string;
  user_id: string;
  tense: TenseName;
  difficulty: DifficultyLevel;
  status: SessionStatus;
  final_feedback: string | null;
  started_at: string;
  completed_at: string | null;
  rounds: RoundWithQuestionsQueryResult[] | null;
}

export class TrainingRepository {
  constructor(private supabase: SupabaseClient) {}

  async createSession(sessionData: TrainingSessionInsert): Promise<TrainingSession> {
    const { data, error } = await this.supabase.from("training_sessions").insert(sessionData).select().single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return data;
  }

  async getSessionById(userId: string, sessionId: string): Promise<TrainingSession | null> {
    const { data, error } = await this.supabase
      .from("training_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch session: ${error.message}`);
    }

    return data;
  }

  async getRoundsBySessionId(sessionId: string): Promise<Round[]> {
    const { data, error } = await this.supabase
      .from("rounds")
      .select("*")
      .eq("session_id", sessionId)
      .order("round_number", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch rounds: ${error.message}`);
    }

    return data || [];
  }

  async createRound(roundData: RoundInsert): Promise<Round> {
    const { data, error } = await this.supabase.from("rounds").insert(roundData).select().single();

    if (error) {
      throw new Error(`Failed to create round: ${error.message}`);
    }

    return data;
  }

  async deleteRound(roundId: string): Promise<void> {
    const { error } = await this.supabase.from("rounds").delete().eq("id", roundId);

    if (error) {
      throw new Error(`Failed to delete round: ${error.message}`);
    }
  }

  async createQuestions(questions: QuestionInsert[]): Promise<Question[]> {
    const { data, error } = await this.supabase.from("questions").insert(questions).select();

    if (error) {
      throw new Error(`Failed to create questions: ${error.message}`);
    }

    return data || [];
  }

  async getSessionsWithRounds(
    userId: string,
    status: SessionStatus,
    page: number,
    limit: number,
    sortOrder: "started_at_desc" | "started_at_asc"
  ): Promise<{ sessions: TrainingSessionWithRounds[]; total: number }> {
    const offset = getPaginationOffset(page, limit);
    const ascending = sortOrder === "started_at_asc";

    const countQuery = this.supabase
      .from("training_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", status);

    const dataQuery = this.supabase
      .from("training_sessions")
      .select(
        `
        id,
        tense,
        difficulty,
        status,
        started_at,
        completed_at,
        rounds (
          id,
          round_number,
          score,
          completed_at
        )
      `
      )
      .eq("user_id", userId)
      .eq("status", status)
      .order("started_at", { ascending })
      .range(offset, offset + limit - 1);

    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    if (countResult.error) {
      throw new Error(`Failed to count sessions: ${countResult.error.message}`);
    }

    if (dataResult.error || !dataResult.data) {
      throw new Error(`Failed to fetch sessions: ${dataResult.error?.message || "Unknown error"}`);
    }

    const sessions: TrainingSessionWithRounds[] = (dataResult.data as SessionWithRoundsQueryResult[]).map(
      (session) => ({
        id: session.id,
        tense: session.tense,
        difficulty: session.difficulty,
        status: session.status,
        started_at: session.started_at,
        completed_at: session.completed_at,
        rounds: (session.rounds || []).map((round) => ({
          id: round.id,
          round_number: round.round_number,
          score: round.score,
          completed_at: round.completed_at,
        })),
      })
    );

    return {
      sessions,
      total: countResult.count || 0,
    };
  }

  async getSessionWithDetails(userId: string, sessionId: string): Promise<SessionWithDetailsData | null> {
    const { data, error } = await this.supabase
      .from("training_sessions")
      .select(
        `
        id,
        user_id,
        tense,
        difficulty,
        status,
        final_feedback,
        started_at,
        completed_at,
        rounds (
          id,
          round_number,
          score,
          round_feedback,
          started_at,
          completed_at,
          questions (
            id,
            question_number,
            question_text,
            options,
            correct_answer,
            user_answers (
              selected_answer,
              is_correct,
              answered_at
            )
          )
        )
      `
      )
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch session details: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    const queryData = data as SessionWithDetailsQueryResult;
    const transformedData: SessionWithDetailsData = {
      id: queryData.id,
      user_id: queryData.user_id,
      tense: queryData.tense,
      difficulty: queryData.difficulty,
      status: queryData.status,
      final_feedback: queryData.final_feedback,
      started_at: queryData.started_at,
      completed_at: queryData.completed_at,
      rounds: (queryData.rounds || []).map((round) => ({
        id: round.id,
        round_number: round.round_number,
        score: round.score,
        round_feedback: round.round_feedback,
        started_at: round.started_at,
        completed_at: round.completed_at,
        questions: (round.questions || []).map((question) => {
          let options: string[];
          try {
            options = Array.isArray(question.options)
              ? question.options
              : typeof question.options === "string"
              ? JSON.parse(question.options)
              : [];
          } catch {
            options = [];
          }

          const userAnswer =
            question.user_answers && question.user_answers.length > 0 ? question.user_answers[0] : null;

          return {
            id: question.id,
            question_number: question.question_number,
            question_text: question.question_text,
            options,
            correct_answer: question.correct_answer,
            user_answer: userAnswer
              ? {
                  selected_answer: userAnswer.selected_answer,
                  is_correct: userAnswer.is_correct,
                  answered_at: userAnswer.answered_at,
                }
              : null,
          };
        }),
      })),
    };

    return transformedData;
  }

  async deleteSessionWithAuth(userId: string, sessionId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("training_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId)
      .select();

    if (error) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }

    return data && data.length > 0;
  }

  async getRoundWithSession(roundId: string): Promise<RoundWithSessionData | null> {
    const { data, error } = await this.supabase
      .from("rounds")
      .select(
        `
        id,
        session_id,
        round_number,
        score,
        round_feedback,
        started_at,
        completed_at,
        training_sessions!inner (
          id,
          user_id,
          tense,
          difficulty,
          status
        )
      `
      )
      .eq("id", roundId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch round: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      session_id: data.session_id,
      round_number: data.round_number,
      score: data.score,
      round_feedback: data.round_feedback,
      started_at: data.started_at,
      completed_at: data.completed_at,
      session: {
        id: data.training_sessions.id,
        user_id: data.training_sessions.user_id,
        tense: data.training_sessions.tense,
        difficulty: data.training_sessions.difficulty,
        status: data.training_sessions.status,
      },
    };
  }

  async getQuestionsWithAnswers(roundId: string): Promise<(Question & { options: string[] })[]> {
    const { data, error } = await this.supabase
      .from("questions")
      .select("*")
      .eq("round_id", roundId)
      .order("question_number", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    return (data || []).map((question) => {
      let options: string[];
      try {
        options = Array.isArray(question.options)
          ? question.options
          : typeof question.options === "string"
          ? JSON.parse(question.options)
          : [];
      } catch {
        options = [];
      }

      return {
        ...question,
        options,
      };
    });
  }

  async createUserAnswers(answers: UserAnswerInsert[]): Promise<void> {
    const { error } = await this.supabase.from("user_answers").insert(answers);

    if (error) {
      throw new Error(`Failed to create user answers: ${error.message}`);
    }
  }

  async updateRoundCompletion(roundId: string, score: number, feedback: string): Promise<CompletedRoundDTO> {
    const { data, error } = await this.supabase
      .from("rounds")
      .update({
        score,
        round_feedback: feedback,
        completed_at: new Date().toISOString(),
      })
      .eq("id", roundId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update round completion: ${error.message}`);
    }

    return {
      id: data.id,
      round_number: data.round_number,
      score: data.score ?? 0,
      completed_at: data.completed_at ?? "",
      round_feedback: data.round_feedback ?? "",
      started_at: data.started_at,
    };
  }

  async updateSessionCompletion(sessionId: string, finalFeedback: string): Promise<TrainingSession> {
    // Check if session is already completed
    const { data: existingSession, error: checkError } = await this.supabase
      .from("training_sessions")
      .select("status, completed_at")
      .eq("id", sessionId)
      .single();

    if (checkError) {
      throw new Error(`Failed to check session status: ${checkError.message}`);
    }

    if (existingSession?.status === "completed") {
      throw new Error("Session is already completed");
    }

    const { data, error } = await this.supabase
      .from("training_sessions")
      .update({
        status: "completed",
        final_feedback: finalFeedback,
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update session completion: ${error.message}`);
    }

    return data;
  }
}
