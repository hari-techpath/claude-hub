"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TYPE_META } from "@/lib/types";
import { getTrending, RESOURCES } from "@/lib/resources";
import { getRecommendations } from "@/lib/recommend";

function MiniCard({ slug, name, type, tagline }: { slug: string; name: string; type: string; tagline: string }) {
  const meta = TYPE_META[type as keyof typeof TYPE_META];
  return (
    <Link
      href={`/resources/${slug}`}
      className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]
        hover:bg-white/[0.06] hover:border-white/[0.12] transition-all min-w-0 flex-1"
    >
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit"
        style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
      >
        <span>{meta.icon}</span>
        {meta.label}
      </span>
      <div className="text-xs font-semibold text-slate-200 line-clamp-1">{name}</div>
      <div className="text-[10px] text-slate-500 line-clamp-1">{tagline}</div>
    </Link>
  );
}

export default function PeopleAlsoViewed() {
  const trending = getTrending().slice(0, 6);

  // Build unique pairs: for each trending resource, grab its top 2 recs
  const pairs: Array<{ from: (typeof trending)[0]; to: (typeof trending)[0] }> = [];
  const seen = new Set<string>();

  for (const resource of trending) {
    if (pairs.length >= 4) break;
    const recs = getRecommendations(resource, RESOURCES, 2);
    for (const rec of recs) {
      if (pairs.length >= 4) break;
      const key = [resource.id, rec.id].sort().join("--");
      if (!seen.has(key) && resource.id !== rec.id) {
        seen.add(key);
        pairs.push({ from: resource, to: rec });
      }
    }
  }

  if (pairs.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Trending together</h2>
        <span className="text-sm text-slate-500">People who like X also love Y</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pairs.map(({ from, to }, i) => (
          <motion.div
            key={`${from.id}--${to.id}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07]
              hover:border-white/[0.12] transition-all"
          >
            <MiniCard slug={from.slug} name={from.name} type={from.type} tagline={from.tagline} />

            <div className="flex flex-col items-center gap-1 shrink-0">
              <ArrowRight size={14} className="text-slate-600" />
              <span className="text-[9px] text-slate-600 font-medium uppercase tracking-wider">also</span>
            </div>

            <MiniCard slug={to.slug} name={to.name} type={to.type} tagline={to.tagline} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
