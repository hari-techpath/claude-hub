"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Share2, Check } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import ResourceCard from "@/components/resource-card";
import { COLLECTIONS } from "@/lib/collections";
import { RESOURCES } from "@/lib/resources";

const COLOR_MAP: Record<string, { from: string; to: string; border: string; text: string; bg: string }> = {
  violet: {
    from: "from-violet-500",
    to: "to-purple-600",
    border: "border-violet-500/30",
    text: "text-violet-300",
    bg: "bg-violet-500/10",
  },
  emerald: {
    from: "from-emerald-500",
    to: "to-green-600",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
  },
  cyan: {
    from: "from-cyan-500",
    to: "to-blue-600",
    border: "border-cyan-500/30",
    text: "text-cyan-300",
    bg: "bg-cyan-500/10",
  },
  blue: {
    from: "from-blue-500",
    to: "to-indigo-600",
    border: "border-blue-500/30",
    text: "text-blue-300",
    bg: "bg-blue-500/10",
  },
  yellow: {
    from: "from-yellow-400",
    to: "to-orange-500",
    border: "border-yellow-500/30",
    text: "text-yellow-300",
    bg: "bg-yellow-500/10",
  },
  orange: {
    from: "from-orange-500",
    to: "to-red-500",
    border: "border-orange-500/30",
    text: "text-orange-300",
    bg: "bg-orange-500/10",
  },
  teal: {
    from: "from-teal-500",
    to: "to-cyan-600",
    border: "border-teal-500/30",
    text: "text-teal-300",
    bg: "bg-teal-500/10",
  },
  green: {
    from: "from-green-500",
    to: "to-emerald-600",
    border: "border-green-500/30",
    text: "text-green-300",
    bg: "bg-green-500/10",
  },
};

export default function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [searchOpen, setSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const collection = COLLECTIONS.find((c) => c.slug === slug);
  if (!collection) notFound();

  const colors = COLOR_MAP[collection.color] ?? COLOR_MAP.violet;
  const resources = collection.resourceSlugs
    .map((s) => RESOURCES.find((r) => r.slug === s))
    .filter(Boolean) as typeof RESOURCES;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to collections
          </Link>
        </motion.div>

        {/* Hero */}
        <div className="mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6"
          >
            {/* Emoji */}
            <div
              className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center text-4xl shadow-2xl shrink-0`}
            >
              {collection.emoji}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
                    {collection.title}
                  </h1>
                  <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
                    {collection.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Resource count */}
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors.text} ${colors.bg} border ${colors.border}`}
                  >
                    {resources.length} resources
                  </span>

                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.10] hover:bg-white/[0.10] text-slate-300 text-sm font-medium transition-all"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 size={14} />
                        Share
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Divider */}
          <div className={`h-px bg-gradient-to-r ${colors.from} ${colors.to} opacity-20`} />
        </div>

        {/* Resources grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((resource, i) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
            >
              <ResourceCard resource={resource} />
            </motion.div>
          ))}
        </div>

        {/* Back link at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-sm font-medium hover:bg-white/[0.08] transition-all"
          >
            <ArrowLeft size={14} />
            View all collections
          </Link>
        </motion.div>
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
