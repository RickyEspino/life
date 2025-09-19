// src/app/onboarding/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

type Tenant = { id: string; slug: string; name: string };

export default async function OnboardingPage() {
  const supa = admin();
  // In v1, you’re still using DEMO_USER_ID; when you switch to real auth,
  // replace this with the logged-in user id from Supabase JWT/cookies.
  const userId = process.env.DEMO_USER_ID!;

  const { data: tenants } = await supa
    .from("tenants")
    .select("id, slug, name")
    .order("slug");

  async function setPrimaryTenant(formData: FormData) {
    "use server";
    const supa = admin();
    const tenantId = String(formData.get("tenant_id") || "");

    // upsert profile
    await supa
      .from("user_profiles")
      .upsert({ user_id: userId, primary_tenant_id: tenantId }, { onConflict: "user_id" });

    // fetch slug and redirect to that tenant’s subdomain
    const { data: t } = await supa
      .from("tenants")
      .select("slug")
      .eq("id", tenantId)
      .maybeSingle<{ slug: string }>();

    const slug = t?.slug || "beach";
    // Redirect to tenant app (server action redirect)
    return { redirect: `https://${slug}.beachlifeapp.com/wallet` };
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Choose your primary lifestyle</h1>
      <p className="text-slate-600">You can earn and spend in any lifestyle—this just sets your default home.</p>

      <form action={setPrimaryTenant} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(tenants ?? []).map((t) => (
          <button
            key={t.id}
            name="tenant_id"
            value={t.id}
            className="rounded-xl border bg-white p-4 text-left hover:shadow"
          >
            <div className="text-lg font-medium">{t.name}</div>
            <div className="text-xs text-slate-500">{t.slug}.beachlifeapp.com</div>
          </button>
        ))}
      </form>
    </main>
  );
}
