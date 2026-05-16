"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, GitFork, ArrowRight, BadgeCheck, Zap } from "lucide-react";
import { getFeatured } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

export default function FeaturedSpotlight() {
  const featured = getFeatured().slice(0, 1)[0];
  if (!featured) return null;
  const meta = TYPE_META[featured.type];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-2 mb-6">
        <Zap size={14} className="text-yellow-400" />
        <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Editor&apos;s Pick</span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] p-8 sm:p-12"
        style={{
          background: `linear-gradient(135deg, ${meta.bg} 0%, rgba(3,7,18,0.95) 60%)`,
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${meta.color}40 0%, transparent 60%)`,
          }}
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
              >
                <span className="text-base">{meta.icon}</span>
                {meta.label}
              </span>
              {featured.verified && <BadgeCheck size={16} className="text-blue-400" />}
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{featured.name}</h2>
            <p className="text-lg text-slate-300 mb-2">{featured.tagline}</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{featured.description}</p>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-yellow-400" />
                <span className="text-sm font-semibold text-white">{formatNumber(featured.stars)}</span>
                <span className="text-xs text-slate-500">stars</span>
              </div>
              <div className="flex items-center gap-2">
                <GitFork size={14} className="text-slate-400" />
                <span className="text-sm font-semibold text-white">{formatNumber(featured.forks)}</span>
                <span className="text-xs text-slate-500">forks</span>
              </div>
              <div className="text-xs text-slate-500">by {featured.author}</div>
            </div>

            <Link
              href={`/resources/${featured.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ background: meta.color, color: "#030712" }}
            >
              View resource
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right side: tags + install */}
          <div className="space-y-4">
            {featured.installCommand && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] font-mono text-sm">
                <div className="text-slate-500 text-xs mb-2 uppercase tracking-wider">Install</div>
                <div className="flex items-center gap-2">
                  <span className="text-violet-400">$</span>
                  <code className="text-slate-200">{featured.installCommand}</code>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {featured.tags.map((tag) => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
