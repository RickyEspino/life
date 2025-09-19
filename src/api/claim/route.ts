// src/app/api/claim/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// server-only admin client
function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

type Payload = { code: string };

export async function POST(req: Request) {
  const { code } = (await req.json()) as Payload;

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  // TODO: replace with the signed-in user id when auth is added
  const userId = process.env.DEMO_USER_ID!;
  if (!userId) {
    return NextResponse.json({ error: "Server missing DEMO_USER_ID" }, { status: 500 });
  }

  const supa = admin();

  // 1) Fetch token
  const { data: token, error: tErr } = await supa
    .from("earn_tokens")
    .select("code, points, expires_at, claimed_at, merchant_id")
    .eq("code", code)
    .maybeSingle<{
      code: string;
      points: number;
      expires_at: string;
      claimed_at: string | null;
      merchant_id: string | null;
    }>();

  if (tErr || !token) {
    return NextResponse.json({ error: "Invalid or unknown code." }, { status: 404 });
  }
  if (token.claimed_at) {
    return NextResponse.json({ error: "This code was already claimed." }, { status: 409 });
  }
  if (new Date(token.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This code has expired." }, { status: 410 });
  }

  // 2) Ensure wallet exists (create if missing)
  const { data: wallet } = await supa
    .from("wallets")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle<{ id: string }>();

  let walletId = wallet?.id;
  if (!walletId) {
    const { data: w2, error: wErr } = await supa
      .from("wallets")
      .insert({ user_id: userId })
      .select("id")
      .maybeSingle<{ id: string }>();
    if (wErr || !w2) {
      return NextResponse.json({ error: "Failed to create wallet." }, { status: 500 });
    }
    walletId = w2.id;
  }

  // Optional: pull merchant + tenant to attribute in ledger
  let tenantId: string | null = null;
  let merchantName: string | null = null;

  if (token.merchant_id) {
    const { data: m } = await supa
      .from("merchants")
      .select("name, tenant_id")
      .eq("id", token.merchant_id)
      .maybeSingle<{ name: string; tenant_id: string | null }>();
    merchantName = m?.name ?? null;
    tenantId = m?.tenant_id ?? null;
  }

  // 3) Mark token claimed + write ledger atomically (best via RPC/transaction—simple 2-step here)
  // 3a) mark claimed
  {
    const { error } = await supa
      .from("earn_tokens")
      .update({ claimed_at: new Date().toISOString(), claimed_by_user_id: userId })
      .eq("code", code)
      .is("claimed_at", null);
    if (error) {
      return NextResponse.json({ error: "Could not mark token claimed." }, { status: 500 });
    }
  }

  // 3b) write ledger row
  {
    const { error } = await supa.from("points_ledger").insert({
      wallet_id: walletId,
      delta: token.points,
      event_type: "merchant_award",
      reason: merchantName ? `Award from ${merchantName}` : "Award from merchant",
      tenant_id: tenantId,            // nullable if you’re not attributing yet
      merchant_id: token.merchant_id, // nullable fine
    });
    if (error) {
      return NextResponse.json({ error: "Could not write ledger." }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    points: token.points,
    merchantName,
  });
}
