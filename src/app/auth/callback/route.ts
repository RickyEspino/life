import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

function toAbs(url: URL, next: string) {
  // Accept absolute or relative next; normalize to absolute URL
  try {
    return new URL(next, url.origin).toString();
  } catch {
    return url.origin; // very unlikely, but safe fallback
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const supabase = createRouteHandlerClient({ cookies });

  // 1) Exchange the code+state for a Supabase session cookie on this domain
  await supabase.auth.exchangeCodeForSession(url);

  // If an explicit `next` was provided, always respect it
  const next = url.searchParams.get("next");
  if (next) {
    return NextResponse.redirect(toAbs(url, next));
  }

  // 2) Otherwise try to route returning users straight to their lifestyle
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  // Root domain for subdomain redirects (no protocol). Defaults to beachlifeapp.com.
  const ROOT =
    (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "beachlifeapp.com").replace(/^https?:\/\//, "");

  if (user) {
    // Read their chosen lifestyle (primary tenant)
    // RLS must allow: SELECT user_profiles where user_id=auth.uid()
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("primary_tenant_id")
      .eq("user_id", user.id)
      .maybeSingle<{ primary_tenant_id: string | null }>();

    if (profile?.primary_tenant_id) {
      // Look up the tenant slug
      const { data: tenant } = await supabase
        .from("tenants")
        .select("slug")
        .eq("id", profile.primary_tenant_id)
        .maybeSingle<{ slug: string }>();

      if (tenant?.slug) {
        // Send straight to the user dashboard on the correct subdomain
        const dest = `https://${tenant.slug}.${ROOT}/wallet`;
        return NextResponse.redirect(dest);
      }
    }
  }

  // 3) New users (or no profile yet) go to onboarding
  return NextResponse.redirect(new URL("/onboarding", url.origin));
}
