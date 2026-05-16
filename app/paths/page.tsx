"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import { RESOURCES } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";

// ── Path definitions ──────────────────────────────────────────────────────────

interface PathStage {
  label: string;
  level: "beginner" | "intermediate" | "advanced";
  slugs: string[];
}

interface LearningPath {
  id: string;
  role: string; // matches role IDs from start-here.tsx
  name: string;
  description: string;
  estimatedHours: number;
  stages: PathStage[];
}

const LEARNING_PATHS: LearningPath[] = [
  {
    id: "data-engineering-fundamentals",
    role: "data-engineer",
    name: "Data Engineering Fundamentals",
    description: "Go from zero to production-ready data pipelines with Claude.",
    estimatedHours: 8,
    stages: [
      {
        label: "Getting Started",
        level: "beginner",
        slugs: ["mcp-postgres", "nl-to-sql-prompt", "data-profiling-trick"],
      },
      {
        label: "Build Pipelines",
        level: "intermediate",
        slugs: ["airflow-mcp", "dbt-cloud-mcp", "generate-dag-skill"],
      },
      {
        label: "Production Ready",
        level: "advanced",
        slugs: ["pipeline-monitor-agent", "medallion-arch", "delta-lake-mcp"],
      },
    ],
  },
  {
    id: "analytics-engineering-dbt",
    role: "analytics-engineer",
    name: "Analytics Engineering with dbt",
    description: "Master dbt from basics to advanced patterns and production deployments.",
    estimatedHours: 6,
    stages: [
      {
        label: "dbt Basics",
        level: "beginner",
        slugs: ["dbt-cloud-mcp", "snowflake-mcp", "explain-sql-skill"],
      },
      {
        label: "Testing & Docs",
        level: "intermediate",
        slugs: ["data-quality-skill", "dbt-debug-skill", "dbt-ci-hook"],
      },
      {
        label: "Advanced Patterns",
        level: "advanced",
        slugs: ["sql-optimize-skill", "data-contract-skill", "schema-drift-agent"],
      },
    ],
  },
  {
    id: "ml-engineering-production",
    role: "ml-engineer",
    name: "ML Engineering & Production",
    description: "Build, ship, and monitor ML systems with Claude as your co-pilot.",
    estimatedHours: 10,
    stages: [
      {
        label: "ML Data Prep",
        level: "beginner",
        slugs: ["eda-python-skill", "profile-data-skill", "pandas-ai-trick"],
      },
      {
        label: "Feature Pipelines",
        level: "intermediate",
        slugs: ["databricks-mcp", "spark-mcp", "ml-experiment-prompt"],
      },
      {
        label: "MLOps & Monitoring",
        level: "advanced",
        slugs: ["anomaly-detection-agent", "medallion-arch", "arch-rag-pipeline"],
      },
    ],
  },
  {
    id: "data-quality-reliability",
    role: "data-analyst",
    name: "Data Quality & Reliability",
    description: "Catch data issues early, automate validation, and own your SLAs.",
    estimatedHours: 7,
    stages: [
      {
        label: "Basic Validation",
        level: "beginner",
        slugs: ["data-catalog-prompt", "nl-to-sql-prompt", "data-profiling-trick"],
      },
      {
        label: "Automated Testing",
        level: "intermediate",
        slugs: ["great-expectations-mcp", "data-quality-skill", "data-validation-hook"],
      },
      {
        label: "Observability & SLAs",
        level: "advanced",
        slugs: ["anomaly-detection-agent", "pipeline-monitor-agent", "incident-rca-prompt"],
      },
    ],
  },
];

// Role → path ID mapping (mirrors role IDs from start-here.tsx)
const ROLE_TO_PATH: Record<string, string> = {
  "data-engineer": "data-engineering-fundamentals",
  "analytics-engineer": "analytics-engineering-dbt",
  "ml-engineer": "ml-engineering-production",
  "data-analyst": "data-quality-reliability",
  "data-scientist": "data-engineering-fundamentals",
};

