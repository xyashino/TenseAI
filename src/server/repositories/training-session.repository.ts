import type { SupabaseClient } from "@/db/supabase.client";
import type {
  CompletedRoundDTO,
  Question,
  QuestionInsert,
  Round,
  RoundInsert,
  SessionStatus,
  TrainingSession,
  TrainingSessionInsert,
  TrainingSessionWithRounds,
  UserAnswerInsert,
} from "@/types";

// Type for the nested query result from getSessionWithDetails
// Note: user_answer is a One-to-One relationship (UNIQUE constraint on question_id)
interface SessionWithDetailsRaw {
  id: string;
  tense: string;
  difficulty: string;
  status: string;
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
      options: unknown; // Json type from Supabase
      correct_answer: string;
      user_answer: {
        selected_answer: string;
        is_correct: boolean;
        answered_at: string;
      } | null;
    }[];
  }[];
}

export class TrainingSessionRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get a single session by ID with authorization check
   * @param userId - User ID for authorization check
   * @param sessionId - Session ID to retrieve
   * @returns Session data or null if not found
   * @throws Error if database query fails
   */
  async getSessionById(userId: string, sessionId: string): Promise<TrainingSession | null> {
    const { data, error } = await this.supabase
      .from("training_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (error) {
      // PGRST116 is Supabase's "no rows returned" error code
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch session: ${error.message}`);
    }

    return data as TrainingSession;
  }

  /**
   * Get all rounds for a session
   * @param sessionId - Session ID to get rounds for
   * @returns Array of rounds sorted by round_number
   * @throws Error if database query fails
   */
  async getRoundsBySessionId(
    sessionId: string
  ): Promise<{ id: string; round_number: number; completed_at: string | null }[]> {
    const { data, error } = await this.supabase
      .from("rounds")
      .select("id, round_number, completed_at")
      .eq("session_id", sessionId)
      .order("round_number", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch rounds: ${error.message}`);
    }

    return data || [];
  }

  async createSession(data: TrainingSessionInsert): Promise<TrainingSession> {
    const { data: session, error } = await this.supabase
      .from("training_sessions")
      .insert(data)
      .select("id, user_id, tense, difficulty, status, started_at, created_at")
      .single();

    if (error || !session) {
      throw new Error(`Failed to create session: ${error?.message}`);
    }

    return session as TrainingSession;
  }

  async createRound(data: RoundInsert): Promise<Round> {
    const { data: round, error } = await this.supabase
      .from("rounds")
      .insert(data)
      .select("id, session_id, round_number, started_at")
      .single();

    if (error || !round) {
      throw new Error(`Failed to create round: ${error?.message}`);
    }

    return round as Round;
  }

  async createQuestions(questions: QuestionInsert[]): Promise<Question[]> {
    const { data: insertedQuestions, error } = await this.supabase
      .from("questions")
      .insert(questions)
      .select("id, question_number, question_text, options");

    if (error || !insertedQuestions) {
      throw new Error(`Failed to insert questions: ${error?.message}`);
    }

    return insertedQuestions as Question[];
  }

  async deleteRound(roundId: string): Promise<void> {
    const { error } = await this.supabase.from("rounds").delete().eq("id", roundId);

    if (error) {
      console.error("Failed to delete round during rollback:", error);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await this.supabase.from("training_sessions").delete().eq("id", sessionId);

    if (error) {
      console.error("Failed to delete session during rollback:", error);
    }
  }

  /**
   * Delete a training session with authorization check
   * @param userId - User ID for authorization check
   * @param sessionId - Session ID to delete
   * @returns True if session was deleted, false if not found or doesn't belong to user
   * @throws Error if database query fails
   */
  async deleteSessionWithAuth(userId: string, sessionId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("training_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId)
      .select("id")
      .single();

    if (error) {
      // PGRST116 is Supabase's "no rows returned" error code
      if (error.code === "PGRST116") {
        return false;
      }
      throw new Error(`Failed to delete session: ${error.message}`);
    }

    return !!data;
  }

  async getSessionsWithRounds(
    userId: string,
    status: SessionStatus,
    page: number,
    limit: number,
    sortOrder: "started_at_desc" | "started_at_asc"
  ): Promise<{ sessions: TrainingSessionWithRounds[]; total: number }> {
    const offset = (page - 1) * limit;
    const ascending = sortOrder === "started_at_asc";

    const { data: sessionsData, error: sessionsError } = await this.supabase
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
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .eq("status", status)
      .order("started_at", { ascending })
      .range(offset, offset + limit - 1);

    if (sessionsError) {
      throw new Error(`Failed to fetch sessions: ${sessionsError.message}`);
    }

    const { count, error: countError } = await this.supabase
      .from("training_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", status);

    if (countError) {
      throw new Error(`Failed to count sessions: ${countError.message}`);
    }

    return {
      sessions: sessionsData,
      total: count || 0,
    };
  }

  /**
   * Get a single training session with all its details including rounds, questions, and user answers
   * @param userId - User ID for authorization check
   * @param sessionId - Session ID to retrieve
   * @returns Session with nested rounds, questions, and answers, or null if not found
   * @throws Error if database query fails
   */
  async getSessionWithDetails(userId: string, sessionId: string): Promise<SessionWithDetailsRaw | null> {
    const { data, error } = await this.supabase
      .from("training_sessions")
      .select(
        `
        id,
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
            user_answer:user_answers (
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
      // PGRST116 is Supabase's "no rows returned" error code
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch session details: ${error.message}`);
    }

    return data as SessionWithDetailsRaw;
  }

  /**
   * Get round with its parent session for authorization check
   * @param roundId - Round ID to fetch
   * @returns Round with session data or null if not found
   * @throws Error if database query fails
   */
  async getRoundWithSession(roundId: string): Promise<{
    id: string;
    session_id: string;
    round_number: number;
    score: number | null;
    completed_at: string | null;
    started_at: string;
    session: {
      user_id: string;
      tense: string;
      difficulty: string;
    };
  } | null> {
    const { data, error } = await this.supabase
      .from("rounds")
      .select(
        `
        id,
        session_id,
        round_number,
        score,
        completed_at,
        started_at,
        training_sessions!inner (
          user_id,
          tense,
          difficulty
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
    return {
      id: data.id,
      session_id: data.session_id,
      round_number: data.round_number,
      score: data.score,
      completed_at: data.completed_at,
      started_at: data.started_at,
      session: {
        user_id: data.training_sessions.user_id,
        tense: data.training_sessions.tense,
        difficulty: data.training_sessions.difficulty,
      },
    };
  }

  /**
   * Get all questions for a round including correct answers
   * @param roundId - Round ID to fetch questions for
   * @returns Array of questions with correct answers
   * @throws Error if database query fails
   */
  async getQuestionsWithAnswers(roundId: string) {
    const { data, error } = await this.supabase
      .from("questions")
      .select("id, question_number, question_text, options, correct_answer")
      .eq("round_id", roundId)
      .order("question_number", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    return (data || []).map((q) => ({
      id: q.id,
      question_number: q.question_number,
      question_text: q.question_text,
      options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
      correct_answer: q.correct_answer,
    }));
  }

  /**
   * Insert multiple user answers in a single transaction
   * @param answers - Array of user answers to insert
   * @throws Error if database operation fails
   */
  async createUserAnswers(answers: UserAnswerInsert[]): Promise<void> {
    const { error } = await this.supabase.from("user_answers").insert(answers);

    if (error) {
      throw new Error(`Failed to insert user answers: ${error.message}`);
    }
  }

  /**
   * Update round with score, feedback, and completion timestamp
   * @param roundId - Round ID to update
   * @param score - Calculated score (0-10)
   * @param feedback - AI-generated feedback
   * @returns Updated round data
   * @throws Error if database operation fails
   */
  async updateRoundCompletion(roundId: string, score: number, feedback: string): Promise<CompletedRoundDTO> {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("rounds")
      .update({
        score,
        round_feedback: feedback,
        completed_at: now,
        updated_at: now,
      })
      .eq("id", roundId)
      .select("id, round_number, score, round_feedback, started_at, completed_at")
      .single();

    if (error || !data) {
      throw new Error(`Failed to update round: ${error?.message}`);
    }

    return data as CompletedRoundDTO;
  }
}
