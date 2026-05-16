"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, ArrowRight, Clock, Tag, Terminal } from "lucide-react";
import { Resource, ResourceType, TYPE_META } from "@/lib/types";
import { localSearch, suggestSearch } from "@/lib/search";
import { RESOURCES } from "@/lib/resources";
import Link from "next/link";
import { useRouter } from "next/navigation";

const HISTORY_KEY = "ch-search-history";
const MAX_HISTORY = 8;

function loadHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveToHistory(query: string) {
  const q = query.trim();
  if (!q) return;
  try {
    const prev = loadHistory();
    const next = [q, ...prev.filter((h) => h.toLowerCase() !== q.toLowerCase())].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_PICKS = [
  "Snowflake MCP",
  "dbt debug skill",
  "SQL query optimization",
  "data pipeline agent",
  "DuckDB local analytics",
  "anomaly detection",
  "ETL migration agent",
  "data quality checks",
];

// Command palette definitions
interface Command {
  id: string;
  label: string;
  description: string;
  route: string;
}

const COMMANDS: Command[] = [
  { id: "explore",   label: "explore",   description: "Browse all resources",          route: "/explore" },
  { id: "stacks",    label: "stacks",    description: "Curated resource stacks",        route: "/stacks" },
  { id: "random",    label: "random",    description: "Go to a random resource",        route: "/random" },
  { id: "saved",     label: "saved",     description: "Your saved resources",           route: "/saved" },
  { id: "graph",     label: "graph",     description: "Resource relationship graph",    route: "/graph" },
  { id: "battle",    label: "battle",    description: "Resource head-to-head battle",   route: "/battle" },
  { id: "build",     label: "build",     description: "Build your stack",               route: "/build" },
  { id: "stats",     label: "stats",     description: "Platform statistics",            route: "/stats" },
  { id: "weekly",    label: "weekly",    description: "Weekly digest",                  route: "/weekly" },
  { id: "compare",   label: "compare",   description: "Compare resources side by side", route: "/compare" },
  { id: "changelog", label: "changelog", description: "What's new",                    route: "/changelog" },
  { id: "wishlist",  label: "wishlist",  description: "Your wishlist",                  route: "/wishlist" },
  { id: "matrix",    label: "matrix",    description: "Compatibility matrix",           route: "/matrix" },
  { id: "paths",     label: "paths",     description: "Learning paths",                 route: "/paths" },
];

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Resource[]>([]);
  const [aiResults, setAiResults] = useState<Resource[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [typeFilter, setTypeFilter] = useState<ResourceType | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const featured = RESOURCES.filter((r) => r.featured).slice(0, 4);

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // --- Command palette state ---
  const isCommandMode = query.startsWith(">");
  const commandFilter = isCommandMode ? query.slice(1).trim().toLowerCase() : "";
  const filteredCommands = isCommandMode
    ? COMMANDS.filter((c) => c.label.includes(commandFilter) || c.description.toLowerCase().includes(commandFilter))
    : [];

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("ch-recently-viewed") || "[]");
      setRecentlyViewed(stored.slice(0, 4));
    } catch { /* ignore */ }
    setSearchHistory(loadHistory());
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setAiResults([]);
      setSelectedIdx(0);
      setTypeFilter(null);
    }
  }, [open]);

  // Compute displayResults outside the handler so we can reference them inside
  const baseResults = aiResults.length > 0 ? aiResults : results;
  const displayResults = typeFilter
    ? baseResults.filter((r) => r.type === typeFilter)
    : baseResults;

  // Did you mean
  const suggestions: Resource[] =
    !isCommandMode && query.length > 2 && displayResults.length === 0 && !aiLoading
      ? suggestSearch(query)
      : [];

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();

      if (isCommandMode) {
        const list = filteredCommands;
        if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, list.length - 1)); }
        if (e.key === "ArrowUp")   { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
        if (e.key === "Enter" && list[selectedIdx]) {
          e.preventDefault();
          router.push(list[selectedIdx].route);
          onClose();
        }
      } else {
        if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, displayResults.length - 1)); }
        if (e.key === "ArrowUp")   { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
        if (e.key === "Enter" && query.trim()) {
          saveToHistory(query);
          setSearchHistory(loadHistory());
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose, query, selectedIdx, isCommandMode, filteredCommands, displayResults]);

  const handleQuery = useCallback((q: string) => {
    setQuery(q);
    setSelectedIdx(0);
    if (!q.trim() || q.startsWith(">")) {
      setResults([]);
      setAiResults([]);
      return;
    }
    const local = localSearch(q);
    setResults(local.slice(0, 6));

    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    if (q.length > 3) {
      setAiLoading(true);
      aiDebounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: q }),
          });
          if (res.ok) {
            const data = await res.json();
            setAiResults(data.results || []);
          }
        } catch {
          // fall back to local
        } finally {
          setAiLoading(false);
        }
      }, 500);
    }
  }, []);

  // Tag suggestions: find tags across all resources matching query prefix
  const tagSuggestions: string[] = (() => {
    if (!query.trim() || isCommandMode) return [];
    const q = query.toLowerCase();
    const allTags = new Set<string>();
    RESOURCES.forEach((r) => r.tags.forEach((t) => allTags.add(t)));
    return Array.from(allTags)
      .filter((t) => t.toLowerCase().includes(q))
      .slice(0, 3);
  })();

  const handleResultClick = (q: string) => {
    if (q.trim()) saveToHistory(q);
    onClose();
  };

  const handleHistorySearch = (h: string) => {
    handleQuery(h);
  };

  const removeHistoryItem = (item: string) => {
    const next = searchHistory.filter((h) => h !== item);
    setSearchHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch { /* ignore */ }
  };

  const TYPE_CHIPS: { label: string; value: ResourceType | null }[] = [
    { label: "All", value: null },
    { label: "MCPs", value: "mcp" },
    { label: "Skills", value: "skill" },
    { label: "Agents", value: "agent" },
    { label: "Prompts", value: "prompt" },
    { label: "Architectures", value: "architecture" },
    { label: "Setups", value: "setup" },
    { label: "Hooks", value: "hook" },
    { label: "Tricks", value: "trick" },
  ];

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 search-backdrop"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-[#0c0f1a] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Search input */}
          <div className={`flex items-center gap-3 px-4 py-4 border-b border-white/[0.07] ${isCommandMode ? "bg-emerald-950/20" : ""}`}>
            {isCommandMode ? (
              <Terminal size={18} className="text-emerald-400 shrink-0" />
            ) : (
              <Search size={18} className="text-slate-500 shrink-0" />
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder={isCommandMode ? "Type a command..." : "Search resources, ask naturally..."}
              className={`flex-1 bg-transparent text-sm outline-none ${
                isCommandMode ? "text-emerald-300 placeholder-emerald-700 font-mono" : "text-slate-100 placeholder-slate-500"
              }`}
            />
            {aiLoading && !isCommandMode && (
              <div className="flex items-center gap-1.5 text-xs text-violet-400">
                <Sparkles size={12} className="animate-pulse" />
                AI
              </div>
            )}
            {isCommandMode && (
              <span className="text-[10px] text-emerald-600 font-mono shrink-0">COMMAND MODE</span>
            )}
            <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Type filter chips — only in normal mode */}
          {query && !isCommandMode && (
            <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {TYPE_CHIPS.map((chip) => {
                const isActive = typeFilter === chip.value;
                const meta = chip.value ? TYPE_META[chip.value] : null;
                return (
                  <button
                    key={chip.label}
                    onClick={() => setTypeFilter(chip.value)}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all"
                    style={
                      isActive && meta
                        ? { background: meta.bg, borderColor: meta.border, color: meta.color }
                        : isActive && !meta
                        ? { background: "rgba(139,92,246,0.15)", borderColor: "rgba(139,92,246,0.3)", color: "#a78bfa" }
                        : { background: "transparent", borderColor: "rgba(255,255,255,0.07)", color: "#64748b" }
                    }
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Results / empty state */}
          <div className="max-h-[60vh] overflow-y-auto">

            {/* ── COMMAND PALETTE MODE ── */}
            {isCommandMode && (
              <div className="p-2">
                <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-emerald-500 font-mono">
                  <Terminal size={11} />
                  {filteredCommands.length > 0 ? `${filteredCommands.length} command${filteredCommands.length !== 1 ? "s" : ""}` : "No matching commands"}
                </div>
                {filteredCommands.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    onClick={() => { router.push(cmd.route); onClose(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                      i === selectedIdx ? "bg-emerald-900/30 border border-emerald-700/30" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-emerald-400 font-mono text-sm shrink-0">&gt;</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-emerald-300 font-mono text-sm">{cmd.label}</span>
                      <span className="text-slate-500 text-xs ml-2">{cmd.description}</span>
                    </div>
                    <span className="text-emerald-700 text-[10px] font-mono shrink-0">{cmd.route}</span>
                    <ArrowRight size={12} className="text-emerald-700 shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* ── NORMAL SEARCH MODE ── */}
            {!isCommandMode && (
              <>
                {!query && (
                  <div className="p-4">
                    <div className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">Featured</div>
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {featured.map((r) => {
                        const meta = TYPE_META[r.type];
                        return (
                          <Link
                            key={r.id}
                            href={`/resources/${r.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group"
                          >
                            <span
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                              style={{ background: meta.bg }}
                            >
                              {meta.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-slate-200 truncate">{r.name}</div>
                              <div className="text-[10px] text-slate-500 truncate">{r.tagline}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    {recentlyViewed.length > 0 && (
                      <div className="mb-5">
                        <div className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">Recently viewed</div>
                        <div className="space-y-1">
                          {recentlyViewed.map((slug) => {
                            const r = RESOURCES.find((res) => res.slug === slug);
                            if (!r) return null;
                            const meta = TYPE_META[r.type];
                            return (
                              <Link key={slug} href={`/resources/${r.slug}`} onClick={onClose}
                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.04] transition-colors group">
                                <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0" style={{ background: meta.bg }}>{meta.icon}</span>
                                <span className="text-xs text-slate-300 truncate">{r.name}</span>
                                <span className="text-[10px] text-slate-600 ml-auto">{meta.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {searchHistory.length > 0 && (
                      <div className="mb-5">
                        <div className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">Recent searches</div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {searchHistory.map((h) => (
                            <div key={h} className="flex items-center gap-0.5">
                              <button
                                onClick={() => handleHistorySearch(h)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] transition-all"
                              >
                                <Clock size={10} />
                                {h}
                              </button>
                              <button
                                onClick={() => removeHistoryItem(h)}
                                className="p-1 text-slate-600 hover:text-slate-400 transition-colors"
                                aria-label={`Remove "${h}" from history`}
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={clearHistory}
                          className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
                        >
                          Clear history
                        </button>
                      </div>
                    )}
                    <div className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">Quick searches</div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PICKS.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleQuery(q)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] transition-all"
                        >
                          <Clock size={10} />
                          {q}
                        </button>
                      ))}
                    </div>
                    {/* Command hint */}
                    <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center gap-1.5 text-[11px] text-slate-600">
                      <Terminal size={11} />
                      Type <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-[10px] text-slate-500">&gt;</kbd> for commands
                    </div>
                  </div>
                )}

                {query && displayResults.length === 0 && !aiLoading && suggestions.length === 0 && tagSuggestions.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="text-slate-500 text-sm">No results for &quot;{query}&quot;</div>
                    <div className="text-slate-600 text-xs mt-1">Try different keywords or explore all resources</div>
                  </div>
                )}

                {aiLoading && query.length > 3 && results.length === 0 && (
                  <div className="p-2 space-y-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl">
                        <div className="w-8 h-8 rounded-lg shimmer shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-32 rounded shimmer" />
                          <div className="h-2.5 w-48 rounded shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {query && displayResults.length > 0 && (
                  <div className="p-2">
                    {aiResults.length > 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-violet-400">
                        <Sparkles size={11} />
                        AI-powered results
                      </div>
                    )}
                    {displayResults.map((r, i) => {
                      const meta = TYPE_META[r.type];
                      return (
                        <Link
                          key={r.id}
                          href={`/resources/${r.slug}`}
                          onClick={() => handleResultClick(query)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                            i === selectedIdx ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
                          }`}
                        >
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                            style={{ background: meta.bg }}
                          >
                            {meta.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-100 truncate">{r.name}</div>
                            <div className="text-xs text-slate-500 truncate">{r.tagline}</div>
                          </div>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                          <ArrowRight size={12} className="text-slate-600 shrink-0" />
                        </Link>
                      );
                    })}
                    {tagSuggestions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/[0.05]">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500">
                          <Tag size={11} />
                          Tag suggestions
                        </div>
                        {tagSuggestions.map((tag) => (
                          <Link
                            key={tag}
                            href={`/explore?q=${encodeURIComponent(tag)}`}
                            onClick={() => handleResultClick(tag)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors"
                          >
                            <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-white/[0.06]">
                              <Tag size={11} className="text-slate-400" />
                            </span>
                            <span className="text-xs text-slate-400">
                              Search for tag: <span className="text-slate-200 font-medium">{tag}</span>
                            </span>
                            <ArrowRight size={11} className="text-slate-600 ml-auto shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Did you mean? */}
                {query.length > 2 && displayResults.length === 0 && !aiLoading && suggestions.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-500/80">
                      <Sparkles size={11} />
                      Did you mean:
                    </div>
                    {suggestions.map((r) => {
                      const meta = TYPE_META[r.type];
                      return (
                        <Link
                          key={r.id}
                          href={`/resources/${r.slug}`}
                          onClick={() => handleResultClick(r.name)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
                        >
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                            style={{ background: meta.bg }}
                          >
                            {meta.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-200 truncate">{r.name}</div>
                            <div className="text-xs text-slate-500 truncate">{r.tagline}</div>
                          </div>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            {meta.label}
                          </span>
                          <ArrowRight size={12} className="text-slate-600 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Tag suggestions when no results */}
                {query && displayResults.length === 0 && !aiLoading && suggestions.length === 0 && tagSuggestions.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500">
                      <Tag size={11} />
                      Tag suggestions
                    </div>
                    {tagSuggestions.map((tag) => (
                      <Link
                        key={tag}
                        href={`/explore?q=${encodeURIComponent(tag)}`}
                        onClick={() => handleResultClick(tag)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors"
                      >
                        <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-white/[0.06]">
                          <Tag size={11} className="text-slate-400" />
                        </span>
                        <span className="text-xs text-slate-400">
                          Search for tag: <span className="text-slate-200 font-medium">{tag}</span>
                        </span>
                        <ArrowRight size={11} className="text-slate-600 ml-auto shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-slate-600">
              {isCommandMode ? (
                <>
                  <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> select</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono">esc</kbd> close</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> open</span>
                  <span className="flex items-center gap-1"><kbd className="font-mono">esc</kbd> close</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-600">
              {isCommandMode ? (
                <>
                  <Terminal size={10} className="text-emerald-700" />
                  <span className="text-emerald-800">command mode</span>
                </>
              ) : (
                <>
                  <Sparkles size={10} />
                  <span>AI search</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
