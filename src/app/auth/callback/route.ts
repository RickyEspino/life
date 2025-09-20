// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { getSupabaseServer } from '@/lib/supabase/server';

function toAbs(base: URL, next: string) {
  try {
    return new URL(next, base).toString();
  } catch {
    return base.toString();
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const supabase = getSupabaseServer();

  // 1) Exchange code+state for session cookie (sets cookie via our server client)
  const { error } = await supabase.auth.exchangeCodeForSession(url.toString());
  if (error) {
    // On failure, go back to signin with the error
    const signin = new URL('/signin', url.origin);
    signin.searchParams.set('error', error.message);
    return NextResponse.redirect(signin);
  }

  // 2) Decide where to send the user next
  const next = url.searchParams.get('next');

  // If they already finished onboarding, go to wallet; else go to onboarding
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/signin', url.origin));
  }

  // Peek user profile to see if they picked a primary tenant
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('primary_tenant_id')
    .eq('user_id', user.id)
    .maybeSingle<{ primary_tenant_id: string | null }>();

  const dest = next
    ? toAbs(new URL(url.origin), next)
    : profile?.primary_tenant_id
      ? new URL('/wallet', url.origin).toString()
      : new URL('/onboarding', url.origin).toString();

  return NextResponse.redirect(dest);
}
