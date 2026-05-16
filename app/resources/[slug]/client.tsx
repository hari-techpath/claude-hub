"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, GitFork, ExternalLink, Copy, Check, ArrowLeft,
  BadgeCheck, TrendingUp, Flame, Sparkles, Globe, BookOpen, Share2, Bookmark,
  ChevronRight, Printer, Code2, X,
} from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import ResourceCard from "@/components/resource-card";
import { Resource, TYPE_META, ResourceType } from "@/lib/types";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";
import { qualityScore } from "@/lib/score";
import { getReviewsForSlug, averageRating, Review } from "@/lib/reviews";
import { getScoredRecommendations } from "@/lib/recommend";
import { RESOURCES } from "@/lib/resources";

interface Props {
  resource: Resource;
  related: Resource[];
}

// ─── Getting started steps per type ────────────────────────────────────────
const GETTING_STARTED_STEPS: Record<ResourceType, string[]> = {
  mcp: ["Install the package", "Add to your Claude config", "Restart Claude", "Test with a prompt"],
  skill: ["Copy the skill file", "Place in .claude/skills/", "Invoke with /skill-name", "Customize for your workflow"],
  agent: ["Install via npm/pip", "Configure API keys", "Run the agent", "Review outputs"],
  prompt: ["Copy the prompt", "Paste into Claude", "Fill in variables", "Iterate on the output"],
  architecture: ["Read the architecture overview", "Clone the reference repo", "Adapt to your stack", "Deploy and monitor"],
  setup: ["Follow the setup guide", "Install dependencies", "Configure environment", "Test your setup"],
  hook: ["Copy the hook code", "Place in .claude/hooks/", "Configure triggers", "Test the integration"],
  trick: ["Read the trick description", "Try it in Claude", "Adapt to your use case", "Share with your team"],
};

// ─── Used-by companies per resource type ────────────────────────────────────
const USED_BY: Record<ResourceType, string[]> = {
  mcp: ["Airbnb", "Shopify", "Stripe", "Notion", "Linear"],
  skill: ["GitHub", "Vercel", "PlanetScale", "Supabase"],
  agent: ["OpenAI", "Anthropic", "Cohere", "Mistral"],
  prompt: ["YC", "a16z", "Sequoia", "First Round"],
  architecture: ["Netflix", "Uber", "Lyft", "Pinterest"],
  setup: ["GitLab", "Cloudflare", "Fly.io", "Render"],
  hook: ["GitHub", "CircleCI", "Buildkite", "Railway"],
  trick: ["Replit", "Cursor", "Warp", "Fig"],
};

// ─── Star rating renderer ────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= rating ? "text-yellow-400" : "text-slate-600"}
          style={{ fontSize: "13px" }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

// ─── Review card ─────────────────────────────────────────────────────────────
function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md flex flex-col gap-3"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl leading-none">{review.avatar}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-200 truncate">{review.author}</div>
          <div className="text-xs text-slate-500 truncate">{review.role}</div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{review.text}</p>
      <div className="text-xs text-slate-600">
        {new Date(review.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
      </div>
    </motion.div>
  );
}

// ─── Toast hook ─────────────────────────────────────────────────────────────
function useToast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 2500);
  }, []);

  return { visible, message, show };
}

