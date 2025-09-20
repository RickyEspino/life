// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

function nextUrlOr(defaultPath: string, url: URL) {
  const n = url.searchParams.get('next');
  if (!n) return defaultPath;
  try {
    // relative-only safety
    const u = new URL(n, url.origin);
    if (u.origin !== url.origin) return defaultPath;
    return u.pathname + u.search + u.hash;
  } catch {
    return defaultPath;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const supabase = getSupabaseServer();

  // 1) Create session cookie on this domain from the code in the URL
  // (email magic links & OAuth both land here)
  const { error: exchErr } = await supabase.auth.exchangeCodeForSession(request.url);
  if (exchErr) {
    // If exchange fails, send back to signin with a message
    const back = new URL('/signin', url.origin);
    back.searchParams.set('error', exchErr.message);
    return NextResponse.redirect(back);
  }

  // 2) Determine where to go next
  // If user has a profile with a primary_tenant_id, go to /wallet
  // else go to /onboarding
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/signin', url.origin));
  }

  const { data: prof } = await supabase
    .from('user_profiles')
    .select('primary_tenant_id')
    .eq('user_id', user.id)
    .maybeSingle<{ primary_tenant_id: string | null }>();

  const defaultDest = prof?.primary_tenant_id ? '/wallet' : '/onboarding';
  const dest = nextUrlOr(defaultDest, url);

  return NextResponse.redirect(new URL(dest, url.origin));
}
