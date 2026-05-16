"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowRight, Sparkles, List } from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import type { ResourceType } from "@/lib/types";

interface WishlistItem {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  requestedBy: string;
  requestedAt: string;
  votes: number;
  status: "open" | "in_progress" | "completed";
  tags: string[];
}

const WISHLIST_ITEMS: WishlistItem[] = [
  {
    id: "databricks-unity-catalog-mcp",
    title: "Databricks Unity Catalog MCP",
    description: "Full Unity Catalog integration with lineage tracking, governance controls, and data discovery. Browse catalogs, schemas, and tables; inspect column-level lineage; manage access policies — all from Claude.",
    type: "mcp",
    requestedBy: "data_lakehouse_dan",
    requestedAt: "2025-03-12",
    votes: 147,
    status: "open",
    tags: ["databricks", "unity-catalog", "governance", "lineage"],
  },
  {
    id: "snowflake-cortex-skill",
    title: "Snowflake Cortex Skill",
    description: "Use Snowflake's built-in ML functions (CORTEX.COMPLETE, CORTEX.EMBED_TEXT, CORTEX.CLASSIFY_TEXT) via Claude. Run LLM inference, embedding generation, and sentiment analysis against data already in Snowflake without moving it.",
    type: "skill",
    requestedBy: "snowflake_sarah",
    requestedAt: "2025-03-28",
    votes: 134,
    status: "in_progress",
    tags: ["snowflake", "cortex", "ml", "llm"],
  },
  {
    id: "dbt-semantic-layer-mcp",
    title: "dbt Semantic Layer MCP",
    description: "Query MetricFlow metrics directly from Claude. List available metrics, dimensions, and entities; run semantic queries; explore metric definitions — without writing SQL.",
    type: "mcp",
    requestedBy: "metrics_marco",
    requestedAt: "2025-04-03",
    votes: 129,
    status: "open",
    tags: ["dbt", "semantic-layer", "metricflow", "metrics"],
  },
  {
    id: "apache-iceberg-schema-evolution-agent",
    title: "Apache Iceberg Schema Evolution Agent",
    description: "Automatically detect and handle schema changes in Iceberg tables. Proposes safe migrations, checks for breaking changes across downstream consumers, and generates ALTER TABLE DDL with rollback plans.",
    type: "agent",
    requestedBy: "lakehouse_leo",
    requestedAt: "2025-04-10",
    votes: 98,
    status: "open",
    tags: ["iceberg", "schema-evolution", "data-lake", "migration"],
  },
  {
    id: "data-contract-validator-hook",
    title: "Data Contract Validator Hook",
    description: "Pre-commit hook that validates YAML data contracts (OpenDataContract, Data Contract CLI spec) before merge. Catches breaking changes to field types, nullability, and freshness SLOs before they hit production.",
    type: "hook",
    requestedBy: "contract_caitlin",
    requestedAt: "2025-04-18",
    votes: 87,
    status: "open",
    tags: ["data-contracts", "pre-commit", "validation", "opendc"],
  },
  {
    id: "tableau-looker-mcp",
    title: "Tableau / Looker MCP",
    description: "Query and manage BI dashboards from Claude. Fetch Tableau workbooks, query Looker Explores via the SDK, refresh extracts, read dashboard data, and generate ad-hoc analyses without opening the UI.",
    type: "mcp",
    requestedBy: "bi_brianna",
    requestedAt: "2025-04-22",
    votes: 112,
    status: "open",
    tags: ["tableau", "looker", "bi", "dashboards"],
  },
  {
    id: "monte-carlo-observability-mcp",
    title: "Monte Carlo Data Observability MCP",
    description: "Access data quality alerts, lineage graphs, and anomaly incidents from Monte Carlo directly in Claude. Triage freshness and volume breaches, trace lineage from broken table to root cause, and draft incident notes.",
    type: "mcp",
    requestedBy: "observability_omar",
    requestedAt: "2025-04-29",
    votes: 76,
    status: "open",
    tags: ["monte-carlo", "observability", "data-quality", "lineage"],
  },
  {
    id: "fivetran-connector-builder-skill",
    title: "Fivetran Connector Builder Skill",
    description: "Scaffold custom Fivetran connectors using the Connector SDK. Generates boilerplate Python connector code, schema definitions, and update strategies from an API spec or OpenAPI doc you paste in.",
    type: "skill",
    requestedBy: "pipeline_priya",
    requestedAt: "2025-05-01",
    votes: 68,
    status: "open",
    tags: ["fivetran", "connectors", "etl", "python"],
  },
  {
    id: "dbt-mesh-agent",
    title: "dbt Mesh Agent",
    description: "Manage cross-project dbt mesh dependencies. Discover public models across projects, check interface contracts, trace cross-project lineage, and generate access grants — all without leaving your IDE.",
    type: "agent",
    requestedBy: "mesh_michelle",
    requestedAt: "2025-05-05",
    votes: 91,
    status: "open",
    tags: ["dbt", "mesh", "cross-project", "lineage"],
  },
  {
    id: "spark-structured-streaming-agent",
    title: "Spark Structured Streaming Agent",
    description: "Monitor and optimize Spark Structured Streaming jobs. Surfaces lag metrics, checkpoint health, and shuffle bottlenecks; suggests trigger intervals; auto-generates watermark and windowing adjustments.",
    type: "agent",
    requestedBy: "streaming_stefan",
    requestedAt: "2025-05-08",
    votes: 83,
    status: "open",
    tags: ["spark", "streaming", "optimization", "monitoring"],
  },
  {
    id: "astronomer-airflow-mcp",
    title: "Astronomer Airflow MCP",
    description: "Full Airflow management via Astro Cloud. Trigger DAG runs, inspect task logs, manage Airflow variables and connections, review DAG run history, and debug failed tasks — without the Airflow UI.",
    type: "mcp",
    requestedBy: "airflow_anya",
    requestedAt: "2025-05-10",
    votes: 103,
    status: "completed",
    tags: ["airflow", "astronomer", "orchestration", "dag"],
  },
  {
    id: "great-expectations-cloud-mcp",
    title: "Great Expectations Cloud MCP",
    description: "Connect to GX Cloud for centralized data validation. Run Expectation Suites on demand, review Validation Results, manage Data Assets, and create new Expectations from sample data — via natural language.",
    type: "mcp",
    requestedBy: "gx_gabriel",
    requestedAt: "2025-05-12",
    votes: 72,
    status: "open",
    tags: ["great-expectations", "data-quality", "validation", "gx-cloud"],
  },
];

