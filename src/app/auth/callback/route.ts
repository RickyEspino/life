import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/onboarding";

  const supabase = createRouteHandlerClient({ cookies });

  // This exchanges the code in the URL and sets Supabase session cookies
  await supabase.auth.exchangeCodeForSession(url);

  // After session, go to the intended page (defaults to onboarding)
  return NextResponse.redirect(new URL(next, url.origin));
}
