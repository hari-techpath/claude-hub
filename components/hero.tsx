"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// ── AnimatedNumber ────────────────────────────────────────────────────────────
// Counts up from 0 to `target` over `duration` ms using an easing function.
function AnimatedNumber({ target, duration = 1200, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;

    // easeOutQuart
    function easeOutQuart(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function tick(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      setDisplay(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [target, duration]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

interface HeroProps {
  onSearchOpen: () => void;
  totalCount: number;
  counts: Record<string, number>;
}

const SEARCH_PLACEHOLDERS = [
  "MCPs for Snowflake and dbt...",
  "Agents for data pipeline debugging...",
  "Prompts for writing SQL queries...",
  "Extended thinking for ML models...",
  "Hooks to automate data quality checks...",
  "Skills for data engineering workflows...",
  "Best Claude setup for data scientists...",
];

export default function Hero({ onSearchOpen, totalCount, counts }: HeroProps) {
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const target = SEARCH_PLACEHOLDERS[placeholderIdx];
    if (!isDeleting && displayText.length < target.length) {
      timeoutRef.current = setTimeout(() => setDisplayText(target.slice(0, displayText.length + 1)), 60);
    } else if (!isDeleting && displayText.length === target.length) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayText.length > 0) {
      timeoutRef.current = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 30);
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setPlaceholderIdx((i) => (i + 1) % SEARCH_PLACEHOLDERS.length);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [displayText, isDeleting, placeholderIdx]);

  const stats = [
    { label: "Resources", numeric: totalCount, suffix: "+" },
    { label: "MCPs", numeric: counts["mcp"] || 0, suffix: "" },
    { label: "Skills", numeric: counts["skill"] || 0, suffix: "" },
    { label: "Agents", numeric: counts["agent"] || 0, suffix: "" },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Aurora background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow beam — vertical shaft of violet light from top to center */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
            width: "1px",
            height: "60vh",
            background: "linear-gradient(180deg, rgba(139,92,246,0.15) 0%, transparent 100%)",
            boxShadow: "0 0 40px 20px rgba(139,92,246,0.08)",
          }}
        />

        <div
          className="aurora-blob w-[700px] h-[700px] animate-aurora-1"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, #4f46e5 40%, transparent 70%)",
            top: "-15%",
            left: "-10%",
          }}
        />
        <div
          className="aurora-blob w-[600px] h-[600px] animate-aurora-2"
          style={{
            background: "radial-gradient(circle, #0891b2 0%, #0e7490 40%, transparent 70%)",
            top: "20%",
            right: "-15%",
          }}
        />
        <div
          className="aurora-blob w-[500px] h-[500px] animate-aurora-3"
          style={{
            background: "radial-gradient(circle, #059669 0%, #0d9488 40%, transparent 70%)",
            bottom: "-10%",
            left: "30%",
          }}
        />
        {/* Floating data tool logos */}
        {[
          { label: "dbt", color: "#FF694A", x: "12%", y: "25%", size: 36, delay: "0s", duration: "18s", scale: 1.2, tooltip: "dbt — data build tool" },
          { label: "❄️", color: "#29B5E8", x: "78%", y: "18%", size: 32, delay: "2s", duration: "22s", scale: 1.0, tooltip: "Snowflake" },
          { label: "⚡", color: "#E25A1C", x: "88%", y: "55%", size: 28, delay: "4s", duration: "16s", scale: 0.8, tooltip: "Apache Spark" },
          { label: "🌊", color: "#0E7490", x: "8%", y: "68%", size: 30, delay: "1s", duration: "20s", scale: 1.2, tooltip: "Apache Kafka" },
          { label: "✈️", color: "#017CEE", x: "55%", y: "80%", size: 26, delay: "3s", duration: "24s", scale: 0.8, tooltip: "Apache Airflow" },
          { label: "🦆", color: "#FFC107", x: "35%", y: "15%", size: 28, delay: "5s", duration: "19s", scale: 1.0, tooltip: "DuckDB" },
          { label: "🔴", color: "#EF4444", x: "65%", y: "72%", size: 24, delay: "2.5s", duration: "21s", scale: 0.8, tooltip: "Redis" },
        ].map((logo, i) => (
          <div
            key={i}
            className="absolute pointer-events-auto select-none"
            title={logo.tooltip}
            style={{
              left: logo.x,
              top: logo.y,
              fontSize: logo.size * logo.scale,
              opacity: 0.12,
              animation: `floatLogo ${logo.duration} ease-in-out infinite`,
              animationDelay: logo.delay,
              filter: "blur(0.5px)",
              cursor: "default",
            }}
          >
            {logo.label === "dbt" ? (
              <span style={{ fontFamily: "monospace", fontWeight: 900, color: logo.color, fontSize: logo.size * logo.scale }}>{logo.label}</span>
            ) : (
              <span>{logo.label}</span>
            )}
          </div>
        ))}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial fade */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#030712_80%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8"
        >
          <Sparkles size={13} />
          Claude resources for data professionals
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
        >
          Claude for data people,
          <br />
          <span className="gradient-text">done right</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The curated registry of MCPs, skills, agents, prompts, and tricks for
          data engineers, data scientists, analysts, and ML engineers.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <button
            onClick={onSearchOpen}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.1] hover:bg-white/[0.07] hover:border-white/[0.18] transition-all group text-left shadow-2xl"
          >
            <Search size={18} className="text-slate-500 group-hover:text-violet-400 transition-colors shrink-0" />
            <span className="text-slate-500 text-base flex-1 truncate">
              {displayText}
              <span className="animate-pulse">|</span>
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <kbd className="px-1.5 py-0.5 text-[11px] rounded bg-white/[0.06] text-slate-500 font-mono border border-white/[0.08]">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[11px] rounded bg-white/[0.06] text-slate-500 font-mono border border-white/[0.08]">K</kbd>
            </div>
          </button>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-3 mb-16"
        >
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-violet-500/25"
          >
            Explore all resources
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/explore?type=mcp"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.09] text-slate-300 font-medium text-sm transition-all"
          >
            Browse MCPs
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Live badge */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-medium text-emerald-400">Live</span>
            <span>— updated weekly</span>
          </div>
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">
                  <AnimatedNumber target={stat.numeric} suffix={stat.suffix} duration={1200} />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => {
          document.getElementById("start-here")?.scrollIntoView({ behavior: "smooth" });
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors group"
        aria-label="Explore resources"
      >
        <span className="text-xs font-medium tracking-wide">Explore resources</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.button>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#030712] to-transparent" />
    </section>
  );
}
