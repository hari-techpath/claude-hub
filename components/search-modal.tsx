"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, ArrowRight, Clock } from "lucide-react";
import { Resource, TYPE_META } from "@/lib/types";
import { localSearch } from "@/lib/search";
import { RESOURCES } from "@/lib/resources";
import Link from "next/link";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_PICKS = [
  "PostgreSQL MCP",
  "code review agent",
  "extended thinking",
  "data pipeline prompts",
  "git hooks",
  "CI/CD setup",
];

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Resource[]>([]);
  const [aiResults, setAiResults] = useState<Resource[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const featured = RESOURCES.filter((r) => r.featured).slice(0, 4);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setAiResults([]);
      setSelectedIdx(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setSelectedIdx((i) => Math.min(i + 1, displayResults.length - 1));
      if (e.key === "ArrowUp") setSelectedIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleQuery = useCallback((q: string) => {
    setQuery(q);
    setSelectedIdx(0);
    if (!q.trim()) {
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

  const displayResults = aiResults.length > 0 ? aiResults : results;

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
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.07]">
            <Search size={18} className="text-slate-500 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Search resources, ask naturally..."
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm outline-none"
            />
            {aiLoading && (
              <div className="flex items-center gap-1.5 text-xs text-violet-400">
                <Sparkles size={12} className="animate-pulse" />
                AI
              </div>
            )}
            <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Results / empty state */}
          <div className="max-h-[60vh] overflow-y-auto">
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
              </div>
            )}

            {query && displayResults.length === 0 && !aiLoading && (
              <div className="p-8 text-center">
                <div className="text-slate-500 text-sm">No results for "{query}"</div>
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
                      onClick={onClose}
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
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-slate-600">
              <span className="flex items-center gap-1"><kbd className="font-mono">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> open</span>
              <span className="flex items-center gap-1"><kbd className="font-mono">esc</kbd> close</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-600">
              <Sparkles size={10} />
              <span>AI search</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
