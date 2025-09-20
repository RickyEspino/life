"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Single, allowed callback origin (e.g., https://beachlifeapp.com)
  const AUTH_BASE = useMemo(() => {
    const v = process.env.NEXT_PUBLIC_AUTH_BASE;
    if (!v) console.warn("NEXT_PUBLIC_AUTH_BASE is not set");
    return (v || window.location.origin).replace(/\/$/, "");
  }, []);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);

    try {
      const supa = getSupabaseBrowser();

      // Default new users to onboarding; if ?next= is present, respect it
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/onboarding";

      // Always send the email link to our single callback host
      const redirectTo = `${AUTH_BASE}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error } = await supa.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setErr(error.message);
      } else {
        setMsg("Check your email for a sign-in link. It expires shortly.");
      }
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
      {err && (
        <p className="mt-4 text-sm text-red-600">
          {err}
          <br />
          <span className="text-xs text-slate-500">
            If this mentions redirect URL, add{" "}
            <code>{AUTH_BASE}/auth/callback*</code> to Supabase → Auth → Redirect URLs.
          </span>
        </p>
      )}

      <p className="mt-8 text-xs text-slate-500">
        Debug: AUTH_BASE = <code>{AUTH_BASE || "(not set)"}</code>
      </p>

      <p className="mt-4 text-sm text-slate-500">
        By continuing you agree to our <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </main>
  );
}
