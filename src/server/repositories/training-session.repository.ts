import type { SupabaseClient } from "@/db/supabase.client";
import type { TrainingSessionInsert, RoundInsert, QuestionInsert, TrainingSession, Round, Question } from "@/types";

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
}
