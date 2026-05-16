"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Search, X } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import ResourceCard from "@/components/resource-card";
import ResourceOfDay from "@/components/resource-of-day";
import { RESOURCES } from "@/lib/resources";
import { ResourceType, UseCase, SortMode, TYPE_META } from "@/lib/types";
import { localSearch } from "@/lib/search";

const USE_CASE_LABELS: Record<UseCase, string> = {
  "data-engineering": "Data Engineering",
  "data-science": "Data Science",
  analytics: "Analytics",
  "ml-engineering": "ML Engineering",
  "data-ops": "DataOps",
  sql: "SQL",
  python: "Python",
  productivity: "Productivity",
};

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "hot", label: "Hot" },
  { id: "new", label: "New" },
  { id: "top", label: "Top rated" },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") as ResourceType | null;

  const [searchOpen, setSearchOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ResourceType | null>(initialType);
  const [useCaseFilter, setUseCaseFilter] = useState<UseCase | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("trending");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(24);

  useEffect(() => { setDisplayCount(24); }, [query, typeFilter, useCaseFilter, sortMode]);

  const filtered = useMemo(() => {
    let list = RESOURCES;

    if (query.trim()) {
      list = localSearch(query);
    }

    if (typeFilter) {
      list = list.filter((r) => r.type === typeFilter);
    }

    if (useCaseFilter) {
      list = list.filter((r) => r.useCases.includes(useCaseFilter));
    }

    switch (sortMode) {
      case "trending":
        return [...list].sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || b.weeklyViews - a.weeklyViews);
      case "hot":
        return [...list].sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || b.weeklyViews - a.weeklyViews);
      case "new":
        return [...list].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      case "top":
        return [...list].sort((a, b) => b.stars - a.stars);
    }
  }, [query, typeFilter, useCaseFilter, sortMode]);

  const displayed = filtered.slice(0, displayCount);

  const types = Object.entries(TYPE_META) as [ResourceType, typeof TYPE_META[ResourceType]][];

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Explore resources</h1>
          <p className="text-slate-400 text-sm">{displayed.length} of {filtered.length} resources</p>
        </div>

        <ResourceOfDay />

        {/* Search + filter bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-colors">
            <Search size={14} className="text-slate-500 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter resources..."
              className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 text-sm outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.07]">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortMode(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortMode === opt.id ? "bg-white/[0.1] text-slate-100" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
              showFilters
                ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-300"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {(typeFilter || useCaseFilter) && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            )}
          </button>
        </div>

        {/* Filter panels */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] space-y-4">
                {/* Type filter */}
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Type</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setTypeFilter(null)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                        !typeFilter
                          ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                          : "bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      All
                    </button>
                    {types.map(([type, meta]) => (
                      <button
                        key={type}
                        onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-all ${
                          typeFilter === type
                            ? "text-white"
                            : "bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-slate-200"
                        }`}
                        style={
                          typeFilter === type
                            ? { background: meta.bg, borderColor: meta.border, color: meta.color }
                            : {}
                        }
                      >
                        {meta.icon} {meta.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Use case filter */}
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Use case</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setUseCaseFilter(null)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                        !useCaseFilter
                          ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                          : "bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      All
                    </button>
                    {(Object.entries(USE_CASE_LABELS) as [UseCase, string][]).map(([uc, label]) => (
                      <button
                        key={uc}
                        onClick={() => setUseCaseFilter(useCaseFilter === uc ? null : uc)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                          useCaseFilter === uc
                            ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                            : "bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-sm">No resources match your filters.</div>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {displayed.map((resource, i) => (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                >
                  <ResourceCard resource={resource} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        {filtered.length > displayCount && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
            <button
              onClick={() => setDisplayCount((c) => c + 24)}
              className="px-6 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] text-slate-400 hover:text-slate-200 text-sm transition-all"
            >
              Load more ({filtered.length - displayCount} remaining)
            </button>
          </motion.div>
        )}
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreContent />
    </Suspense>
  );
}
