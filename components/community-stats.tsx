"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { RESOURCES } from "@/lib/resources";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}

function useCountUp(target: number, duration = 1.8, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);

  return count;
}

function StatCard({
  stat,
  index,
  active,
}: {
  stat: Stat;
  index: number;
  active: boolean;
}) {
  const count = useCountUp(stat.value, 1.8, active);

  function formatDisplay(n: number, suffix: string) {
    if (suffix === "k+") return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k+";
    return n.toLocaleString() + suffix;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex-1 min-w-[180px] relative group"
    >
      <div
        className="h-full rounded-2xl p-6 text-center
          bg-white/[0.03] border border-white/[0.07]
          backdrop-blur-md
          hover:bg-white/[0.05] hover:border-white/[0.12]
          transition-all duration-200
          shadow-lg hover:shadow-xl"
      >
        <div className="text-3xl mb-2">{stat.icon}</div>
        <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1 tabular-nums">
          {active ? formatDisplay(count, stat.suffix) : "—"}
        </div>
        <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
      </div>
    </motion.div>
  );
}

export default function CommunityStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const totalStars = RESOURCES.reduce((acc, r) => acc + r.stars, 0);

  const stats: Stat[] = [
    {
      value: RESOURCES.length,
      suffix: "",
      label: "resources curated",
      icon: "📦",
    },
    {
      value: 2847,
      suffix: "",
      label: "weekly active users",
      icon: "👥",
    },
    {
      value: totalStars,
      suffix: "+",
      label: "total stars across all resources",
      icon: "⭐",
    },
    {
      value: 73,
      suffix: "",
      label: "contributors",
      icon: "🤝",
    },
  ];

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="text-2xl sm:text-3xl font-bold mb-2"
        >
          Built by the{" "}
          <span className="gradient-text">data community</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="text-slate-400 text-sm"
        >
          Real usage numbers from real data engineers.
        </motion.p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} active={inView} />
        ))}
      </div>
    </section>
  );
}
