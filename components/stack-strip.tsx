"use client";

import { motion } from "framer-motion";

const TOOLS = [
  { name: "Snowflake", emoji: "❄️", color: "#29B5E8" },
  { name: "dbt", emoji: "🟠", color: "#FF694A" },
  { name: "Apache Spark", emoji: "⚡", color: "#E25A1C" },
  { name: "Airflow", emoji: "✈️", color: "#017CEE" },
  { name: "BigQuery", emoji: "🔵", color: "#4285F4" },
  { name: "Kafka", emoji: "🌊", color: "#0E7490" },
  { name: "Databricks", emoji: "🔴", color: "#EF4444" },
  { name: "DuckDB", emoji: "🦆", color: "#FFC107" },
  { name: "Airbyte", emoji: "🔀", color: "#6366F1" },
  { name: "Fivetran", emoji: "🔗", color: "#0052CC" },
  { name: "Prefect", emoji: "🌊", color: "#7C3AED" },
  { name: "Great Expectations", emoji: "✅", color: "#34D399" },
  { name: "Redshift", emoji: "🔶", color: "#F97316" },
  { name: "Trino", emoji: "🔷", color: "#3B82F6" },
  { name: "Monte Carlo", emoji: "🎯", color: "#A78BFA" },
];

// Duplicate for seamless loop
const DOUBLED = [...TOOLS, ...TOOLS];

export default function StackStrip() {
  return (
    <div className="relative py-10 overflow-hidden border-y border-white/[0.05]">
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-transparent to-[#030712] z-10 pointer-events-none" />
      <div className="text-center mb-6 relative z-20">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Works with your entire data stack</span>
      </div>
      <div className="flex overflow-hidden">
        <motion.div
          className="flex gap-8 shrink-0"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {DOUBLED.map((tool, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0 hover:bg-white/[0.06] transition-colors"
            >
              <span className="text-lg">{tool.emoji}</span>
              <span className="text-sm text-slate-400 whitespace-nowrap font-medium">{tool.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
