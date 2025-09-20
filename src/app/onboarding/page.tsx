// src/app/onboarding/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useRouter, useSearchParams } from "next/navigation";

type Tenant = { id: string; name: string; slug: string };

type UserProfilesRow = {
  user_id: string;
  primary_tenant_id: string | null;
};

type WalletRow = { id: string; user_id: string };

export default function OnboardingPage() {
  const supa = useMemo(getSupabaseBrowser, []);
  const router = useRouter();
  const qp = useSearchParams();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  // Load tenants for the picker
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr(null);

      // Ensure user is authed
      const { data: auth } = await supa.auth.getUser();
      if (!auth.user) {
        router.replace("/signin?next=/onboarding");
        return;
      }

      // Fetch list of tenants
      const { data, error } = await supa
        .from("tenants")
        .select("id,name,slug")
        .order("slug", { ascending: true })
        .returns<Tenant[]>();

      if (!mounted) return;

      if (error) {
        setErr(error.message);
      } else {
        setTenants(data ?? []);
      }
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [router, supa]);

  async function handlePick(tenantId: string) {
    setSaving(true);
    setErr(null);

    // Verify auth again to be safe
    const { data: auth } = await supa.auth.getUser();
    const user = auth.user;
    if (!user) {
      setSaving(false);
      router.replace("/signin?next=/onboarding");
      return;
    }

    // 1) upsert user_profiles (primary tenant)
    const upsertPayload: UserProfilesRow = {
      user_id: user.id,
      primary_tenant_id: tenantId,
    };

    const { error: upErr } = await supa
      .from("user_profiles")
      .upsert([upsertPayload], { onConflict: "user_id" })
      .select()
      .single();

    if (upErr) {
      setSaving(false);
      setErr(upErr.message);
      return;
    }

    // 2) ensure a wallet exists for this user (create if missing)
    const { data: walletRow, error: wReadErr } = await supa
      .from("wallets")
      .select("id,user_id")
      .eq("user_id", user.id)
      .maybeSingle<WalletRow>();

    if (wReadErr) {
      setSaving(false);
      setErr(wReadErr.message);
      return;
    }

    if (!walletRow) {
      const { error: wInsErr } = await supa
        .from("wallets")
        .insert([{ user_id: user.id }])
        .select("id")
        .single();
      if (wInsErr) {
        setSaving(false);
        setErr(wInsErr.message);
        return;
      }
    }

    // 3) optional: add to user_tenants (membership)
    const { error: utErr } = await supa
      .from("user_tenants")
      .insert([{ user_id: user.id, tenant_id: tenantId }], { defaultToNull: true });

    // Ignore duplicate membership errors; only block on other errors
    if (utErr && !/duplicate|unique/i.test(utErr.message)) {
      setSaving(false);
      setErr(utErr.message);
      return;
    }

    // Done → go where they intended, or to wallet
    const next = qp.get("next") || "/wallet";
    router.replace(next);
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Choose your lifestyle</h1>
      <p className="mt-2 text-slate-600">
        Pick the lifestyle you want to start with. You can switch later — your points are unified.
      </p>

      {loading ? (
        <div className="mt-6 text-sm text-slate-500">Loading…</div>
      ) : tenants.length === 0 ? (
        <div className="mt-6 text-sm text-slate-500">No lifestyles available.</div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tenants.map((t) => (
            <li key={t.id}>
              <button
                disabled={saving}
                onClick={() => handlePick(t.id)}
                className="w-full rounded-xl border bg-white p-4 text-left hover:shadow disabled:opacity-50"
              >
                <div className="text-lg font-medium">{t.name}</div>
                <div className="text-xs text-slate-500">/{t.slug}</div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}
    </main>
  );
}
