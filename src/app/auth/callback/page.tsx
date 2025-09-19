"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const supa = getSupabaseBrowser();

    async function run() {
      const next = params.get("next") || "/wallet";
      const { data, error } = await supa.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        console.error("Auth error:", error);
        router.replace("/signin?error=" + encodeURIComponent(error.message));
      } else {
        router.replace(next);
      }
    }

    run();
  }, [params, router]);

  return (
    <main className="flex h-screen items-center justify-center">
      <p className="text-slate-600">Finishing sign-in…</p>
    </main>
  );
}
