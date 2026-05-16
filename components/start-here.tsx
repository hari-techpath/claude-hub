"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { RESOURCES } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";
import ResourceCard from "./resource-card";

const ROLES = [
  { id: "data-engineer", label: "Data Engineer", emoji: "🏗️", desc: "Build and maintain pipelines" },
  { id: "data-scientist", label: "Data Scientist", emoji: "🔬", desc: "Analyze data and build models" },
  { id: "analytics-engineer", label: "Analytics Engineer", emoji: "📊", desc: "Transform data with SQL/dbt" },
  { id: "ml-engineer", label: "ML Engineer", emoji: "🤖", desc: "Deploy and monitor ML systems" },
  { id: "data-analyst", label: "Data Analyst", emoji: "📈", desc: "Explore data and create reports" },
];

const GOALS = [
  { id: "automate", label: "Automate repetitive tasks", emoji: "⚡" },
  { id: "debug", label: "Debug faster", emoji: "🐛" },
  { id: "learn", label: "Learn new tools", emoji: "📚" },
  { id: "quality", label: "Improve data quality", emoji: "✅" },
  { id: "sql", label: "Write better SQL", emoji: "🗄️" },
];

const STACK_TOOLS = [
  { id: "snowflake", label: "Snowflake", emoji: "❄️" },
  { id: "dbt", label: "dbt", emoji: "🟠" },
  { id: "airflow", label: "Airflow", emoji: "✈️" },
  { id: "spark", label: "Spark", emoji: "⚡" },
  { id: "bigquery", label: "BigQuery", emoji: "🔵" },
  { id: "kafka", label: "Kafka", emoji: "🌊" },
  { id: "python", label: "Python/pandas", emoji: "🐍" },
  { id: "other", label: "Other / Not sure", emoji: "🔧" },
];

// Recommendation logic: role + goal + tools → resource slugs
function getRecommendations(role: string, goal: string, tools: string[]): string[] {
  const slugMap: Record<string, string[]> = {
    "data-engineer-automate": ["generate-dag-skill", "dbt-ci-hook", "data-validation-hook", "pipeline-monitor-agent"],
    "data-engineer-debug": ["dbt-debug-skill", "pipeline-monitor-agent", "incident-rca-prompt", "airflow-mcp"],
    "data-engineer-quality": ["data-quality-skill", "schema-drift-agent", "great-expectations-mcp", "data-contract-skill"],
    "data-engineer-sql": ["sql-optimize-skill", "explain-sql-skill", "nl-to-sql-prompt", "dbt-cloud-mcp"],
    "data-scientist-automate": ["eda-python-skill", "pandas-ai-trick", "ml-experiment-prompt", "anomaly-detection-agent"],
    "data-scientist-learn": ["pandas-ai-trick", "iceberg-trick", "explain-sql-skill", "data-profiling-trick"],
    "data-scientist-sql": ["nl-to-sql-prompt", "duckdb-mcp", "explain-sql-skill", "bigquery-mcp"],
    "analytics-engineer-automate": ["dbt-cloud-mcp", "sql-optimize-skill", "dbt-debug-skill", "dbt-ci-hook"],
    "analytics-engineer-sql": ["nl-to-sql-prompt", "sql-optimize-skill", "explain-sql-skill", "snowflake-mcp"],
    "analytics-engineer-quality": ["data-quality-skill", "data-contract-skill", "great-expectations-mcp"],
    "ml-engineer-automate": ["medallion-arch", "anomaly-detection-agent", "spark-mcp", "delta-lake-mcp"],
    "ml-engineer-debug": ["anomaly-detection-agent", "pipeline-monitor-agent", "incident-rca-prompt"],
    "data-analyst-sql": ["nl-to-sql-prompt", "explain-sql-skill", "duckdb-mcp", "stakeholder-report-prompt"],
    "data-analyst-learn": ["pandas-ai-trick", "data-profiling-trick", "explain-sql-skill"],
  };

  const key = `${role}-${goal}`;
  const base = slugMap[key] || ["duckdb-mcp", "nl-to-sql-prompt", "explain-sql-skill", "data-quality-skill"];

  // Add tool-specific MCPs
  const toolMcps: Record<string, string> = {
    snowflake: "snowflake-mcp",
    dbt: "dbt-cloud-mcp",
    airflow: "airflow-mcp",
    spark: "spark-mcp",
    bigquery: "bigquery-mcp",
    kafka: "kafka-mcp",
  };

  const toolSlugs = tools.flatMap((t) => (toolMcps[t] ? [toolMcps[t]] : []));
  return [...new Set([...toolSlugs, ...base])].slice(0, 6);
}

export default function StartHere() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const toggleTool = (id: string) => {
    setTools((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const recommendations = done
    ? getRecommendations(role, goal, tools)
        .map((slug) => RESOURCES.find((r) => r.slug === slug))
        .filter(Boolean) as typeof RESOURCES
    : [];

  const reset = () => { setStep(0); setRole(""); setGoal(""); setTools([]); setDone(false); };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Not sure where to start?</h2>
          <p className="text-slate-400 text-sm">Answer 3 questions and we'll build your personal resource list.</p>
        </div>

        {!done ? (
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08]">
            {/* Progress bar */}
            <div className="flex gap-2 mb-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-violet-500" : "bg-white/[0.08]"}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-semibold mb-5">What's your role?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => { setRole(r.id); setStep(1); }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-violet-500/30 transition-all text-left group"
                      >
                        <span className="text-2xl">{r.emoji}</span>
                        <div>
                          <div className="text-sm font-medium text-slate-200 group-hover:text-white">{r.label}</div>
                          <div className="text-xs text-slate-500">{r.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-semibold mb-5">What's your main goal with Claude?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {GOALS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => { setGoal(g.id); setStep(2); }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-violet-500/30 transition-all text-left group"
                      >
                        <span className="text-xl">{g.emoji}</span>
                        <span className="text-sm font-medium text-slate-200 group-hover:text-white">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-lg font-semibold mb-2">Which tools are you using? <span className="text-slate-500 font-normal text-sm">(pick all that apply)</span></h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {STACK_TOOLS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => toggleTool(t.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-all ${
                          tools.includes(t.id)
                            ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                            : "bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span>{t.emoji}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setDone(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium text-sm transition-all"
                  >
                    Show my recommendations <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">Your personalized stack</h3>
                <p className="text-slate-400 text-sm">Based on your role, goal, and tools</p>
              </div>
              <button onClick={reset} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                <RotateCcw size={12} /> Start over
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {recommendations.map((r) => <ResourceCard key={r.id} resource={r} compact />)}
            </div>
            <div className="text-center">
              <Link href="/stacks" className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                Browse all curated stacks <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
