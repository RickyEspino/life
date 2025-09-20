// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const TENANTS = new Set([
  "beach",
  "golf",
  "rv",
  "car",
  "bike",
  "music",
  "art",
  "fair",
]);

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const sub = host.split(".")[0].split(":")[0];
  const tenant = TENANTS.has(sub) ? sub : "beach";

  const res = NextResponse.next();
  res.headers.set("x-tenant", tenant);

  // --- Auth-aware routing ---
  const pathname = req.nextUrl.pathname;

  // If user has an active Supabase session cookie, prevent access to /signin
  const hasSession = req.cookies.getAll().some((c) =>
    c.name.startsWith("sb-")
  );

  if (pathname === "/signin" && hasSession) {
    const url = new URL("/wallet", req.url);
    return NextResponse.redirect(url);
  }

  // Otherwise just continue
  return res;
}

export const config = {
  // Apply middleware on all routes (including signin)
  matcher: ["/:path*"],
};
