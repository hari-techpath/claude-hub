"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import { COLLECTIONS } from "@/lib/collections";
import { RESOURCES } from "@/lib/resources";

const COLOR_MAP: Record<string, { from: string; to: string; border: string; text: string; glow: string }> = {
  violet: {
    from: "from-violet-500",
    to: "to-purple-600",
    border: "border-violet-500/30",
    text: "text-violet-300",
    glow: "shadow-violet-500/20",
  },
  emerald: {
    from: "from-emerald-500",
    to: "to-green-600",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    glow: "shadow-emerald-500/20",
  },
  cyan: {
    from: "from-cyan-500",
    to: "to-blue-600",
    border: "border-cyan-500/30",
    text: "text-cyan-300",
    glow: "shadow-cyan-500/20",
  },
  blue: {
    from: "from-blue-500",
    to: "to-indigo-600",
    border: "border-blue-500/30",
    text: "text-blue-300",
    glow: "shadow-blue-500/20",
  },
  yellow: {
    from: "from-yellow-400",
    to: "to-orange-500",
    border: "border-yellow-500/30",
    text: "text-yellow-300",
    glow: "shadow-yellow-500/20",
  },
  orange: {
    from: "from-orange-500",
    to: "to-red-500",
    border: "border-orange-500/30",
    text: "text-orange-300",
    glow: "shadow-orange-500/20",
  },
  teal: {
    from: "from-teal-500",
    to: "to-cyan-600",
    border: "border-teal-500/30",
    text: "text-teal-300",
    glow: "shadow-teal-500/20",
  },
  green: {
    from: "from-green-500",
    to: "to-emerald-600",
    border: "border-green-500/30",
    text: "text-green-300",
    glow: "shadow-green-500/20",
  },
};

function CollectionCard({ collection, index }: { collection: (typeof COLLECTIONS)[0]; index: number }) {
  const colors = COLOR_MAP[collection.color] ?? COLOR_MAP.violet;
  const count = collection.resourceSlugs.filter((slug) =>
    RESOURCES.some((r) => r.slug === slug)
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group"
    >
      <Link href={`/collections/${collection.slug}`} className="block h-full">
        <div
          className={`glass-card rounded-3xl p-6 h-full flex flex-col gap-4 border ${colors.border} hover:scale-[1.02] hover:shadow-2xl ${colors.glow} transition-all duration-300`}
        >
          {/* Emoji circle */}
          <div className="flex items-start justify-between">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center text-2xl shadow-lg ${colors.glow} group-hover:scale-110 transition-transform duration-300`}
            >
              {collection.emoji}
            </div>
            {/* Resource count badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors.text} bg-white/[0.05] border ${colors.border}`}
            >
              {count} resources
            </span>
          </div>

          {/* Title + description */}
          <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
              {collection.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
              {collection.description}
            </p>
          </div>

          {/* CTA */}
          <div className={`flex items-center gap-1.5 text-sm font-medium ${colors.text} mt-auto`}>
            <span>Browse collection</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CollectionsPage() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6"
          >
            <Bookmark size={13} />
            Editorial playlists for data professionals
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            Curated <span className="gradient-text">Collections</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Hand-picked groups of resources organized around a theme. Start here if you're looking for
            the best tools for a specific job.
          </motion.p>
        </div>

        {/* Collections grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {COLLECTIONS.map((collection, i) => (
            <CollectionCard key={collection.id} collection={collection} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center p-8 rounded-3xl bg-white/[0.02] border border-white/[0.07]"
        >
          <h2 className="text-2xl font-bold mb-2">Want to explore everything?</h2>
          <p className="text-slate-400 text-sm mb-6">
            Collections are curated highlights. Browse the full registry to find every resource.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium text-sm transition-all"
          >
            Browse all resources <ArrowRight size={14} />
          </Link>
        </motion.div>
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
