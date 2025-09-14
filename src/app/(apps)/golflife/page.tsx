"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from "react";

/**
 * GolfLife 5-Tab App UI Mockup (React + Tailwind)
 * Tabs: Now, Map, Reels, Community, Me
 * No header, no scan floater. All helpers included here.
 * Tailwind: set darkMode: 'class'
 */

/* =================== Router =================== */
type Route = "now" | "map" | "reels" | "community" | "me";
const ROUTES: Route[] = ["now", "map", "reels", "community", "me"];
const readHash = (): Route => {
  if (typeof window === "undefined") return "now";
  const raw = (window.location.hash || "#/now").replace("#/", "");
  return (ROUTES.includes(raw as Route) ? (raw as Route) : "now");
};

/* =================== Root App =================== */
export default function GolfLifePage() {
  // Router
  const [activeTab, setActiveTab] = useState<Route>(readHash());
  useEffect(() => {
    const onHash = () => setActiveTab(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = (r: Route) => (readHash() !== r ? (location.hash = `#/${r}`) : setActiveTab(r));

  // Theme
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    setDark(saved ? saved === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Optional QR modal (opened from CTA)
  const [qrOpen, setQrOpen] = useState(false);

  // Me progress demo
  const points = 420,
    nextMilestone = 600;
  const pct = Math.min(100, Math.round((points / nextMilestone) * 100));
  const size = 120,
    stroke = 12;
  const r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  const dash = useMemo(() => (pct / 100) * c, [pct, c]);

  const [meTab, setMeTab] = useState<"profile" | "wallet" | "activity">("profile");

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-dvh w-full bg-gradient-to-b from-[#E6F4EA] via-white to-[#E0F2FE] text-slate-800 flex flex-col dark:from-[#0B1220] dark:via-[#0E1626] dark:to-[#0B1220] dark:text-slate-100">
        {/* Content */}
        <main className="mx-auto w-full max-w-screen-sm flex-1 px-4 pb-28 pt-4">
          {activeTab === "now" && <NowTabGolf openQR={() => setQrOpen(true)} dark={dark} setDark={setDark} />}
          {activeTab === "map" && <MapTabGolf />}
          {activeTab === "reels" && <ReelsTabGolf />}
          {activeTab === "community" && <CommunityTabGolf />}
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
              <FlagIcon className="w-6 h-6" />
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

        {qrOpen && <QrModal onClose={() => setQrOpen(false)} />}
      </div>
    </div>
  );
}

/* =================== Tabs =================== */

/* ---------- NOW (Golf) ---------- */
function NowTabGolf({
  openQR,
  dark,
  setDark,
}: {
  openQR: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
}) {
  const items = [
    { title: "⛳️ Twilight Tee Times in 20 min", sub: "Pine Dunes • 9 holes • Walk-on ok" },
    { title: "🏌️‍♂️ 2-for-1 Range Buckets", sub: "West Range • 4–6pm • +50 GP bonus" },
    { title: "🥃 Nine & Dine", sub: "Clubhouse • Tonight 7pm • 15% off" },
  ];
  return (
    <div className="space-y-4">
      <HeroCarousel
        gradient="from-emerald-500 via-green-500 to-lime-500"
        items={items}
        primaryLabel="Book Now"
        onPrimary={openQR}
        secondaryHref="#/map"
        secondaryLabel="See Map"
        corner={<ThemeButton dark={dark} setDark={setDark} />}
      />

      <Section title="Live Nearby">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LiveCard
            badge="Friends"
            title="Ava & Leo are on Hole 3"
            sub="+25 GP if you join before 5:30"
            ctaLabel="Join"
            onClick={openQR}
          >
            <FriendStack names={["Ava", "Leo", "Mia", "Kai"]} />
          </LiveCard>
          <LiveCard
            badge="Bonus"
            title="Check in @ West Range for +50 GP"
            sub="0.6 mi • Until 6pm"
            ctaLabel="Check in"
            onClick={openQR}
          />
        </div>
      </Section>

      <Section title="Trending Courses & Deals">
        <ImageScroll
          cards={[
            {
              img: "https://images.unsplash.com/photo-1514894780887-121968d00567?q=80&w=1200&auto=format&fit=crop",
              title: "Pine Dunes",
              meta: "Twilight -20% • 2h left",
            },
            {
              img: "https://images.unsplash.com/photo-1518602164578-cd0074062767?q=80&w=1200&auto=format&fit=crop",
              title: "West Practice Range",
              meta: "2-for-1 buckets",
            },
            {
              img: "https://images.unsplash.com/photo-1526746323784-6e8b3c4b1c5a?q=80&w=1200&auto=format&fit=crop",
              title: "Riverbend GC",
              meta: "League night 7pm",
            },
          ]}
        />
      </Section>
    </div>
  );
}

/* ---------- MAP (Golf) ---------- */
function MapTabGolf() {
  return (
    <div className="relative h-[70dvh] rounded-2xl overflow-hidden shadow-soft">
      {/* Map mock */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-white/60 dark:from-slate-900/30 dark:to-slate-900/60" />

      {/* Pins */}
      <div className="absolute left-12 top-16 animate-bounce">
        <Pin color="#22c55e" label="Deal" />
      </div>
      <div className="absolute right-16 top-24 animate-[bounce_1.2s_infinite]">
        <Pin color="#06b6d4" label="Event" />
      </div>
      <div className="absolute left-1/3 bottom-16 animate-[bounce_1.1s_infinite]">
        <Pin color="#f59e0b" label="Range" />
      </div>

      {/* Filter tray */}
      <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur p-4 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-center gap-2">
          {["Tee Times", "Deals", "Range", "Food", "Leagues", "Now"].map((t) => (
            <button
              key={t}
              type="button"
              className="px-3 py-1.5 rounded-full border border-slate-200 text-sm hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- REELS (Golf) ---------- */
function ReelsTabGolf() {
  return (
    <div className="space-y-4">
      <IntroCard title="GolfReels" actionLabel="Upload Reel" actionStyle="bg-emerald-600">
        Short clips from local golfers and courses.
      </IntroCard>
      <ReelCard
        user="@FairwayFinn"
        caption="Stuck it to 4ft on 7 🏌️‍♂️"
        stats={{ waves: 132, shells: 25, suns: 12, fires: 10 }}
        img="https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format&fit=crop"
      />
      <ReelCard
        user="@RangeRanger"
        caption="Ball speed PR! 168 mph 🔥"
        stats={{ waves: 110, shells: 18, suns: 22, fires: 17 }}
        img="https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1200&auto=format&fit=crop"
      />
    </div>
  );
}

/* ---------- COMMUNITY (Golf) ---------- */
function CommunityTabGolf() {
  return (
    <div className="space-y-4">
      <IntroCard title="Community Hub">Find playing partners, compare gear, plan scrambles.</IntroCard>

      <Section title="Popular Groups">
        <HorizontalChips items={["Twilight Crew", "Low-Cap League", "New to Golf", "Gearheads"]} />
      </Section>

      <PostCard
        user="@SpinControl"
        title="Best wedges for tight lies?"
        body="Hardpan city at my course — what grind are you all gaming?"
        reactions={{ wave: 27, shell: 8, sun: 5, fish: 0 }}
        comments={12}
        tag="Gear"
      />
      <PostCard
        user="@ScrambleSquad"
        title="Saturday 2-person scramble"
        body="10am tee, Riverbend GC. Any pair want to join?"
        reactions={{ wave: 34, shell: 12, sun: 9, fish: 1 }}
        comments={7}
        tag="Event"
      />
      <PollCard question="Pick next week’s league night" options={["Tue 6pm", "Wed 6pm", "Thu 6pm"]} />
    </div>
  );
}

/* ---------- ME / Wallet / Activity (shared) ---------- */
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
      {/* Profile header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600/90 via-green-500/90 to-lime-500/90 text-white p-5 shadow-soft">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/15 rounded-full blur-2xl" />
        <div className="flex items-center gap-4">
          <Avatar name="Ricky" />
          <div className="flex-1">
            <p className="text-white/80 text-sm">Welcome back</p>
            <h3 className="text-xl font-semibold">Ricky Espino</h3>
            <p className="text-white/90">Level 4 • Fairway Finder</p>
          </div>
          {/* Progress ring */}
          <div className="relative">
            <svg width={progressRing.size} height={progressRing.size} className="rotate-[-90deg]">
              <circle
                cx={progressRing.size / 2}
                cy={progressRing.size / 2}
                r={progressRing.r}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={progressRing.stroke}
                fill="none"
              />
              <circle
                cx={progressRing.size / 2}
                cy={progressRing.size / 2}
                r={progressRing.r}
                stroke="#FDFCFB"
                strokeWidth={progressRing.stroke}
                strokeLinecap="round"
                strokeDasharray={progressRing.c}
                strokeDashoffset={Math.max(progressRing.c - progressRing.dash, 0)}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center rotate-0">
              <span className="text-center text-sm font-semibold leading-4">
                {pct}%<br />
                <span className="text-[10px] font-normal">to L5</span>
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm text-white/90">
          {points} / {nextMilestone} GP to next level
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="rounded-2xl bg-white/80 border border-slate-100 shadow-soft dark:bg-slate-900/60 dark:border-white/10">
        <div className="flex p-1 gap-1">
          <SubTab label="Profile" active={meTab === "profile"} onClick={() => setMeTab("profile")} />
          <SubTab label="Wallet" active={meTab === "wallet"} onClick={() => setMeTab("wallet")} />
          <SubTab label="Activity" active={meTab === "activity"} onClick={() => setMeTab("activity")} />
        </div>
        <div className="p-4">
          {meTab === "profile" && <ProfilePanel />}
          {meTab === "wallet" && <WalletPanel />}
          {meTab === "activity" && <ActivityPanel />}
        </div>
      </div>

      {/* Roles */}
      <div className="rounded-2xl bg-white/80 border border-slate-100 shadow-soft p-4 dark:bg-slate-900/60 dark:border-white/10">
        <h4 className="font-semibold mb-2">Roles & Dashboards</h4>
        <div className="grid grid-cols-2 gap-2">
          <RoleCard title="Owner Console" desc="Manage offers, view redemptions" />
          <RoleCard title="Staff Console" desc="Scan, issue points, receipts" />
        </div>
      </div>
    </div>
  );
}

/* =================== Reusable Components =================== */

function ThemeButton({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      className="p-2 rounded-full bg-white/90 text-slate-800 hover:bg-white"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <ThemeIcon className="w-5 h-5" dark={dark} />
    </button>
  );
}

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
      className={`flex flex-col items-center justify-center gap-1 py-3 ${
        active ? "text-emerald-600" : "text-slate-500 dark:text-slate-400"
      }`}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
    >
      <div className={`transition ${active ? "scale-110" : "scale-100"}`}>{children}</div>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
      {children}
    </section>
  );
}

function HeroCarousel({
  gradient,
  items,
  primaryLabel,
  onPrimary,
  secondaryHref,
  secondaryLabel,
  corner,
}: {
  gradient: string;
  items: { title: string; sub: string }[];
  primaryLabel: string;
  onPrimary: () => void;
  secondaryHref: string;
  secondaryLabel: string;
  corner?: React.ReactNode;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % items.length), 3500);
    return () => clearInterval(t);
  }, [items.length]);
  const cur = items[i];
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-r ${gradient} shadow-soft`}>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/15 rounded-full blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{cur.title}</h2>
          <p className="text-white/90">{cur.sub}</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onPrimary}
              className="rounded-full bg-white/90 text-slate-800 text-sm px-4 py-2 font-semibold hover:bg-white"
            >
              {primaryLabel}
            </button>
            <a
              href={secondaryHref}
              className="rounded-full border border-white/70 text-white text-sm px-4 py-2 font-semibold hover:bg-white/10"
            >
              {secondaryLabel}
            </a>
          </div>
        </div>
        {corner}
      </div>
      {/* dots */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {items.map((_, idx) => (
          <span key={idx} className={`h-1.5 w-3 rounded-full ${idx === i ? "bg-white" : "bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}

function FriendStack({ names }: { names: string[] }) {
  return (
    <div className="flex -space-x-2">
      {names.slice(0, 4).map((n, idx) => (
        <div
          key={idx}
          className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-slate-900 grid place-items-center bg-gradient-to-br from-emerald-500 to-lime-500 text-white text-[10px] font-bold"
          title={n}
        >
          {n[0]}
        </div>
      ))}
    </div>
  );
}

function LiveCard({
  badge,
  title,
  sub,
  ctaLabel,
  onClick,
  children,
}: {
  badge: string;
  title: string;
  sub?: string;
  ctaLabel: string;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/80 border border-slate-100 shadow-soft p-4 dark:bg-slate-900/60 dark:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-block mb-2 dark:bg-white/10 dark:text-slate-300">
            {badge}
          </div>
          <h4 className="font-semibold leading-snug">{title}</h4>
          {sub && <p className="text-sm text-slate-500 dark:text-slate-400">{sub}</p>}
          {children && <div className="mt-2">{children}</div>}
        </div>
        <button
          type="button"
          onClick={onClick}
          className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-sm font-semibold self-start"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

function ImageScroll({ cards }: { cards: { img: string; title: string; meta?: string }[] }) {
  return (
    <div className="flex gap-3 overflow-auto no-scrollbar snap-x">
      {cards.map((c, i) => (
        <div
          key={i}
          className="snap-start min-w-[220px] rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-soft dark:bg-slate-900/60 dark:border-white/10"
        >
          <div className="aspect-[16/10] relative">
            <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="p-3">
            <div className="font-semibold">{c.title}</div>
            {c.meta && <div className="text-sm text-slate-500 dark:text-slate-400">{c.meta}</div>}
            <div className="mt-2 flex gap-2">
              <a
                href="#/map"
                className="px-3 py-1.5 rounded-full border border-slate-200 text-sm font-semibold dark:border-white/10"
              >
                View
              </a>
              <button
                type="button"
                className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-sm font-semibold"
                onClick={() => alert("Saved to your list (demo)")}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Community UI ---------- */
function HorizontalChips({ items }: { items: string[] }) {
  return (
    <div className="flex gap-2 overflow-auto no-scrollbar">
      {items.map((t) => (
        <button
          key={t}
          type="button"
          className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm hover:bg-slate-50 dark:bg-slate-900/60 dark:border-white/10 dark:hover:bg-white/5"
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function IntroCard({
  title,
  actionLabel,
  actionStyle,
  children,
}: {
  title: string;
  actionLabel?: string;
  actionStyle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-4 bg-white/80 border border-slate-100 shadow-soft dark:bg-slate-900/60 dark:border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        {actionLabel && (
          <button
            type="button"
            className={`px-3 py-1.5 rounded-full text-white text-sm font-semibold ${actionStyle ?? "bg-slate-800"}`}
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children && <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">{children}</p>}
    </div>
  );
}

function PostCard({
  user,
  title,
  body,
  reactions,
  comments,
  tag,
}: {
  user: string;
  title: string;
  body: string;
  reactions: { wave: number; shell: number; sun: number; fish: number };
  comments: number;
  tag: string;
}) {
  return (
    <div className="rounded-2xl bg-white/80 border border-slate-100 shadow-soft p-4 dark:bg-slate-900/60 dark:border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar size={28} name={user.replace("@", "")} />
          <div>
            <div className="text-sm font-semibold">{user}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{tag}</div>
          </div>
        </div>
        <button type="button" className="text-sm text-emerald-600 font-semibold">
          Follow
        </button>
      </div>
      <h4 className="mt-3 font-semibold">{title}</h4>
      <p className="text-sm text-slate-600 mt-1 dark:text-slate-300">{body}</p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span>🌊 {reactions.wave}</span>
          <span>🐚 {reactions.shell}</span>
          <span>☀️ {reactions.sun}</span>
          <span>🐠 {reactions.fish}</span>
        </div>
        <button
          type="button"
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {comments} comments
        </button>
      </div>
    </div>
  );
}

function PollCard({ question, options }: { question: string; options: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="rounded-2xl bg-white/80 border border-slate-100 shadow-soft p-4 dark:bg-slate-900/60 dark:border-white/10">
      <h4 className="font-semibold">{question}</h4>
      <div className="mt-3 grid gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setSelected(o)}
            className={`px-3 py-2 rounded-xl border text-left ${
              selected === o
                ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
                : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-white/5"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Reels UI ---------- */
function ReelCard({
  user,
  caption,
  stats,
  img,
}: {
  user: string;
  caption: string;
  stats: { waves: number; shells: number; suns: number; fires: number };
  img: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-soft bg-white dark:bg-slate-900/60 dark:border-white/10">
      <div className="aspect-[3/4] bg-slate-100 relative">
        <img src={img} alt="reel" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar size={28} name={user.replace("@", "")} />
            <div className="text-sm font-semibold">{user}</div>
          </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <span>🌊 {stats.waves}</span>
            <span>🐚 {stats.shells}</span>
            <span>☀️ {stats.suns}</span>
            <span>🔥 {stats.fires}</span>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-1 dark:text-slate-300">{caption}</p>
      </div>
    </div>
  );
}

/* ---------- Panels for Me tab ---------- */
function ProfilePanel() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Points" value="1,250" hint="Total balance" />
        <StatCard label="Vouchers" value="3" hint="Active" />
        <StatCard label="Streak" value="5" hint="days" />
      </div>
      <div className="rounded-xl border border-slate-100 bg-white p-4 dark:bg-slate-900/60 dark:border-white/10">
        <h5 className="font-semibold">Active Challenges</h5>
        <ul className="mt-2 space-y-2 text-sm">
          <li className="flex items-center justify-between">
            <span>Par 3 birdie hunt</span>
            <span className="text-slate-500 dark:text-slate-400">1/3</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Play 9 holes this week</span>
            <span className="text-slate-500 dark:text-slate-400">0/1</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function WalletPanel() {
  return (
    <div className="space-y-4">
      {/* Balance */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 dark:bg-slate-900/60 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h5 className="font-semibold">GolfPoints</h5>
          <button type="button" className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-sm font-semibold">
            Transfer
          </button>
        </div>
        <div className="mt-3 text-3xl font-bold">1,250 GP</div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Earned this month: 325 • Redeemed: 200</p>
      </div>

      {/* Vouchers */}
      <div className="rounded-2xl bg-white/80 border border-slate-100 shadow-soft p-4 dark:bg-slate-900/60 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h5 className="font-semibold">Vouchers</h5>
          <button type="button" className="text-sm text-emerald-700 font-semibold dark:text-emerald-400">
            View all
          </button>
        </div>
        <div className="mt-3 grid gap-3">
          <VoucherCard brand="Pine Dunes" offer="Twilight 20% off" expires="Sep 30" />
          <VoucherCard brand="West Range" offer="2-for-1 buckets" expires="Oct 15" />
          <VoucherCard brand="Riverbend GC" offer="Free cart w/ 9" expires="Oct 10" disabled />
        </div>
      </div>

      {/* Ledger */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 dark:bg-slate-900/60 dark:border-white/10">
        <h5 className="font-semibold">History</h5>
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-white/10">
          <LedgerItem label="Check-in @ West Range" delta={+50} date="Sep 12" />
          <LedgerItem label="Redeemed: Cart voucher" delta={-90} date="Sep 10" />
          <LedgerItem label="Daily streak bonus" delta={+25} date="Sep 09" />
        </ul>
      </div>
    </div>
  );
}

function ActivityPanel() {
  return (
    <div className="space-y-3">
      <ActivityRow title="Joined Twilight Crew" time="2h ago" icon={<CommunityIcon className="w-5 h-5" />} />
      <ActivityRow title="Posted a gear question" time="5h ago" icon={<ChatIcon className="w-5 h-5" />} />
      <ActivityRow title="Uploaded a Reel" time="1d ago" icon={<ReelsIcon className="w-5 h-5" />} />
      <ActivityRow title="Checked in @ West Range" time="2d ago" icon={<ScanIcon className="w-5 h-5" />} />
    </div>
  );
}

/* ---------- Modal ---------- */
function QrModal({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "scanning" | "success">("idle");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => setStatus("scanning"), 300);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 backdrop-blur" role="dialog" aria-modal="true" aria-labelledby="qr-title">
      <div className="w-[92vw] max-w-sm rounded-2xl overflow-hidden bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-white/10">
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
          <h3 id="qr-title" className="font-semibold">Scan QR</h3>
          <button type="button" onClick={onClose} className="px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Close">✕</button>
        </div>
        {/* Camera preview (mock) */}
        <div className="relative aspect-[3/4] bg-slate-900 grid place-items-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="rounded-xl border-2 border-white/60 w-3/4 h-1/2" />
          <span className="absolute bottom-3 text-xs opacity-80">Camera preview (demo)</span>
        </div>
        <div className="p-4 flex items-center justify-between gap-3">
          <button type="button" onClick={() => setStatus("scanning")} className="flex-1 rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5">Rescan</button>
          <button type="button" onClick={() => { setStatus("success"); setTimeout(() => { alert("✅ Scanned! +50 GP at West Range"); onClose(); }, 350); }} className="flex-1 rounded-xl bg-emerald-600 text-white px-4 py-2 font-semibold hover:brightness-105">
            {status === "success" ? "Success" : status === "scanning" ? "Scanning…" : "Scan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small UI Bits ---------- */
function SubTab({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200" : "bg-transparent text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
      }`}
    >
      {label}
    </button>
  );
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="grid place-items-center rounded-full bg-gradient-to-br from-emerald-600 to-lime-500 text-white font-bold shadow-soft"
      style={{ width: size, height: size }}
      aria-label={`${name} avatar`}
    >
      <span className="text-sm">{initials}</span>
    </div>
  );
}

function ActivityRow({ title, time, icon }: { title: string; time: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 dark:bg-slate-900/60 dark:border-white/10">
      <div className="grid place-items-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{time}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 text-center dark:bg-slate-900/60 dark:border-white/10">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-2xl font-bold leading-tight">{value}</div>
      {hint && <div className="text-xs text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
  );
}

function VoucherCard({ brand, offer, expires, disabled }: { brand: string; offer: string; expires: string; disabled?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        disabled
          ? "border-slate-200 bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:border-white/10"
          : "border-slate-100 bg-white dark:bg-slate-900/60 dark:border-white/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{brand}</div>
          <div className="text-sm">{offer}</div>
        </div>
        <div className="text-xs">Expires {expires}</div>
      </div>
    </div>
  );
}

function LedgerItem({ label, delta, date }: { label: string; delta: number; date: string }) {
  const plus = delta > 0;
  return (
    <li className="py-2 flex items-center justify-between text-sm">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-slate-500 dark:text-slate-400">{date}</div>
      </div>
      <div className={`${plus ? "text-emerald-600" : "text-rose-500"} font-semibold`}>{plus ? "+" : ""}{delta} GP</div>
    </li>
  );
}

function RoleCard({ title, desc }: { title: string; desc: string }) {
  return (
    <button
      type="button"
      className="rounded-xl border border-slate-100 bg-white p-4 text-left hover:shadow-md transition dark:bg-slate-900/60 dark:border-white/10"
    >
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-slate-600 dark:text-slate-300">{desc}</div>
    </button>
  );
}

/* =================== Icons =================== */
function FlagIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 3v18M6 4h12l-3 4 3 4H6" />
    </svg>
  );
}
function MapIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
      <path d="M9 3v15m6-12v15" />
    </svg>
  );
}
function ReelsIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M3 9h18M8 4l4 5m0-5l4 5" />
    </svg>
  );
}
function CommunityIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
      <circle cx="12" cy="7" r="3" />
    </svg>
  );
}
function UserIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M7 21v-2a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function ScanIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M4 12h16" />
    </svg>
  );
}
function ChatIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M21 12a8 8 0 1 1-4-6.9L21 5l-1.9 2.9A7.9 7.9 0 0 1 21 12z" />
    </svg>
  );
}
function ThemeIcon({ className = "w-6 h-6", dark }: { className?: string; dark?: boolean }) {
  return dark ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
function Pin({ color = "#22c55e", label = "Spot" }: { color?: string; label?: string }) {
  return (
    <div className="relative">
      <svg viewBox="0 0 24 24" className="w-9 h-9 drop-shadow">
        <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" fill={color} />
        <circle cx="12" cy="9.5" r="2.5" fill="white" />
      </svg>
      <span className="absolute left-1/2 -translate-x-1/2 top-9 text-[11px] bg-white/90 backdrop-blur px-2 py-0.5 rounded-full border border-white/60 dark:bg-slate-900/80 dark:border-white/20">
        {label}
      </span>
    </div>
  );
}

/* =================== Notes ===================
Add to global CSS for niceties:

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.shadow-soft {
  --tw-shadow: 0 10px 30px rgba(2, 6, 23, 0.06);
  --tw-shadow-colored: 0 10px 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow,0 0 #0000), var(--tw-ring-shadow,0 0 #0000), var(--tw-shadow);
}
*/
