// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/wallet";

  // If Supabase didn’t give us a code, bounce back to signin
  if (!code) {
    const to = new URL(`/signin?error=missing_code`, url.origin);
    return NextResponse.redirect(to);
  }

  const supabase = getSupabaseServer();

  // Exchange the auth code for a session and set cookies on this domain
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const to = new URL(`/signin?error=${encodeURIComponent(error.message)}`, url.origin);
    return NextResponse.redirect(to);
  }

  // Success: redirect where the app asked us to go
  const dest = new URL(next, url.origin);
  return NextResponse.redirect(dest);
}
