// src/app/onboarding/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

type TenantRow = { id: string; name: string; slug: string };

export default function OnboardingPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [choice, setChoice] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supa = getSupabaseBrowser();
      const { data, error } = await supa
        .from('tenants')
        .select('id,name,slug')
        .order('slug', { ascending: true });
      if (error) setErr(error.message);
      else setTenants(data ?? []);
    })();
  }, []);

  async function saveChoice() {
    setBusy(true);
    setErr(null);
    try {
      const supa = getSupabaseBrowser();
      const { data: u } = await supa.auth.getUser();
      const user = u?.user;
      if (!user) {
        router.replace('/signin?next=/onboarding');
        return;
      }

      // upsert the profile
      const { error: upErr } = await supa
        .from('user_profiles')
        .upsert(
          { user_id: user.id, primary_tenant_id: choice },
          { onConflict: 'user_id' }
        );
      if (upErr) {
        setErr(upErr.message);
        return;
      }

      // (Optional) create a wallet now if one doesn’t exist
      await supa.rpc('ensure_wallet_for_user', { p_user_id: user.id }).catch(() => {});

      router.replace('/wallet');
    } catch (e: any) {
      setErr(e?.message ?? 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Pick your lifestyle</h1>
      <p className="mt-2 text-slate-600">Choose the lifestyle to personalize your experience.</p>

      <div className="mt-6 grid gap-3">
        {tenants.map((t) => (
          <label key={t.id} className="flex items-center gap-3 rounded-lg border p-3">
            <input
              type="radio"
              name="tenant"
              value={t.id}
              checked={choice === t.id}
              onChange={() => setChoice(t.id)}
            />
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-slate-500">{t.slug}</div>
            </div>
          </label>
        ))}
      </div>

      <button
        className="mt-6 w-full rounded-md bg-black text-white py-2 font-medium disabled:opacity-50"
        disabled={!choice || busy}
        onClick={saveChoice}
      >
        {busy ? 'Saving…' : 'Continue'}
      </button>

      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
    </main>
  );
}
