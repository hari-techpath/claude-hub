"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TYPE_META, ResourceType } from "@/lib/types";

interface CategoryGridProps {
  counts: Record<ResourceType, number>;
}

export default function CategoryGrid({ counts }: CategoryGridProps) {
  const types = Object.entries(TYPE_META) as [ResourceType, typeof TYPE_META[ResourceType]][];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Browse by type</h2>
        <p className="text-slate-400 text-sm">Every kind of resource, organized by what it is.</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {types.map(([type, meta], i) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Link href={`/explore?type=${type}`} className="block group">
              <div
                className="glass-card rounded-2xl p-5 hover:border-opacity-60 transition-all"
                style={{ borderColor: meta.border }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${meta.bg} 0%, transparent 70%)` }}
                />

                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 transition-transform group-hover:scale-110"
                    style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
                  >
                    {meta.icon}
                  </div>
                  <div className="font-semibold text-sm text-slate-100 mb-0.5">{meta.label}</div>
                  <div className="text-xs text-slate-500 mb-3 line-clamp-2">{meta.description}</div>
                  <div
                    className="text-xs font-semibold"
                    style={{ color: meta.color }}
                  >
                    {counts[type] || 0} resources
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
