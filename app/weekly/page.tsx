"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Share2 } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import ResourceCard from "@/components/resource-card";
import { RESOURCES } from "@/lib/resources";
import { Resource } from "@/lib/types";

// ─── helpers ────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-05-16");

/** Convert a lastUpdated string to a Date for comparison. */
function toDate(lastUpdated: string): Date {
  // relative strings
  const relMap: Record<string, number> = {
    "1 day ago": 1,
    "2 days ago": 2,
    "3 days ago": 3,
    "4 days ago": 4,
    "5 days ago": 5,
    "6 days ago": 6,
    "1 week ago": 7,
    "2 weeks ago": 14,
  };
  if (relMap[lastUpdated] !== undefined) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - relMap[lastUpdated]);
    return d;
  }
  return new Date(lastUpdated);
}

function isWithinLastNDays(lastUpdated: string, days: number): boolean {
  const cutoff = new Date(TODAY);
  cutoff.setDate(cutoff.getDate() - days);
  return toDate(lastUpdated) >= cutoff;
}

// ─── Derived collections ─────────────────────────────────────────────────────

const thisWeek: Resource[] = (() => {
  const recent = RESOURCES.filter((r) => isWithinLastNDays(r.lastUpdated, 7));
  if (recent.length > 0) return recent;
  // fallback: 5 most recently updated
  return [...RESOURCES]
    .sort((a, b) => toDate(b.lastUpdated).getTime() - toDate(a.lastUpdated).getTime())
    .slice(0, 5);
})();

const onFire: Resource[] = RESOURCES.filter((r) => r.hot);

const communityFavorites: Resource[] = [...RESOURCES]
  .sort((a, b) => b.stars - a.stars)
  .slice(0, 5);

const newArrivals: Resource[] = [...RESOURCES]
  .sort((a, b) => toDate(b.lastUpdated).getTime() - toDate(a.lastUpdated).getTime())
  .slice(0, 5);

// ─── Section component ───────────────────────────────────────────────────────

function DigestSection({
  emoji,
  title,
  count,
  resources,
  accentColor,
}: {
  emoji: string;
  title: string;
  count: number;
  resources: Resource[];
  accentColor: string;
}) {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-2xl">{emoji}</span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{title}</h2>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full border"
            style={{
              color: accentColor,
              borderColor: `${accentColor}40`,
              background: `${accentColor}12`,
            }}
          >
            {count}
          </span>
        </div>

        {/* Horizontal scroll row */}
        <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {resources.map((r) => (
            <div key={r.id} className="snap-start shrink-0 w-72">
              <ResourceCard resource={r} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WeeklyPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://claudehub.dev/weekly";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />

      <main className="pt-20 pb-16">
        {/* ── Hero banner ─────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.1) 50%, transparent 100%)",
          }}
        >
          {/* aurora blobs */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
          <div className="pointer-events-none absolute -top-16 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl"
            style={{ background: "radial-gradient(circle, #2563eb, transparent 70%)" }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4
                  bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  Week of May 12 – 16, 2026
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
                  Weekly Digest
                </h1>
                <p className="text-slate-400 text-base sm:text-lg max-w-xl">
                  The best Claude resources curated from the community — what&apos;s hot, trending, and brand new this week.
                </p>
              </div>

              <button
                onClick={handleShare}
                className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl
                  bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.1] hover:border-white/[0.2]
                  transition-all text-sm text-slate-300 font-medium shrink-0"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-400" />
                    Link copied!
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    Share this digest
                  </>
                )}
              </button>
            </div>

            {/* Stats strip */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "This week", value: thisWeek.length, color: "#a78bfa" },
                { label: "On fire", value: onFire.length, color: "#f87171" },
                { label: "Top by stars", value: communityFavorites.length, color: "#facc15" },
                { label: "New arrivals", value: newArrivals.length, color: "#34d399" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-4 backdrop-blur-sm"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="border-t border-white/[0.06]" />

        {/* ── Section 1: This week's highlights ────────────────────── */}
        <div style={{ background: "rgba(139,92,246,0.03)" }}>
          <DigestSection
            emoji="✨"
            title="This week's highlights"
            count={thisWeek.length}
            resources={thisWeek}
            accentColor="#a78bfa"
          />
        </div>

        <div className="border-t border-white/[0.06]" />

        {/* ── Section 2: On fire right now ─────────────────────────── */}
        <div style={{ background: "rgba(239,68,68,0.03)" }}>
          <DigestSection
            emoji="🔥"
            title="On fire right now"
            count={onFire.length}
            resources={onFire}
            accentColor="#f87171"
          />
        </div>

        <div className="border-t border-white/[0.06]" />

        {/* ── Section 3: Community favorites ───────────────────────── */}
        <div style={{ background: "rgba(234,179,8,0.03)" }}>
          <DigestSection
            emoji="⭐"
            title="Community favorites"
            count={communityFavorites.length}
            resources={communityFavorites}
            accentColor="#facc15"
          />
        </div>

        <div className="border-t border-white/[0.06]" />

        {/* ── Section 4: New arrivals ───────────────────────────────── */}
        <div style={{ background: "rgba(52,211,153,0.03)" }}>
          <DigestSection
            emoji="🆕"
            title="New arrivals"
            count={newArrivals.length}
            resources={newArrivals}
            accentColor="#34d399"
          />
        </div>

        {/* ── Footer CTA ───────────────────────────────────────────── */}
        <div className="border-t border-white/[0.06] mt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
            <p className="text-slate-500 text-sm mb-4">Want to see everything?</p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40
                transition-all text-violet-300 text-sm font-medium"
            >
              Browse all resources →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