const VOTES_KEY = "ch-votes-wishlist";

function loadVotes(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveVotes(votes: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

const TYPE_COLORS: Record<ResourceType, string> = {
  mcp: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  skill: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  agent: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  prompt: "bg-pink-500/15 text-pink-300 border-pink-500/25",
  architecture: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  setup: "bg-teal-500/15 text-teal-300 border-teal-500/25",
  hook: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  trick: "bg-rose-500/15 text-rose-300 border-rose-500/25",
};

const STATUS_CONFIG = {
  open: { label: "Open", cls: "bg-blue-500/15 text-blue-300 border-blue-500/25" },
  in_progress: { label: "In progress", cls: "bg-orange-500/15 text-orange-300 border-orange-500/25" },
  completed: { label: "Completed", cls: "bg-green-500/15 text-green-300 border-green-500/25" },
};

type StatusTab = "open" | "in_progress" | "completed";
type SortMode = "votes" | "date";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function WishlistPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTab>("open");
  const [sortMode, setSortMode] = useState<SortMode>("votes");
  const [votes, setVotes] = useState<Record<string, boolean>>({});
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(WISHLIST_ITEMS.map((i) => [i.id, i.votes]))
  );

  useEffect(() => {
    setVotes(loadVotes());
  }, []);

  function toggleVote(id: string) {
    setVotes((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveVotes(next);
      return next;
    });
    setVoteCounts((prev) => ({
      ...prev,
      [id]: votes[id] ? prev[id] - 1 : prev[id] + 1,
    }));
  }

  const filtered = WISHLIST_ITEMS.filter((i) => i.status === activeTab).sort((a, b) =>
    sortMode === "votes"
      ? (voteCounts[b.id] ?? b.votes) - (voteCounts[a.id] ?? a.votes)
      : new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );

  const counts = {
    open: WISHLIST_ITEMS.filter((i) => i.status === "open").length,
    in_progress: WISHLIST_ITEMS.filter((i) => i.status === "in_progress").length,
    completed: WISHLIST_ITEMS.filter((i) => i.status === "completed").length,
  };

  const tabs: { key: StatusTab; label: string }[] = [
    { key: "open", label: "Open requests" },
    { key: "in_progress", label: "In progress" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-4">
                <Sparkles size={13} /> Community Wishlist
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Community Wishlist
              </h1>
              <p className="text-slate-400 leading-relaxed">
                Vote for the resources you want to see next.{" "}
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-slate-300 text-sm font-medium">
                  <List size={12} />
                  {WISHLIST_ITEMS.length} requests
                </span>
              </p>
            </div>
            <Link
              href="/submit"
              className="shrink-0 self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all text-violet-300 text-sm font-medium"
            >
              Request a resource <ArrowRight size={14} />
            </Link>
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-white/[0.08] text-slate-100 shadow-sm"
                    : "text-slate-400 hover:text-slate-300 hover:bg-white/[0.04]"
                }`}
              >
                {tab.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key
                      ? "bg-violet-500/20 text-violet-300"
                      : "bg-white/[0.06] text-slate-500"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sort control */}
        <div className="flex items-center justify-end gap-2 mb-5">
          <span className="text-xs text-slate-500">Sort by:</span>
          {(["votes", "date"] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortMode === mode
                  ? "bg-white/[0.08] text-slate-200 border border-white/[0.12]"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
              }`}
            >
              {mode === "votes" ? "Most votes" : "Newest"}
            </button>
          ))}
        </div>

        {/* Items */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            >
              <p className="text-slate-400 font-medium mb-1">No items here yet</p>
              <p className="text-slate-600 text-sm">
                {activeTab === "open"
                  ? "No open requests right now."
                  : activeTab === "in_progress"
                  ? "Nothing in progress at the moment."
                  : "Nothing completed yet — check back soon."}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item, idx) => {
                const voted = !!votes[item.id];
                const count = voteCounts[item.id] ?? item.votes;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: idx * 0.04 }}
                    className="glass-card rounded-2xl p-5 flex gap-4 group"
                  >
                    {/* Vote button */}
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                      <button
                        onClick={() => toggleVote(item.id)}
                        title={voted ? "Remove vote" : "Upvote"}
                        className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl border transition-all ${
                          voted
                            ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                            : "bg-white/[0.04] border-white/[0.08] text-slate-500 hover:bg-violet-500/10 hover:border-violet-500/25 hover:text-violet-300"
                        }`}
                      >
                        <ArrowUp size={14} strokeWidth={2.5} />
                        <span className="text-xs font-semibold tabular-nums leading-none">
                          {count}
                        </span>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Type badge */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border uppercase tracking-wide ${TYPE_COLORS[item.type]}`}
                        >
                          {item.type}
                        </span>
                        {/* Status badge */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${STATUS_CONFIG[item.status].cls}`}
                        >
                          {STATUS_CONFIG[item.status].label}
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-100 leading-snug mb-1.5 group-hover:text-white transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed mb-3">
                        {item.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.tags.map((tag) => (
                          <span key={tag} className="tag-pill">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Meta */}
                      <p className="text-xs text-slate-600">
                        Requested by{" "}
                        <span className="text-slate-500 font-medium">
                          @{item.requestedBy}
                        </span>{" "}
                        · {formatDate(item.requestedAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
