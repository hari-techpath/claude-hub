export type ResourceType =
  | "mcp"
  | "skill"
  | "agent"
  | "prompt"
  | "architecture"
  | "setup"
  | "hook"
  | "trick";

export type Complexity = "beginner" | "intermediate" | "advanced";

export type UseCase =
  | "data-engineering"
  | "data-science"
  | "analytics"
  | "ml-engineering"
  | "data-ops"
  | "sql"
  | "python"
  | "productivity";

export interface Resource {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  type: ResourceType;
  tags: string[];
  author: string;
  authorUrl?: string;
  githubUrl?: string;
  docsUrl?: string;
  installCommand?: string;
  stars: number;
  forks: number;
  lastUpdated: string;
  complexity: Complexity;
  useCases: UseCase[];
  featured: boolean;
  trending: boolean;
  hot: boolean;
  verified: boolean;
  weeklyViews: number;
}

export type SortMode = "trending" | "hot" | "new" | "top";

export const TYPE_META: Record<
  ResourceType,
  { label: string; color: string; bg: string; border: string; icon: string; description: string }
> = {
  mcp: {
    label: "MCP",
    color: "#a78bfa",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.25)",
    icon: "🔌",
    description: "Connect Claude to your data stack — Postgres, Snowflake, dbt, and more",
  },
  skill: {
    label: "Skill",
    color: "#22d3ee",
    bg: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.25)",
    icon: "⚡",
    description: "Slash commands that automate your data engineering workflows",
  },
  agent: {
    label: "Agent",
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.25)",
    icon: "🤖",
    description: "Autonomous agents for pipeline debugging, data quality, and ML ops",
  },
  prompt: {
    label: "Prompt",
    color: "#34d399",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
    icon: "📝",
    description: "Proven prompt templates for SQL, Python, data modeling, and analysis",
  },
  architecture: {
    label: "Architecture",
    color: "#fb923c",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.25)",
    icon: "🏗️",
    description: "Multi-agent patterns for end-to-end data systems",
  },
  setup: {
    label: "Setup",
    color: "#facc15",
    bg: "rgba(234,179,8,0.1)",
    border: "rgba(234,179,8,0.25)",
    icon: "⚙️",
    description: "Optimized Claude environments for data teams and ML engineers",
  },
  hook: {
    label: "Hook",
    color: "#f472b6",
    bg: "rgba(236,72,153,0.1)",
    border: "rgba(236,72,153,0.25)",
    icon: "🪝",
    description: "Event-driven automation hooks for data pipelines and CI/CD",
  },
  trick: {
    label: "Trick",
    color: "#f87171",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
    icon: "💡",
    description: "Power-user techniques to get the most out of Claude for data work",
  },
};
