import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const TENANTS = new Set(["beach","golf","rv","car","bike","music","art","fair"]);

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const sub = host.split(".")[0].split(":")[0];
  const tenant = TENANTS.has(sub) ? sub : "beach";
  const res = NextResponse.next();
  res.headers.set("x-tenant", tenant);
  return res;
}
