/// <reference types="astro/client" />

import type { SupabaseClient, User, Session } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      session: Session | null;
      user: User | null;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly OPENROUTER_MODEL: string;
  readonly OPENROUTER_HTTP_REFERER?: string;
  readonly OPENROUTER_APP_TITLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
