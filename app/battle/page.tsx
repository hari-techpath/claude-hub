"use client";

import { useState, useEffect, useCallback } from "react";
import { Swords, Star, SkipForward, RotateCcw, Trophy, TrendingUp } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import { resources } from "@/lib/resources";
import { Resource, TYPE_META } from "@/lib/types";

// ── Types ──────────────────────────────────────────────────────────────────

type Scores = Record<string, number>;
type CompCount = Record<string, number>;

interface BattleState {
  scores: Scores;
  comparisons: CompCount;
  totalVotes: number;
}

const STORAGE_KEY = "ch-battle-scores";
const INITIAL_SCORE = 1000;
const ELO_K = 32;

// ── Elo helpers ────────────────────────────────────────────────────────────

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function updateElo(winnerScore: number, loserScore: number): [number, number] {
  const expectedWin = expectedScore(winnerScore, loserScore);
  const newWinner = Math.round(winnerScore + ELO_K * (1 - expectedWin));
  const newLoser = Math.round(loserScore + ELO_K * (0 - (1 - expectedWin)));
  return [newWinner, newLoser];
}

// ── Storage helpers ────────────────────────────────────────────────────────

function loadState(): BattleState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BattleState;
  } catch {
    // ignore
  }
  const scores: Scores = {};
  const comparisons: CompCount = {};
  resources.forEach((r) => {
    scores[r.slug] = INITIAL_SCORE;
    comparisons[r.slug] = 0;
  });
  return { scores, comparisons, totalVotes: 0 };
}

function saveState(state: BattleState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// ── Pair selection ─────────────────────────────────────────────────────────

function selectPair(
  state: BattleState,
  seenPairs: Set<string>
): [Resource, Resource] | null {
  // Group resources by type
  const byType: Record<string, Resource[]> = {};
  resources.forEach((r) => {
    if (!byType[r.type]) byType[r.type] = [];
    byType[r.type].push(r);
  });

  // Collect all valid same-type pairs (min 2 per type)
  const validTypes = Object.keys(byType).filter((t) => byType[t].length >= 2);
  if (validTypes.length === 0) return null;

  // Shuffle types so we don't always pick the same type
  const shuffledTypes = [...validTypes].sort(() => Math.random() - 0.5);

  for (const type of shuffledTypes) {
    const pool = byType[type];

    // Weight by fewer comparisons
    const weighted: Resource[] = [];
    pool.forEach((r) => {
      const count = state.comparisons[r.slug] ?? 0;
      const weight = Math.max(1, 5 - count); // more weight for fewer comparisons
      for (let i = 0; i < weight; i++) weighted.push(r);
    });

    // Shuffle weighted pool
    const shuffled = [...weighted].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i++) {
      for (let j = i + 1; j < shuffled.length; j++) {
        const a = shuffled[i];
        const b = shuffled[j];
        if (a.slug === b.slug) continue;
        const pairKey = [a.slug, b.slug].sort().join("|");
        if (!seenPairs.has(pairKey)) {
          return [a, b];
        }
      }
    }
  }

  // All same-type pairs seen — clear seen and try again with cross-type
  const allRes = [...resources].sort(() => Math.random() - 0.5);
  for (let i = 0; i < allRes.length; i++) {
    for (let j = i + 1; j < allRes.length; j++) {
      return [allRes[i], allRes[j]];
    }
  }

  return null;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

type AnimState = "idle" | "winner" | "loser";

interface BattleCardProps {
  resource: Resource;
  animState: AnimState;
  onClick: () => void;
}

function BattleCard({ resource, animState, onClick }: BattleCardProps) {
  const meta = TYPE_META[resource.type];

  const cardClass = [
    "relative flex flex-col gap-4 p-6 rounded-2xl border cursor-pointer select-none",
    "transition-all duration-500",
    animState === "idle"
      ? "hover:scale-[1.02] hover:shadow-2xl"
      : animState === "winner"
      ? "scale-[1.05] shadow-[0_0_60px_rgba(139,92,246,0.5)] border-violet-400/60 bg-violet-500/10"
      : "scale-[0.96] opacity-30",
  ].join(" ");

  return (
    <button
      onClick={onClick}
      disabled={animState !== "idle"}
      className={cardClass}
      style={{
        background:
          animState === "winner"
            ? "rgba(139,92,246,0.12)"
            : "var(--surface)",
        borderColor:
          animState === "winner"
            ? "rgba(167,139,250,0.5)"
            : animState === "loser"
            ? "rgba(255,255,255,0.04)"
            : meta.border,
      }}
    >
      {/* Winner crown */}
      {animState === "winner" && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-3xl animate-bounce pointer-events-none">
          👑
        </div>
      )}

      {/* Type badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
        >
          <span>{meta.icon}</span>
          {meta.label}
        </span>
        {resource.verified && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400">
            ✓ Verified
          </span>
        )}
      </div>

      {/* Name + tagline */}
      <div>
        <h3 className="text-lg font-bold text-slate-100 mb-1 text-left leading-tight">
          {resource.name}
        </h3>
        <p className="text-sm text-slate-400 text-left leading-relaxed line-clamp-2">
          {resource.tagline}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {resource.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="tag-pill">{tag}</span>
        ))}
      </div>

      {/* Stars */}
      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-white/[0.06]">
        <span className="flex items-center gap-1.5 text-sm text-slate-400">
          <Star size={13} className="text-yellow-500/80" />
          {formatNumber(resource.stars)}
        </span>
        <span className="text-xs text-slate-600">{resource.complexity}</span>
      </div>

      {/* Click hint */}
      {animState === "idle" && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <span className="px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-semibold backdrop-blur-sm">
            Choose this
          </span>
        </div>
      )}
    </button>
  );
}

