"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState("Completing sign-in…");

  useEffect(() => {
    const supa = getSupabaseBrowser();

    async function run() {
      try {
        // Accept either code in query (?code=...) or tokens in hash (#access_token=...)
        const { error } = await supa.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          console.error("Auth callback error:", error);
          setStatus("Sign-in failed: " + error.message);
          // bounce back to /signin after a moment
          setTimeout(() => router.replace("/signin"), 1800);
          return;
        }

        const next = params.get("next") || "/wallet";
        router.replace(next);
      } catch (e: unknown) {
        console.error("Auth callback unexpected error:", e);
        setStatus("Something went wrong finishing the sign-in.");
        setTimeout(() => router.replace("/signin"), 1800);
      }
    }

    run();
  }, [params, router]);

  return (
    <main className="flex h-screen items-center justify-center">
      <p className="text-slate-600">{status}</p>
    </main>
  );
}
