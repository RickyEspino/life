// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server"; // uses async cookies in Next 15

function toAbs(url: URL, next: string) {
  try {
    return new URL(next, url.origin).toString();
  } catch {
    return url.origin;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const supabase = getSupabaseServer();

  // 1) Exchange the ?code=... for a session cookie on this domain
  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent(error.message)}`, url.origin));
    }
  } else {
    // no code? send to signin
    return NextResponse.redirect(new URL("/signin?error=missing_code", url.origin));
  }

  // 2) Honor explicit ?next=
  const next = url.searchParams.get("next");
  if (next) {
    return NextResponse.redirect(toAbs(url, next));
  }

  // 3) Otherwise, if user has a primary tenant, jump to its subdomain dashboard
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  const ROOT =
    (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "beachlifeapp.com").replace(/^https?:\/\//, "");

  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("primary_tenant_id")
      .eq("user_id", user.id)
      .maybeSingle<{ primary_tenant_id: string | null }>();

    if (profile?.primary_tenant_id) {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("slug")
        .eq("id", profile.primary_tenant_id)
        .maybeSingle<{ slug: string }>();

      if (tenant?.slug) {
        return NextResponse.redirect(`https://${tenant.slug}.${ROOT}/wallet`);
      }
    }
  }

  // 4) New users (or no profile yet) → onboarding
  return NextResponse.redirect(new URL("/onboarding", url.origin));
}
