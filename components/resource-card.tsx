"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Star, GitFork, ExternalLink, TrendingUp, Flame, Sparkles, BadgeCheck, Plus, Check, ChevronUp } from "lucide-react";
import { Resource, TYPE_META } from "@/lib/types";
import { hasVoted, toggleVote } from "@/lib/votes";

interface ResourceCardProps {
  resource: Resource;
  compact?: boolean;
  onCompare?: (r: Resource) => void;
  inCompare?: boolean;
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function ResourceCard({ resource, compact = false, onCompare, inCompare }: ResourceCardProps) {
  const meta = TYPE_META[resource.type];
  const [voted, setVoted] = useState(false);
  const [voteAnim, setVoteAnim] = useState(false);

  useEffect(() => {
    setVoted(hasVoted(resource.slug));
  }, [resource.slug]);

  function handleUpvote(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowVoted = toggleVote(resource.slug);
    setVoted(nowVoted);
    if (nowVoted) {
      setVoteAnim(true);
      setTimeout(() => setVoteAnim(false), 600);
    }
  }

  return (
    <Link href={`/resources/${resource.slug}`} className="block group transition-transform active:scale-[0.98]" style={{ minHeight: 44 }}>
      <div
        className={`glass-card rounded-2xl p-5 h-full flex flex-col gap-3 relative overflow-hidden transition-shadow ${
          inCompare ? "ring-2 ring-violet-500/60 shadow-[0_0_20px_rgba(139,92,246,0.25)]" : ""
        }`}
        style={{ borderColor: `${meta.border}` }}
      >
        {/* Subtle type color glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ background: `radial-gradient(circle at 50% 0%, ${meta.bg} 0%, transparent 60%)` }}
        />

        {/* Top row */}
        <div className="flex items-start justify-between gap-2 relative">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type badge */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
            >
              <span>{meta.icon}</span>
              {meta.label}
            </span>

            {/* Trending badge */}
            {resource.trending && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <TrendingUp size={9} />
                Trending
              </span>
            )}
            {resource.hot && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 border border-red-500/20 text-red-400">
                <Flame size={9} />
                Hot
              </span>
            )}
            {resource.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Sparkles size={9} />
                Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Compare button — only shown when onCompare provided and not compact */}
            {onCompare && !compact && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCompare(resource);
                }}
                title={inCompare ? "Remove from compare" : "Add to compare"}
                className={`p-1.5 rounded-lg transition-colors ${
                  inCompare
                    ? "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]"
                }`}
              >
                {inCompare ? <Check size={13} /> : <Plus size={13} />}
              </button>
            )}

            {resource.githubUrl && (
              <a
                href={resource.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>

        {/* Title + author */}
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors line-clamp-1">
              {resource.name}
            </h3>
            {resource.verified && (
              <BadgeCheck size={13} className="text-blue-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">{resource.tagline}</p>
        </div>

        {/* Description */}
        {!compact && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed relative">
            {resource.description}
          </p>
        )}

        {/* Tags */}
        {!compact && (
          <div className="flex flex-wrap gap-1 relative">
            {resource.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
          </div>
        )}

        {/* View popularity bar */}
        <div className="w-full h-0.5 bg-white/[0.05] rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min((resource.weeklyViews / 10000) * 100, 100)}%`,
              background: `linear-gradient(90deg, ${meta.color}80, ${meta.color})`,
            }}
          />
        </div>

        {/* Bottom row: stats + author */}
        <div className="flex items-center justify-between mt-auto relative">
          <div className="flex items-center gap-3">
            {/* Upvote button — only on non-compact cards */}
            {!compact && (
              <button
                onClick={handleUpvote}
                title={voted ? "Remove upvote" : "Upvote"}
                className={`relative flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                  voted
                    ? "text-orange-400 bg-orange-500/10 border border-orange-500/20"
                    : "text-slate-500 hover:text-orange-300 hover:bg-orange-500/10 border border-transparent"
                }`}
              >
                <ChevronUp
                  size={12}
                  className={`transition-transform ${voted ? "scale-110" : ""}`}
                />
                <span>{formatNumber(resource.stars)}</span>
                {voteAnim && (
                  <span
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-orange-400 font-semibold pointer-events-none"
                    style={{ animation: "countUp 0.6s ease-out both" }}
                  >
                    +1
                  </span>
                )}
              </button>
            )}
            {compact && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <Star size={11} className="text-yellow-500/70" />
                {formatNumber(resource.stars)}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <GitFork size={11} />
              {formatNumber(resource.forks)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <Link
              href={`/authors/${encodeURIComponent(resource.author)}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate max-w-[100px] hover:text-slate-200 transition-colors"
            >
              {resource.author}
            </Link>
            <span>·</span>
            <span>{timeAgo(resource.lastUpdated)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
