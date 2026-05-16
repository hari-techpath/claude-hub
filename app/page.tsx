"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Nav from "@/components/nav";
import ActivityFeed from "@/components/activity-feed";
import TrendingTicker from "@/components/trending-ticker";
import Hero from "@/components/hero";
import StackStrip from "@/components/stack-strip";
import FeaturedSpotlight from "@/components/featured-spotlight";
import CategoryGrid from "@/components/category-grid";
import TrendingSection from "@/components/trending-section";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import Link from "next/link";
import { getCounts, getNew, RESOURCES } from "@/lib/resources";
import ResourceCard from "@/components/resource-card";
import PeopleAlsoViewed from "@/components/people-also-viewed";

const StartHere = dynamic(() => import("@/components/start-here"), { ssr: false });
const TypeDistribution = dynamic(() => import("@/components/type-distribution"), { ssr: false });
const CommunityStats = dynamic(() => import("@/components/community-stats"), { ssr: false });
const Newsletter = dynamic(() => import("@/components/newsletter"), { ssr: false });

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const counts = getCounts();
  const totalCount = RESOURCES.length;
  const recentResources = useMemo(() => getNew().slice(0, 6), []);

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <TrendingTicker />
      <main>
        <Hero onSearchOpen={() => setSearchOpen(true)} totalCount={totalCount} counts={counts} />
        <StackStrip />
        <FeaturedSpotlight />

        {/* Start Here wizard */}
        <section id="start-here" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Find your perfect setup</h2>
          </div>
          <StartHere />
        </section>

        <CategoryGrid counts={counts} />
        <TrendingSection />
        <TypeDistribution />

        {/* Recently added */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold">Recently added</h2>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {recentResources.map((resource, i) => (
              <motion.div
                key={resource.id}
                className="min-w-[280px]"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
              >
                <ResourceCard resource={resource} compact />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trending together */}
        <PeopleAlsoViewed />

        {/* Stacks teaser */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Data stacks</h2>
              <p className="text-slate-400 text-sm">Pre-assembled resource bundles for every data role.</p>
            </div>
            <Link href="/stacks" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium">
              Browse all stacks →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { emoji: "🏗️", name: "Full Data Engineering Stack", audience: "Data Engineers", color: "#a78bfa", href: "/stacks" },
              { emoji: "📊", name: "Analytics Engineer Starter Kit", audience: "Analytics Engineers", color: "#34d399", href: "/stacks" },
              { emoji: "🔬", name: "Data Scientist Power Stack", audience: "Data Scientists", color: "#60a5fa", href: "/stacks" },
              { emoji: "🤖", name: "MLOps Stack", audience: "ML Engineers", color: "#fb923c", href: "/stacks" },
              { emoji: "🌊", name: "Streaming Stack", audience: "Streaming Engineers", color: "#22d3ee", href: "/stacks" },
              { emoji: "✅", name: "Data Reliability Stack", audience: "DREs", color: "#f472b6", href: "/stacks" },
            ].map((s) => (
              <Link key={s.name} href={s.href} className="glass-card rounded-2xl p-4 hover:border-white/[0.14] transition-all group">
                <span className="text-2xl block mb-2">{s.emoji}</span>
                <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">{s.name}</div>
                <div className="text-xs mt-0.5" style={{ color: s.color }}>{s.audience}</div>
              </Link>
            ))}
          </div>
        </section>
        <Newsletter />
        <CommunityStats />
      </main>
      <ActivityFeed />
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
