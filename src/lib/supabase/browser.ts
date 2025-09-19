// src/lib/supabase/browser.ts
"use client";

import { createClient } from "@supabase/supabase-js";

let _client:
  | ReturnType<typeof createClient<Database>>
  | null = null;

// If you have generated types, replace `any` with your `Database` type.
type Database = any;

export function getSupabaseBrowser() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  _client = createClient<Database>(url, anon, {
    auth: {
      persistSession: true, // store session in localStorage (client-side)
      autoRefreshToken: true,
    },
  });
  return _client;
}
