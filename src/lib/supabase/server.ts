// src/lib/supabase/server.ts
import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function getSupabaseServer() {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url) throw new Error("SUPABASE: NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!anon) throw new Error("SUPABASE: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");

  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN; // e.g. ".beachlifeapp.com"

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        const c = cookieStore.get(name);
        return c?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value,
          ...options,
          ...(cookieDomain ? { domain: cookieDomain } : {}),
        });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value: "",
          ...options,
          ...(cookieDomain ? { domain: cookieDomain } : {}),
          maxAge: 0,
        });
      },
    },
  });
}
