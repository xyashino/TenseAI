/// <reference types="astro/client" />

import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      session: Session | null;
      user: User | null;
      profile: Profile | null;
    }
  }
}

interface ImportMetaEnv {
  readonly OPENROUTER_API_KEY: string;
  readonly PUBLIC_SITE_URL: string;
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
