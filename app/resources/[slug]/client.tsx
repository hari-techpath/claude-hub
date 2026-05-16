"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star, GitFork, ExternalLink, Copy, Check, ArrowLeft,
  BadgeCheck, TrendingUp, Flame, Sparkles, Globe, BookOpen, Share2
} from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import ResourceCard from "@/components/resource-card";
import { Resource, TYPE_META } from "@/lib/types";

interface Props {
  resource: Resource;
  related: Resource[];
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

export default function ResourceDetailClient({ resource, related }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const meta = TYPE_META[resource.type];

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
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/resources/${resource.slug}`;
    navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
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

            {/* Install command */}
            {resource.installCommand && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Install</h2>
                <div className="flex items-center gap-2 p-4 rounded-xl bg-[#0a0f1a] border border-white/[0.08] font-mono text-sm group">
                  <span className="text-violet-400 shrink-0">$</span>
                  <code className="flex-1 text-slate-200 truncate">{resource.installCommand}</code>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors shrink-0"
                  >
                    {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                  </button>
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
                onClick={handleShare}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors w-full"
              >
                {shared ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
                {shared ? "Link copied!" : "Copy link"}
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
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">Related resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => (
                <ResourceCard key={r.id} resource={r} compact />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
