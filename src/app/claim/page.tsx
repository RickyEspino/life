// src/app/claim/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function ClaimPage() {
  const [state, setState] = useState<"checking" | "redeeming" | "ok" | "err">("checking");
  const [msg, setMsg] = useState("Checking sign-in…");

  useEffect(() => {
    const supa = getSupabaseBrowser();
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const nextSelf = url.pathname + url.search; // e.g. /claim?code=...

    async function ensureSignedIn() {
      // 1) Require a code in the URL
      if (!code) {
        setState("err");
        setMsg("Missing code.");
        return false;
      }

      // 2) Check session
      const { data } = await supa.auth.getSession();
      if (!data.session) {
        // Not signed in → go to signin with return path
        const signinUrl = new URL("/signin", window.location.origin);
        signinUrl.searchParams.set("next", nextSelf);
        window.location.replace(signinUrl.toString());
        return false; // stop flow; browser navigates away
      }
      return true;
    }

    function confetti(n = 140) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const el = document.createElement("div");
        el.textContent = "🎉";
        el.style.position = "fixed";
        el.style.left = Math.random() * 100 + "vw";
        el.style.top = "-2rem";
        el.style.fontSize = 12 + Math.random() * 24 + "px";
        el.style.transition = "transform 1.2s ease-out, opacity 1.2s";
        frag.appendChild(el);
        requestAnimationFrame(() => {
          el.style.transform = `translateY(${100 + Math.random() * 60}vh) rotate(${Math.random() * 720 - 360}deg)`;
          el.style.opacity = "0";
        });
        setTimeout(() => el.remove(), 1400);
      }
      document.body.appendChild(frag);
    }

    async function redeem() {
      setState("redeeming");
      setMsg("Processing…");

      try {
        const r = await fetch("/api/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const j = await r.json();
        if (!r.ok) {
          setState("err");
          setMsg(j?.error ?? "Redemption failed.");
          return;
        }
        setState("ok");
        setMsg(`+${j.points} points${j.merchantName ? ` from ${j.merchantName}` : ""}!`);
        confetti(150);
        setTimeout(() => {
          window.location.href = "/wallet";
        }, 1800);
      } catch {
        setState("err");
        setMsg("Network error.");
      }
    }

    (async () => {
      const proceed = await ensureSignedIn();
      if (proceed) await redeem();
    })();
  }, []);

  const title =
    state === "ok" ? "Success!" : state === "err" ? "Whoops…" : state === "checking" ? "Just a sec…" : "Claiming…";

  return (
    <main className="mx-auto max-w-md p-8 text-center space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-slate-600">{msg}</p>
    </main>
  );
}
