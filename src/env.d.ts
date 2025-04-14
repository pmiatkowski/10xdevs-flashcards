/// <reference types="astro/client" />

import type { SupabaseClient, User, Session } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";

interface LocalsWithAuth {
  supabase: SupabaseClient<Database>;
  session: Session | null;
  user: User | null;
}

declare global {
  namespace App {
    type Locals = LocalsWithAuth;
  }
}

// declare module "astro" {
//   interface Astro {
//     // Add any additional properties or methods you want to expose
//     locals: LocalsWithAuth;
//   }
// }

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly OPENROUTER_MODEL: string;
  readonly OPENROUTER_HTTP_REFERER?: string;
  readonly OPENROUTER_APP_TITLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
