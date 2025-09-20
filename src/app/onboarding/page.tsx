// src/app/onboarding/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Tenant = { id: string; name: string; slug: string };

export default function OnboardingPage() {
  const supa = useMemo(getSupabaseBrowser, []);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [choice, setChoice] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // root domain for redirect after selection (no protocol)
  const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "beachlifeapp.com").replace(
    /^https?:\/\//,
    ""
  );

  useEffect(() => {
    (async () => {
      const { data, error } = await supa
        .from("tenants")
        .select("id,name,slug")
        .order("slug", { ascending: true })
        .returns<Tenant[]>();

      if (error) setErr(error.message);
      else setTenants(data ?? []);
    })();
  }, [supa]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!choice) return;

    try {
      setBusy(true);
      setErr(null);

      // 1) get current user
      const { data: userRes } = await supa.auth.getUser();
      const user = userRes?.user;
      if (!user) {
        setErr("Your session expired. Please sign in again.");
        setBusy(false);
        return;
      }

      // 2) set primary tenant in user_profiles (array form avoids TS never)
      const { error: upErr } = await supa
        .from("user_profiles")
        .upsert([{ user_id: user.id, primary_tenant_id: choice }], { onConflict: "user_id" });

      if (upErr) {
        setErr(upErr.message);
        setBusy(false);
        return;
      }

      // 3) ensure membership exists (array form; ok if unique index ignores duplicates)
      await supa
        .from("user_tenants")
        .insert([{ user_id: user.id, tenant_id: choice }])
        .select()
        .maybeSingle();

      // 4) find chosen tenant slug for redirect
      const t = tenants.find((x) => x.id === choice);
      const slug = t?.slug || "beach";

      // 5) redirect to chosen subdomain dashboard
      window.location.href = `https://${slug}.${ROOT_DOMAIN}/wallet`;
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Unable to save your selection. Please try again.";
      setErr(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Choose your lifestyle</h1>
      <p className="mt-2 text-slate-600">Pick where you want to start. You can change this later.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div className="rounded-xl border bg-white divide-y">
          {tenants.map((t) => (
            <label key={t.id} className="flex items-center gap-3 p-3 cursor-pointer">
              <input
                type="radio"
                name="tenant"
                value={t.id}
                checked={choice === t.id}
                onChange={() => setChoice(t.id)}
              />
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-slate-500">{t.slug}.beachlifeapp.com</div>
              </div>
            </label>
          ))}
          {tenants.length === 0 && (
            <div className="p-3 text-sm text-slate-500">No lifestyles available yet.</div>
          )}
        </div>

        <button
          type="submit"
          disabled={!choice || busy}
          className="w-full rounded-md bg-black text-white py-2 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Continue"}
        </button>
      </form>

      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
    </main>
  );
}