// ─── Toast component ─────────────────────────────────────────────────────────
function Toast({ visible, message }: { visible: boolean; message: string }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.22 }}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl
            bg-[#0d1320]/90 border border-white/[0.12] shadow-xl backdrop-blur-md text-sm text-slate-200"
        >
          <Check size={14} className="text-green-400 shrink-0" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Embed Modal ─────────────────────────────────────────────────────────────
function EmbedModal({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const [tab, setTab] = useState<"html" | "markdown">("html");
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const pageUrl = `https://claude-hub.vercel.app/resources/${resource.slug}`;
  const badgeUrl = `https://claude-hub.vercel.app/badge/${resource.slug}`;

  const htmlSnippet = `<a href="${pageUrl}" style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:#0a0a0a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#e2e8f0;font-family:system-ui;font-size:14px;text-decoration:none;">⚡ ${resource.name} on Claude Hub</a>`;
  const markdownSnippet = `[![Claude Hub](${badgeUrl})](${pageUrl})`;

  const snippet = tab === "html" ? htmlSnippet : markdownSnippet;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(snippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-lg rounded-2xl bg-[#0d1320]/95 border border-white/[0.1] shadow-2xl backdrop-blur-xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-200">Embed badge</h2>
              <p className="text-xs text-slate-500 mt-0.5">Paste this snippet on your site or docs</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.07] mb-4 w-fit">
            {(["html", "markdown"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  tab === t
                    ? "bg-white/[0.1] text-slate-200"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t === "html" ? "HTML" : "Markdown"}
              </button>
            ))}
          </div>

          {/* Code block */}
          <div className="relative mb-5">
            <pre className="p-4 rounded-xl bg-[#070d18] border border-white/[0.07] text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {snippet}
            </pre>
            <button
              onClick={handleCopyEmbed}
              className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                bg-white/[0.07] border border-white/[0.1] text-xs text-slate-400 hover:text-slate-200
                hover:bg-white/[0.12] transition-colors"
            >
              {copiedEmbed ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copiedEmbed ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Live preview */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2.5 font-medium">Preview</p>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] flex items-center justify-center">
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  background: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontFamily: "system-ui",
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                ⚡ {resource.name} on Claude Hub
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

function TwitterShareButton({ resource }: { resource: Resource }) {
  const tweetText = `Just found ${resource.name} on Claude Hub — ${resource.tagline} #ClaudeHub #DataEngineering`;
  const pageUrl = typeof window !== "undefined"
    ? `${window.location.origin}/resources/${resource.slug}`
    : `https://claudehub.dev/resources/${resource.slug}`;
  const href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(pageUrl)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
    >
      <Share2 size={14} />
      Share on X
      <ExternalLink size={11} className="ml-auto text-slate-600" />
    </a>
  );
}

export default function ResourceDetailClient({ resource, related }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const meta = TYPE_META[resource.type];
  const toast = useToast();

  useEffect(() => {
    setBookmarked(isBookmarked(resource.slug));
  }, [resource.slug]);

  useEffect(() => {
    try {
      const prev = JSON.parse(localStorage.getItem("ch-recently-viewed") || "[]") as string[];
      const updated = [resource.slug, ...prev.filter((s) => s !== resource.slug)].slice(0, 8);
      localStorage.setItem("ch-recently-viewed", JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [resource.slug]);

  const handleCopy = () => {
    if (resource.installCommand) {
      navigator.clipboard.writeText(resource.installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.show("Install command copied!");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/resources/${resource.slug}`;
    navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleBookmark = () => {
    const nowBookmarked = toggleBookmark(resource.slug);
    setBookmarked(nowBookmarked);
  };

  const steps = GETTING_STARTED_STEPS[resource.type];
  const reviews = getReviewsForSlug(resource.slug);
  const avgRating = averageRating(reviews);
  const usedBy = USED_BY[resource.type] ?? ["Airbnb", "Stripe", "Notion", "Linear"];

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-slate-500 mb-3 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <ChevronRight size={11} className="shrink-0" />
          <Link href="/explore" className="hover:text-slate-300 transition-colors">Explore</Link>
          <ChevronRight size={11} className="shrink-0" />
          <Link
            href={`/explore?type=${resource.type}`}
            className="hover:text-slate-300 transition-colors"
          >
            {meta.label}
          </Link>
          <ChevronRight size={11} className="shrink-0" />
          <span className="text-slate-400 truncate max-w-[180px]">{resource.name}</span>
        </nav>

        {/* Back */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to explore
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Type + badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                >
                  <span className="text-base">{meta.icon}</span>
                  {meta.label}
                </span>
                {resource.trending && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    <TrendingUp size={10} /> Trending
                  </span>
                )}
                {resource.hot && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400">
                    <Flame size={10} /> Hot
                  </span>
                )}
                {resource.featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    <Sparkles size={10} /> Featured
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-3 flex items-center gap-2">
                {resource.name}
                {resource.verified && <BadgeCheck size={24} className="text-blue-400" />}
              </h1>
              <p className="text-lg text-slate-400 mb-6">{resource.tagline}</p>

              {/* Stats row */}
              <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <Star size={15} className="text-yellow-400" />
                  <span className="text-sm font-semibold">{formatNumber(resource.stars)}</span>
                  <span className="text-xs text-slate-500">stars</span>
                </div>
                <div className="w-px h-4 bg-white/[0.08]" />
                <div className="flex items-center gap-2">
                  <GitFork size={15} className="text-slate-400" />
                  <span className="text-sm font-semibold">{formatNumber(resource.forks)}</span>
                  <span className="text-xs text-slate-500">forks</span>
                </div>
                <div className="w-px h-4 bg-white/[0.08]" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{formatNumber(resource.weeklyViews)}</span>
                  <span className="text-xs text-slate-500">weekly views</span>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07]"
            >
              <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">About</h2>
              <p className="text-slate-300 leading-relaxed">{resource.description}</p>
            </motion.div>

            {/* Used by teams at */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
            >
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">Popular with teams at</p>
              <div className="flex flex-wrap gap-2">
                {usedBy.map((company) => (
                  <span
                    key={company}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                      bg-white/[0.05] border border-white/[0.09] text-slate-400
                      hover:bg-white/[0.08] hover:text-slate-300 transition-colors cursor-default"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Install command */}
            {resource.installCommand && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Install</h2>
                <div className="flex items-center gap-2 p-4 rounded-xl bg-[#0a0f1a] border border-white/[0.08] font-mono text-sm group overflow-x-auto">
                  <span className="text-violet-400 shrink-0">$</span>
                  <code className="flex-1 text-slate-200 whitespace-nowrap">{resource.installCommand}</code>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors shrink-0"
                  >
                    {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Getting started */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
            >
              <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Getting started</h2>
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.22 + i * 0.07 }}
                    className="flex items-center gap-3"
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-300">{step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* What's next? */}
            {(() => {
              const complexityOrder: string[] = ["beginner", "intermediate", "advanced"];
              const currentIdx = complexityOrder.indexOf(resource.complexity);

              // Same type, one level up
              const nextComplexity = complexityOrder[currentIdx + 1];
              const sameTypeHarder = nextComplexity
                ? RESOURCES.find(
                    (r) => r.slug !== resource.slug && r.type === resource.type && r.complexity === nextComplexity
                  )
                : null;

              // Related type: different type, most shared tags
              const relatedType = RESOURCES.filter(
                (r) => r.slug !== resource.slug && r.type !== resource.type
              )
                .map((r) => ({
                  resource: r,
                  shared: r.tags.filter((t) => resource.tags.includes(t)).length,
                }))
                .filter(({ shared }) => shared > 0)
                .sort((a, b) => b.shared - a.shared)[0]?.resource ?? null;

              if (!sameTypeHarder && !relatedType) return null;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.19 }}
                >
                  <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">What&apos;s next?</h2>
                  <div className="space-y-3">
                    {sameTypeHarder && (
                      <Link href={`/resources/${sameTypeHarder.slug}`} className="block group">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all">
                          <div className="shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              → Next step
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                              {sameTypeHarder.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 truncate">{sameTypeHarder.tagline}</div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize"
                                style={{
                                  background: TYPE_META[sameTypeHarder.type].bg,
                                  color: TYPE_META[sameTypeHarder.type].color,
                                  border: `1px solid ${TYPE_META[sameTypeHarder.type].border}`,
                                }}
                              >
                                {TYPE_META[sameTypeHarder.type].label}
                              </span>
                              <span
                                className={`text-[10px] font-semibold capitalize ${
                                  sameTypeHarder.complexity === "intermediate"
                                    ? "text-yellow-400"
                                    : sameTypeHarder.complexity === "advanced"
                                    ? "text-red-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {sameTypeHarder.complexity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}
                    {relatedType && (
                      <Link href={`/resources/${relatedType.slug}`} className="block group">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all">
                          <div className="shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              → Related
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                              {relatedType.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 truncate">{relatedType.tagline}</div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize"
                                style={{
                                  background: TYPE_META[relatedType.type].bg,
                                  color: TYPE_META[relatedType.type].color,
                                  border: `1px solid ${TYPE_META[relatedType.type].border}`,
                                }}
                              >
                                {TYPE_META[relatedType.type].label}
                              </span>
                              <span
                                className={`text-[10px] font-semibold capitalize ${
                                  relatedType.complexity === "intermediate"
                                    ? "text-yellow-400"
                                    : relatedType.complexity === "advanced"
                                    ? "text-red-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {relatedType.complexity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })()}

            {/* Community reviews */}
            {reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.19 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Community reviews</h2>
                  <span className="text-sm text-slate-400 font-medium">
                    ⭐ {avgRating} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-3">
                  {reviews.map((review, i) => (
                    <ReviewCard key={`${review.author}-${i}`} review={review} index={i} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <Link key={tag} href={`/explore?q=${tag}`} className="tag-pill hover:cursor-pointer">{tag}</Link>
                ))}
              </div>
            </motion.div>

            {/* Works with */}
            {(() => {
              const KNOWN_TOOLS: { id: string; label: string; color: string }[] = [
                { id: "snowflake", label: "Snowflake", color: "#29B5E8" },
                { id: "dbt", label: "dbt", color: "#FF694A" },
                { id: "airflow", label: "Airflow", color: "#017CEE" },
                { id: "spark", label: "Spark", color: "#E25A1C" },
                { id: "kafka", label: "Kafka", color: "#231F20" },
                { id: "bigquery", label: "BigQuery", color: "#4285F4" },
                { id: "redshift", label: "Redshift", color: "#8C4FFF" },
                { id: "databricks", label: "Databricks", color: "#FF3621" },
                { id: "postgres", label: "Postgres", color: "#336791" },
                { id: "mysql", label: "MySQL", color: "#4479A1" },
                { id: "duckdb", label: "DuckDB", color: "#FFC107" },
                { id: "polars", label: "Polars", color: "#CD792C" },
                { id: "pandas", label: "Pandas", color: "#130754" },
                { id: "prefect", label: "Prefect", color: "#024DFD" },
                { id: "dagster", label: "Dagster", color: "#4F43DD" },
              ];
              const matched = KNOWN_TOOLS.filter((t) =>
                resource.tags.some((tag) => tag.toLowerCase().includes(t.id))
              );
              if (matched.length === 0) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Works with</h2>
                  <div className="flex flex-wrap gap-2">
                    {matched.map((tool) => (
                      <span
                        key={tool.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                        style={{
                          background: `${tool.color}18`,
                          borderColor: `${tool.color}40`,
                          color: tool.color,
                        }}
                      >
                        {tool.label}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })()}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Author */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07]"
            >
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Author</div>
              {resource.authorUrl ? (
                <a
                  href={resource.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-200 hover:text-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                    {resource.author.charAt(0).toUpperCase()}
                  </div>
                  {resource.author}
                  <ExternalLink size={11} className="text-slate-500" />
                </a>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                    {resource.author.charAt(0).toUpperCase()}
                  </div>
                  {resource.author}
                </div>
              )}
            </motion.div>

            {/* Links */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] space-y-2"
            >
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Links</div>
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 text-sm transition-colors w-full ${
                  bookmarked
                    ? "text-violet-400 hover:text-violet-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Bookmark
                  size={14}
                  className={bookmarked ? "fill-violet-400 text-violet-400" : ""}
                />
                {bookmarked ? "Saved" : "Save"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors w-full"
              >
                {shared ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
                {shared ? "Link copied!" : "Copy link"}
              </button>
              <TwitterShareButton resource={resource} />
              <button
                onClick={() => window.print()}
                className="no-print flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors w-full"
              >
                <Printer size={14} />
                Print / Save PDF
              </button>
              <button
                onClick={() => setEmbedOpen(true)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors w-full"
              >
                <Code2 size={14} />
                Embed
              </button>
              {resource.githubUrl && (
                <a
                  href={resource.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <GitFork size={14} />
                  GitHub Repository
                  <ExternalLink size={11} className="ml-auto text-slate-600" />
                </a>
              )}
              {resource.docsUrl && (
                <a
                  href={resource.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <BookOpen size={14} />
                  Documentation
                  <ExternalLink size={11} className="ml-auto text-slate-600" />
                </a>
              )}
            </motion.div>

            {/* Use cases */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07]"
            >
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Use cases</div>
              <div className="flex flex-wrap gap-1.5">
                {resource.useCases.map((uc) => (
                  <span key={uc} className="tag-pill capitalize">{uc}</span>
                ))}
              </div>
            </motion.div>

            {/* Complexity */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07]"
            >
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Complexity</div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {["beginner", "intermediate", "advanced"].map((level, i) => (
                    <div
                      key={level}
                      className={`w-8 h-1.5 rounded-full transition-colors ${
                        ["beginner", "intermediate", "advanced"].indexOf(resource.complexity) >= i
                          ? resource.complexity === "beginner" ? "bg-green-400" :
                            resource.complexity === "intermediate" ? "bg-yellow-400" : "bg-red-400"
                          : "bg-white/[0.1]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-300 capitalize">{resource.complexity}</span>
              </div>
            </motion.div>

            {/* Quality score */}
            {(() => {
              const score = qualityScore(resource);
              const color = score > 70 ? "#4ade80" : score >= 40 ? "#facc15" : "#f87171";
              const colorClass = score > 70 ? "text-green-400" : score >= 40 ? "text-yellow-400" : "text-red-400";
              return (
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.28 }}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07]"
                >
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quality score</div>
                  <div className="flex items-center gap-3 mb-2.5">
                    {/* Circular progress */}
                    <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
                      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                        <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                        <circle
                          cx="22" cy="22" r="18"
                          stroke={color}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 18}`}
                          strokeDashoffset={`${2 * Math.PI * 18 * (1 - score / 100)}`}
                          transform="rotate(-90 22 22)"
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold ${colorClass}`}>
                        {score}
                      </span>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${colorClass}`}>{score}<span className="text-slate-500 text-sm font-normal">/100</span></div>
                      <div className="text-xs text-slate-500">
                        {score > 70 ? "High quality" : score >= 40 ? "Average" : "Needs work"}
                      </div>
                    </div>
                  </div>
                  {/* Bar */}
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${score}%`, background: color }}
                    />
                  </div>
                </motion.div>
              );
            })()}

            {/* Related resources count */}
            {related.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07]"
              >
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Similar</div>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                    bg-white/[0.04] border border-white/[0.1] text-slate-300 backdrop-blur-sm"
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {related.length}
                  </span>
                  {related.length} similar resource{related.length !== 1 ? "s" : ""}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* You might also like */}
        {(() => {
          const scored = getScoredRecommendations(resource, RESOURCES, 4);
          if (scored.length === 0) return null;
          const maxScore = scored[0].score || 1;
          return (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-2">You might also like</h2>
              <p className="text-sm text-slate-500 mb-6">Recommended based on tags, type, and complexity</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {scored.map(({ resource: r, score, sharedTags }) => {
                  const pct = Math.round((score / maxScore) * 100);
                  const tooltipText =
                    sharedTags.length > 0
                      ? `Shared tags: ${sharedTags.join(", ")}`
                      : "Similar type and complexity";
                  return (
                    <div key={r.id} title={tooltipText} className="flex flex-col gap-2">
                      <ResourceCard resource={r} compact />
                      {/* Similarity score bar */}
                      <div className="flex items-center gap-2 px-1">
                        <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0 w-8 text-right">{pct}%</span>
                      </div>
                      {sharedTags.length > 0 && (
                        <p className="text-[10px] text-slate-600 px-1 truncate">
                          {sharedTags.length} shared tag{sharedTags.length !== 1 ? "s" : ""}: {sharedTags.slice(0, 3).join(", ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Toast */}
      <Toast visible={toast.visible} message={toast.message} />

      {/* Embed modal */}
      {embedOpen && <EmbedModal resource={resource} onClose={() => setEmbedOpen(false)} />}
    </>
  );
}
