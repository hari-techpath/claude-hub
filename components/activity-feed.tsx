"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ACTIVITIES = [
  "🔥 Someone in Berlin just discovered kafka-mcp",
  "⭐ New star on snowflake-mcp — now at 3.2k stars",
  "👀 42 people viewed dbt-debug-skill this week",
  "🚀 data-lineage-mapper-agent was featured",
  "💾 Someone saved sql-query-optimizer to their list",
  "🔍 'dbt testing' searched 8 times today",
  "✨ great-expectations-mcp was just verified",
  "📦 new: polars-dev-setup added to Local-First Data Science stack",
];

export default function ActivityFeed() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ACTIVITIES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full py-2.5 px-4"
      style={{
        background: "rgba(10, 10, 18, 0.72)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest shrink-0">Live</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
        <div className="overflow-hidden h-[18px] flex items-center">
          <AnimatePresence mode="wait">
            {visible && (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-[12px] text-slate-400 whitespace-nowrap"
              >
                {ACTIVITIES[index]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
