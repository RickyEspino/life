// src/app/wallet/page.tsx
export const runtime = 'nodejs';

import { getTenantSlug } from "@/lib/tenant";
import { createAdminClient } from "@/lib/supabase/admin";

type Wallet = { id: string };
type Tenant = { id: string; name: string; slug: string };

export default async function WalletPage() {
  const tenantSlug = await getTenantSlug();         // branding only
  const admin = createAdminClient();

  // demo wallet (no auth)
  const demoUserId = process.env.DEMO_USER_ID!;

  // (1) get wallet id
  const { data: wallet, error: wErr } = await admin
    .from("wallets")
    .select("id")
    .eq("user_id", demoUserId)
    .maybeSingle<Wallet>();
  if (wErr) return <main className="p-6 text-red-600">Wallet lookup error: {wErr.message}</main>;
  if (!wallet) return <main className="p-6">No wallet found for demo user {demoUserId}.</main>;

  // (2) unified balance (no tenant filter)
  const { data: totalRow, error: bErr } = await admin
    .from("wallet_balance_total")
    .select("balance")
    .eq("wallet_id", wallet.id)
    .maybeSingle<{ balance: number }>();
  if (bErr) return <main className="p-6 text-red-600">Balance error: {bErr.message}</main>;
  const total = totalRow?.balance ?? 0;

  // (3) optional: breakdown by tenant (purely informational)
  const { data: breakdownRows, error: brErr } = await admin
    .from("wallet_balance_by_tenant")
    .select("tenant_id, balance, tenants!inner(name,slug)")
    .eq("wallet_id", wallet.id);
  if (brErr) return <main className="p-6 text-red-600">Breakdown error: {brErr.message}</main>;
  const breakdown =
    (breakdownRows ?? [])
      .map((r: any) => ({ slug: r.tenants.slug as string, name: r.tenants.name as string, balance: r.balance as number }))
      .sort((a, b) => a.slug.localeCompare(b.slug));

  // (4) recent activity (across all tenants)
  const { data: txns, error: lErr } = await admin
    .from("points_ledger")
    .select("created_at, event_type, delta, reason, tenants(name,slug)")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .limit(10);
  if (lErr) return <main className="p-6 text-red-600">Ledger error: {lErr.message}</main>;

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Your Wallet — {tenantSlug.toUpperCase()}</h1>

      <div className="mt-4 rounded-xl border p-4 bg-white shadow-sm">
        <div className="text-sm text-slate-500">Unified Balance</div>
        <div className="text-3xl font-bold">{total}</div>
        <p className="mt-3 text-xs text-slate-400">
          Demo user <code>{demoUserId}</code>. Points are shared across all lifestyles.
        </p>
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
        {(txns ?? []).length ? (
          (txns ?? []).map((r: any, i: number) => (
            <li key={i} className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm capitalize">
                  {r.event_type.replace("_", " ")} — {r.tenants?.name ?? "Unknown"}
                </div>
                {r.reason && <div className="text-xs text-slate-500">{r.reason}</div>}
                <div className="text-xs text-slate-400">
                  {new Date(r.created_at as string).toLocaleString()}
                </div>
              </div>
              <div className={`text-base font-semibold ${r.delta >= 0 ? "text-green-600" : "text-red-600"}`}>
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
