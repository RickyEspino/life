// src/lib/supabase/server.ts
import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/** Minimal shape we need from Next's cookie store */
type CookieRecord = { name: string; value: string };
type CookieStore = {
  get(name: string): CookieRecord | undefined;
  set(input: CookieRecord & CookieOptions): void;
};

function isPromise<T>(val: unknown): val is Promise<T> {
  // Narrow without using `any`
  const maybe = val as { then?: unknown } | null;
  return typeof val === "object" && val !== null && typeof maybe?.then === "function";
}

/** Get a CookieStore whether Next returns it directly or as a Promise in Next 15 */
async function getCookieStore(): Promise<CookieStore> {
  const maybe = cookies() as unknown;
  if (isPromise<CookieStore>(maybe)) return await maybe;
  return maybe as CookieStore;
}

export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url) throw new Error("SUPABASE: NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!anon) throw new Error("SUPABASE: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");

  return createServerClient(url, anon, {
    cookies: {
      async get(name: string) {
        const store = await getCookieStore();
        const c = store.get(name);
        return c?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        const store = await getCookieStore();
        store.set({ name, value, ...options });
      },
      async remove(name: string, options: CookieOptions) {
        const store = await getCookieStore();
        store.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });
}
