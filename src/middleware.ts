import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOWED = new Set(["beach", "golf", "rv", "car", "bike", "music", "art", "fair"]);

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  // host can be "beach.localhost:3000" or "beach.example.com"
  const sub = host.split(".")[0].split(":")[0];
  const tenant = ALLOWED.has(sub) ? sub : "beach"; // default
  const res = NextResponse.next();
  res.headers.set("x-tenant", tenant);
  return res;
}

// run middleware on all pages (default). If you want to exclude /_next/static etc., you can add a matcher.
