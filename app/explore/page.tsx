"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Search, X, Database, TrendingUp, Award, Star } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import ResourceCard from "@/components/resource-card";
import ResourceOfDay from "@/components/resource-of-day";
import CompareTray from "@/components/compare-tray";
import { RESOURCES } from "@/lib/resources";
import { Resource, ResourceType, UseCase, SortMode, TYPE_META, Complexity } from "@/lib/types";
import { localSearch } from "@/lib/search";
import { qualityScore } from "@/lib/score";

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
  { id: "quality", label: "Quality" },
];

const COMPLEXITY_OPTIONS: { id: Complexity; label: string; color: string; bg: string; border: string }[] = [
  { id: "beginner", label: "Beginner", color: "#34d399", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.35)" },
  { id: "intermediate", label: "Intermediate", color: "#facc15", bg: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.35)" },
  { id: "advanced", label: "Advanced", color: "#f87171", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.35)" },
];

const STARS_OPTIONS: { label: string; value: number }[] = [
  { label: "1k+", value: 1000 },
  { label: "5k+", value: 5000 },
  { label: "10k+", value: 10000 },
  { label: "50k+", value: 50000 },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") as ResourceType | null;

  const [searchOpen, setSearchOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ResourceType | null>(initialType);
  const [useCaseFilter, setUseCaseFilter] = useState<UseCase | null>(null);
  const [complexityFilter, setComplexityFilter] = useState<Complexity | null>(null);
  const [starsFilter, setStarsFilter] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("trending");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(24);
  const [compareList, setCompareList] = useState<Resource[]>([]);

  useEffect(() => {
    setDisplayCount(24);
  }, [query, typeFilter, useCaseFilter, complexityFilter, starsFilter, sortMode]);

  const handleCompare = useCallback((r: Resource) => {
    setCompareList((prev) => {
      const already = prev.find((x) => x.id === r.id);
      if (already) {
        return prev.filter((x) => x.id !== r.id);
      }
      if (prev.length >= 2) {
        return [prev[1], r];
      }
      return [...prev, r];
    });
  }, []);

  const handleRemoveCompare = useCallback((id: string) => {
    setCompareList((prev) => prev.filter((x) => x.id !== id));
  }, []);

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

    if (complexityFilter) {
      list = list.filter((r) => r.complexity === complexityFilter);
    }

    if (starsFilter) {
      list = list.filter((r) => r.stars >= starsFilter);
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
      case "quality":
        return [...list].sort((a, b) => qualityScore(b) - qualityScore(a));
    }
  }, [query, typeFilter, useCaseFilter, complexityFilter, starsFilter, sortMode]);

  const displayed = filtered.slice(0, displayCount);

  const types = Object.entries(TYPE_META) as [ResourceType, typeof TYPE_META[ResourceType]][];

  // Stats bar calculations
  const totalResources = RESOURCES.length;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const addedThisMonth = RESOURCES.filter((r) => {
    const t = new Date(r.lastUpdated).getTime();
    return !isNaN(t) && t >= thirtyDaysAgo;
  }).length;
  const typeCounts = RESOURCES.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  const mostPopularType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  const mostStarred = [...RESOURCES].sort((a, b) => b.stars - a.stars)[0];

  const STATS = [
    {
      icon: Database,
      value: totalResources.toString(),
      label: "Total resources",
      color: "#a78bfa",
    },
    {
      icon: TrendingUp,
      value: addedThisMonth > 0 ? `+${addedThisMonth}` : "—",
      label: "Added this month",
      color: "#34d399",
    },
    {
      icon: Award,
      value: mostPopularType ? TYPE_META[mostPopularType[0] as ResourceType].label : "—",
      label: "Most popular type",
      color: "#60a5fa",
    },
    {
      icon: Star,
      value: mostStarred ? mostStarred.name : "—",
      label: "Most starred",
      color: "#fb923c",
      truncate: true,
    },
  ] as const;

  // Active filter chips
  const activeFilterCount = [typeFilter, useCaseFilter, complexityFilter, starsFilter].filter(Boolean).length;

  const activeChips: { key: string; label: string; onClear: () => void }[] = [];
  if (typeFilter) {
    activeChips.push({
      key: "type",
      label: `Type: ${TYPE_META[typeFilter].label}`,
      onClear: () => setTypeFilter(null),
    });
  }
  if (useCaseFilter) {
    activeChips.push({
      key: "usecase",
      label: `Use: ${USE_CASE_LABELS[useCaseFilter]}`,
      onClear: () => setUseCaseFilter(null),
    });
  }
  if (complexityFilter) {
    const cx = COMPLEXITY_OPTIONS.find((c) => c.id === complexityFilter);
    activeChips.push({
      key: "complexity",
      label: `Complexity: ${cx?.label ?? complexityFilter}`,
      onClear: () => setComplexityFilter(null),
    });
  }
  if (starsFilter) {
    const opt = STARS_OPTIONS.find((o) => o.value === starsFilter);
    activeChips.push({
      key: "stars",
      label: `Stars: ${opt?.label ?? `${starsFilter}+`}`,
      onClear: () => setStarsFilter(null),
    });
  }

  const clearAll = () => {
    setTypeFilter(null);
    setUseCaseFilter(null);
    setComplexityFilter(null);
    setStarsFilter(null);
  };

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Explore resources</h1>
          <p className="text-slate-400 text-sm">{displayed.length} of {filtered.length} resources</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="glass-card rounded-2xl p-4 flex items-start gap-3"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <div
                  className="p-2 rounded-xl shrink-0"
                  style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}
                >
                  <Icon size={14} style={{ color: stat.color }} />
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-base font-bold leading-tight mb-0.5 ${(stat as { truncate?: boolean }).truncate ? "truncate" : ""}`}
                    style={{ color: stat.color }}
                    title={(stat as { truncate?: boolean }).truncate ? stat.value : undefined}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <ResourceOfDay />

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-colors">
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

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.07] overflow-x-auto">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortMode(opt.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortMode === opt.id ? "bg-white/[0.1] text-slate-100" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all shrink-0 ${
                showFilters
                  ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-300"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </button>
          </div>
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

                {/* Complexity filter */}
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Complexity</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setComplexityFilter(null)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                        !complexityFilter
                          ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                          : "bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      All
                    </button>
                    {COMPLEXITY_OPTIONS.map((cx) => (
                      <button
                        key={cx.id}
                        onClick={() => setComplexityFilter(complexityFilter === cx.id ? null : cx.id)}
                        className="px-3 py-1.5 rounded-full text-xs border transition-all"
                        style={
                          complexityFilter === cx.id
                            ? { background: cx.bg, borderColor: cx.border, color: cx.color }
                            : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "#94a3b8" }
                        }
                      >
                        {cx.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stars filter */}
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Stars</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setStarsFilter(null)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                        !starsFilter
                          ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                          : "bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      All
                    </button>
                    {STARS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setStarsFilter(starsFilter === opt.value ? null : opt.value)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                          starsFilter === opt.value
                            ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                            : "bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips */}
        <AnimatePresence>
          {activeChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap items-center gap-2 mb-5"
            >
              {activeChips.map((chip) => (
                <motion.div
                  key={chip.key}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white/[0.06] border border-white/[0.1] text-slate-300"
                >
                  <span>{chip.label}</span>
                  <button
                    onClick={chip.onClear}
                    className="text-slate-500 hover:text-slate-200 transition-colors ml-0.5"
                    aria-label={`Clear ${chip.label} filter`}
                  >
                    <X size={11} />
                  </button>
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                onClick={clearAll}
                className="px-2.5 py-1 rounded-full text-xs text-slate-500 hover:text-slate-300 border border-white/[0.07] hover:border-white/[0.14] transition-all"
              >
                Clear all
              </motion.button>
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
                  <ResourceCard
                    resource={resource}
                    onCompare={handleCompare}
                    inCompare={compareList.some((x) => x.id === resource.id)}
                  />
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
      <CompareTray
        resources={compareList}
        onRemove={handleRemoveCompare}
        onClear={() => setCompareList([])}
      />
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
