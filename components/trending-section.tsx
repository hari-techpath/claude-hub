"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Flame, Clock, Trophy } from "lucide-react";
import { Resource, SortMode } from "@/lib/types";
import { getTrending, getHot, getNew, getTop } from "@/lib/resources";
import ResourceCard from "./resource-card";
import Link from "next/link";

const TABS: { id: SortMode; label: string; icon: React.ReactNode }[] = [
  { id: "trending", label: "Trending", icon: <TrendingUp size={14} /> },
  { id: "hot", label: "Hot", icon: <Flame size={14} /> },
  { id: "new", label: "New", icon: <Clock size={14} /> },
  { id: "top", label: "Top", icon: <Trophy size={14} /> },
];

export default function TrendingSection() {
  const [active, setActive] = useState<SortMode>("trending");

  const resources: Record<SortMode, Resource[]> = {
    trending: getTrending().slice(0, 9),
    hot: getHot().slice(0, 9),
    new: getNew().slice(0, 9),
    top: getTop().slice(0, 9),
    quality: getTop().slice(0, 9),
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">Discover resources</h2>
          <p className="text-slate-400 text-sm">What the community is using right now.</p>
        </motion.div>

        <Link
          href="/explore"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.07] w-fit mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              active === tab.id
                ? "bg-white/[0.1] text-slate-100 shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {resources[active].map((resource, i) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <ResourceCard resource={resource} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
