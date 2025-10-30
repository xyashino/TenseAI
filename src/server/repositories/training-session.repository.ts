import type { SupabaseClient } from "@/db/supabase.client";
import type {
  Question,
  QuestionInsert,
  Round,
  RoundInsert,
  SessionStatus,
  TrainingSession,
  TrainingSessionInsert,
  TrainingSessionWithRounds,
} from "@/types";

export class TrainingSessionRepository {
  constructor(private supabase: SupabaseClient) {}

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
        user_id,
        tense,
        difficulty,
        status,
        started_at,
        completed_at,
        created_at,
        final_feedback,
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
}
