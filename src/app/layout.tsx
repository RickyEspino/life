// src/app/layout.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { getTenantSlug, getTenantMeta, getTenantTheme } from "@/lib/tenant";

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

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = getTenantSlug();
  const themeVars = getTenantTheme(tenant) as CSSVars;

  return (
    <html lang="en" data-tenant={tenant}>
      <body style={themeVars} className="antialiased min-h-dvh">
        {children}
      </body>
    </html>
  );
}
