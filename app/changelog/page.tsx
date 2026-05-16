"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import { RESOURCES } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";
import type { ResourceType } from "@/lib/types";

// Parse relative date strings like "1 day ago", "2 weeks ago" into actual dates
// Reference: today is 2026-05-16
function parseRelativeDate(relative: string): Date {
  const now = new Date("2026-05-16");
  const lower = relative.toLowerCase().trim();

  const match = lower.match(/^(\d+)\s+(day|days|week|weeks|month|months)\s+ago$/);
  if (match) {
    const amount = parseInt(match[1], 10);
    const unit = match[2].replace(/s$/, ""); // normalize to singular
    const result = new Date(now);
    if (unit === "day") result.setDate(result.getDate() - amount);
    else if (unit === "week") result.setDate(result.getDate() - amount * 7);
    else if (unit === "month") result.setMonth(result.getMonth() - amount);
    return result;
  }

  // fallback: return now
  return new Date(now);
}

function formatMonthHeader(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function ChangelogPage() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Sort resources by parsed date (newest first), then group by month
  const grouped = useMemo(() => {
    const withDates = RESOURCES.map((r) => ({
      ...r,
      _date: parseRelativeDate(r.lastUpdated),
    })).sort((a, b) => b._date.getTime() - a._date.getTime());

    const map = new Map<string, typeof withDates>();
    for (const r of withDates) {
      const key = formatMonthHeader(r._date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }

    return Array.from(map.entries()); // [["May 2026", [...]], ...]
  }, []);

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-5">
            <span>📋</span>
            Registry updates
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            <span className="gradient-text">Changelog</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl leading-relaxed">
            A timeline of every resource added to Claude Hub — MCPs, skills,
            agents, prompts, and more.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical spine */}
          <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/40 via-blue-500/20 to-transparent" />

          <div className="space-y-14">
            {grouped.map(([month, entries], groupIdx) => (
              <motion.div
                key={month}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: groupIdx * 0.07 }}
              >
                {/* Month header */}
                <div className="flex items-center gap-4 mb-6 ml-6">
                  <h2 className="text-lg font-semibold gradient-text">{month}</h2>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-xs text-slate-500 shrink-0">
                    {entries.length} {entries.length === 1 ? "resource" : "resources"}
                  </span>
                </div>

                {/* Entries */}
                <div className="space-y-3 ml-6">
                  {entries.map((resource, entryIdx) => {
                    const meta = TYPE_META[resource.type as ResourceType];
                    return (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: groupIdx * 0.07 + entryIdx * 0.03,
                        }}
                        className="relative"
                      >
                        {/* Dot indicator */}
                        <div
                          className="absolute -left-[27px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] rounded-full border-2 border-[#030712] flex items-center justify-center"
                          style={{ backgroundColor: meta.color + "33", borderColor: meta.color + "66" }}
                        >
                          <div
                            className="w-[7px] h-[7px] rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                        </div>

                        {/* Card */}
                        <Link
                          href={`/resources/${resource.slug}`}
                          className="group flex items-start gap-4 p-4 rounded-xl bg-white/[0.025] border border-white/[0.07] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all backdrop-blur-sm"
                        >
                          {/* Type badge */}
                          <span
                            className="shrink-0 mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              color: meta.color,
                              background: meta.bg,
                              border: `1px solid ${meta.border}`,
                            }}
                          >
                            {meta.icon} {meta.label}
                          </span>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-sm font-medium text-slate-100 group-hover:text-white transition-colors">
                                {resource.name}
                              </span>
                              {resource.verified && (
                                <span className="text-[10px] text-emerald-400 font-medium">✓ verified</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                              {resource.tagline}
                            </p>
                          </div>

                          {/* Date hint */}
                          <span className="shrink-0 text-[11px] text-slate-600 mt-0.5 hidden sm:block">
                            {resource.lastUpdated}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center text-xs text-slate-600"
        >
          {RESOURCES.length} resources tracked · Updated continuously
        </motion.p>
      </main>

      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
