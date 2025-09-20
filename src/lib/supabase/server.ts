// src/lib/supabase/server.ts
import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Server-side Supabase client that works with Next 15 where cookies() may be async.
 * No call-site changes needed.
 */
export function getSupabaseServer() {
  // May be ReadonlyRequestCookies or Promise<ReadonlyRequestCookies> in Next 15+
  const cookieStoreMaybePromise = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url) throw new Error("SUPABASE: NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!anon) throw new Error("SUPABASE: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");

  return createServerClient(url, anon, {
    cookies: {
      async get(name: string) {
        const store = (await cookieStoreMaybePromise) as any;
        const c = store?.get?.(name);
        return c?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        const store = (await cookieStoreMaybePromise) as any;
        // Next 15 requires writing through the cookie store
        store?.set?.({ name, value, ...options });
      },
      async remove(name: string, options: CookieOptions) {
        const store = (await cookieStoreMaybePromise) as any;
        store?.set?.({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });
}
