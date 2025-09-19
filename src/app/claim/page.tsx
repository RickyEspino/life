// src/app/claim/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function ClaimPage() {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("Processing…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    function confetti(n = 120) {
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
        // async start to allow transition
        requestAnimationFrame(() => {
          el.style.transform = `translateY(${100 + Math.random() * 60}vh) rotate(${Math.random() * 720 - 360}deg)`;
          el.style.opacity = "0";
        });
        setTimeout(() => el.remove(), 1400);
      }
      document.body.appendChild(frag);
    }

    async function redeem() {
      if (!code) {
        setState("err");
        setMsg("Missing code.");
        return;
      }
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
        confetti(140);
        setTimeout(() => {
          window.location.href = "/wallet";
        }, 1800);
      } catch {
        setState("err");
        setMsg("Network error.");
      }
    }

    redeem();
  }, []);

  return (
    <main className="mx-auto max-w-md p-8 text-center space-y-4">
      <h1 className="text-2xl font-semibold">
        {state === "ok" ? "Success!" : state === "err" ? "Whoops…" : "Claiming…"}
      </h1>
      <p className="text-slate-600">{msg}</p>
    </main>
  );
}
