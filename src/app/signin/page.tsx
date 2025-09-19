// src/app/signin/page.tsx
"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);

    try {
      const supa = getSupabaseBrowser();

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/wallet";
      const redirectTo = new URL(next, window.location.origin).toString();

      const { error } = await supa.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (error) setErr(error.message);
      else setMsg("Check your email for a sign-in link. It expires shortly.");
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-slate-600">
        Use your email to receive a secure, one-time sign-in link.
      </p>

      <form onSubmit={handleMagicLink} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm text-slate-600">Email</span>
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="mt-1 w-full rounded-md border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
          />
        </label>

        <button
          type="submit"
          disabled={busy || !email}
          className="w-full rounded-md bg-black text-white py-2 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Sending link…" : "Send magic link"}
        </button>
      </form>

      {msg && <p className="mt-4 text-sm text-green-700">{msg}</p>}
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

      <p className="mt-8 text-sm text-slate-500">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </main>
  );
}
