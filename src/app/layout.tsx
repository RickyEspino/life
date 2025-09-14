// src/app/layout.tsx
export async function generateMetadata(): Promise<Metadata> {
  const h = headers();
  const host = h.get("host") ?? "beach.localhost:3000";
  const tenant = h.get("x-tenant") ?? "beach";
  const meta = getTenantMeta(tenant);

  const protocol = host.includes("localhost") ? "http" : "https";

  return {
    title: meta.title,
    description: meta.desc,
    metadataBase: new URL(`${protocol}://${host}`),
    alternates: { canonical: "/" },
  };
}
