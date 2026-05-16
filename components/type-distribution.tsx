"use client";

import { motion } from "framer-motion";
import { getCounts } from "@/lib/resources";
import { TYPE_META, ResourceType } from "@/lib/types";

const TYPE_ORDER: ResourceType[] = [
  "mcp",
  "skill",
  "prompt",
  "agent",
  "architecture",
  "setup",
  "hook",
  "trick",
];

export default function TypeDistribution() {
  const counts = getCounts();
  const maxCount = Math.max(...TYPE_ORDER.map((t) => counts[t] || 0), 1);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">What&apos;s in the registry</h2>
        <p className="text-slate-400 text-sm">A breakdown of every resource type, by count.</p>
      </div>

      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5">
        {TYPE_ORDER.map((type, i) => {
          const meta = TYPE_META[type];
          const count = counts[type] || 0;
          const pct = count / maxCount;

          return (
            <div key={type} className="flex items-center gap-4">
              {/* Icon + label */}
              <div className="flex items-center gap-2.5 w-32 shrink-0">
                <span className="text-xl leading-none">{meta.icon}</span>
                <span className="text-sm font-medium text-slate-300">{meta.label}</span>
              </div>

              {/* Bar track */}
              <div className="flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full origin-left"
                  style={{ backgroundColor: meta.color }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: pct }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </div>

              {/* Count */}
              <div
                className="text-sm font-semibold tabular-nums w-8 text-right shrink-0"
                style={{ color: meta.color }}
              >
                {count}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
