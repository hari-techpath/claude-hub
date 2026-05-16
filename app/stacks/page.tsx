"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Layers, ArrowRight, Star, Copy, Check, Clock, ChevronRight } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import { RESOURCES } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";
import { STACKS } from "@/lib/stacks";
import type { Stack } from "@/lib/stacks";

function setupTimeLabel(count: number): string {
  if (count < 5) return "~15 min";
  if (count <= 7) return "~30 min";
  return "~1 hour";
}

function TypeBreakdownBar({ slugs }: { slugs: string[] }) {
  const resources = slugs
    .map((slug) => RESOURCES.find((r) => r.slug === slug))
    .filter(Boolean) as typeof RESOURCES;

  const counts: Record<string, number> = {};
  for (const r of resources) {
    counts[r.type] = (counts[r.type] || 0) + 1;
  }

  const dotColors: Record<string, string> = {
    mcp: "#a78bfa",
    skill: "#22d3ee",
    agent: "#60a5fa",
    prompt: "#34d399",
    architecture: "#fb923c",
    setup: "#facc15",
    hook: "#f472b6",
    trick: "#f87171",
  };

  const icons: Record<string, string> = {
    mcp: "🔌",
    skill: "⚡",
    agent: "🤖",
    prompt: "📝",
    architecture: "🏗️",
    setup: "⚙️",
    hook: "🪝",
    trick: "💡",
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {Object.entries(counts).map(([type, count]) => (
        <span
          key={type}
          className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
          style={{ background: `${dotColors[type]}15`, color: dotColors[type] }}
          title={`${count} ${type}${count > 1 ? "s" : ""}`}
        >
          <span style={{ fontSize: "10px" }}>{icons[type]}</span>
          <span className="font-medium tabular-nums">{count}</span>
        </span>
      ))}
    </div>
  );
}

function InstallScriptTooltip({ slugs }: { slugs: string[] }) {
  const resources = slugs
    .map((slug) => RESOURCES.find((r) => r.slug === slug))
    .filter(Boolean) as typeof RESOURCES;

  const installable = resources.filter((r) => r.installCommand);
  const lines = installable.map((r) => r.installCommand!);
  const preview = lines.slice(0, 2).join("\n");
  const hasMore = lines.length > 2;

  return (
    <div className="absolute bottom-full right-0 mb-2 z-50 w-72 pointer-events-none">
      <div className="bg-slate-900 border border-white/[0.12] rounded-xl p-3 shadow-2xl">
        <p className="text-xs text-slate-400 mb-2 font-medium">Install preview</p>
        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
          {preview || "# No install commands for this stack"}
        </pre>
        {hasMore && (
          <p className="text-xs text-slate-500 mt-1.5">
            +{lines.length - 2} more commands…
          </p>
        )}
      </div>
      {/* Arrow */}
      <div className="absolute bottom-[-6px] right-3 w-3 h-3 bg-slate-900 border-r border-b border-white/[0.12] rotate-45" />
    </div>
  );
}

function StackCard({ stack, delay }: { stack: Stack; delay: number }) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resources = stack.slugs
    .map((slug) => RESOURCES.find((r) => r.slug === slug))
    .filter(Boolean) as typeof RESOURCES;

  const totalStars = resources.reduce((acc, r) => acc + r.stars, 0);
  const setupTime = setupTimeLabel(resources.length);

  const handleCopy = () => {
    const installable = resources.filter((r) => r.installCommand);
    const script = installable.map((r) => r.installCommand!).join("\n");
    navigator.clipboard.writeText(script || stack.slugs.join(", "));
    setCopied(true);
    setShowTooltip(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMouseEnter = () => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    tooltipTimeout.current = setTimeout(() => setShowTooltip(false), 150);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="glass-card rounded-3xl p-6 flex flex-col gap-5 group hover:border-white/[0.16] transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{stack.emoji}</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
              style={{
                background: `${stack.color}20`,
                color: stack.color,
                border: `1px solid ${stack.color}30`,
              }}
            >
              {stack.audience}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100">{stack.name}</h3>
          <p className="text-sm text-slate-400 mt-1">{stack.tagline}</p>
        </div>

        {/* Copy button with tooltip */}
        <div className="relative shrink-0">
          <button
            onClick={handleCopy}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
            title="Copy install script"
          >
            {copied ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} />
            )}
          </button>
          <AnimatePresence>
            {showTooltip && !copied && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
              >
                <InstallScriptTooltip slugs={stack.slugs} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">{stack.description}</p>

      {/* Resource chips */}
      <div className="flex flex-wrap gap-2">
        {resources.map((r) => {
          const meta = TYPE_META[r.type];
          return (
            <Link
              key={r.id}
              href={`/resources/${r.slug}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:scale-105"
              style={{
                background: meta.bg,
                color: meta.color,
                border: `1px solid ${meta.border}`,
              }}
            >
              <span>{meta.icon}</span>
              <span className="font-medium">{r.name}</span>
            </Link>
          );
        })}
        {stack.slugs.length > resources.length && (
          <span className="px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.04] text-slate-500 border border-white/[0.06]">
            +{stack.slugs.length - resources.length} more
          </span>
        )}
      </div>

      {/* Type breakdown */}
      <TypeBreakdownBar slugs={stack.slugs} />

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Star size={11} className="text-yellow-500/70" />
            <span>{totalStars.toLocaleString()} stars</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={11} className="text-slate-600" />
            <span>{setupTime} setup</span>
          </div>
        </div>
        <Link
          href={`/stacks/${stack.id}`}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <span>{resources.length} resources</span>
          <ChevronRight size={11} />
        </Link>
      </div>
    </motion.div>
  );
}

export default function StacksPage() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6"
          >
            <Layers size={13} />
            Curated stacks for every data role
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            Build your <span className="gradient-text">data stack</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Pre-assembled collections of Claude resources that work together. Pick your
            role, adopt the stack.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {STACKS.map((stack, i) => (
            <StackCard key={stack.id} stack={stack} delay={i * 0.08} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center p-8 rounded-3xl bg-white/[0.02] border border-white/[0.07]"
        >
          <h2 className="text-2xl font-bold mb-2">Missing a resource?</h2>
          <p className="text-slate-400 text-sm mb-6">
            These stacks are community-maintained. Submit a PR to add resources or
            propose a new stack.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium text-sm transition-all"
            >
              Browse all resources <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
