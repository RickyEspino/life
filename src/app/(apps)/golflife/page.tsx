"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from "react";

/**
 * GolfLife 5-Tab App UI Mockup (React + Tailwind)
 * Core Pages: ⛳ Now, 🗺 Map, 🎥 Reels, 🏌️ Community, 👤 Me
 * - Immediate snapshot of what’s happening on the course
 * - Full-screen interactive map with pins for tee boxes, holes, and pro shop
 * - GolfReels for short videos and highlights
 * - Community hub for golfers
 * - Personal dashboard with wallet, points, and roles
 * Tailwind: ensure darkMode: 'class'.
 */

type Route = "now" | "map" | "reels" | "community" | "me";
const ROUTES: Route[] = ["now", "map", "reels", "community", "me"];

function readHash(): Route {
  if (typeof window === "undefined") return "now";
  const raw = (window.location.hash || "#/now").replace("#/", "");
  return (ROUTES.includes(raw as Route) ? (raw as Route) : "now");
}

export default function GolfLifeAppMock() {
  const [activeTab, setActiveTab] = useState<Route>(readHash());
  useEffect(() => {
    const onHash = () => setActiveTab(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = (r: Route) => {
    if (readHash() !== r) location.hash = `#/${r}`;
    else setActiveTab(r);
  };

  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved) setDark(saved === "dark");
    else setDark(window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", dark ? "dark" : "light");
    }
  }, [dark]);

  const points = 880;
  const nextMilestone = 1000;
  const pct = Math.min(100, Math.round((points / nextMilestone) * 100));
  const size = 120, stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = useMemo(() => (pct / 100) * c, [pct, c]);

  const [meTab, setMeTab] = useState<"profile" | "wallet" | "activity">("profile");

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-dvh w-full bg-gradient-to-b from-green-100 via-white to-green-50 text-slate-800 flex flex-col dark:from-[#0B2E1C] dark:via-[#0C3B24] dark:to-[#0B2E1C] dark:text-slate-100">
        <main className="mx-auto w-full max-w-screen-sm flex-1 px-4 pb-28 pt-4">
          {activeTab === "now" && <NowTab navigate={navigate} dark={dark} setDark={setDark} />}
          {activeTab === "map" && <MapTab />}
          {activeTab === "reels" && <ReelsTab />}
          {activeTab === "community" && <CommunityTab />}
          {activeTab === "me" && (
            <MeTab
              meTab={meTab}
              setMeTab={setMeTab}
              points={points}
              nextMilestone={nextMilestone}
              pct={pct}
              progressRing={{ size, stroke, r, c, dash }}
            />
          )}
        </main>

        <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-green-200 bg-white/80 backdrop-blur dark:bg-slate-900/70 dark:border-white/10">
          <div className="mx-auto max-w-screen-sm grid grid-cols-5 text-xs">
            <NavItem label="Now" active={activeTab === "now"} onClick={() => navigate("now")}>
              <GolfIcon className="w-6 h-6" />
            </NavItem>
            <NavItem label="Map" active={activeTab === "map"} onClick={() => navigate("map")}>
              <MapIcon className="w-6 h-6" />
            </NavItem>
            <NavItem label="Reels" active={activeTab === "reels"} onClick={() => navigate("reels")}>
              <ReelsIcon className="w-6 h-6" />
            </NavItem>
            <NavItem label="Community" active={activeTab === "community"} onClick={() => navigate("community")}>
              <CommunityIcon className="w-6 h-6" />
            </NavItem>
            <NavItem label="Me" active={activeTab === "me"} onClick={() => navigate("me")}>
              <UserIcon className="w-6 h-6" />
            </NavItem>
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ================= Tabs ================= */

function NowTab({
  navigate,
  dark,
  setDark,
}: {
  navigate: (r: Route) => void;
  dark: boolean;
  setDark: (v: boolean) => void;
}) {
  const items = [
    { title: "⛳ Tee Time in 15 min", sub: "Hole 1 • Sunrise Course" },
    { title: "🍹 19th Hole Happy Hour", sub: "Clubhouse Bar • 5–7pm" },
    { title: "🏌️ Long Drive Contest", sub: "Range • 3pm" },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % items.length), 4000);
    return () => clearInterval(t);
  }, [items.length]);
  const cur = items[i];
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-r from-green-600 via-green-500 to-green-400 shadow-soft">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/15 rounded-full blur-2xl" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{cur.title}</h2>
            <p className="text-white/90">{cur.sub}</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => alert("⛳ Booking flow (demo)")}
                className="rounded-full bg-white/90 text-green-700 text-sm px-4 py-2 font-semibold hover:bg-white"
              >
                Book Now
              </button>
              <a
                href="#/map"
                className="rounded-full border border-white/70 text-white text-sm px-4 py-2 font-semibold hover:bg-white/10"
              >
                See Map
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="p-2 rounded-full bg-white/90 text-green-800 hover:bg-white"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <ThemeIcon className="w-5 h-5" dark={dark} />
          </button>
        </div>
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {items.map((_, idx) => (
            <span key={idx} className={`h-1.5 w-3 rounded-full ${idx === i ? "bg-white" : "bg-white/50"}`} />
          ))}
        </div>
      </div>

      <Section title="On the Course Now">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LiveCard
            badge="Friends"
            title="Alex & Jamie teeing off"
            sub="Hole 5 • 200yds away"
            ctaLabel="Join"
          />
          <LiveCard
            badge="Bonus"
            title="Earn 100 BP for hitting the range"
            sub="Practice Range • Today"
            ctaLabel="Check in"
          />
        </div>
      </Section>

      <Section title="Trending at the Club">
        <ImageScroll
          cards={[
            { img: "https://images.unsplash.com/photo-1508255139162-e1f7b5c8c1c6?q=80&w=1200&auto=format&fit=crop", title: "Pro Shop Deals", meta: "20% off golf balls" },
            { img: "https://images.unsplash.com/photo-1505842465776-3b4953ca4f79?q=80&w=1200&auto=format&fit=crop", title: "Golf Cart Rentals", meta: "Half price twilight" },
            { img: "https://images.unsplash.com/photo-1504271863819-df91df9a69a0?q=80&w=1200&auto=format&fit=crop", title: "Clubhouse Dinner", meta: "Live jazz Friday" },
          ]}
        />
      </Section>
    </div>
  );
}

