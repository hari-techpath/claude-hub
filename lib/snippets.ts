export interface CodeSnippet {
  resourceSlug: string;
  label: string;
  language: string;
  code: string;
}

export const SNIPPETS: CodeSnippet[] = [
  // ── snowflake-mcp ─────────────────────────────────────────────────────────
  {
    resourceSlug: "snowflake-mcp",
    label: "Basic SQL query",
    language: "sql",
    code: `-- Ask Claude to run this query against your Snowflake warehouse
SELECT
  o.order_date,
  c.customer_name,
  SUM(o.amount) AS total_revenue
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.order_date >= DATEADD('day', -30, CURRENT_DATE())
GROUP BY 1, 2
ORDER BY 3 DESC
LIMIT 100;`,
  },
  {
    resourceSlug: "snowflake-mcp",
    label: "Browse schema",
    language: "sql",
    code: `-- Explore available tables and columns
SHOW TABLES IN SCHEMA analytics.public;

-- Inspect a specific table
DESCRIBE TABLE analytics.public.orders;

-- Preview sample data
SELECT * FROM analytics.public.orders SAMPLE (50 ROWS);`,
  },
  {
    resourceSlug: "snowflake-mcp",
    label: "Query cost estimation",
    language: "sql",
    code: `-- Check query history and costs for the last 7 days
SELECT
  query_text,
  execution_status,
  total_elapsed_time / 1000 AS elapsed_seconds,
  credits_used_cloud_services,
  bytes_scanned / POWER(1024, 3) AS gb_scanned
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE start_time >= DATEADD('day', -7, CURRENT_TIMESTAMP())
  AND execution_status = 'SUCCESS'
ORDER BY credits_used_cloud_services DESC
LIMIT 20;`,
  },

  // ── dbt-debug-skill ───────────────────────────────────────────────────────
  {
    resourceSlug: "dbt-debug-skill",
    label: "Invoke the skill",
    language: "bash",
    code: `# In Claude, invoke the dbt debug skill with your model name
# Example prompt:
# /dbt-debug-skill model=stg_orders

# Claude will run the following and interpret the output:
dbt debug
dbt compile --select stg_orders
dbt run --select stg_orders --target dev 2>&1 | tail -50`,
  },
  {
    resourceSlug: "dbt-debug-skill",
    label: "Debug specific model",
    language: "bash",
    code: `# Debug a failing model with full context
dbt run --select fct_revenue --target dev

# If it fails, get compiled SQL for inspection
dbt compile --select fct_revenue
cat target/compiled/my_project/models/marts/fct_revenue.sql

# Check freshness of upstream sources
dbt source freshness --select source:postgres.orders`,
  },
  {
    resourceSlug: "dbt-debug-skill",
    label: "Check model lineage",
    language: "bash",
    code: `# Show upstream dependencies for a model
dbt ls --select +fct_revenue --output json | jq '.[]'

# Show downstream models that will be affected
dbt ls --select fct_revenue+ --output json | jq '.[]'

# Run with full refresh on a single model and its parents
dbt run --select +fct_revenue --full-refresh --target dev`,
  },

  // ── kafka-mcp ─────────────────────────────────────────────────────────────
  {
    resourceSlug: "kafka-mcp",
    label: "Produce a message",
    language: "python",
    code: `from confluent_kafka import Producer
import json

producer = Producer({
    "bootstrap.servers": "localhost:9092",
    "acks": "all",
    "compression.type": "lz4",
})

def delivery_callback(err, msg):
    if err:
        print(f"Delivery failed: {err}")
    else:
        print(f"Delivered to {msg.topic()} [{msg.partition()}] @ offset {msg.offset()}")

payload = {
    "event_type": "order_placed",
    "order_id": "ord_8821",
    "customer_id": "cust_442",
    "amount": 149.99,
    "currency": "USD",
}

producer.produce(
    topic="orders",
    key="cust_442",
    value=json.dumps(payload).encode("utf-8"),
    callback=delivery_callback,
)
producer.flush()`,
  },
  {
    resourceSlug: "kafka-mcp",
    label: "Consumer group example",
    language: "python",
    code: `from confluent_kafka import Consumer, KafkaError
import json

consumer = Consumer({
    "bootstrap.servers": "localhost:9092",
    "group.id": "data-pipeline-group",
    "auto.offset.reset": "earliest",
    "enable.auto.commit": False,
})

consumer.subscribe(["orders", "order_events"])

try:
    while True:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            raise Exception(msg.error())

        event = json.loads(msg.value().decode("utf-8"))
        print(f"Received: {event['event_type']} for order {event.get('order_id')}")

        # Process the event here
        process_event(event)
        consumer.commit(msg)

finally:
    consumer.close()`,
  },

  // ── sql-optimize-skill ────────────────────────────────────────────────────
  {
    resourceSlug: "sql-optimize-skill",
    label: "Before optimization",
    language: "sql",
    code: `-- BEFORE: Slow query — full table scan, correlated subquery
SELECT
  u.id,
  u.email,
  (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
  (SELECT SUM(amount) FROM orders o WHERE o.user_id = u.id) AS lifetime_value
FROM users u
WHERE u.created_at > '2024-01-01'
  AND u.status = 'active'
ORDER BY lifetime_value DESC;`,
  },
  {
    resourceSlug: "sql-optimize-skill",
    label: "After optimization",
    language: "sql",
    code: `-- AFTER: Optimized — single join, no correlated subqueries
WITH user_metrics AS (
  SELECT
    user_id,
    COUNT(*)          AS order_count,
    SUM(amount)       AS lifetime_value
  FROM orders
  GROUP BY user_id
)
SELECT
  u.id,
  u.email,
  COALESCE(m.order_count, 0)     AS order_count,
  COALESCE(m.lifetime_value, 0)  AS lifetime_value
FROM users u
LEFT JOIN user_metrics m ON m.user_id = u.id
WHERE u.created_at > '2024-01-01'
  AND u.status = 'active'
ORDER BY lifetime_value DESC;
-- Add index: CREATE INDEX idx_users_status_created ON users(status, created_at);`,
  },

  // ── airflow-mcp ───────────────────────────────────────────────────────────
  {
    resourceSlug: "airflow-mcp",
    label: "Trigger a DAG",
    language: "python",
    code: `import requests

AIRFLOW_URL = "http://localhost:8080"
DAG_ID = "daily_revenue_pipeline"

# Trigger a DAG run with config
response = requests.post(
    f"{AIRFLOW_URL}/api/v1/dags/{DAG_ID}/dagRuns",
    auth=("admin", "admin"),
    json={
        "conf": {
            "run_date": "2024-05-15",
            "target_schema": "analytics",
            "send_alerts": True,
        }
    },
)
response.raise_for_status()
run = response.json()
print(f"Triggered DAG run: {run['dag_run_id']} — state: {run['state']}")`,
  },
  {
    resourceSlug: "airflow-mcp",
    label: "List running DAGs",
    language: "python",
    code: `import requests

AIRFLOW_URL = "http://localhost:8080"

# Get all DAG runs that are currently running
response = requests.get(
    f"{AIRFLOW_URL}/api/v1/dags/~/dagRuns",
    auth=("admin", "admin"),
    params={"state": "running", "limit": 25},
)
response.raise_for_status()

for run in response.json()["dag_runs"]:
    print(
        f"DAG: {run['dag_id']:40s} | "
        f"Run: {run['dag_run_id']:30s} | "
        f"Started: {run['start_date']}"
    )`,
  },

  // ── great-expectations-mcp ────────────────────────────────────────────────
  {
    resourceSlug: "great-expectations-mcp",
    label: "Run a validation suite",
    language: "python",
    code: `import great_expectations as gx

context = gx.get_context()

# Get the validation suite and run it
result = context.run_checkpoint(
    checkpoint_name="daily_orders_checkpoint",
    batch_request={
        "datasource_name": "postgres_datasource",
        "data_connector_name": "default_inferred_data_connector_name",
        "data_asset_name": "orders",
        "limit": 1000,
    },
)

print(f"Validation passed: {result['success']}")
print(f"Total expectations: {result.statistics['evaluated_expectations']}")
print(f"Successful:         {result.statistics['successful_expectations']}")
print(f"Failed:             {result.statistics['unsuccessful_expectations']}")`,
  },
  {
    resourceSlug: "great-expectations-mcp",
    label: "Define expectations",
    language: "python",
    code: `import great_expectations as gx

context = gx.get_context()
suite = context.add_expectation_suite("orders.critical")

validator = context.get_validator(
    batch_request={"datasource_name": "postgres", "data_asset_name": "orders"},
    expectation_suite_name="orders.critical",
)

# Define expectations
validator.expect_column_values_to_not_be_null("order_id")
validator.expect_column_values_to_be_unique("order_id")
validator.expect_column_values_to_be_between("amount", min_value=0, max_value=100_000)
validator.expect_column_values_to_be_in_set("status", ["pending", "completed", "refunded"])
validator.expect_column_pair_values_A_to_be_greater_than_B(
    "shipped_at", "created_at", or_equal=True
)

validator.save_expectation_suite()
print("Expectation suite saved.")`,
  },

  // ── databricks-mcp ────────────────────────────────────────────────────────
  {
    resourceSlug: "databricks-mcp",
    label: "Run a notebook",
    language: "python",
    code: `from databricks.sdk import WorkspaceClient
from databricks.sdk.service.jobs import RunNow

client = WorkspaceClient(
    host="https://your-workspace.azuredatabricks.net",
    token="dapi_your_token_here",
)

# Trigger a notebook job run
run = client.jobs.run_now(
    job_id=12345,
    notebook_params={
        "run_date": "2024-05-15",
        "environment": "production",
        "dry_run": "false",
    },
)
print(f"Job run started: run_id={run.run_id}")

# Poll until complete
result = client.jobs.wait_get_run_job_terminated_or_skipped(run_id=run.run_id)
print(f"Final state: {result.state.result_state}")`,
  },
  {
    resourceSlug: "databricks-mcp",
    label: "Query Unity Catalog",
    language: "python",
    code: `from databricks.sdk import WorkspaceClient

client = WorkspaceClient(
    host="https://your-workspace.azuredatabricks.net",
    token="dapi_your_token_here",
)

# Run a SQL statement via Databricks SQL
statement = client.statement_execution.execute_statement(
    warehouse_id="abc123def456",
    catalog="prod",
    schema="analytics",
    statement="""
    SELECT
      date_trunc('week', event_date) AS week,
      event_type,
      COUNT(*) AS events
    FROM prod.analytics.events
    WHERE event_date >= DATEADD(WEEK, -4, CURRENT_DATE())
    GROUP BY 1, 2
    ORDER BY 1, 3 DESC
    """,
)

for row in statement.result.data_array or []:
    print(row)`,
  },

  // ── data-lineage-mapper-agent ─────────────────────────────────────────────
  {
    resourceSlug: "data-lineage-mapper-agent",
    label: "Input schema",
    language: "yaml",
    code: `# Input: describe your schema so the agent can build lineage
tables:
  - name: raw.orders
    source: postgres
    columns: [id, customer_id, amount, created_at, status]

  - name: raw.customers
    source: postgres
    columns: [id, email, country, signup_date]

  - name: stg_orders
    depends_on: [raw.orders]
    columns: [order_id, customer_id, order_amount, order_date]

  - name: fct_revenue
    depends_on: [stg_orders, raw.customers]
    columns: [week, country, total_revenue, order_count]`,
  },
  {
    resourceSlug: "data-lineage-mapper-agent",
    label: "Output lineage map",
    language: "json",
    code: `{
  "lineage": {
    "fct_revenue": {
      "upstream": ["stg_orders", "raw.customers"],
      "columns": {
        "week":          { "source": "stg_orders.order_date", "transform": "date_trunc('week')" },
        "country":       { "source": "raw.customers.country", "transform": "passthrough" },
        "total_revenue": { "source": "stg_orders.order_amount", "transform": "SUM" },
        "order_count":   { "source": "stg_orders.order_id",    "transform": "COUNT" }
      }
    },
    "stg_orders": {
      "upstream": ["raw.orders"],
      "columns": {
        "order_id":     { "source": "raw.orders.id",         "transform": "passthrough" },
        "order_amount": { "source": "raw.orders.amount",     "transform": "passthrough" },
        "order_date":   { "source": "raw.orders.created_at", "transform": "CAST(DATE)" }
      }
    }
  },
  "critical_path": ["raw.orders", "stg_orders", "fct_revenue"],
  "orphan_tables": []
}`,
  },

  // ── generate-cte-skill ────────────────────────────────────────────────────
  {
    resourceSlug: "generate-cte-skill",
    label: "Before: flat query",
    language: "sql",
    code: `-- BEFORE: deeply nested, hard to read
SELECT
  u.email,
  SUM(o.amount) AS ltv,
  COUNT(o.id) AS orders,
  MAX(o.created_at) AS last_order
FROM users u
JOIN orders o ON o.user_id = u.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE u.status = 'active'
  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
  AND p.category IN ('electronics', 'software')
GROUP BY u.email
HAVING SUM(o.amount) > 500;`,
  },
  {
    resourceSlug: "generate-cte-skill",
    label: "After: CTE form",
    language: "sql",
    code: `-- AFTER: generated CTE structure — readable and maintainable
WITH active_users AS (
  SELECT id, email
  FROM users
  WHERE status = 'active'
),

recent_qualifying_orders AS (
  SELECT o.id, o.user_id, o.amount, o.created_at
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p    ON p.id = oi.product_id
  WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    AND p.category IN ('electronics', 'software')
),

user_metrics AS (
  SELECT
    user_id,
    SUM(amount)    AS ltv,
    COUNT(id)      AS orders,
    MAX(created_at) AS last_order
  FROM recent_qualifying_orders
  GROUP BY user_id
  HAVING SUM(amount) > 500
)

SELECT
  u.email,
  m.ltv,
  m.orders,
  m.last_order
FROM active_users u
JOIN user_metrics m ON m.user_id = u.id
ORDER BY m.ltv DESC;`,
  },

  // ── duckdb-mcp ────────────────────────────────────────────────────────────
  {
    resourceSlug: "duckdb-mcp",
    label: "Query local Parquet",
    language: "sql",
    code: `-- DuckDB can query Parquet files directly — no loading required
SELECT
  event_type,
  COUNT(*)                          AS event_count,
  AVG(session_duration_seconds)     AS avg_session_s,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY session_duration_seconds) AS p95_session_s
FROM read_parquet('/data/events/2024-05-*.parquet')
WHERE country_code = 'US'
  AND event_date BETWEEN '2024-05-01' AND '2024-05-31'
GROUP BY event_type
ORDER BY event_count DESC;`,
  },
  {
    resourceSlug: "duckdb-mcp",
    label: "Export query results",
    language: "sql",
    code: `-- Write results to a new Parquet file
COPY (
  SELECT
    date_trunc('day', event_date) AS day,
    country_code,
    SUM(revenue_usd)              AS daily_revenue
  FROM read_parquet('/data/events/*.parquet')
  GROUP BY 1, 2
) TO '/output/daily_revenue.parquet' (FORMAT PARQUET, COMPRESSION ZSTD);

-- Or export to CSV
COPY (...) TO '/output/daily_revenue.csv' (HEADER, DELIMITER ',');`,
  },
  {
    resourceSlug: "duckdb-mcp",
    label: "Query S3 directly",
    language: "sql",
    code: `-- DuckDB can query S3 without downloading files
INSTALL httpfs;
LOAD httpfs;

SET s3_region      = 'us-east-1';
SET s3_access_key  = 'AKIA...';
SET s3_secret_key  = '...';

SELECT
  year, month, SUM(bytes_transferred) AS total_bytes
FROM read_parquet('s3://my-data-lake/logs/year=*/month=*/*.parquet', hive_partitioning=true)
GROUP BY year, month
ORDER BY year, month;`,
  },

  // ── pandas-ai-trick ───────────────────────────────────────────────────────
  {
    resourceSlug: "pandas-ai-trick",
    label: "Basic pandas-ai query",
    language: "python",
    code: `import pandas as pd
from pandasai import Agent
from pandasai.llm.anthropic import Claude

llm = Claude(api_token="sk-ant-...")
df = pd.read_csv("sales_data.csv")

agent = Agent([df], config={"llm": llm, "verbose": True})

# Ask natural language questions about your DataFrame
response = agent.chat("What were the top 5 products by revenue last quarter?")
print(response)

response2 = agent.chat("Show me a bar chart of monthly sales by region")
response2  # renders chart inline in Jupyter`,
  },
  {
    resourceSlug: "pandas-ai-trick",
    label: "Multi-dataframe analysis",
    language: "python",
    code: `import pandas as pd
from pandasai import Agent
from pandasai.llm.anthropic import Claude

llm = Claude(api_token="sk-ant-...")

orders_df   = pd.read_parquet("orders.parquet")
customers_df = pd.read_parquet("customers.parquet")
products_df  = pd.read_parquet("products.parquet")

# Pass multiple DataFrames — the agent joins them automatically
agent = Agent(
    [orders_df, customers_df, products_df],
    config={
        "llm": llm,
        "save_charts": True,
        "save_charts_path": "./output",
    },
)

result = agent.chat(
    "Which customer segments have the highest average order value, "
    "and what product categories do they prefer?"
)
print(result)`,
  },

  // ── explain-sql-skill ─────────────────────────────────────────────────────
  {
    resourceSlug: "explain-sql-skill",
    label: "Input: complex SQL",
    language: "sql",
    code: `-- Paste this into Claude with the /explain-sql-skill invocation:
WITH monthly_cohorts AS (
  SELECT
    DATE_TRUNC('month', first_order_date) AS cohort_month,
    customer_id
  FROM (
    SELECT customer_id, MIN(created_at) AS first_order_date
    FROM orders GROUP BY customer_id
  ) AS first_orders
),
cohort_activity AS (
  SELECT
    mc.cohort_month,
    DATEDIFF('month', mc.cohort_month, DATE_TRUNC('month', o.created_at)) AS months_since_first,
    COUNT(DISTINCT o.customer_id) AS active_customers
  FROM monthly_cohorts mc
  JOIN orders o USING (customer_id)
  GROUP BY 1, 2
)
SELECT * FROM cohort_activity ORDER BY cohort_month, months_since_first;`,
  },
  {
    resourceSlug: "explain-sql-skill",
    label: "Output: plain-English explanation",
    language: "bash",
    code: `# Claude's output after running /explain-sql-skill:

# WHAT THIS QUERY DOES
# =====================
# This is a cohort retention analysis. It answers:
# "Of all customers who made their FIRST order in month X,
#  how many were still ordering in month X+1, X+2, etc.?"
#
# STEP-BY-STEP BREAKDOWN
# ─────────────────────
# 1. monthly_cohorts
#    → Finds each customer's first order date and groups them
#      into monthly cohorts (the "vintage" they joined in).
#
# 2. cohort_activity
#    → For each cohort, counts distinct customers who placed
#      at least one order in each subsequent calendar month.
#    → months_since_first=0 is the cohort month itself (100% by definition).
#
# 3. Final SELECT
#    → Returns one row per (cohort_month, months_since_first) pair.
#      Divide active_customers by the cohort size to get a retention %.
#
# PERFORMANCE NOTE
# ─────────────────
# Ensure index on orders(customer_id, created_at) for large tables.`,
  },

  // ── medallion-arch ────────────────────────────────────────────────────────
  {
    resourceSlug: "medallion-arch",
    label: "Architecture config",
    language: "yaml",
    code: `# Medallion (Bronze / Silver / Gold) architecture definition
medallion:
  bronze:
    description: Raw ingestion layer — no transformations, append-only
    storage: s3://datalake/bronze/
    format: parquet
    retention_days: 365
    sources:
      - name: postgres_orders
        type: cdc
        connector: debezium
      - name: kafka_events
        type: streaming
        topic: user_events

  silver:
    description: Cleaned and conformed layer — deduped, typed, validated
    storage: s3://datalake/silver/
    format: delta
    tables:
      - name: orders
        depends_on: [bronze.postgres_orders]
        sla_hours: 2
      - name: events
        depends_on: [bronze.kafka_events]
        sla_hours: 1

  gold:
    description: Business-ready aggregations — serving layer
    storage: s3://datalake/gold/
    format: delta
    tables:
      - name: fct_revenue
        depends_on: [silver.orders]
        refresh: daily
      - name: dim_customers
        depends_on: [silver.orders, silver.events]
        refresh: hourly`,
  },
  {
    resourceSlug: "medallion-arch",
    label: "dbt project layout",
    language: "bash",
    code: `# Recommended dbt project structure for medallion architecture
models/
├── bronze/                     # raw source models (sources.yml references)
│   └── _sources.yml
├── silver/
│   ├── staging/                # stg_ prefix — light cleaning only
│   │   ├── stg_orders.sql
│   │   └── stg_events.sql
│   └── intermediate/           # int_ prefix — joins, dedup, enrichment
│       ├── int_orders_deduped.sql
│       └── int_customer_events.sql
└── gold/
    ├── marts/                  # fct_ and dim_ — business-ready
    │   ├── fct_revenue.sql
    │   └── dim_customers.sql
    └── reporting/              # report_ — dashboard-ready aggregates
        └── report_weekly_kpis.sql

# dbt_project.yml materialization strategy
models:
  my_project:
    silver:   { materialized: view }
    gold:     { materialized: table, post-hook: "ANALYZE {{ this }}" }`,
  },

  // ── build-data-contract-skill ─────────────────────────────────────────────
  {
    resourceSlug: "build-data-contract-skill",
    label: "Contract YAML",
    language: "yaml",
    code: `# Data contract for orders table — generated by /build-data-contract-skill
dataContractSpecification: 1.0.0

id: urn:datacontract:orders:v1
info:
  title: Orders Data Contract
  version: 1.0.0
  owner: data-platform-team
  contact: data-platform@company.com
  description: |
    Source-of-truth for all customer orders.
    Produced by the transactional Postgres database via Debezium CDC.

servers:
  production:
    type: s3
    location: s3://datalake/silver/orders/
    format: delta

terms:
  usage: Analytical use only. Do not use for real-time transactional decisions.
  billing: Internal — no charge
  noticePeriod: 30 days

models:
  orders:
    type: table
    fields:
      order_id:      { type: string,    required: true, unique: true, pii: false }
      customer_id:   { type: string,    required: true, pii: true  }
      order_date:    { type: timestamp, required: true }
      amount_usd:    { type: decimal,   required: true, minimum: 0 }
      status:        { type: string,    required: true, enum: [pending, completed, refunded, cancelled] }
      country_code:  { type: string,    required: false, pattern: "^[A-Z]{2}$" }

quality:
  type: great-expectations
  specification:
    - expect_column_values_to_not_be_null: order_id
    - expect_column_values_to_be_unique:    order_id
    - expect_column_values_to_be_between:   { column: amount_usd, min: 0, max: 1000000 }`,
  },
  {
    resourceSlug: "build-data-contract-skill",
    label: "Validate contract",
    language: "bash",
    code: `# Install the datacontract CLI
pip install datacontract-cli

# Validate a contract YAML against a live data source
datacontract test orders-contract.yaml \\
  --server production \\
  --output html \\
  --report-path ./contract-report.html

# Check for breaking changes between versions
datacontract diff \\
  orders-contract-v1.0.0.yaml \\
  orders-contract-v1.1.0.yaml

# Publish contract to the catalog
datacontract publish orders-contract.yaml \\
  --catalog-url https://data-catalog.company.com`,
  },

  // ── write-sql-tests-skill ─────────────────────────────────────────────────
  {
    resourceSlug: "write-sql-tests-skill",
    label: "Generated dbt tests",
    language: "yaml",
    code: `# Auto-generated by /write-sql-tests-skill for fct_revenue
version: 2

models:
  - name: fct_revenue
    description: Weekly revenue aggregated by country and product category

    columns:
      - name: week
        description: ISO week start date (Monday)
        tests:
          - not_null
          - dbt_utils.recency:
              datepart: week
              field: week
              interval: 2

      - name: country_code
        tests:
          - not_null
          - accepted_values:
              values: ["US", "GB", "DE", "FR", "CA", "AU", "JP"]

      - name: total_revenue_usd
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0
              max_value: 10000000
              inclusive: true

      - name: order_count
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0
              inclusive: true

    tests:
      # No duplicate grain rows
      - dbt_utils.unique_combination_of_columns:
          combination_of_columns: [week, country_code, product_category]

      # Revenue should never be less than (order_count * $1)
      - dbt_utils.expression_is_true:
          expression: "total_revenue_usd >= order_count * 1"`,
  },
  {
    resourceSlug: "write-sql-tests-skill",
    label: "Custom singular test",
    language: "sql",
    code: `-- tests/assert_revenue_never_decreases_week_over_week.sql
-- Generated by /write-sql-tests-skill
-- Fails if any country has >50% revenue drop week-over-week (data anomaly check)

WITH weekly_revenue AS (
  SELECT
    week,
    country_code,
    total_revenue_usd,
    LAG(total_revenue_usd) OVER (
      PARTITION BY country_code ORDER BY week
    ) AS prev_week_revenue
  FROM {{ ref('fct_revenue') }}
),

drops AS (
  SELECT *,
    (total_revenue_usd - prev_week_revenue) / NULLIF(prev_week_revenue, 0) AS pct_change
  FROM weekly_revenue
  WHERE prev_week_revenue IS NOT NULL
)

-- Returns rows that fail the test (non-empty = test failure)
SELECT *
FROM drops
WHERE pct_change < -0.50  -- flag >50% week-over-week revenue drop`,
  },
];

export function getSnippetsForSlug(slug: string): CodeSnippet[] {
  return SNIPPETS.filter((s) => s.resourceSlug === slug);
}
