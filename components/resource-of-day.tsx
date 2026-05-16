"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Star, GitFork, ArrowRight } from "lucide-react";
import { RESOURCES } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

function getDailyResource() {
  // Rotate through featured resources based on day of year
  const featured = RESOURCES.filter((r) => r.featured || r.hot);
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return featured[dayOfYear % featured.length];
}

const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

export default function ResourceOfDay() {
  const resource = getDailyResource();
  if (!resource) return null;
  const meta = TYPE_META[resource.type];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 flex items-center gap-5"
        style={{ background: `linear-gradient(135deg, ${meta.bg} 0%, rgba(3,7,18,0.9) 50%)` }}
      >
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 0% 50%, ${meta.color}15 0%, transparent 60%)` }} />

        {/* Date pill */}
        <div className="shrink-0 hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.08] relative">
          <Calendar size={12} className="text-slate-500 mb-0.5" />
          <span className="text-[10px] text-slate-500 font-medium">{new Date().toLocaleDateString("en-US", { month: "short" })}</span>
          <span className="text-lg font-bold text-slate-200 leading-none">{new Date().getDate()}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resource of the day</span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-600 hidden sm:inline">{today}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: meta.color }}>{meta.icon}</span>
            <h3 className="text-base font-bold text-slate-100 truncate">{resource.name}</h3>
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">{resource.tagline}</p>
        </div>

        {/* Stats */}
        <div className="shrink-0 hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Star size={11} className="text-yellow-500/70" />
            {formatNumber(resource.stars)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <GitFork size={11} />
            {formatNumber(resource.forks)}
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/resources/${resource.slug}`}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all relative hover:scale-105"
          style={{ background: meta.color, color: "#030712" }}
        >
          View <ArrowRight size={12} />
        </Link>
      </motion.div>
    </section>
  );
}
