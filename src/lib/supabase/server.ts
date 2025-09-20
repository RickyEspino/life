// src/lib/supabase/server.ts
import 'server-only';
import { cookies, headers } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

function getBaseDomain() {
  // Prefer explicit env; fall back to deriving from Host
  const fromEnv = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN?.trim();
  if (fromEnv) return fromEnv; // e.g. ".beachlifeapp.com"

  const h = headers();
  const host = h.get('host') || 'localhost:3000';
  // Try to coerce "golf.beachlifeapp.com" -> ".beachlifeapp.com"
  const parts = host.split(':')[0].split('.');
  if (parts.length >= 2) {
    const apex = parts.slice(-2).join('.'); // beachlifeapp.com
    // Only return a shared domain if it's not localhost
    if (!apex.includes('localhost')) return `.${apex}`;
  }
  return undefined; // no cross-subdomain sharing in dev by default
}

export function getSupabaseServer() {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url) throw new Error('SUPABASE: NEXT_PUBLIC_SUPABASE_URL is missing');
  if (!anon) throw new Error('SUPABASE: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');

  const domain = getBaseDomain();
  const isProd = !!domain && !domain.includes('localhost');
  const baseCookie: Partial<CookieOptions> = {
    // Share across subdomains when we have a parent domain
    ...(domain ? { domain } : {}),
    sameSite: 'lax',
    secure: isProd, // secure=true on https
    path: '/',
  };

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        const c = cookieStore.get(name);
        return c?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...baseCookie, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: '', ...baseCookie, ...options, maxAge: 0 });
      },
    },
  });
}
