"use client";

import { useEffect, useState } from "react";

export default function ClaimPage() {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("Processing…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

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

        // Simple confetti without deps
        // @ts-ignore
        const C = (n=80)=>{for(let i=0;i<n;i++){const s=document.createElement('div');s.textContent='🎉';s.style.position='fixed';s.style.left=Math.random()*100+'vw';s.style.top='-2rem';s.style.fontSize=(12+Math.random()*24)+'px';s.style.transition='transform 1.2s ease-out, opacity 1.2s';document.body.appendChild(s);requestAnimationFrame(()=>{s.style.transform=`translateY(${100+Math.random()*60}vh) rotate(${Math.random()*720-360}deg)`;s.style.opacity='0';});setTimeout(()=>s.remove(),1400);}};

        C(120);

        // After a moment, send them to wallet
        setTimeout(() => (window.location.href = "/wallet"), 1800);
      } catch (e) {
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