const STAGE_COLORS = {
  beginner: {
    header: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  intermediate: {
    header: "bg-yellow-500/15 border-yellow-500/30",
    text: "text-yellow-400",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    dot: "bg-yellow-400",
  },
  advanced: {
    header: "bg-red-500/15 border-red-500/30",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    dot: "bg-red-400",
  },
};

function MiniResourceCard({ slug }: { slug: string }) {
  const resource = RESOURCES.find((r) => r.slug === slug);
  if (!resource) return null;

  const meta = TYPE_META[resource.type];

  return (
    <Link href={`/resources/${slug}`}>
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all group cursor-pointer">
        <span className="text-lg shrink-0 mt-0.5">{meta.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-200 group-hover:text-white truncate leading-tight">
            {resource.name}
          </div>
          <span
            className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border"
            style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
          >
            {meta.label}
          </span>
        </div>
        <ArrowRight
          size={13}
          className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-0.5"
        />
      </div>
    </Link>
  );
}

function StageColumn({ stage, index }: { stage: PathStage; index: number }) {
  const colors = STAGE_COLORS[stage.level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="flex-1 min-w-0"
    >
      <div className={`rounded-2xl border overflow-hidden ${colors.header}`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b ${colors.header}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
              Stage {index + 1}
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-200">{stage.label}</div>
          <span
            className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${colors.badge}`}
          >
            {stage.level}
          </span>
        </div>

        {/* Resources */}
        <div className="p-3 space-y-2 bg-white/[0.01]">
          {stage.slugs.map((slug) => (
            <MiniResourceCard key={slug} slug={slug} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ArrowConnector() {
  return (
    <div className="hidden lg:flex items-center justify-center shrink-0 px-1">
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <ArrowRight size={18} className="text-slate-600" />
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
}

export default function PathsPage() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const [selectedPathId, setSelectedPathId] = useState<string>(() => {
    if (roleParam && ROLE_TO_PATH[roleParam]) {
      return ROLE_TO_PATH[roleParam];
    }
    return LEARNING_PATHS[0].id;
  });

  const [searchOpen, setSearchOpen] = useState(false);

  // Sync if URL param changes
  useEffect(() => {
    if (roleParam && ROLE_TO_PATH[roleParam]) {
      setSelectedPathId(ROLE_TO_PATH[roleParam]);
    }
  }, [roleParam]);

  const activePath = LEARNING_PATHS.find((p) => p.id === selectedPathId) ?? LEARNING_PATHS[0];

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Learning <span className="gradient-text">Paths</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              Structured progressions from beginner to advanced. Pick your role and follow the stages.
            </p>
          </motion.div>
        </div>

        {/* Tab selector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {LEARNING_PATHS.map((path) => (
            <button
              key={path.id}
              onClick={() => setSelectedPathId(path.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                selectedPathId === path.id
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                  : "bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
              }`}
            >
              {path.name}
            </button>
          ))}
        </motion.div>

        {/* Active path */}
        <motion.div
          key={activePath.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Path info */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">{activePath.name}</h2>
              <p className="text-slate-400 text-sm mt-1">{activePath.description}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400">
              <Clock size={14} />
              <span className="text-sm font-medium">
                Estimated time: <span className="text-slate-200">{activePath.estimatedHours} hours</span>
              </span>
            </div>
          </div>

          {/* Stages */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 items-stretch">
            {activePath.stages.map((stage, i) => (
              <>
                <StageColumn key={stage.label} stage={stage} index={i} />
                {i < activePath.stages.length - 1 && <ArrowConnector key={`arrow-${i}`} />}
              </>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-8 flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07]"
          >
            <div>
              <div className="text-sm font-semibold text-slate-200 mb-0.5">
                Ready to explore everything?
              </div>
              <div className="text-xs text-slate-500">
                Browse all resources across types and complexity levels.
              </div>
            </div>
            <Link
              href="/explore"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 text-sm font-medium hover:bg-violet-500/30 transition-all"
            >
              Explore all <ArrowRight size={13} />
            </Link>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
