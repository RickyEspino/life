// src/lib/supabase/browser.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url) throw new Error("SUPABASE: NEXT_PUBLIC_SUPABASE_URL is missing");
  if (!anon) throw new Error("SUPABASE: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");

  // IMPORTANT: scope cookies to parent domain so session is shared across subdomains
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN; // e.g. ".beachlifeapp.com"

  return createBrowserClient(url, anon, {
    cookieOptions: cookieDomain ? { domain: cookieDomain } : undefined,
  });
}
