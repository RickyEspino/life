// src/app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function AuthCallbackPage() {
  const [msg, setMsg] = useState("Completing sign-in…");

  useEffect(() => {
    async function run() {
      try {
        const supa = getSupabaseBrowser();

        // Supabase sends either a code (?code=...) or a hash (#access_token=...)
        // exchangeCodeForSession() handles both.
        const { error } = await supa.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          setMsg("Sign-in failed. " + error.message);
          return;
        }

        // honor ?next=... if present, else /wallet
        const url = new URL(window.location.href);
        const next = url.searchParams.get("next") || "/wallet";
        window.location.replace(next);
      } catch (e) {
        setMsg("Something went wrong finishing the sign-in.");
      }
    }
    run();
  }, []);

  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-semibold">Just a sec…</h1>
      <p className="mt-2 text-slate-600">{msg}</p>
    </main>
  );
}
