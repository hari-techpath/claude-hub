"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { resources } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";
import type { Resource, ResourceType } from "@/lib/types";
import { Star, GitFork, X, Download, ExternalLink, BadgeCheck } from "lucide-react";

// ── Data tools definition ─────────────────────────────────────────────────────

const DATA_TOOLS = [
  { name: "Snowflake", emoji: "❄️", matchTerms: ["snowflake"] },
  { name: "BigQuery", emoji: "🔵", matchTerms: ["bigquery", "big-query"] },
  { name: "Redshift", emoji: "🔴", matchTerms: ["redshift"] },
  { name: "dbt", emoji: "🔧", matchTerms: ["dbt"] },
  { name: "Apache Airflow", emoji: "🌊", matchTerms: ["airflow"] },
  { name: "Apache Spark", emoji: "⚡", matchTerms: ["spark"] },
  { name: "Kafka", emoji: "📨", matchTerms: ["kafka"] },
  { name: "DuckDB", emoji: "🦆", matchTerms: ["duckdb", "duck-db"] },
  { name: "Databricks", emoji: "🟠", matchTerms: ["databricks"] },
  { name: "Postgres", emoji: "🐘", matchTerms: ["postgres", "postgresql"] },
  { name: "Polars", emoji: "🐻", matchTerms: ["polars"] },
  { name: "Great Expectations", emoji: "✅", matchTerms: ["great-expectations", "great expectations"] },
] as const;

type ToolName = (typeof DATA_TOOLS)[number]["name"];

const RESOURCE_TYPES: ResourceType[] = ["mcp", "skill", "agent", "prompt", "architecture", "setup", "hook", "trick"];

// ── Matching logic ────────────────────────────────────────────────────────────

function toolMatchesResource(tool: (typeof DATA_TOOLS)[number], resource: Resource): boolean {
  const tagStr = resource.tags.join(" ").toLowerCase();
  const nameStr = resource.name.toLowerCase();
  const descStr = resource.description.toLowerCase();
  return tool.matchTerms.some(
    (term) =>
      tagStr.includes(term.toLowerCase()) ||
      nameStr.includes(term.toLowerCase()) ||
      descStr.includes(term.toLowerCase())
  );
}

function buildMatrix(): Map<string, Resource[]> {
  const map = new Map<string, Resource[]>();
  for (const tool of DATA_TOOLS) {
    for (const type of RESOURCE_TYPES) {
      const key = `${tool.name}::${type}`;
      const matches = resources.filter(
        (r) => r.type === type && toolMatchesResource(tool, r)
      );
      map.set(key, matches);
    }
  }
  return map;
}

const MATRIX = buildMatrix();

// ── CSV export ────────────────────────────────────────────────────────────────

