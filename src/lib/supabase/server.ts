// src/lib/supabase/server.ts
import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url) throw new Error('SUPABASE: NEXT_PUBLIC_SUPABASE_URL is missing');
if (!anon) throw new Error('SUPABASE: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');

export function getSupabaseServer() {
  return createServerClient(url, anon, {
    cookies: {
      // Next 15: `cookies()` is async in RSC/route contexts.
      async get(name: string) {
        const store = await nextCookies();
        return store.get(name)?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        const store = await nextCookies();
        store.set({ name, value, ...options });
      },
      async remove(name: string, options: CookieOptions) {
        const store = await nextCookies();
        // Supabase’s helper expects remove; emulate via a set with maxAge=0
        store.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });
}