interface LeaderboardEntry {
  resource: Resource;
  score: number;
  comparisons: number;
}

function Leaderboard({ state, title }: { state: BattleState; title: string }) {
  const entries: LeaderboardEntry[] = resources
    .map((r) => ({
      resource: r,
      score: state.scores[r.slug] ?? INITIAL_SCORE,
      comparisons: state.comparisons[r.slug] ?? 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={16} className="text-yellow-400" />
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      </div>
      <div className="space-y-2">
        {entries.map((entry, i) => {
          const meta = TYPE_META[entry.resource.type];
          const rankColors = ["text-yellow-400", "text-slate-300", "text-amber-600", "text-slate-500", "text-slate-600"];
          return (
            <div
              key={entry.resource.slug}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
              <span className={`text-sm font-bold w-5 text-center ${rankColors[i]}`}>
                {i + 1}
              </span>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
              >
                {meta.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">{entry.resource.name}</div>
                <div className="text-xs text-slate-500">{entry.comparisons} battles</div>
              </div>
              <div className="text-sm font-bold tabular-nums" style={{ color: meta.color }}>
                {entry.score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GlobalRanking() {
  const top = [...resources].sort((a, b) => b.stars - a.stars).slice(0, 5);
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-violet-400" />
        <h3 className="text-sm font-semibold text-slate-300">Global ranking (by stars)</h3>
      </div>
      <div className="space-y-2">
        {top.map((r, i) => {
          const meta = TYPE_META[r.type];
          const rankColors = ["text-yellow-400", "text-slate-300", "text-amber-600", "text-slate-500", "text-slate-600"];
          return (
            <div
              key={r.slug}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
              <span className={`text-sm font-bold w-5 text-center ${rankColors[i]}`}>
                {i + 1}
              </span>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
              >
                {meta.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">{r.name}</div>
                <div className="text-xs text-slate-500">{r.author}</div>
              </div>
              <div className="flex items-center gap-1 text-sm text-yellow-500/80">
                <Star size={12} />
                <span className="tabular-nums">{formatNumber(r.stars)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function BattlePage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [battleState, setBattleState] = useState<BattleState>({
    scores: {},
    comparisons: {},
    totalVotes: 0,
  });
  const [pair, setPair] = useState<[Resource, Resource] | null>(null);
  const [seenPairs, setSeenPairs] = useState<Set<string>>(new Set());
  const [animLeft, setAnimLeft] = useState<AnimState>("idle");
  const [animRight, setAnimRight] = useState<AnimState>("idle");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGlobal, setShowGlobal] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const state = loadState();
    setBattleState(state);
    setMounted(true);
  }, []);

  // Pick initial pair once mounted
  useEffect(() => {
    if (mounted && !pair) {
      const newPair = selectPair(battleState, seenPairs);
      setPair(newPair);
    }
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const advancePair = useCallback(
    (state: BattleState, seen: Set<string>) => {
      setTimeout(() => {
        const newPair = selectPair(state, seen);
        setPair(newPair);
        setAnimLeft("idle");
        setAnimRight("idle");
        // Show leaderboard milestone every 5 votes
        if (state.totalVotes > 0 && state.totalVotes % 5 === 0) {
          setShowLeaderboard(true);
        }
      }, 700);
    },
    []
  );

  function handleVote(winner: Resource, loser: Resource) {
    if (animLeft !== "idle" || animRight !== "idle") return;

    const isLeftWinner = pair?.[0].slug === winner.slug;
    setAnimLeft(isLeftWinner ? "winner" : "loser");
    setAnimRight(isLeftWinner ? "loser" : "winner");

    setBattleState((prev) => {
      const winScore = prev.scores[winner.slug] ?? INITIAL_SCORE;
      const loseScore = prev.scores[loser.slug] ?? INITIAL_SCORE;
      const [newWin, newLose] = updateElo(winScore, loseScore);

      const newState: BattleState = {
        scores: { ...prev.scores, [winner.slug]: newWin, [loser.slug]: newLose },
        comparisons: {
          ...prev.comparisons,
          [winner.slug]: (prev.comparisons[winner.slug] ?? 0) + 1,
          [loser.slug]: (prev.comparisons[loser.slug] ?? 0) + 1,
        },
        totalVotes: prev.totalVotes + 1,
      };

      saveState(newState);

      const pairKey = [winner.slug, loser.slug].sort().join("|");
      const newSeen = new Set(seenPairs).add(pairKey);
      setSeenPairs(newSeen);

      advancePair(newState, newSeen);
      return newState;
    });
  }

  function handleSkip() {
    if (!pair) return;
    const pairKey = [pair[0].slug, pair[1].slug].sort().join("|");
    const newSeen = new Set(seenPairs).add(pairKey);
    setSeenPairs(newSeen);
    const newPair = selectPair(battleState, newSeen);
    setPair(newPair);
  }

  function handleReset() {
    const scores: Scores = {};
    const comparisons: CompCount = {};
    resources.forEach((r) => {
      scores[r.slug] = INITIAL_SCORE;
      comparisons[r.slug] = 0;
    });
    const fresh: BattleState = { scores, comparisons, totalVotes: 0 };
    setBattleState(fresh);
    saveState(fresh);
    setSeenPairs(new Set());
    setShowLeaderboard(false);
    setShowGlobal(false);
    const newPair = selectPair(fresh, new Set());
    setPair(newPair);
    setAnimLeft("idle");
    setAnimRight("idle");
  }

  if (!mounted) {
    return (
      <>
        <Nav onSearchOpen={() => setSearchOpen(true)} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16 min-h-screen" />
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      </>
    );
  }

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
            <Swords size={12} />
            Head-to-head
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Which would you{" "}
            <span className="gradient-text">rather use?</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Vote on resource pairs to build your personal Elo ranking. Your scores are saved locally.
          </p>

          {/* Vote count */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-xs text-slate-500">
              <span className="text-slate-300 font-semibold tabular-nums">{battleState.totalVotes}</span> comparisons made
            </span>
            {battleState.totalVotes > 0 && battleState.totalVotes % 5 !== 0 && (
              <span className="text-xs text-slate-600">
                {5 - (battleState.totalVotes % 5)} until ranking update
              </span>
            )}
          </div>
        </div>

        {/* Battle arena */}
        {pair ? (
          <div className="relative mb-8">
            {/* VS divider */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 items-start">
              <BattleCard
                resource={pair[0]}
                animState={animLeft}
                onClick={() => handleVote(pair[0], pair[1])}
              />

              <div className="hidden sm:flex items-center justify-center self-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-500">VS</span>
                  </div>
                </div>
              </div>

              <div className="sm:hidden flex items-center justify-center">
                <div className="px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                  <span className="text-xs font-bold text-slate-500">VS</span>
                </div>
              </div>

              <BattleCard
                resource={pair[1]}
                animState={animRight}
                onClick={() => handleVote(pair[1], pair[0])}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">No more pairs available.</div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={handleSkip}
            disabled={!pair || animLeft !== "idle"}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] hover:border-white/[0.14] transition-all text-slate-400 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SkipForward size={14} />
            Skip this pair
          </button>

          <button
            onClick={() => { setShowLeaderboard((v) => !v); setShowGlobal(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm ${
              showLeaderboard
                ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                : "bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.08] text-slate-400"
            }`}
          >
            <Trophy size={14} />
            Your top 5
          </button>

          <button
            onClick={() => { setShowGlobal((v) => !v); setShowLeaderboard(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm ${
              showGlobal
                ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                : "bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.08] text-slate-400"
            }`}
          >
            <TrendingUp size={14} />
            Global ranking
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/[0.06] border border-red-500/[0.15] hover:bg-red-500/10 hover:border-red-500/25 transition-all text-red-400 text-sm"
          >
            <RotateCcw size={14} />
            Reset scores
          </button>
        </div>

        {/* Leaderboard panel */}
        {showLeaderboard && (
          <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
            <Leaderboard state={battleState} title="Your top 5 (local Elo)" />
          </div>
        )}

        {/* Global ranking panel */}
        {showGlobal && (
          <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
            <GlobalRanking />
          </div>
        )}

        {/* Milestone leaderboard toast */}
        {showLeaderboard && battleState.totalVotes % 5 === 0 && battleState.totalVotes > 0 && !showGlobal && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30 backdrop-blur-md text-violet-300 text-sm font-medium flex items-center gap-2 shadow-xl">
            <Trophy size={14} />
            {battleState.totalVotes} comparisons — ranking updated above!
          </div>
        )}
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
