"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getTrending } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";

const trending = getTrending();
// Duplicate for seamless infinite loop
const DOUBLED = [...trending, ...trending];

export default function TrendingTicker() {
  if (trending.length === 0) return null;

  return (
    <div className="relative h-9 w-full bg-white/[0.02] border-b border-white/[0.05] flex items-center overflow-hidden">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #030712 0%, transparent 100%)" }} />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #030712 0%, transparent 100%)" }} />

      {/* Label */}
      <div className="absolute left-4 z-20 flex items-center gap-1.5 shrink-0 select-none">
        <span className="text-sm">🔥</span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
          Trending:
        </span>
      </div>

      {/* Scrolling strip — starts after the label */}
      <div className="flex overflow-hidden ml-28 w-full">
        <motion.div
          className="flex items-center gap-0 shrink-0"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {DOUBLED.map((resource, i) => {
            const meta = TYPE_META[resource.type];
            return (
              <span key={`${resource.id}-${i}`} className="flex items-center shrink-0">
                <Link
                  href={`/resources/${resource.slug}`}
                  className="flex items-center gap-1.5 px-3 py-0.5 rounded-full hover:bg-white/[0.06] transition-colors group"
                >
                  {/* Type badge */}
                  <span
                    className="inline-flex items-center gap-0.5 px-1.5 py-px rounded-full text-[10px] font-semibold leading-none"
                    style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                  >
                    {meta.icon} {meta.label}
                  </span>
                  <span className="text-xs text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">
                    {resource.name}
                  </span>
                </Link>
                <span className="text-slate-600 text-xs select-none px-1">·</span>
              </span>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
