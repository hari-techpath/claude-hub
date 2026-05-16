"use client";

import { TrendingUp, Search } from "lucide-react";
import Link from "next/link";
import { TYPE_META } from "@/lib/types";
import type { ResourceType } from "@/lib/types";

const TRENDING_TERMS = [
  "snowflake mcp",
  "dbt testing",
  "bigquery optimization",
  "kafka streaming",
  "python data pipeline",
  "sql query optimization",
  "airflow dag",
  "spark tuning",
  "data lineage",
  "great expectations",
];

// Cycle through type colors for visual variety
const TYPE_KEYS = Object.keys(TYPE_META) as ResourceType[];

export default function TrendingSearches() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm px-5 py-4"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-violet-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            What data teams are searching for
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {TRENDING_TERMS.map((term, i) => {
            const typeKey = TYPE_KEYS[i % TYPE_KEYS.length];
            const meta = TYPE_META[typeKey];
            return (
              <Link
                key={term}
                href={`/explore?q=${encodeURIComponent(term)}`}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 hover:shadow-md"
                style={{
                  background: meta.bg,
                  borderColor: meta.border,
                  color: meta.color,
                }}
              >
                <Search size={10} className="shrink-0" />
                {term}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
