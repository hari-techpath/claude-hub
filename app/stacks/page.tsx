"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Layers, ArrowRight, Star, Copy, Check } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import { RESOURCES } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";

interface Stack {
  id: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  color: string;
  audience: string;
  slugs: string[];
}

const STACKS: Stack[] = [
  {
    id: "full-data-engineering",
    name: "Full Data Engineering Stack",
    tagline: "Everything a data engineer needs to build production pipelines",
    description: "The complete toolkit: EL with Airbyte, transform with dbt, orchestrate with Airflow, store in Snowflake, and monitor quality with Great Expectations. Claude connects everything.",
    emoji: "🏗️",
    color: "#a78bfa",
    audience: "Data Engineers",
    slugs: ["airbyte-mcp", "dbt-cloud-mcp", "airflow-mcp", "snowflake-mcp", "great-expectations-mcp", "pipeline-monitor-agent", "dbt-debug-skill", "data-validation-hook"],
  },
  {
    id: "analytics-engineer-kit",
    name: "Analytics Engineer Starter Kit",
    tagline: "SQL-first analytics with dbt at the center",
    description: "Purpose-built for analytics engineers: dbt MCP for model management, BigQuery or Snowflake for storage, the NL-to-SQL prompt for ad-hoc queries, and sql-optimize for performance work.",
    emoji: "📊",
    color: "#34d399",
    audience: "Analytics Engineers",
    slugs: ["dbt-cloud-mcp", "bigquery-mcp", "snowflake-mcp", "nl-to-sql-prompt", "sql-optimize-skill", "explain-sql-skill", "data-catalog-prompt"],
  },
  {
    id: "data-scientist-stack",
    name: "Data Scientist Power Stack",
    tagline: "From raw data to model deployment with Claude",
    description: "DuckDB for local exploration, the Claude+Pandas trick for data wrangling, EDA skill for analysis, ML experiment prompt for tracking, and the anomaly detection agent for monitoring model drift.",
    emoji: "🔬",
    color: "#60a5fa",
    audience: "Data Scientists",
    slugs: ["duckdb-mcp", "pandas-ai-trick", "eda-python-skill", "profile-data-skill", "ml-experiment-prompt", "nl-to-sql-prompt", "anomaly-detection-agent"],
  },
  {
    id: "ml-ops-stack",
    name: "MLOps Stack",
    tagline: "Build, deploy, and monitor ML systems reliably",
    description: "The MLOps toolkit: Spark for feature engineering, Delta Lake for feature stores, the ML experiment prompt for tracking, anomaly detection for data drift, and CI hooks for model validation.",
    emoji: "🤖",
    color: "#fb923c",
    audience: "ML Engineers",
    slugs: ["spark-mcp", "delta-lake-mcp", "ml-experiment-prompt", "anomaly-detection-agent", "medallion-arch", "data-engineer-setup"],
  },
  {
    id: "streaming-stack",
    name: "Real-time Streaming Stack",
    tagline: "Build event-driven data systems with Claude",
    description: "For real-time data engineers: Kafka MCP for stream monitoring, Spark for stream processing, Prefect for orchestration, and pipeline monitoring to catch failures the moment they happen.",
    emoji: "🌊",
    color: "#22d3ee",
    audience: "Streaming Engineers",
    slugs: ["kafka-mcp", "spark-mcp", "prefect-mcp", "pipeline-monitor-agent", "schema-drift-agent", "data-validation-hook"],
  },
  {
    id: "data-quality-stack",
    name: "Data Reliability Stack",
    tagline: "Never let bad data reach your stakeholders again",
    description: "The data reliability toolkit: Great Expectations for validation, anomaly detection for statistical monitoring, schema drift detection for breaking changes, and data contracts for governance.",
    emoji: "✅",
    color: "#f472b6",
    audience: "Data Reliability Engineers",
    slugs: ["great-expectations-mcp", "anomaly-detection-agent", "schema-drift-agent", "data-quality-skill", "data-contract-skill", "dbt-ci-hook", "incident-rca-prompt"],
  },
];

function StackCard({ stack, delay }: { stack: Stack; delay: number }) {
  const [copied, setCopied] = useState(false);
  const resources = stack.slugs
    .map((slug) => RESOURCES.find((r) => r.slug === slug))
    .filter(Boolean) as typeof RESOURCES;

  const handleCopy = () => {
    const text = stack.slugs.join(", ");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="glass-card rounded-3xl p-6 flex flex-col gap-5 group hover:border-white/[0.16] transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{stack.emoji}</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: `${stack.color}20`, color: stack.color, border: `1px solid ${stack.color}30` }}
            >
              {stack.audience}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100">{stack.name}</h3>
          <p className="text-sm text-slate-400 mt-1">{stack.tagline}</p>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors shrink-0"
          title="Copy resource slugs"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">{stack.description}</p>

      {/* Resource chips */}
      <div className="flex flex-wrap gap-2">
        {resources.map((r) => {
          const meta = TYPE_META[r.type];
          return (
            <Link
              key={r.id}
              href={`/resources/${r.slug}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all hover:scale-105"
              style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
            >
              <span>{meta.icon}</span>
              <span className="font-medium">{r.name}</span>
            </Link>
          );
        })}
        {stack.slugs.length > resources.length && (
          <span className="px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.04] text-slate-500 border border-white/[0.06]">
            +{stack.slugs.length - resources.length} more
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Star size={11} className="text-yellow-500/70" />
          <span>{resources.reduce((acc, r) => acc + r.stars, 0).toLocaleString()} combined stars</span>
        </div>
        <span className="text-xs text-slate-600">{resources.length} resources</span>
      </div>
    </motion.div>
  );
}

export default function StacksPage() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6"
          >
            <Layers size={13} />
            Curated stacks for every data role
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            Build your <span className="gradient-text">data stack</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Pre-assembled collections of Claude resources that work together. Pick your role, adopt the stack.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {STACKS.map((stack, i) => (
            <StackCard key={stack.id} stack={stack} delay={i * 0.08} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center p-8 rounded-3xl bg-white/[0.02] border border-white/[0.07]"
        >
          <h2 className="text-2xl font-bold mb-2">Missing a resource?</h2>
          <p className="text-slate-400 text-sm mb-6">These stacks are community-maintained. Submit a PR to add resources or propose a new stack.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/explore" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium text-sm transition-all">
              Browse all resources <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
