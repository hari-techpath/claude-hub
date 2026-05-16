export interface Stack {
  id: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  color: string;
  audience: string;
  slugs: string[];
}

export const STACKS: Stack[] = [
  {
    id: "full-data-engineering",
    name: "Full Data Engineering Stack",
    tagline: "Everything a data engineer needs to build production pipelines",
    description:
      "The complete toolkit: EL with Airbyte, transform with dbt, orchestrate with Airflow, store in Snowflake, and monitor quality with Great Expectations. Claude connects everything.",
    emoji: "🏗️",
    color: "#a78bfa",
    audience: "Data Engineers",
    slugs: [
      "airbyte-mcp",
      "dbt-cloud-mcp",
      "airflow-mcp",
      "snowflake-mcp",
      "great-expectations-mcp",
      "pipeline-monitor-agent",
      "dbt-debug-skill",
      "data-validation-hook",
    ],
  },
  {
    id: "analytics-engineer-kit",
    name: "Analytics Engineer Starter Kit",
    tagline: "SQL-first analytics with dbt at the center",
    description:
      "Purpose-built for analytics engineers: dbt MCP for model management, BigQuery or Snowflake for storage, the NL-to-SQL prompt for ad-hoc queries, and sql-optimize for performance work.",
    emoji: "📊",
    color: "#34d399",
    audience: "Analytics Engineers",
    slugs: [
      "dbt-cloud-mcp",
      "bigquery-mcp",
      "snowflake-mcp",
      "nl-to-sql-prompt",
      "sql-optimize-skill",
      "explain-sql-skill",
      "data-catalog-prompt",
    ],
  },
  {
    id: "data-scientist-stack",
    name: "Data Scientist Power Stack",
    tagline: "From raw data to model deployment with Claude",
    description:
      "DuckDB for local exploration, the Claude+Pandas trick for data wrangling, EDA skill for analysis, ML experiment prompt for tracking, and the anomaly detection agent for monitoring model drift.",
    emoji: "🔬",
    color: "#60a5fa",
    audience: "Data Scientists",
    slugs: [
      "duckdb-mcp",
      "pandas-ai-trick",
      "eda-python-skill",
      "profile-data-skill",
      "ml-experiment-prompt",
      "nl-to-sql-prompt",
      "anomaly-detection-agent",
    ],
  },
  {
    id: "ml-ops-stack",
    name: "MLOps Stack",
    tagline: "Build, deploy, and monitor ML systems reliably",
    description:
      "The MLOps toolkit: Spark for feature engineering, Delta Lake for feature stores, the ML experiment prompt for tracking, anomaly detection for data drift, and CI hooks for model validation.",
    emoji: "🤖",
    color: "#fb923c",
    audience: "ML Engineers",
    slugs: [
      "spark-mcp",
      "delta-lake-mcp",
      "ml-experiment-prompt",
      "anomaly-detection-agent",
      "medallion-arch",
      "data-engineer-setup",
    ],
  },
  {
    id: "streaming-stack",
    name: "Real-time Streaming Stack",
    tagline: "Build event-driven data systems with Claude",
    description:
      "For real-time data engineers: Kafka MCP for stream monitoring, Spark for stream processing, Prefect for orchestration, and pipeline monitoring to catch failures the moment they happen.",
    emoji: "🌊",
    color: "#22d3ee",
    audience: "Streaming Engineers",
    slugs: [
      "kafka-mcp",
      "spark-mcp",
      "prefect-mcp",
      "pipeline-monitor-agent",
      "schema-drift-agent",
      "data-validation-hook",
    ],
  },
  {
    id: "data-quality-stack",
    name: "Data Reliability Stack",
    tagline: "Never let bad data reach your stakeholders again",
    description:
      "The data reliability toolkit: Great Expectations for validation, anomaly detection for statistical monitoring, schema drift detection for breaking changes, and data contracts for governance.",
    emoji: "✅",
    color: "#f472b6",
    audience: "Data Reliability Engineers",
    slugs: [
      "great-expectations-mcp",
      "anomaly-detection-agent",
      "schema-drift-agent",
      "data-quality-skill",
      "data-contract-skill",
      "dbt-ci-hook",
      "incident-rca-prompt",
    ],
  },
  {
    id: "analytics-engineer-pro",
    name: "Analytics Engineer Pro Stack",
    tagline: "dbt-native workflow with SQL testing and schema documentation",
    description:
      "The deep analytics engineering toolkit: dbt Core MCP for local development, dbt Cloud for CI, SQL test generation, query optimization, ERD documentation, BigQuery integration, and medallion architecture scaffolding.",
    emoji: "🧮",
    color: "#3b82f6",
    audience: "Analytics Engineers",
    slugs: [
      "dbt-debug-skill",
      "dbt-core-mcp",
      "write-sql-tests-skill",
      "sql-optimize-skill",
      "generate-erd-prompt",
      "bigquery-mcp",
      "generate-medallion-skill",
    ],
  },
  {
    id: "local-first-data-science",
    name: "Local-First Data Science Stack",
    tagline: "DuckDB + Polars for blazing-fast local analytics",
    description:
      "Modern local analytics stack: DuckDB MCP for in-process SQL, the Claude+Pandas trick for wrangling, Polars migration skill for 10x speedups, DataFrame profiling, Polars+DuckDB dev environment, and local data stack setup.",
    emoji: "🦆",
    color: "#14b8a6",
    audience: "Data Scientists",
    slugs: [
      "duckdb-mcp",
      "pandas-ai-trick",
      "pandas-to-polars-skill",
      "profile-pandas-skill",
      "polars-dev-setup",
      "local-de-stack-setup",
      "eda-python-skill",
    ],
  },
  {
    id: "data-platform-team",
    name: "Data Platform Team Stack",
    tagline: "Governance, lineage, and data quality at scale",
    description:
      "Built for platform teams owning the data fabric: column-level lineage mapping, automated schema migrations, continuous quality sentinel, Great Expectations integration, data contract generation, data dictionary docs, and automated documentation.",
    emoji: "🏛️",
    color: "#8b5cf6",
    audience: "Data Platform Engineers",
    slugs: [
      "data-lineage-mapper-agent",
      "schema-migration-agent",
      "data-quality-sentinel-agent",
      "great-expectations-mcp",
      "build-data-contract-skill",
      "data-dictionary-prompt",
      "docs-generator-agent",
    ],
  },
  {
    id: "cloud-cost-optimizer",
    name: "Cloud Cost Optimizer Stack",
    tagline: "Cut your BigQuery and Snowflake bill — intelligently",
    description:
      "For data leads watching the cloud bill: autonomous cost optimizer agent surfaces wasteful queries, query cost estimator prompts prevent bill shock before runs, Spark optimizer cuts compute costs, and SQL optimizer reduces slot usage across warehouses.",
    emoji: "💰",
    color: "#f59e0b",
    audience: "Data Leads & Architects",
    slugs: [
      "cost-optimizer-agent",
      "query-cost-estimator-prompt",
      "optimize-spark-skill",
      "sql-optimize-skill",
      "bigquery-mcp",
      "snowflake-mcp",
    ],
  },
];

export function stackToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getStackBySlug(slug: string): Stack | undefined {
  return STACKS.find((s) => s.id === slug);
}

export function getRelatedStacks(stack: Stack, limit = 3): Stack[] {
  // Find stacks that share at least one slug
  return STACKS.filter(
    (s) =>
      s.id !== stack.id &&
      s.slugs.some((slug) => stack.slugs.includes(slug))
  )
    .slice(0, limit);
}
