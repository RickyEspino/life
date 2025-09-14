"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * BeachLife 5-Tab App UI Mockup (React + Tailwind)
 * v4.1: Minor a11y/ESLint refinements (button type, aria-current, modal roles).
 */

type Route = "now" | "map" | "reels" | "community" | "me";
const ROUTES: Route[] = ["now", "map", "reels", "community", "me"];

function readHash(): Route {
  if (typeof window === "undefined") return "now";
  const raw = (window.location.hash || "#/now").replace("#/", "");
  return (ROUTES.includes(raw as Route) ? (raw as Route) : "now");
}

export default function BeachLifeAppMock() {
  // Router
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

  // Theme
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

  // Demo QR modal
  const [qrOpen, setQrOpen] = useState(false);

  // Demo progress
  const points = 375;
  const nextMilestone = 500;
  const pct = Math.min(100, Math.round((points / nextMilestone) * 100));

  // Progress math
  const size = 120;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = useMemo(() => (pct / 100) * c, [pct, c]);

  // Me sub-tabs
  const [meTab, setMeTab] = useState<"profile" | "wallet" | "activity">("profile");

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-dvh w-full bg-gradient-to-b from-[#FDECC8] via-white to-[#E6F7F5] text-slate-800 flex flex-col dark:from-[#0B1220] dark:via-[#0E1626] dark:to-[#0B1220] dark:text-slate-100">
        {/* Content (no header) */}
        <main className="mx-auto w-full max-w-screen-sm flex-1 px-4 pb-28 pt-4">
          {activeTab === "now" && <NowTab openQR={() => setQrOpen(true)} />}
          {activeTab === "map" && <MapTab />}
          {activeTab === "reels" && (
            <ReelsTab>
              <ReelCard />
            </ReelsTab>
          )}
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

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-white/60 bg-white/80 backdrop-blur dark:bg-slate-900/70 dark:border-white/10">
          <div className="mx-auto max-w-screen-sm grid grid-cols-5 text-xs">
            <NavItem label="Now" active={activeTab === "now"} onClick={() => navigate("now")}>
              <FlameIcon className="w-6 h-6" />
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

        {/* QR Modal */}
        {qrOpen && <QrModal onClose={() => setQrOpen(false)} />}
      </div>
    </div>
  );
}

/* ---- Simplified helpers (safe placeholders) ---- */

function NowTab({ openQR }: { openQR: () => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:bg-slate-900 dark:border-white/10">
      NowTab content (dummy){" "}
      <button type="button" onClick={openQR} className="ml-2 rounded-full bg-[#FF6A5A] px-3 py-1.5 text-white text-sm">
        Open QR
      </button>
    </div>
  );
}

function MapTab() {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 dark:bg-slate-900 dark:border-white/10">MapTab (dummy)</div>;
}

function ReelsTab({ children }: { children?: React.ReactNode }) {
  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:bg-slate-900 dark:border-white/10">ReelsTab</div>
      {children}
    </div>
  );
}

function CommunityTab() {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 dark:bg-slate-900 dark:border-white/10">CommunityTab (dummy)</div>;
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
    <div className="grid gap-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:bg-slate-900 dark:border-white/10">
        <div className="mb-2 text-sm text-slate-600 dark:text-slate-300">
          {points} / {nextMilestone} BP • {pct}% to next level
        </div>
        {/* progress ring (visual placeholder) */}
        <svg width={progressRing.size} height={progressRing.size} className="rotate-[-90deg]">
          <circle
            cx={progressRing.size / 2}
            cy={progressRing.size / 2}
            r={progressRing.r}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={progressRing.stroke}
            fill="none"
          />
          <circle
            cx={progressRing.size / 2}
            cy={progressRing.size / 2}
            r={progressRing.r}
            stroke="#FF6A5A"
            strokeWidth={progressRing.stroke}
            strokeLinecap="round"
            strokeDasharray={progressRing.c}
            strokeDashoffset={Math.max(progressRing.c - progressRing.dash, 0)}
            fill="none"
          />
        </svg>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:bg-slate-900 dark:border-white/10">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setMeTab("profile")}
            className={`rounded-lg px-3 py-1.5 text-sm ${meTab === "profile" ? "bg-[#F6F0FF] text-[#7C6FC5]" : "bg-slate-100 dark:bg-white/10"}`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setMeTab("wallet")}
            className={`rounded-lg px-3 py-1.5 text-sm ${meTab === "wallet" ? "bg-[#F6F0FF] text-[#7C6FC5]" : "bg-slate-100 dark:bg-white/10"}`}
          >
            Wallet
          </button>
          <button
            type="button"
            onClick={() => setMeTab("activity")}
            className={`rounded-lg px-3 py-1.5 text-sm ${meTab === "activity" ? "bg-[#F6F0FF] text-[#7C6FC5]" : "bg-slate-100 dark:bg白/10"}`}
          >
            Activity
          </button>
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-300">
          MeTab (dummy with <RoleCard title="Owner Console" desc="Manage" />)
        </div>
      </div>
    </div>
  );
}

/* ---- Missing Components (simple placeholders) ---- */
function ReelCard() {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 dark:bg-slate-900 dark:border-white/10">ReelCard placeholder</div>;
}

function RoleCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="inline-block rounded-xl border border-slate-200 bg-white px-3 py-2 text-left dark:bg-slate-900 dark:border-white/10">
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
    </div>
  );
}

/* ---- Basics ---- */
function NavItem({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-3 ${
        active ? "text-[#FF6A5A]" : "text-slate-500 dark:text-slate-400"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <div className={`transition ${active ? "scale-110" : "scale-100"}`}>{children}</div>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

function QrModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 grid place-items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-title"
    >
      <div className="bg-white p-4 rounded-xl dark:bg-slate-900 dark:text-slate-100">
        <h3 id="qr-title" className="font-semibold mb-2">
          QR Modal
        </h3>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">QR Modal Placeholder</p>
        <button type="button" onClick={onClose} className="rounded-md bg-[#FF6A5A] px-3 py-1.5 text-white text-sm">
          Close
        </button>
      </div>
    </div>
  );
}

/* ---- Icons (emoji placeholders for speed) ---- */
function FlameIcon({ className = "" }: { className?: string }) {
  return <span className={className} role="img" aria-label="flame">🔥</span>;
}
function MapIcon({ className = "" }: { className?: string }) {
  return <span className={className} role="img" aria-label="map">🗺️</span>;
}
function ReelsIcon({ className = "" }: { className?: string }) {
  return <span className={className} role="img" aria-label="reels">🎬</span>;
}
function CommunityIcon({ className = "" }: { className?: string }) {
  return <span className={className} role="img" aria-label="community">💬</span>;
}
function UserIcon({ className = "" }: { className?: string }) {
  return <span className={className} role="img" aria-label="user">👤</span>;
}
