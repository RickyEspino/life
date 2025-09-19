// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/wallet";

  if (!code) {
    const to = new URL(`/signin?error=missing_code`, url.origin);
    return NextResponse.redirect(to);
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const to = new URL(`/signin?error=${encodeURIComponent(error.message)}`, url.origin);
    return NextResponse.redirect(to);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
