// src/lib/supabase/server.ts
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url) throw new Error('SUPABASE: NEXT_PUBLIC_SUPABASE_URL is missing');
  if (!anon) throw new Error('SUPABASE: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');

  return createServerClient(url, anon, {
    cookies: {
      get: async (name: string) => {
        const store = await cookies();
        return store.get(name)?.value;
      },
      set: async (name: string, value: string, options: CookieOptions) => {
        const store = await cookies();
        store.set({ name, value, ...options });
      },
      remove: async (name: string, options: CookieOptions) => {
        const store = await cookies();
        store.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });
}
