import { headers } from "next/headers";

export async function getTenantSlug(): Promise<string> {
  const h = await headers();                      // 👈 await it
  return h.get("x-tenant") ?? "beach";
}

export function getTenantMeta(slug: string) {
  switch (slug) {
    case "golf": return { title: "GolfLife — LifeStyle Network", desc: "Courses, pro shops, and rewards." };
    case "rv":   return { title: "RvLife — LifeStyle Network",   desc: "Campgrounds, gear, and road rewards." };
    default:     return { title: "BeachLife — LifeStyle Network", desc: "Events, vendors, and beach rewards." };
  }
}

export function getTenantTheme(slug: string): Record<`--${string}`, string> {
  const themes: Record<string, Record<`--${string}`, string>> = {
    beach: { "--brand": "#2EC4B6", "--accent": "#FF6A5A" },
    golf:  { "--brand": "#1f7a1f", "--accent": "#c0d860" },
    rv:    { "--brand": "#5A8DFF", "--accent": "#2EC46F" },
  };
  return themes[slug] ?? themes.beach;
}
