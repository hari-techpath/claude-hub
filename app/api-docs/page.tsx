"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const BASE_URL = "https://claude-hub.vercel.app/api";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-400 hover:text-slate-200 text-xs transition-all"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy URL"}
    </button>
  );
}

interface Param {
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
}

interface Endpoint {
  method: string;
  path: string;
  description: string;
  params: Param[];
  example: string;
}

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/resources",
    description:
      "Returns a paginated list of Claude resources. Supports filtering by type, text search, sorting, and pagination.",
    params: [
      {
        name: "type",
        type: "string",
        description: "Filter by resource type: mcp, skill, agent, prompt, architecture, setup, hook, trick",
      },
      {
        name: "q",
        type: "string",
        description: "Full-text search across name, tagline, description, and tags",
      },
      {
        name: "sort",
        type: "string",
        description: "Sort order: trending (default), stars, new",
        defaultValue: "trending",
      },
      {
        name: "limit",
        type: "number",
        description: "Number of results per page (default 20, max 100)",
        defaultValue: "20",
      },
      {
        name: "page",
        type: "number",
        description: "Page number (1-indexed)",
        defaultValue: "1",
      },
    ],
    example: `{
  "data": [
    {
      "id": "mcp-postgres",
      "slug": "mcp-postgres",
      "name": "PostgreSQL MCP",
      "tagline": "Query and manage PostgreSQL databases with natural language",
      "type": "mcp",
      "stars": 2100,
      "trending": true,
      ...
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}`,
  },
  {
    method: "GET",
    path: "/resources/:slug",
    description:
      "Returns a single resource by its slug, plus up to 3 related resource slugs. Returns 404 if not found.",
    params: [
      {
        name: "slug",
        type: "path",
        description: "The unique slug identifier for the resource (e.g. mcp-postgres)",
      },
    ],
    example: `{
  "data": {
    "id": "mcp-postgres",
    "slug": "mcp-postgres",
    "name": "PostgreSQL MCP",
    "tagline": "Query and manage PostgreSQL databases with natural language",
    "description": "Full PostgreSQL access for Claude...",
    "type": "mcp",
    "tags": ["database", "sql", "postgresql"],
    "author": "Anthropic",
    "stars": 2100,
    "forks": 340,
    "complexity": "beginner",
    "featured": true,
    "trending": true,
    "verified": true
  },
  "related": ["mcp-supabase", "mcp-mysql", "mcp-sqlite"]
}`,
  },
  {
    method: "GET",
    path: "/stats",
    description:
      "Returns aggregate statistics about the registry: total resources, counts by type, total GitHub stars, and the top trending and hot resources.",
    params: [],
    example: `{
  "totalResources": 156,
  "byType": {
    "mcp": 45,
    "skill": 30,
    "agent": 18,
    "prompt": 22,
    "architecture": 12,
    "setup": 15,
    "hook": 8,
    "trick": 6
  },
  "totalStars": 124500,
  "trending": [
    "GitHub MCP",
    "PostgreSQL MCP",
    "dbt MCP",
    "Snowflake MCP",
    "Pipeline Debugger"
  ],
  "hot": [
    "GitHub MCP",
    "PostgreSQL MCP",
    "Airflow MCP",
    "Data Quality Agent",
    "SQL Optimizer"
  ]
}`,
  },
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
            Free &amp; Open
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Claude Hub API
          </h1>
          <p className="text-slate-400 text-lg mb-6">
            Free, read-only REST API for Claude Hub resources. No authentication required.
          </p>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Base URL</span>
            <code className="text-sm text-violet-300 font-mono flex-1">{BASE_URL}</code>
            <CopyButton text={BASE_URL} />
          </div>
        </div>

        {/* Notes */}
        <div className="mb-12 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
          <p className="text-sm text-slate-400">
            All endpoints return JSON. CORS is enabled — call these from any origin. No API key required.
            Responses include <code className="text-blue-300 text-xs font-mono">Access-Control-Allow-Origin: *</code> headers.
          </p>
        </div>

        {/* Endpoints */}
        <div className="space-y-12">
          {endpoints.map((endpoint) => {
            const fullUrl = `${BASE_URL}${endpoint.path}`;
            return (
              <section
                key={endpoint.path}
                className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
              >
                {/* Endpoint header */}
                <div className="flex items-center gap-3 p-5 border-b border-white/[0.06]">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-bold font-mono">
                    {endpoint.method}
                  </span>
                  <code className="text-sm text-slate-200 font-mono flex-1">
                    {BASE_URL}
                    <span className="text-violet-300">{endpoint.path}</span>
                  </code>
                  <CopyButton text={fullUrl} />
                </div>

                <div className="p-5 space-y-6">
                  {/* Description */}
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {endpoint.description}
                  </p>

                  {/* Query params */}
                  {endpoint.params.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                        {endpoint.params[0].type === "path" ? "Path Parameters" : "Query Parameters"}
                      </h3>
                      <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Param
                              </th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                Default
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {endpoint.params.map((param, i) => (
                              <tr
                                key={param.name}
                                className={
                                  i < endpoint.params.length - 1
                                    ? "border-b border-white/[0.04]"
                                    : ""
                                }
                              >
                                <td className="px-4 py-3">
                                  <code className="text-xs text-violet-300 font-mono">
                                    {param.name}
                                  </code>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs text-slate-500 font-mono">
                                    {param.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-400">
                                  {param.description}
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell">
                                  {param.defaultValue ? (
                                    <code className="text-xs text-slate-500 font-mono">
                                      {param.defaultValue}
                                    </code>
                                  ) : (
                                    <span className="text-xs text-slate-700">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Example response */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                      Example Response
                    </h3>
                    <pre
                      className="rounded-xl bg-black/40 border border-white/[0.06] p-4 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed"
                      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace" }}
                    >
                      {endpoint.example}
                    </pre>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] text-center">
          <p className="text-sm text-slate-600">
            Have questions or want to contribute?{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Open an issue on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
