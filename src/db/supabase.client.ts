import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type { SupabaseClient };

export const cookieOptions: CookieOptions = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
} as const;

interface CreateServerOptions {
  headers: Headers;
  cookies: AstroCookies;
}

export function createSupabaseServerInstance(context: CreateServerOptions) {
  return createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookies: {
      get(name: string) {
        const cookie = context.cookies.get(name);
        return cookie?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        context.cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        context.cookies.delete(name, options);
      },
    },
  });
}
