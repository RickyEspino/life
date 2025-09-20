// src/app/wallet/page.tsx
export const runtime = 'nodejs';

import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';

type WalletRow = { id: string };
type BreakdownRow = { tenant_id: string; balance: number; tenants: { name: string; slug: string } };
type TxnRow = {
  created_at: string;
  event_type: string;
  delta: number;
  reason: string | null;
  tenants: { name: string; slug: string } | null;
};

export default async function WalletPage() {
  const supa = getSupabaseServer();

  // 1) Require auth
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect('/signin?next=/wallet');

  // 2) Ensure the user has a wallet (onboarding should create it, but we’ll be defensive)
  const { data: wallet, error: wErr } = await supa
    .from('wallets')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle<WalletRow>();

  if (wErr) {
    return <main className="p-6 text-red-600">Wallet lookup error: {wErr.message}</main>;
  }

  let walletId = wallet?.id;

  if (!walletId) {
    // create one if missing (requires RLS insert policy)
    const { data: created, error: insErr } = await supa
      .from('wallets')
      .insert({ user_id: user.id } as never) // cast keeps TS happy without generated types
      .select('id')
      .single<WalletRow>();
    if (insErr) {
      return <main className="p-6 text-red-600">Could not create wallet: {insErr.message}</main>;
    }
    walletId = created.id;
  }

  // 3) Unified total balance (via view with RLS)
  let total = 0;
  {
    const { data, error } = await supa
      .from('wallet_balance_total')
      .select('balance')
      .eq('wallet_id', walletId)
      .maybeSingle<{ balance: number }>();
    if (error) {
      return <main className="p-6 text-red-600">Balance error: {error.message}</main>;
    }
    total = data?.balance ?? 0;
  }

  // 4) By-tenant breakdown (informational)
  let breakdown: Array<{ slug: string; name: string; balance: number }> = [];
  {
    const { data, error } = await supa
      .from('wallet_balance_by_tenant')
      .select('tenant_id,balance,tenants!inner(name,slug)')
      .eq('wallet_id', walletId);
    if (error) {
      return <main className="p-6 text-red-600">Breakdown error: {error.message}</main>;
    }
    const rows = (data ?? []) as unknown as BreakdownRow[];
    breakdown = rows
      .map((r) => ({ slug: r.tenants.slug, name: r.tenants.name, balance: r.balance }))
      .sort((a, b) => a.slug.localeCompare(b.slug));
  }

  // 5) Recent activity across all tenants
  let txns: TxnRow[] = [];
  {
    const { data, error } = await supa
      .from('points_ledger')
      .select('created_at,event_type,delta,reason,tenants(name,slug)')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) {
      return <main className="p-6 text-red-600">Ledger error: {error.message}</main>;
    }
    txns = (data ?? []) as unknown as TxnRow[];
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Your Wallet</h1>

      <div className="mt-4 rounded-xl border p-4 bg-white shadow-sm">
        <div className="text-sm text-slate-500">Unified Balance</div>
        <div className="text-3xl font-bold">{total}</div>
      </div>

      <h2 className="mt-8 text-lg font-semibold">By Lifestyle (info)</h2>
      <ul className="mt-3 divide-y rounded-xl border bg-white">
        {breakdown.length ? (
          breakdown.map((r) => (
            <li key={r.slug} className="p-3 flex items-center justify-between">
              <div className="text-sm">{r.name}</div>
              <div className="text-base font-semibold">{r.balance}</div>
            </li>
          ))
        ) : (
          <li className="p-3 text-sm text-slate-500">No transactions yet.</li>
        )}
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Recent activity (all lifestyles)</h2>
      <ul className="mt-3 divide-y rounded-xl border bg-white">
        {txns.length ? (
          txns.map((r, i) => (
            <li key={i} className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm capitalize">
                  {r.event_type.replace('_', ' ')} — {r.tenants?.name ?? 'Unknown'}
                </div>
                {r.reason && <div className="text-xs text-slate-500">{r.reason}</div>}
                <div className="text-xs text-slate-400">
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
              <div className={`text-base font-semibold ${r.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {r.delta > 0 ? `+${r.delta}` : r.delta}
              </div>
            </li>
          ))
        ) : (
          <li className="p-3 text-sm text-slate-500">No transactions yet.</li>
        )}
      </ul>
    </main>
  );
}
