export interface Review {
  resourceSlug: string;
  author: string;
  role: string;
  avatar: string; // single emoji
  rating: number; // 1-5
  text: string;
  date: string; // ISO date
}

export const REVIEWS: Review[] = [
  // snowflake-mcp
  {
    resourceSlug: "snowflake-mcp",
    author: "Priya Nair",
    role: "Senior Data Engineer",
    avatar: "👩‍💻",
    rating: 5,
    text: "This MCP saved me hours of context switching every week. I can query Snowflake directly from Claude, iterate on transforms, and debug schema mismatches without ever leaving my chat window. Game changer for our team.",
    date: "2025-04-18",
  },
  {
    resourceSlug: "snowflake-mcp",
    author: "Carlos Mendez",
    role: "Analytics Engineer",
    avatar: "🧑‍💻",
    rating: 5,
    text: "Set it up in under 10 minutes. Now I use it daily to explore warehouse metadata, profile tables, and prototype dbt models. The context it gives Claude is just the right level — not too much, not too little.",
    date: "2025-03-30",
  },
  {
    resourceSlug: "snowflake-mcp",
    author: "Jordan Li",
    role: "Staff Data Engineer",
    avatar: "👨‍💻",
    rating: 4,
    text: "Solid integration. Would love native support for time travel queries, but the core SELECT + DDL introspection workflow is rock solid. My entire data platform team has adopted it.",
    date: "2025-02-14",
  },

  // dbt-debug-skill
  {
    resourceSlug: "dbt-debug-skill",
    author: "Simone Brooks",
    role: "Analytics Engineer",
    avatar: "👩‍💻",
    rating: 5,
    text: "Before this skill I would paste error logs manually and fumble through dbt docs. Now Claude diagnoses ref errors, circular dependencies, and failed tests in one shot. Absolutely essential.",
    date: "2025-04-05",
  },
  {
    resourceSlug: "dbt-debug-skill",
    author: "Ryo Tanaka",
    role: "Senior Data Engineer",
    avatar: "🧑‍💻",
    rating: 5,
    text: "The contextual awareness is impressive — it knows about selector syntax, graph operations, and even dbt Cloud semantic layer. Cut my debug time by at least 60%.",
    date: "2025-03-11",
  },
  {
    resourceSlug: "dbt-debug-skill",
    author: "Ananya Krishnan",
    role: "Data Engineer",
    avatar: "👩‍💻",
    rating: 4,
    text: "Really helpful for junior engineers on my team who are still learning dbt internals. I point them to this skill and they can self-serve most debugging sessions now.",
    date: "2025-01-29",
  },

  // sql-optimize-skill
  {
    resourceSlug: "sql-optimize-skill",
    author: "Marcus Webb",
    role: "Staff Data Engineer",
    avatar: "👨‍💻",
    rating: 5,
    text: "Took a 45-second Snowflake query down to 3 seconds on the first pass. The rewrite explained every optimization with reasoning — this is how SQL tutoring should work.",
    date: "2025-04-22",
  },
  {
    resourceSlug: "sql-optimize-skill",
    author: "Elena Ivanova",
    role: "Data Scientist",
    avatar: "👩‍💻",
    rating: 4,
    text: "Excellent for understanding query plans. I feed it the EXPLAIN output and it tells me exactly which joins to push down or which CTEs to materialize. Saved real compute costs.",
    date: "2025-03-18",
  },
  {
    resourceSlug: "sql-optimize-skill",
    author: "Derek Osei",
    role: "Analytics Engineer",
    avatar: "🧑‍💻",
    rating: 5,
    text: "The window function rewrites alone are worth it. Our data warehouse bill dropped noticeably the week after our team started using this. 10/10 would recommend to any SQL-heavy team.",
    date: "2025-02-07",
  },

  // agent-data-pipeline
  {
    resourceSlug: "agent-data-pipeline",
    author: "Asha Patel",
    role: "ML Engineer",
    avatar: "👩‍💻",
    rating: 5,
    text: "This agent caught a data drift issue in our feature pipeline before it hit production. The automated quality checks and alerting are genuinely production-ready, not just a demo toy.",
    date: "2025-04-10",
  },
  {
    resourceSlug: "agent-data-pipeline",
    author: "Luca Ferrari",
    role: "Senior Data Engineer",
    avatar: "👨‍💻",
    rating: 4,
    text: "Works great for orchestrating multi-step ETL tasks. I'd love a tighter Airflow integration but the core pipeline agent loop is very solid. Our oncall burden dropped significantly.",
    date: "2025-03-02",
  },

  // duckdb-mcp
  {
    resourceSlug: "duckdb-mcp",
    author: "Sofia Larsson",
    role: "Data Scientist",
    avatar: "👩‍💻",
    rating: 5,
    text: "I do all my local EDA through this now. Query Parquet files on S3, local CSVs, and even iceberg snapshots — all from within Claude. No notebook context switching. This is the future of local analytics.",
    date: "2025-04-25",
  },
  {
    resourceSlug: "duckdb-mcp",
    author: "Noah Kim",
    role: "Analytics Engineer",
    avatar: "🧑‍💻",
    rating: 5,
    text: "DuckDB is already fast, but having Claude write and iterate queries on the fly is a multiplier. The MCP handles type inference and schema discovery automatically. Best analytics MCP in this list.",
    date: "2025-03-20",
  },
  {
    resourceSlug: "duckdb-mcp",
    author: "Fatima Al-Rashid",
    role: "ML Engineer",
    avatar: "👩‍💻",
    rating: 4,
    text: "Really solid for feature engineering workflows. I run DuckDB locally against raw data, let Claude explore and transform, then export the final query to our production pipeline. Huge time saver.",
    date: "2025-02-15",
  },

  // kafka-mcp
  {
    resourceSlug: "kafka-mcp",
    author: "Ben Torres",
    role: "Staff Data Engineer",
    avatar: "👨‍💻",
    rating: 5,
    text: "Being able to inspect topic offsets, consumer lag, and schema registry all from Claude is incredible for incident response. Shaved 20 minutes off our average MTTD for streaming issues.",
    date: "2025-04-08",
  },
  {
    resourceSlug: "kafka-mcp",
    author: "Yuki Sato",
    role: "Data Engineer",
    avatar: "🧑‍💻",
    rating: 4,
    text: "Great for exploring message schemas and lag analysis. Would appreciate write capabilities for producing test messages, but the read-only operations cover 90% of my day-to-day debugging.",
    date: "2025-03-15",
  },

  // great-expectations-mcp
  {
    resourceSlug: "great-expectations-mcp",
    author: "Chloe Martin",
    role: "Data Engineer",
    avatar: "👩‍💻",
    rating: 5,
    text: "Writing expectation suites used to be tedious boilerplate. Now Claude generates them from a sample dataset in seconds and I just review and adjust. Our data quality coverage went from 20% to 80% in a sprint.",
    date: "2025-04-14",
  },
  {
    resourceSlug: "great-expectations-mcp",
    author: "Isaac Okonkwo",
    role: "Senior Data Engineer",
    avatar: "👨‍💻",
    rating: 5,
    text: "The best GX tooling integration I've seen. Claude understands expectation semantics, not just the API syntax. It suggests statistically appropriate checks based on column distributions. Impressive.",
    date: "2025-03-01",
  },
  {
    resourceSlug: "great-expectations-mcp",
    author: "Rachel Chen",
    role: "Analytics Engineer",
    avatar: "👩‍💻",
    rating: 4,
    text: "Solid MCP. Made onboarding junior engineers to data quality best practices much smoother — they can ask Claude to explain why a particular expectation matters and get a real answer.",
    date: "2025-02-20",
  },

  // explain-sql-skill
  {
    resourceSlug: "explain-sql-skill",
    author: "Omar Hassan",
    role: "Data Scientist",
    avatar: "🧑‍💻",
    rating: 5,
    text: "I paste legacy SQL written by someone who left the company five years ago and Claude walks me through it line by line, identifies anti-patterns, and suggests modern rewrites. Invaluable for knowledge transfer.",
    date: "2025-04-19",
  },
  {
    resourceSlug: "explain-sql-skill",
    author: "Mei Lin",
    role: "Analytics Engineer",
    avatar: "👩‍💻",
    rating: 5,
    text: "Use this daily for onboarding new team members. It demystifies complex CTEs and nested subqueries in plain English. Our code review quality has noticeably improved since we introduced it.",
    date: "2025-03-07",
  },

  // airflow-mcp
  {
    resourceSlug: "airflow-mcp",
    author: "Stefan Kovac",
    role: "Data Engineer",
    avatar: "👨‍💻",
    rating: 5,
    text: "Debugging failed DAG runs used to mean hours in the Airflow UI. Now I describe the failure to Claude via this MCP and it reads the task logs, checks upstream dependencies, and pinpoints the root cause. Night and day.",
    date: "2025-04-03",
  },
  {
    resourceSlug: "airflow-mcp",
    author: "Amara Diallo",
    role: "Senior Data Engineer",
    avatar: "👩‍💻",
    rating: 4,
    text: "Really useful for introspecting DAG lineage and scheduling logic. The ability to ask natural language questions about DAG dependencies and have Claude query the metadata DB is a genuine productivity win.",
    date: "2025-03-25",
  },
  {
    resourceSlug: "airflow-mcp",
    author: "Chris Park",
    role: "Data Ops Engineer",
    avatar: "🧑‍💻",
    rating: 5,
    text: "Combined with the dbt debug skill, this covers basically every operational question I get from my data engineering team. Highly recommend as a pairing.",
    date: "2025-02-10",
  },

  // data-lineage-mapper-agent
  {
    resourceSlug: "data-lineage-mapper-agent",
    author: "Tomas Blanco",
    role: "Staff Data Engineer",
    avatar: "👨‍💻",
    rating: 5,
    text: "Our data mesh had zero documented lineage. This agent crawled our dbt project, warehouse, and Kafka topics and produced a lineage graph we could actually share with the business. Would have taken a human weeks.",
    date: "2025-04-21",
  },
  {
    resourceSlug: "data-lineage-mapper-agent",
    author: "Nadia Petrov",
    role: "Data Engineer",
    avatar: "👩‍💻",
    rating: 4,
    text: "The impact analysis feature is what sold me — I can ask 'what breaks if I modify this table?' and get an accurate dependency graph. Essential for any team doing refactoring at scale.",
    date: "2025-03-12",
  },
];

export function getReviewsForSlug(slug: string): Review[] {
  return REVIEWS.filter((r) => r.resourceSlug === slug);
}

export function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
