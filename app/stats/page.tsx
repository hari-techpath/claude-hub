"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Star,
  Shield,
  Layers,
  TrendingUp,
  Tag,
  Clock,
  Grid3X3,
  GitFork,
  Award,
  Zap,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import { resources } from "@/lib/resources";
import { TYPE_META, ResourceType } from "@/lib/types";
import { qualityScore } from "@/lib/score";

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString();
}

function pct(n: number, total: number): string {
  return total === 0 ? "0%" : ((n / total) * 100).toFixed(1) + "%";
}

// ── Glass card wrapper ─────────────────────────────────────────────────────

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Section 1: Header stats ─────────────────────────────────────────────────

function HeaderStats() {
  const totalStars = useMemo(() => resources.reduce((s, r) => s + r.stars, 0), []);
  const avgQuality = useMemo(
    () => Math.round(resources.reduce((s, r) => s + qualityScore(r), 0) / resources.length),
    []
  );
  const verifiedCount = useMemo(() => resources.filter((r) => r.verified).length, []);

  const stats = [
    {
      label: "Total Resources",
      value: fmt(resources.length),
      icon: <Layers size={20} />,
      color: "#a78bfa",
      bg: "rgba(139,92,246,0.08)",
      border: "rgba(139,92,246,0.2)",
    },
    {
      label: "Total GitHub Stars",
      value: fmt(totalStars),
      icon: <Star size={20} />,
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.08)",
      border: "rgba(251,191,36,0.2)",
    },
    {
      label: "Avg Quality Score",
      value: avgQuality.toString(),
      icon: <Award size={20} />,
      color: "#34d399",
      bg: "rgba(52,211,153,0.08)",
      border: "rgba(52,211,153,0.2)",
    },
    {
      label: "Verified Resources",
      value: fmt(verifiedCount),
      icon: <Shield size={20} />,
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.08)",
      border: "rgba(96,165,250,0.2)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className="rounded-2xl border p-5 flex flex-col gap-3"
          style={{ background: s.bg, borderColor: s.border }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${s.color}18`, color: s.color }}
          >
            {s.icon}
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-100 tabular-nums">
              {s.value}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Section 2: Resources by type ───────────────────────────────────────────

function ByType() {
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    resources.forEach((r) => {
      map[r.type] = (map[r.type] ?? 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type: type as ResourceType, count }));
  }, []);

  const max = counts[0]?.count ?? 1;

  return (
    <GlassCard>
      <SectionHeading
        icon={<BarChart3 size={16} />}
        title="Resources by Type"
        subtitle="Distribution across all resource categories"
      />
      <div className="space-y-3">
        {counts.map(({ type, count }, i) => {
          const meta = TYPE_META[type];
          const barPct = (count / max) * 100;
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="flex items-center gap-3"
            >
              {/* Icon + label */}
              <div className="flex items-center gap-2 w-36 shrink-0">
                <span className="text-base leading-none">{meta.icon}</span>
                <span className="text-sm text-slate-300 font-medium">{meta.label}</span>
              </div>

              {/* Bar */}
              <div className="flex-1 h-6 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: meta.color, opacity: 0.75 }}
                  initial={{ scaleX: 0, originX: 0 }}
                  whileInView={{ scaleX: barPct / 100 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 + 0.15, duration: 0.5, ease: "easeOut" }}
                />
              </div>

              {/* Count + pct */}
              <div className="w-20 text-right shrink-0">
                <span className="text-sm font-semibold tabular-nums text-slate-200">{count}</span>
                <span className="text-xs text-slate-500 ml-1.5">{pct(count, resources.length)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ── Section 3: Complexity donut ────────────────────────────────────────────

function ComplexityDonut() {
  const data = useMemo(() => {
    const counts = { beginner: 0, intermediate: 0, advanced: 0 };
    resources.forEach((r) => {
      counts[r.complexity]++;
    });
    return [
      { label: "Beginner", count: counts.beginner, color: "#34d399", stroke: "#059669" },
      { label: "Intermediate", count: counts.intermediate, color: "#fbbf24", stroke: "#d97706" },
      { label: "Advanced", count: counts.advanced, color: "#f87171", stroke: "#dc2626" },
    ];
  }, []);

  const total = resources.length;
  const SIZE = 180;
  const STROKE = 28;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  let offset = 0;
  const slices = data.map((d) => {
    const fraction = d.count / total;
    const len = fraction * CIRC;
    const dashArray = `${len} ${CIRC - len}`;
    const dashOffset = -offset;
    offset += len;
    return { ...d, dashArray, dashOffset, fraction };
  });

  return (
    <GlassCard>
      <SectionHeading
        icon={<Zap size={16} />}
        title="By Complexity"
        subtitle="Skill level required"
      />
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* SVG donut */}
        <div className="relative shrink-0">
          <svg width={SIZE} height={SIZE} className="rotate-[-90deg]">
            {/* Track */}
            <circle
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={STROKE}
            />
            {slices.map((s, i) => (
              <motion.circle
                key={s.label}
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={s.dashArray}
                strokeDashoffset={s.dashOffset}
                strokeLinecap="butt"
                initial={{ strokeDasharray: `0 ${CIRC}` }}
                whileInView={{ strokeDasharray: s.dashArray }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
              />
            ))}
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-100">{total}</span>
            <span className="text-[10px] text-slate-500">total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-4 flex-1">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{s.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-slate-200">
                    {s.count}
                  </span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: s.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: pct(s.count, total) }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{pct(s.count, total)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

// ── Section 4: Top resources leaderboard ───────────────────────────────────

function TopResources() {
  const top = useMemo(
    () => [...resources].sort((a, b) => b.stars - a.stars).slice(0, 10),
    []
  );

  return (
    <GlassCard>
      <SectionHeading
        icon={<TrendingUp size={16} />}
        title="Top Resources by Stars"
        subtitle="Highest GitHub stars in the registry"
      />
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["#", "Name", "Type", "Stars", "Forks", "Quality"].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3 px-2"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {top.map((r, i) => {
              const meta = TYPE_META[r.type];
              const score = qualityScore(r);
              const rankColors = [
                "text-yellow-400",
                "text-slate-300",
                "text-amber-600",
                "text-slate-400",
                "text-slate-500",
              ];
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={`border-b border-white/[0.04] ${
                    i % 2 === 0 ? "bg-white/[0.015]" : ""
                  } hover:bg-white/[0.04] transition-colors`}
                >
                  <td className="py-3 px-2">
                    <span className={`font-bold tabular-nums ${rankColors[Math.min(i, 4)]}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <Link
                      href={`/resources/${r.slug}`}
                      className="font-medium text-slate-200 hover:text-violet-300 transition-colors flex items-center gap-1.5 group"
                    >
                      {r.name}
                      <ExternalLink
                        size={11}
                        className="opacity-0 group-hover:opacity-60 transition-opacity"
                      />
                    </Link>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{r.tagline}</div>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                    >
                      {meta.icon} {meta.label}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="flex items-center gap-1 text-yellow-400/80 font-medium tabular-nums">
                      <Star size={11} />
                      {fmt(r.stars)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="flex items-center gap-1 text-slate-400 tabular-nums">
                      <GitFork size={11} />
                      {fmt(r.forks)}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] w-16 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-violet-400"
                          style={{ width: `${Math.min((score / 100) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-slate-300 font-medium w-7">
                        {score}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

// ── Section 5: Stars distribution histogram ────────────────────────────────

function StarsHistogram() {
  const buckets = useMemo(() => {
    const defs = [
      { label: "0–100", min: 0, max: 100 },
      { label: "100–500", min: 100, max: 500 },
      { label: "500–1k", min: 500, max: 1000 },
      { label: "1k–5k", min: 1000, max: 5000 },
      { label: "5k–10k", min: 5000, max: 10000 },
      { label: "10k+", min: 10000, max: Infinity },
    ];
    return defs.map((d) => ({
      ...d,
      count: resources.filter((r) => r.stars >= d.min && r.stars < d.max).length,
    }));
  }, []);

  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <GlassCard>
      <SectionHeading
        icon={<BarChart3 size={16} />}
        title="Stars Distribution"
        subtitle="How resources are spread across star ranges"
      />
      <div className="space-y-3">
        {buckets.map((b, i) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center gap-3"
          >
            <div className="w-16 text-right shrink-0 text-xs text-slate-400 font-mono">{b.label}</div>
            <div className="flex-1 h-7 rounded-lg bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded-lg flex items-center px-2"
                style={{
                  background: "linear-gradient(90deg, rgba(139,92,246,0.6), rgba(59,130,246,0.6))",
                }}
                initial={{ scaleX: 0, originX: 0 }}
                whileInView={{ scaleX: b.count / max }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 + 0.1, duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="w-12 text-right shrink-0">
              <span className="text-sm font-semibold text-slate-200 tabular-nums">{b.count}</span>
              <span className="text-[10px] text-slate-500 ml-1">{pct(b.count, resources.length)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Section 6: Tag cloud ───────────────────────────────────────────────────

function TagCloud() {
  const tags = useMemo(() => {
    const map: Record<string, number> = {};
    resources.forEach((r) => r.tags.forEach((t) => {
      map[t] = (map[t] ?? 0) + 1;
    }));
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));
  }, []);

  const maxCount = tags[0]?.count ?? 1;

  return (
    <GlassCard>
      <SectionHeading
        icon={<Tag size={16} />}
        title="Tag Cloud Analytics"
        subtitle="Top 20 most-used tags across all resources"
      />
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }, i) => {
          const scale = 0.7 + (count / maxCount) * 0.6; // 0.7 → 1.3 font scale
          const alpha = 0.4 + (count / maxCount) * 0.6;
          return (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                href={`/tags`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all hover:brightness-125"
                style={{
                  fontSize: `${scale * 0.78}rem`,
                  background: `rgba(139,92,246,${alpha * 0.12})`,
                  borderColor: `rgba(139,92,246,${alpha * 0.35})`,
                  color: `rgba(196,181,253,${alpha})`,
                }}
              >
                <span>{tag}</span>
                <span
                  className="text-[10px] font-bold tabular-nums px-1 py-0.5 rounded-full"
                  style={{ background: `rgba(139,92,246,${alpha * 0.3})` }}
                >
                  {count}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ── Section 7: Recently added timeline ────────────────────────────────────

function RecentTimeline() {
  // lastUpdated is a string like "2 days ago" — sort as-is by array position
  // Since these are strings, we use the original order but take last 12 unique entries
  const recent = useMemo(() => {
    return [...resources]
      .slice()
      .reverse()
      .slice(0, 12);
  }, []);

  const timeUnits: Record<string, { color: string; bg: string }> = {
    day: { color: "#34d399", bg: "rgba(52,211,153,0.1)" },
    week: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
    month: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  };

  function getTimeStyle(lastUpdated: string) {
    if (lastUpdated.includes("day") || lastUpdated.includes("hour")) return timeUnits.day;
    if (lastUpdated.includes("week")) return timeUnits.week;
    return timeUnits.month;
  }

  return (
    <GlassCard>
      <SectionHeading
        icon={<Clock size={16} />}
        title="Recently Added"
        subtitle="Last 12 resources by position in registry"
      />
      <div className="space-y-1.5">
        {recent.map((r, i) => {
          const meta = TYPE_META[r.type];
          const style = getTimeStyle(r.lastUpdated);
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.07] transition-all group"
            >
              {/* Time dot */}
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: style.color }}
              />

              {/* Name */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/resources/${r.slug}`}
                  className="text-sm font-medium text-slate-200 hover:text-violet-300 transition-colors truncate block"
                >
                  {r.name}
                </Link>
              </div>

              {/* Type badge */}
              <span
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
              >
                {meta.icon} {meta.label}
              </span>

              {/* Time label */}
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                style={{ background: style.bg, color: style.color }}
              >
                {r.lastUpdated}
              </span>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ── Section 8: Type × Complexity matrix ───────────────────────────────────

function TypeComplexityMatrix() {
  const complexities = ["beginner", "intermediate", "advanced"] as const;
  const types = Object.keys(TYPE_META) as ResourceType[];

  const matrix = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    types.forEach((t) => {
      map[t] = { beginner: 0, intermediate: 0, advanced: 0 };
    });
    resources.forEach((r) => {
      map[r.type][r.complexity]++;
    });
    return map;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const globalMax = useMemo(() => {
    let m = 0;
    types.forEach((t) => {
      complexities.forEach((c) => {
        m = Math.max(m, matrix[t][c]);
      });
    });
    return m || 1;
  }, [matrix]); // eslint-disable-line react-hooks/exhaustive-deps

  const complexityColors: Record<string, string> = {
    beginner: "#34d399",
    intermediate: "#fbbf24",
    advanced: "#f87171",
  };

  return (
    <GlassCard>
      <SectionHeading
        icon={<Grid3X3 size={16} />}
        title="Type × Complexity Matrix"
        subtitle="Count of resources per type and complexity level"
      />
      <div className="overflow-x-auto -mx-2">
        <table className="w-full min-w-[480px] text-xs">
          <thead>
            <tr>
              <th className="text-left text-slate-500 font-medium pb-3 px-2 w-28">Type</th>
              {complexities.map((c) => (
                <th key={c} className="text-center pb-3 px-2" style={{ color: complexityColors[c] }}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </th>
              ))}
              <th className="text-right text-slate-500 font-medium pb-3 px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type, ri) => {
              const meta = TYPE_META[type];
              const rowTotal = complexities.reduce((s, c) => s + matrix[type][c], 0);
              return (
                <motion.tr
                  key={type}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: ri * 0.05 }}
                  className={`border-b border-white/[0.04] ${ri % 2 === 0 ? "bg-white/[0.015]" : ""}`}
                >
                  <td className="py-2.5 px-2">
                    <span className="flex items-center gap-1.5">
                      <span>{meta.icon}</span>
                      <span style={{ color: meta.color }}>{meta.label}</span>
                    </span>
                  </td>
                  {complexities.map((c) => {
                    const val = matrix[type][c];
                    const intensity = val / globalMax;
                    return (
                      <td key={c} className="py-2.5 px-2 text-center">
                        {val > 0 ? (
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold"
                            style={{
                              background: `${complexityColors[c]}${Math.round(intensity * 0.3 * 255).toString(16).padStart(2, "0")}`,
                              color: complexityColors[c],
                            }}
                          >
                            {val}
                          </span>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-2 text-right">
                    <span className="text-slate-400 font-medium tabular-nums">{rowTotal}</span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
          {/* Footer row: totals per complexity */}
          <tfoot>
            <tr className="border-t border-white/[0.08]">
              <td className="py-2.5 px-2 text-slate-500 font-medium">Total</td>
              {complexities.map((c) => {
                const total = types.reduce((s, t) => s + matrix[t][c], 0);
                return (
                  <td key={c} className="py-2.5 px-2 text-center">
                    <span className="font-semibold tabular-nums" style={{ color: complexityColors[c] }}>
                      {total}
                    </span>
                  </td>
                );
              })}
              <td className="py-2.5 px-2 text-right text-slate-300 font-semibold tabular-nums">
                {resources.length}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </GlassCard>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function StatsPage() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Page hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
            <BarChart3 size={12} />
            Platform Analytics
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Claude Hub <span className="gradient-text">Stats</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Real-time analytics across all {resources.length} resources in the registry. Stars,
            quality scores, type distribution, and more.
          </p>
        </motion.div>

        {/* ── 1. Header stats ── */}
        <HeaderStats />

        {/* ── 2 + 3. Type + Complexity (side by side on large screens) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 mt-8">
          <ByType />
          <ComplexityDonut />
        </div>

        {/* ── 4. Top leaderboard ── */}
        <div className="mt-8">
          <TopResources />
        </div>

        {/* ── 5 + 6. Histogram + Tags (side by side) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <StarsHistogram />
          <TagCloud />
        </div>

        {/* ── 7 + 8. Timeline + Matrix ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <RecentTimeline />
          <TypeComplexityMatrix />
        </div>
      </main>

      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
