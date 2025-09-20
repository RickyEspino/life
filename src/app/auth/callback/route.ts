// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

function toAbs(url: URL, next: string) {
  try {
    // If `next` is absolute already, just use it
    // eslint-disable-next-line no-new
    new URL(next);
    return next;
  } catch {
    return new URL(next, url.origin).toString();
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const supabase = getSupabaseServer();

  // 1) Exchange the code+state for a Supabase session cookie
  await supabase.auth.exchangeCodeForSession(url.toString());

  // 2) If an explicit `next` was provided, respect it; else send to onboarding
  const next = url.searchParams.get("next") || "/onboarding";
  const dest = toAbs(url, next);

  return NextResponse.redirect(dest);
}
