// src/app/page.tsx
import { getTenantSlug } from "@/lib/tenant";

export default async function HomePage() {
  const tenant = await getTenantSlug(); // 👈 await the promise

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">
        Happening Now — {tenant.toUpperCase()}
      </h1>
      <p className="text-slate-600">Tenant resolved by subdomain: {tenant}</p>
    </main>
  );
}