function downloadCSV() {
  const header = ["Tool", ...RESOURCE_TYPES.map((t) => TYPE_META[t].label)].join(",");
  const rows = DATA_TOOLS.map((tool) => {
    const counts = RESOURCE_TYPES.map((type) => {
      const key = `${tool.name}::${type}`;
      return MATRIX.get(key)?.length ?? 0;
    });
    return [tool.name, ...counts].join(",");
  });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "claude-hub-compatibility-matrix.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Cell component ────────────────────────────────────────────────────────────

interface CellProps {
  resources: Resource[];
  type: ResourceType;
  isActive: boolean;
  onClick: () => void;
}

function Cell({ resources: cellResources, type, isActive, onClick }: CellProps) {
  const meta = TYPE_META[type];
  const count = cellResources.length;
  const [hovered, setHovered] = useState(false);

  if (count === 0) {
    return (
      <td className="p-1.5 text-center align-middle">
        <div className="w-full h-12 rounded-lg flex items-center justify-center opacity-20">
          <span className="text-slate-700 text-xs">—</span>
        </div>
      </td>
    );
  }

  return (
    <td className="p-1.5 text-center align-middle relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full h-12 rounded-lg flex items-center justify-center gap-1.5 transition-all relative overflow-hidden"
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${meta.color}40, ${meta.color}20)`
            : hovered
            ? `linear-gradient(135deg, ${meta.color}28, ${meta.color}14)`
            : `linear-gradient(135deg, ${meta.color}18, ${meta.color}08)`,
          border: isActive
            ? `1.5px solid ${meta.color}80`
            : `1px solid ${meta.color}30`,
          boxShadow: isActive ? `0 0 12px ${meta.color}30` : undefined,
        }}
      >
        <span className="text-[11px] font-bold" style={{ color: meta.color }}>
          {count}
        </span>
        <span className="text-[10px]" style={{ color: meta.color + "cc" }}>
          {meta.icon}
        </span>
      </button>

      {/* Tooltip */}
      {hovered && cellResources.length > 0 && (
        <div
          className="absolute z-30 bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ minWidth: 180 }}
        >
          <div className="glass-card rounded-xl p-3 shadow-2xl text-left border border-white/10">
            <p className="text-[10px] font-semibold text-slate-300 mb-2">
              {count} resource{count !== 1 ? "s" : ""}
            </p>
            {cellResources.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-start gap-1.5 mb-1.5">
                <span className="text-[10px] mt-px">{TYPE_META[r.type].icon}</span>
                <span className="text-[10px] text-slate-300 leading-snug line-clamp-1">{r.name}</span>
              </div>
            ))}
            {cellResources.length > 5 && (
              <p className="text-[10px] text-slate-500 mt-1">+{cellResources.length - 5} more</p>
            )}
            <p className="text-[9px] text-slate-600 mt-2 border-t border-white/[0.06] pt-1.5">Click to open panel</p>
          </div>
        </div>
      )}
    </td>
  );
}

// ── Mini resource card for drawer ────────────────────────────────────────────

function DrawerResourceCard({ resource }: { resource: Resource }) {
  const meta = TYPE_META[resource.type];
  return (
    <Link
      href={`/resources/${resource.slug}`}
      className="block glass-card rounded-xl p-4 hover:bg-white/[0.06] transition-all group"
      style={{ borderColor: meta.border }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
          style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
        >
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
              {resource.name}
            </span>
            {resource.verified && <BadgeCheck size={12} className="shrink-0" style={{ color: meta.color }} />}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">{resource.tagline}</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Star size={10} />
              {resource.stars.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <GitFork size={10} />
              {resource.forks.toLocaleString()}
            </span>
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
              style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
            >
              {meta.label}
            </span>
          </div>
        </div>
        <ExternalLink size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-1" />
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface ActiveCell {
  tool: ToolName;
  type: ResourceType;
  resources: Resource[];
}

export default function MatrixPage() {
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [highlightedTools, setHighlightedTools] = useState<Set<ToolName>>(new Set());
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleCellClick = useCallback((tool: ToolName, type: ResourceType) => {
    const key = `${tool}::${type}`;
    const cellResources = MATRIX.get(key) ?? [];
    if (cellResources.length === 0) return;
    setActiveCell((prev) =>
      prev?.tool === tool && prev?.type === type ? null : { tool, type, resources: cellResources }
    );
  }, []);

  const toggleToolHighlight = (toolName: ToolName) => {
    setHighlightedTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolName)) {
        next.delete(toolName);
      } else {
        next.add(toolName);
      }
      return next;
    });
  };

  const closeDrawer = () => setActiveCell(null);

  // Click-outside to close drawer
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      closeDrawer();
    }
  };

  return (
    <div className="min-h-screen bg-[#030712]">
      <Nav />

      <main className="pt-24 pb-24">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📊</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                  Compatibility Matrix
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3 leading-tight">
                Data Tool{" "}
                <span className="gradient-text">Compatibility Matrix</span>
              </h1>
              <p className="text-slate-400 text-base max-w-xl leading-relaxed">
                Find Claude resources that work with your stack. Use Snowflake + dbt? See exactly which
                MCPs, skills, and agents are compatible.
              </p>
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all text-slate-300 text-sm font-medium shrink-0"
            >
              <Download size={14} />
              Download CSV
            </button>
          </div>

          {/* Tool filter chips */}
          <div className="mt-6">
            <p className="text-xs text-slate-500 mb-3 font-medium">Highlight tools:</p>
            <div className="flex flex-wrap gap-2">
              {DATA_TOOLS.map((tool) => {
                const active = highlightedTools.has(tool.name);
                return (
                  <button
                    key={tool.name}
                    onClick={() => toggleToolHighlight(tool.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                    style={{
                      borderColor: active ? "rgba(167,139,250,0.6)" : "rgba(255,255,255,0.08)",
                      background: active ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.03)",
                      color: active ? "#a78bfa" : "#64748b",
                    }}
                  >
                    <span>{tool.emoji}</span>
                    {tool.name}
                  </button>
                );
              })}
              {highlightedTools.size > 0 && (
                <button
                  onClick={() => setHighlightedTools(new Set())}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-slate-300 border border-white/[0.06] hover:border-white/[0.12] transition-all"
                >
                  <X size={11} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Matrix table — full width, horizontally scrollable */}
        <div
          className="relative"
          onClick={activeCell ? handleOverlayClick : undefined}
        >
          <div
            className="overflow-x-auto"
            style={{ paddingLeft: "max(1rem, calc((100vw - 80rem) / 2 + 1rem))", paddingRight: activeCell ? "400px" : "max(1rem, calc((100vw - 80rem) / 2 + 1rem))" }}
          >
            <table className="border-separate" style={{ borderSpacing: 0, minWidth: 900 }}>
              <thead>
                <tr>
                  {/* Corner cell */}
                  <th className="pb-3 pr-3 text-left align-bottom w-44 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Tool ↓ &nbsp; Type →
                    </span>
                  </th>
                  {RESOURCE_TYPES.map((type) => {
                    const meta = TYPE_META[type];
                    return (
                      <th key={type} className="pb-3 px-1.5 text-center align-bottom min-w-[90px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-lg">{meta.icon}</span>
                          <span
                            className="text-[11px] font-semibold"
                            style={{ color: meta.color }}
                          >
                            {meta.label}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {DATA_TOOLS.map((tool) => {
                  const isHighlighted = highlightedTools.size === 0 || highlightedTools.has(tool.name);
                  return (
                    <tr
                      key={tool.name}
                      className="transition-opacity"
                      style={{ opacity: isHighlighted ? 1 : 0.3 }}
                    >
                      {/* Tool name — sticky left */}
                      <td className="pr-4 py-1.5 align-middle">
                        <div className="flex items-center gap-2.5 w-44">
                          <span className="text-xl shrink-0">{tool.emoji}</span>
                          <div>
                            <p className="text-sm font-semibold text-slate-200 leading-tight">{tool.name}</p>
                            <p className="text-[10px] text-slate-600">
                              {RESOURCE_TYPES.reduce((acc, type) => {
                                const key = `${tool.name}::${type}`;
                                return acc + (MATRIX.get(key)?.length ?? 0);
                              }, 0)}{" "}
                              resources
                            </p>
                          </div>
                        </div>
                      </td>
                      {RESOURCE_TYPES.map((type) => {
                        const key = `${tool.name}::${type}`;
                        const cellResources = MATRIX.get(key) ?? [];
                        const isActive =
                          activeCell?.tool === tool.name && activeCell?.type === type;
                        return (
                          <Cell
                            key={type}
                            resources={cellResources}
                            type={type}
                            isActive={isActive}
                            onClick={() => handleCellClick(tool.name, type)}
                          />
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary row */}
          <div
            className="mt-4 overflow-x-auto"
            style={{ paddingLeft: "max(1rem, calc((100vw - 80rem) / 2 + 1rem))", paddingRight: activeCell ? "400px" : "max(1rem, calc((100vw - 80rem) / 2 + 1rem))" }}
          >
            <div className="flex items-center gap-2" style={{ minWidth: 900 }}>
              <div className="w-44 pr-4">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Totals</span>
              </div>
              {RESOURCE_TYPES.map((type) => {
                const meta = TYPE_META[type];
                const total = DATA_TOOLS.reduce((acc, tool) => {
                  const key = `${tool.name}::${type}`;
                  return acc + (MATRIX.get(key)?.length ?? 0);
                }, 0);
                return (
                  <div key={type} className="flex-1 min-w-[90px] px-1.5 text-center">
                    <span className="text-xs font-bold" style={{ color: meta.color }}>
                      {total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">How it works</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm text-slate-400">
              <div>
                <p className="text-slate-200 font-medium mb-1">Tag matching</p>
                <p className="text-xs leading-relaxed text-slate-500">
                  Resources are matched when their tags, name, or description mention the tool name (case-insensitive).
                </p>
              </div>
              <div>
                <p className="text-slate-200 font-medium mb-1">Click a cell</p>
                <p className="text-xs leading-relaxed text-slate-500">
                  Click any colored cell to open a side panel listing all matching resources for that tool + type combination.
                </p>
              </div>
              <div>
                <p className="text-slate-200 font-medium mb-1">Filter chips</p>
                <p className="text-xs leading-relaxed text-slate-500">
                  Use the tool chips above to highlight specific tools in your stack and dim the rest.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Drawer */}
      {activeCell && (
        <>
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Drawer panel */}
          <div
            ref={drawerRef}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-[#030712] border-l border-white/[0.08] shadow-2xl"
            style={{ width: 380 }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">
                  {DATA_TOOLS.find((t) => t.name === activeCell.tool)?.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100 leading-tight truncate">
                    {activeCell.tool}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        color: TYPE_META[activeCell.type].color,
                        background: TYPE_META[activeCell.type].bg,
                        border: `1px solid ${TYPE_META[activeCell.type].border}`,
                      }}
                    >
                      {TYPE_META[activeCell.type].icon} {TYPE_META[activeCell.type].label}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {activeCell.resources.length} resource{activeCell.resources.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeCell.resources.map((r) => (
                <DrawerResourceCard key={r.id} resource={r} />
              ))}
            </div>

            {/* Drawer footer */}
            <div className="p-4 border-t border-white/[0.06] shrink-0">
              <Link
                href={`/explore?type=${activeCell.type}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.14] transition-all"
              >
                Browse all {TYPE_META[activeCell.type].label}s
                <ExternalLink size={11} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
