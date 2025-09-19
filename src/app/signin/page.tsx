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

      // Where the magic link should land after the user clicks it.
      // Keep it on the same tenant subdomain; fallback to root if needed.
      const redirectTo =
        typeof window !== "undefined"
          ? new URL("/wallet", window.location.origin).toString()
          : undefined;

      const { error } = await supa.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        setErr(error.message);
      } else {
        setMsg("Check your email for a sign-in link. It expires shortly.");
      }
    } catch (e) {
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

        {/* Optional: add OAuth later */}
        {/* <button type="button" onClick={() => signInWithProvider('google')} className="w-full rounded-md border py-2"> */}
        {/*   Continue with Google */}
        {/* </button> */}
      </form>

      {msg && <p className="mt-4 text-sm text-green-700">{msg}</p>}
      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

      <p className="mt-8 text-sm text-slate-500">
        By continuing you agree to our&nbsp;
        <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </main>
  );
}
