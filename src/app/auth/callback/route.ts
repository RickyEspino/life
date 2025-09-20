// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServer } from '@/lib/supabase/server';

function toAbs(url: URL, next: string) {
  try {
    return new URL(next, url.origin).toString();
  } catch {
    return url.origin + '/wallet';
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const supabase = getSupabaseServer();

  // 1) Exchange code & state for session cookies (set-cookie on this host)
  await supabase.auth.exchangeCodeForSession(url.toString());

  // 2) Verify we now have a user
  const { data: { user } } = await supabase.auth.getUser();

  // Optional: set a friendly flag cookie you can read client-side for UX
  const jar = await cookies();
  jar.set({
    name: 'lf_signed_in',
    value: user ? '1' : '0',
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });

  // 3) Where to go next
  const nextParam = url.searchParams.get('next');
  const next = nextParam ? toAbs(url, nextParam) : (user ? '/onboarding' : '/signin');

  return NextResponse.redirect(next);
}