function MapTab() {
  return (
    <div className="relative h-[70dvh] rounded-2xl overflow-hidden shadow-soft">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-green-200/30 to-green-500/40" />
      <div className="absolute left-12 top-16 animate-bounce">
        <Pin color="#7C6FC5" label="Hole 1" />
      </div>
      <div className="absolute right-16 top-24 animate-[bounce_1.2s_infinite]">
        <Pin color="#2EC4B6" label="Clubhouse" />
      </div>
      <div className="absolute left-1/3 bottom-16 animate-[bounce_1.1s_infinite]">
        <Pin color="#FF6A5A" label="Pro Shop" />
      </div>
    </div>
  );
}

function ReelsTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 bg-white/80 border border-slate-100 shadow-soft dark:bg-slate-900/60 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">GolfReels</h3>
          <button type="button" className="px-3 py-1.5 rounded-full bg-green-600 text-white text-sm font-semibold">
            Upload Reel
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">Clips from golfers on the course.</p>
      </div>

      <ReelCard user="@GolfProSam" caption="🏌️ Perfect swing this morning!" stats={{ waves: 88, shells: 14, suns: 10, fires: 6 }} img="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop" />
      <ReelCard user="@ClubLife" caption="Sunset over the 18th hole 🌅" stats={{ waves: 130, shells: 47, suns: 30, fires: 15 }} img="https://images.unsplash.com/photo-1505842078234-1c1d22b20f0b?q=80&w=1200&auto=format&fit=crop" />
    </div>
  );
}

function CommunityTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 bg-white/80 border border-slate-100 shadow-soft dark:bg-slate-900/60 dark:border-white/10">
        <h3 className="font-semibold">Clubhouse Chat</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Join leagues, share tips, and discuss all things golf.</p>
      </div>

      <Section title="Popular Groups">
        <HorizontalChips items={["Weekend League", "Golf Travel", "Gear Talk", "19th Hole Stories"]} />
      </Section>

      <PostCard
        user="@FairwayFan"
        title="Best irons for mid-handicap?"
        body="Looking for recommendations — what’s working for you guys?"
        reactions={{ wave: 20, shell: 5, sun: 8, fish: 1 }}
        comments={12}
        tag="Gear"
      />
      <PostCard
        user="@GreensGuru"
        title="Anyone up for sunrise round?"
        body="Thinking 6:30 tee-off tomorrow. DM me if interested."
        reactions={{ wave: 33, shell: 11, sun: 22, fish: 4 }}
        comments={6}
        tag="Meetup"
      />
      <PollCard question="Pick next week’s club tournament day" options={["Sat", "Sun", "Mon"]} />
    </div>
  );
}

function MeTab({
  meTab,
  setMeTab,
  points,
  nextMilestone,
  pct,
  progressRing,
}: {
  meTab: "profile" | "wallet" | "activity";
  setMeTab: (t: "profile" | "wallet" | "activity") => void;
  points: number;
  nextMilestone: number;
  pct: number;
  progressRing: { size: number; stroke: number; r: number; c: number; dash: number };
}) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white p-5 shadow-soft">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/15 rounded-full blur-2xl" />
        <div className="flex items-center gap-4">
          <Avatar name="Ricky" />
          <div className="flex-1">
            <p className="text-white/80 text-sm">Welcome back</p>
            <h3 className="text-xl font-semibold">Ricky Espino</h3>
            <p className="text-white/90">Level 4 • Fairway Pro</p>
          </div>
          <div className="relative">
            <svg width={progressRing.size} height={progressRing.size} className="rotate-[-90deg]">
              <circle cx={progressRing.size / 2} cy={progressRing.size / 2} r={progressRing.r} stroke="rgba(255,255,255,0.25)" strokeWidth={progressRing.stroke} fill="none" />
              <circle cx={progressRing.size / 2} cy={progressRing.size / 2} r={progressRing.r} stroke="#ffffff" strokeWidth={progressRing.stroke} strokeLinecap="round" strokeDasharray={progressRing.c} strokeDashoffset={Math.max(progressRing.c - progressRing.dash, 0)} fill="none" />
            </svg>
            <div className="absolute inset-0 grid place-items-center rotate-0">
              <span className="text-center text-sm font-semibold leading-4">
                {pct}%
                <br />
                <span className="text-[10px] font-normal">to L5</span>
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm text-white/90">
          {points} / {nextMilestone} BP to next level
        </div>
      </div>

      <div className="rounded-2xl bg-white/80 border border-slate-100 shadow-soft dark:bg-s
