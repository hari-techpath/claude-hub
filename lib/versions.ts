export interface ResourceVersion {
  resourceSlug: string;
  version: string;
  date: string;       // ISO date
  changes: string[];  // list of changes in this version
  breaking?: boolean; // breaking change?
}

export const VERSIONS: ResourceVersion[] = [
  // ─── snowflake-mcp ────────────────────────────────────────────────────────
  {
    resourceSlug: "snowflake-mcp",
    version: "1.0.0",
    date: "2024-06-01",
    changes: ["Initial release", "Basic query execution", "Schema browsing"],
  },
  {
    resourceSlug: "snowflake-mcp",
    version: "1.1.0",
    date: "2024-08-15",
    changes: ["Added time travel queries", "Improved error messages"],
  },
  {
    resourceSlug: "snowflake-mcp",
    version: "1.2.0",
    date: "2024-11-20",
    changes: ["Dynamic table support", "Cost tracking endpoints"],
  },
  {
    resourceSlug: "snowflake-mcp",
    version: "2.0.0",
    date: "2025-02-10",
    breaking: true,
    changes: [
      "Redesigned authentication flow — OAuth 2.0 replaces key-pair auth",
      "New config format (snowflake.config.json instead of env vars)",
      "Removed deprecated /query-legacy endpoint",
    ],
  },
  {
    resourceSlug: "snowflake-mcp",
    version: "2.1.0",
    date: "2025-05-01",
    changes: ["Cortex AI integration", "Query history endpoint"],
  },

  // ─── dbt-debug-skill ──────────────────────────────────────────────────────
  {
    resourceSlug: "dbt-debug-skill",
    version: "1.0.0",
    date: "2024-07-10",
    changes: [
      "Initial release",
      "Parses dbt compile errors and explains root cause",
      "Supports dbt Core 1.5+",
    ],
  },
  {
    resourceSlug: "dbt-debug-skill",
    version: "1.1.0",
    date: "2024-09-22",
    changes: [
      "Added ref() graph traversal for upstream dependency analysis",
      "Better handling of Jinja2 macro errors",
    ],
  },
  {
    resourceSlug: "dbt-debug-skill",
    version: "1.2.0",
    date: "2024-12-05",
    changes: [
      "dbt Cloud integration — pull run logs automatically",
      "Test failure explainer with suggested fixes",
    ],
  },
  {
    resourceSlug: "dbt-debug-skill",
    version: "2.0.0",
    date: "2025-03-18",
    breaking: true,
    changes: [
      "Skill renamed from /dbt-debug to /dbt — all invocations must update",
      "Dropped support for dbt Core <1.5",
      "Config now read from .claude/skills/dbt.yaml instead of inline args",
    ],
  },
  {
    resourceSlug: "dbt-debug-skill",
    version: "2.1.0",
    date: "2025-05-12",
    changes: ["Added /dbt test-explain subcommand", "Support for dbt 1.8 unit tests"],
  },

  // ─── kafka-mcp ────────────────────────────────────────────────────────────
  {
    resourceSlug: "kafka-mcp",
    version: "1.0.0",
    date: "2024-05-20",
    changes: [
      "Initial release",
      "Topic listing and metadata inspection",
      "Consumer group lag monitoring",
    ],
  },
  {
    resourceSlug: "kafka-mcp",
    version: "1.1.0",
    date: "2024-08-01",
    changes: [
      "Schema Registry integration for Avro/Protobuf schemas",
      "Partition reassignment support",
    ],
  },
  {
    resourceSlug: "kafka-mcp",
    version: "1.2.0",
    date: "2024-10-14",
    changes: [
      "Confluent Cloud support via REST proxy",
      "Added produce-sample-message tool for testing",
    ],
  },
  {
    resourceSlug: "kafka-mcp",
    version: "2.0.0",
    date: "2025-01-28",
    breaking: true,
    changes: [
      "Moved to KRaft mode only — ZooKeeper connection strings no longer accepted",
      "Authentication config restructured to support SASL/OAUTHBEARER",
      "Removed plaintext (no-auth) connection mode",
    ],
  },
  {
    resourceSlug: "kafka-mcp",
    version: "2.0.1",
    date: "2025-03-05",
    changes: ["Fixed consumer group offset reset bug", "Improved timeout handling on slow brokers"],
  },

  // ─── airflow-mcp ─────────────────────────────────────────────────────────
  {
    resourceSlug: "airflow-mcp",
    version: "1.0.0",
    date: "2024-06-15",
    changes: [
      "Initial release",
      "DAG listing, triggering, and status checks",
      "Supports Airflow 2.6+",
    ],
  },
  {
    resourceSlug: "airflow-mcp",
    version: "1.1.0",
    date: "2024-09-03",
    changes: [
      "Task instance log streaming",
      "XCom value inspection tool",
    ],
  },
  {
    resourceSlug: "airflow-mcp",
    version: "1.2.0",
    date: "2025-01-10",
    changes: [
      "Astro Cloud support via Astro API",
      "Dataset-aware DAG scheduling helpers",
    ],
  },
  {
    resourceSlug: "airflow-mcp",
    version: "2.0.0",
    date: "2025-04-02",
    breaking: true,
    changes: [
      "Upgraded to Airflow 3.x REST API — Airflow 2.x endpoints removed",
      "Connection config moved to airflow.mcp.json",
      "Removed legacy experimental API support",
    ],
  },

  // ─── great-expectations-mcp ───────────────────────────────────────────────
  {
    resourceSlug: "great-expectations-mcp",
    version: "1.0.0",
    date: "2024-07-01",
    changes: [
      "Initial release",
      "Run checkpoint and surface failed expectations",
      "Supports GX Core 0.18+",
    ],
  },
  {
    resourceSlug: "great-expectations-mcp",
    version: "1.1.0",
    date: "2024-09-18",
    changes: [
      "Natural-language expectation authoring",
      "Integration with GX Cloud for validation history",
    ],
  },
  {
    resourceSlug: "great-expectations-mcp",
    version: "1.2.0",
    date: "2024-12-20",
    changes: [
      "Batch definition helpers for SQL datasources",
      "Data docs auto-refresh after validation",
    ],
  },
  {
    resourceSlug: "great-expectations-mcp",
    version: "1.3.0",
    date: "2025-04-15",
    changes: [
      "Support for GX 1.0 GA fluent API",
      "Added expectation suite comparison tool",
    ],
  },

  // ─── data-lineage-mapper-agent ────────────────────────────────────────────
  {
    resourceSlug: "data-lineage-mapper-agent",
    version: "1.0.0",
    date: "2024-08-01",
    changes: [
      "Initial release",
      "Column-level lineage extraction from dbt manifests",
      "Mermaid diagram output",
    ],
  },
  {
    resourceSlug: "data-lineage-mapper-agent",
    version: "1.1.0",
    date: "2024-10-22",
    changes: [
      "Added Snowflake ACCESS_HISTORY integration for runtime lineage",
      "Support for Spark SQL EXPLAIN EXTENDED parsing",
    ],
  },
  {
    resourceSlug: "data-lineage-mapper-agent",
    version: "2.0.0",
    date: "2025-02-14",
    breaking: true,
    changes: [
      "Agent now requires Claude claude-sonnet-4-6 or newer — older models not supported",
      "Output format changed from Mermaid to OpenLineage JSON (use --mermaid flag for legacy)",
      "Removed --flat-mode flag (now always column-level)",
    ],
  },
  {
    resourceSlug: "data-lineage-mapper-agent",
    version: "2.1.0",
    date: "2025-05-08",
    changes: [
      "DataHub emit integration",
      "Lineage diff between manifest versions",
    ],
  },

  // ─── sql-optimize-skill ───────────────────────────────────────────────────
  {
    resourceSlug: "sql-optimize-skill",
    version: "1.0.0",
    date: "2024-05-15",
    changes: [
      "Initial release",
      "Query plan analysis for Snowflake and BigQuery",
      "Index and clustering key recommendations",
    ],
  },
  {
    resourceSlug: "sql-optimize-skill",
    version: "1.1.0",
    date: "2024-07-30",
    changes: [
      "Redshift EXPLAIN support",
      "Window function rewrite suggestions",
    ],
  },
  {
    resourceSlug: "sql-optimize-skill",
    version: "1.2.0",
    date: "2024-11-05",
    changes: [
      "DuckDB and MotherDuck support",
      "CTE materialization hints",
    ],
  },
  {
    resourceSlug: "sql-optimize-skill",
    version: "1.3.0",
    date: "2025-03-25",
    changes: [
      "Cost estimation before/after rewrite using warehouse credits",
      "Databricks Photon-aware recommendations",
    ],
  },

  // ─── databricks-mcp ───────────────────────────────────────────────────────
  {
    resourceSlug: "databricks-mcp",
    version: "1.0.0",
    date: "2024-06-28",
    changes: [
      "Initial release",
      "Cluster and job management",
      "Unity Catalog table browsing",
    ],
  },
  {
    resourceSlug: "databricks-mcp",
    version: "1.1.0",
    date: "2024-09-10",
    changes: [
      "Delta table history and restore support",
      "MLflow experiment and run inspection",
    ],
  },
  {
    resourceSlug: "databricks-mcp",
    version: "1.2.0",
    date: "2024-12-01",
    changes: [
      "Serverless compute support",
      "DLT pipeline status and event log tool",
    ],
  },
  {
    resourceSlug: "databricks-mcp",
    version: "2.0.0",
    date: "2025-04-20",
    breaking: true,
    changes: [
      "Authentication migrated to OAuth M2M — PAT tokens no longer accepted",
      "Host config moved from DATABRICKS_HOST env var to databricks.mcp.json",
      "Removed Hive metastore tools (Unity Catalog only)",
    ],
  },

  // ─── spark-mcp ────────────────────────────────────────────────────────────
  {
    resourceSlug: "spark-mcp",
    version: "1.0.0",
    date: "2024-07-15",
    changes: [
      "Initial release",
      "SparkUI job and stage inspection",
      "Executor memory and GC metrics",
    ],
  },
  {
    resourceSlug: "spark-mcp",
    version: "1.1.0",
    date: "2024-09-28",
    changes: [
      "Adaptive Query Execution plan diff tool",
      "Broadcast join threshold advisor",
    ],
  },
  {
    resourceSlug: "spark-mcp",
    version: "1.2.0",
    date: "2025-01-15",
    changes: [
      "Spark Structured Streaming metrics (lag, batch duration)",
      "Support for remote SparkContext via Spark Connect",
    ],
  },
  {
    resourceSlug: "spark-mcp",
    version: "2.0.0",
    date: "2025-05-01",
    breaking: true,
    changes: [
      "Dropped Spark 2.x and 3.1 support — minimum is Spark 3.3",
      "Config format changed: spark-mcp.yaml replaces CLI flags",
      "Removed /spark-history-server tool (use /spark-jobs instead)",
    ],
  },

  // ─── duckdb-mcp ───────────────────────────────────────────────────────────
  {
    resourceSlug: "duckdb-mcp",
    version: "1.0.0",
    date: "2024-08-10",
    changes: [
      "Initial release",
      "In-process DuckDB query execution",
      "Parquet and CSV file querying",
    ],
  },
  {
    resourceSlug: "duckdb-mcp",
    version: "1.1.0",
    date: "2024-10-05",
    changes: [
      "MotherDuck cloud database support",
      "Delta Lake and Iceberg table reading",
    ],
  },
  {
    resourceSlug: "duckdb-mcp",
    version: "1.2.0",
    date: "2025-01-22",
    changes: [
      "httpfs extension auto-install for S3/GCS/AZ querying",
      "Query result caching with TTL control",
    ],
  },
  {
    resourceSlug: "duckdb-mcp",
    version: "1.3.0",
    date: "2025-04-10",
    changes: [
      "DuckDB 1.2 spatial extension support",
      "Persistent secrets manager integration",
    ],
  },
];

/** Returns versions for a given resource slug, sorted newest first. */
export function getVersionsForSlug(slug: string): ResourceVersion[] {
  return VERSIONS.filter((v) => v.resourceSlug === slug).sort((a, b) =>
    b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: "base" })
  );
}

/** Returns the latest version entry for a slug, or undefined. */
export function getLatestVersion(slug: string): ResourceVersion | undefined {
  return getVersionsForSlug(slug)[0];
}
