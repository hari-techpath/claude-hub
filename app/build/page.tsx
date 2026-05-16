"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  FileText,
  Webhook,
  Bot,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  Hammer,
} from "lucide-react";
import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";

// --- Types ---
type BuildType = "skill" | "prompt" | "hook" | "agent-config";
type Tool =
  | "Snowflake"
  | "BigQuery"
  | "dbt"
  | "Airflow"
  | "Spark"
  | "DuckDB"
  | "Postgres"
  | "Kafka"
  | "General";
type Complexity = "beginner" | "intermediate" | "advanced";

interface WizardState {
  buildType: BuildType | null;
  useCase: string;
  tool: Tool;
  complexity: Complexity;
  requirements: string;
  includeExamples: boolean;
  includeErrorHandling: boolean;
}

// --- Template engine ---
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function generateTemplate(state: WizardState): string {
  const {
    buildType,
    useCase,
    tool,
    complexity,
    requirements,
    includeExamples,
    includeErrorHandling,
  } = state;

  const slug = slugify(useCase || "my-skill");

  if (buildType === "skill") {
    return `---
name: ${slug}
description: ${useCase} for ${tool}
triggers:
  - pattern: "/${slug}"
    description: "${useCase}"
---

# ${useCase}

## Context
You are a ${tool} expert. When invoked, help the user with: ${useCase}.

## Instructions
${complexity === "beginner" ? "Use simple explanations and avoid jargon. Walk the user through each step clearly." : ""}${complexity === "intermediate" ? "Balance clarity with technical depth. Assume familiarity with core concepts." : ""}${complexity === "advanced" ? "Include advanced techniques, edge cases, and production considerations." : ""}
${requirements ? `\n## Requirements\n${requirements}\n` : ""}${includeExamples ? "\n## Examples\nProvide 2-3 concrete examples with real ${tool} syntax where relevant.\n" : ""}${includeErrorHandling ? "\n## Error Handling\nAlways check for and handle common errors. Surface actionable fixes, not just error messages.\n" : ""}
## Output Format
Provide clear, actionable output with code blocks where appropriate.
Use ${tool}-native syntax and idioms.
`.trim();
  }

  if (buildType === "prompt") {
    return `# ${useCase}

## Role
You are an expert ${tool} practitioner helping with: ${useCase}.
${complexity === "beginner" ? "\nAssume the user is new to this. Explain every step." : ""}${complexity === "advanced" ? "\nThe user is experienced. Skip basics and go deep." : ""}

## Task
Given the user's input, produce a clear, correct, and idiomatic ${tool} solution.

## Input format
Describe what you need help with. Include relevant context (schema, pipeline config, error message, etc.).

## Output format
- Start with a brief explanation (2-3 sentences max)
- Provide the code/query/config in a code block
- Add inline comments for non-obvious parts
${includeExamples ? "- Include a worked example\n" : ""}${includeErrorHandling ? "- Flag potential errors and how to handle them\n" : ""}${requirements ? `\n## Constraints\n${requirements}\n` : ""}
## Example invocation
User: "[describe your ${tool} problem here]"
`.trim();
  }

  if (buildType === "hook") {
    return `# ${useCase} — Claude Hook

## Hook metadata
\`\`\`yaml
name: ${slug}
event: pre-commit  # or post-run, on-error, on-success
tool: ${tool}
\`\`\`

## Trigger condition
Fires when: ${useCase}.
${complexity === "advanced" ? "Evaluate edge cases and fail fast with a clear message." : ""}

## Hook logic
\`\`\`bash
#!/bin/bash
# ${useCase} hook for ${tool}
# Auto-generated — customize before use

set -euo pipefail

echo "Running ${slug} hook..."

# TODO: add your ${tool}-specific check here
# Example: validate schema, lint SQL, check dbt artifacts

echo "Hook passed."
\`\`\`
${requirements ? `\n## Requirements\n${requirements}\n` : ""}${includeErrorHandling ? `
## Error handling
- Exit code 0 = pass (pipeline continues)
- Exit code 1 = fail (pipeline halts)
- Always print a human-readable error before exiting 1
` : ""}${includeExamples ? `
## Example output
\`\`\`
Running ${slug} hook...
Hook passed.
\`\`\`
` : ""}`.trim();
  }

  // agent-config
  return `# ${useCase} — Agent Config

## Agent metadata
\`\`\`yaml
name: ${slug}
type: agent
tool: ${tool}
complexity: ${complexity}
\`\`\`

## System prompt
You are an autonomous ${tool} agent.
Your goal: ${useCase}.
${complexity === "beginner" ? "\nOperate conservatively. Ask for confirmation before destructive actions." : ""}${complexity === "advanced" ? "\nOperate autonomously. Optimize for speed and correctness. Surface blockers immediately." : ""}

## Capabilities
- Access to ${tool} environment
- Read and write permissions (scope as needed)
- Can invoke sub-tools: code interpreter, file reader, API caller
${requirements ? `\n## Constraints\n${requirements}\n` : ""}
## Decision loop
1. Understand the task
2. Plan steps (max 5)
3. Execute each step, validate output
4. Report result with evidence
${includeErrorHandling ? `
## Error recovery
- On failure: retry once, then escalate to user
- Log all errors with context
- Never silently fail
` : ""}${includeExamples ? `
## Example task
"${useCase} — run on the production ${tool} environment and report findings."
` : ""}`.trim();
}

// --- Step components ---

const BUILD_TYPES: {
  value: BuildType;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  border: string;
  bg: string;
}[] = [
  {
    value: "skill",
    icon: <Zap size={20} />,
    label: "Skill",
    description: "Slash command that automates a workflow",
    color: "#22d3ee",
    border: "rgba(6,182,212,0.4)",
    bg: "rgba(6,182,212,0.08)",
  },
  {
    value: "prompt",
    icon: <FileText size={20} />,
    label: "Prompt",
    description: "Reusable prompt template for a task",
    color: "#34d399",
    border: "rgba(52,211,153,0.4)",
    bg: "rgba(52,211,153,0.08)",
  },
  {
    value: "hook",
    icon: <Webhook size={20} />,
    label: "Hook",
    description: "Event-driven automation for pipelines",
    color: "#f472b6",
    border: "rgba(236,72,153,0.4)",
    bg: "rgba(236,72,153,0.08)",
  },
  {
    value: "agent-config",
    icon: <Bot size={20} />,
    label: "Agent Config",
    description: "Autonomous agent system prompt + config",
    color: "#60a5fa",
    border: "rgba(59,130,246,0.4)",
    bg: "rgba(59,130,246,0.08)",
  },
];

const TOOLS: Tool[] = [
  "Snowflake",
  "BigQuery",
  "dbt",
  "Airflow",
  "Spark",
  "DuckDB",
  "Postgres",
  "Kafka",
  "General",
];

const COMPLEXITY_OPTIONS: { value: Complexity; label: string; hint: string }[] =
  [
    { value: "beginner", label: "Beginner", hint: "Simple language, step-by-step" },
    { value: "intermediate", label: "Intermediate", hint: "Balanced depth" },
    { value: "advanced", label: "Advanced", hint: "Edge cases, production-ready" },
  ];

const TOTAL_STEPS = 4;

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function BuildPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [copied, setCopied] = useState(false);

  const [state, setState] = useState<WizardState>({
    buildType: null,
    useCase: "",
    tool: "General",
    complexity: "intermediate",
    requirements: "",
    includeExamples: true,
    includeErrorHandling: true,
  });

  const generatedTemplate = generateTemplate(state);

  function goNext() {
    setDir(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function restart() {
    setDir(-1);
    setStep(1);
    setState({
      buildType: null,
      useCase: "",
      tool: "General",
      complexity: "intermediate",
      requirements: "",
      includeExamples: true,
      includeErrorHandling: true,
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const canProceedStep1 = state.buildType !== null;
  const canProceedStep2 = state.useCase.trim().length > 3;

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-5">
              <Hammer size={13} />
              Skill Builder
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Build a{" "}
              <span className="gradient-text">Claude resource</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate a skill, prompt, hook, or agent config for your data stack — no AI needed.
            </p>
          </motion.div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-mono">
                Step {step} of {TOTAL_STEPS}
              </span>
              <span className="text-xs text-slate-500">
                {["Choose type", "Use case", "Customize", "Output"][step - 1]}
              </span>
            </div>
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400"
                animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
            <div className="flex mt-2 gap-1">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${
                    i < step ? "bg-violet-500/60" : "bg-white/[0.05]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Wizard card */}
          <div
            className="glass-card rounded-2xl overflow-hidden"
            style={{ minHeight: 380 }}
          >
            <AnimatePresence mode="wait" custom={dir}>
              {/* Step 1 */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="p-6 sm:p-8"
                >
                  <h2 className="text-lg font-semibold mb-1">
                    What do you want to build?
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Choose the type of Claude resource.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUILD_TYPES.map((bt) => {
                      const selected = state.buildType === bt.value;
                      return (
                        <button
                          key={bt.value}
                          onClick={() =>
                            setState((s) => ({ ...s, buildType: bt.value }))
                          }
                          className="text-left p-4 rounded-xl border transition-all duration-200 focus-ring"
                          style={{
                            background: selected ? bt.bg : "rgba(255,255,255,0.02)",
                            borderColor: selected
                              ? bt.border
                              : "rgba(255,255,255,0.08)",
                            boxShadow: selected
                              ? `0 0 20px ${bt.color}20`
                              : "none",
                          }}
                        >
                          <div
                            className="mb-2"
                            style={{ color: selected ? bt.color : "#64748b" }}
                          >
                            {bt.icon}
                          </div>
                          <div
                            className="font-medium text-sm mb-1 transition-colors"
                            style={{
                              color: selected ? bt.color : "var(--text-primary)",
                            }}
                          >
                            {bt.label}
                          </div>
                          <div className="text-xs text-slate-500">
                            {bt.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="p-6 sm:p-8"
                >
                  <h2 className="text-lg font-semibold mb-1">Define your use case</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Tell us what this should do and for which tool.
                  </p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                        What should this do? *
                      </label>
                      <input
                        type="text"
                        value={state.useCase}
                        onChange={(e) =>
                          setState((s) => ({ ...s, useCase: e.target.value }))
                        }
                        placeholder="e.g. Optimize SQL queries for BigQuery"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200 placeholder-slate-600 text-sm outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                        For which tool?
                      </label>
                      <select
                        value={state.tool}
                        onChange={(e) =>
                          setState((s) => ({
                            ...s,
                            tool: e.target.value as Tool,
                          }))
                        }
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200 text-sm outline-none focus:border-violet-500/50 transition-colors appearance-none cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        {TOOLS.map((t) => (
                          <option
                            key={t}
                            value={t}
                            style={{ background: "#0f172a" }}
                          >
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Complexity level
                      </label>
                      <div className="flex gap-2">
                        {COMPLEXITY_OPTIONS.map((c) => {
                          const sel = state.complexity === c.value;
                          return (
                            <button
                              key={c.value}
                              onClick={() =>
                                setState((s) => ({
                                  ...s,
                                  complexity: c.value,
                                }))
                              }
                              className="flex-1 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 focus-ring"
                              style={{
                                background: sel
                                  ? "rgba(139,92,246,0.15)"
                                  : "rgba(255,255,255,0.02)",
                                borderColor: sel
                                  ? "rgba(139,92,246,0.5)"
                                  : "rgba(255,255,255,0.08)",
                                color: sel ? "#a78bfa" : "#64748b",
                              }}
                            >
                              <div className="font-medium">{c.label}</div>
                              <div
                                className="text-[10px] mt-0.5 opacity-70"
                                style={{ color: sel ? "#a78bfa" : "#475569" }}
                              >
                                {c.hint}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="p-6 sm:p-8"
                >
                  <h2 className="text-lg font-semibold mb-1">Customize</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Fine-tune the generated output.
                  </p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                        Any specific requirements?{" "}
                        <span className="normal-case text-slate-600 font-normal">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        value={state.requirements}
                        onChange={(e) =>
                          setState((s) => ({
                            ...s,
                            requirements: e.target.value,
                          }))
                        }
                        placeholder="e.g. Must handle partitioned tables, return EXPLAIN output, follow style guide..."
                        rows={4}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200 placeholder-slate-600 text-sm outline-none focus:border-violet-500/50 transition-colors resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          key: "includeExamples" as const,
                          label: "Include examples",
                          hint: "Adds a concrete example section",
                        },
                        {
                          key: "includeErrorHandling" as const,
                          label: "Include error handling",
                          hint: "Adds error recovery guidance",
                        },
                      ].map(({ key, label, hint }) => {
                        const on = state[key];
                        return (
                          <button
                            key={key}
                            onClick={() =>
                              setState((s) => ({ ...s, [key]: !s[key] }))
                            }
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 focus-ring text-left"
                            style={{
                              background: on
                                ? "rgba(139,92,246,0.08)"
                                : "rgba(255,255,255,0.02)",
                              borderColor: on
                                ? "rgba(139,92,246,0.35)"
                                : "rgba(255,255,255,0.08)",
                            }}
                          >
                            <div>
                              <div
                                className="text-sm font-medium"
                                style={{
                                  color: on ? "#c4b5fd" : "var(--text-primary)",
                                }}
                              >
                                {label}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {hint}
                              </div>
                            </div>
                            <div
                              className="w-10 h-5 rounded-full transition-all duration-200 relative shrink-0 ml-4"
                              style={{
                                background: on
                                  ? "rgba(139,92,246,0.8)"
                                  : "rgba(255,255,255,0.1)",
                              }}
                            >
                              <div
                                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                                style={{ left: on ? "calc(100% - 18px)" : "2px" }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="p-6 sm:p-8"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">
                        Your generated template
                      </h2>
                      <p className="text-sm text-slate-500">
                        Edit freely — this is your starting point.
                      </p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border"
                      style={{
                        background: copied
                          ? "rgba(52,211,153,0.12)"
                          : "rgba(255,255,255,0.04)",
                        borderColor: copied
                          ? "rgba(52,211,153,0.4)"
                          : "rgba(255,255,255,0.1)",
                        color: copied ? "#34d399" : "#94a3b8",
                      }}
                    >
                      {copied ? (
                        <>
                          <Check size={13} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    value={generatedTemplate}
                    onChange={(e) => {
                      // Allow editing — we use a controlled textarea but don't need to persist
                      // back to state since the template is derived. Show a detached copy.
                    }}
                    rows={16}
                    spellCheck={false}
                    className="w-full px-4 py-3 rounded-xl font-mono text-xs leading-relaxed text-slate-300 resize-none outline-none transition-colors"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                    readOnly
                  />

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <button
                      onClick={restart}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <RotateCcw size={12} />
                      Start over
                    </button>
                    <Link
                      href="/submit"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 hover:bg-violet-500/25 hover:border-violet-500/50 text-violet-300 text-sm font-medium transition-all"
                    >
                      Submit to Claude Hub
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          {step < TOTAL_STEPS && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mt-5"
            >
              {step > 1 ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.16] text-sm transition-all"
                >
                  <ChevronLeft size={15} />
                  Back
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={goNext}
                disabled={step === 1 ? !canProceedStep1 : step === 2 ? !canProceedStep2 : false}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background:
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2)
                      ? "rgba(139,92,246,0.15)"
                      : "rgba(139,92,246,0.85)",
                  color: "#fff",
                  border: "1px solid rgba(139,92,246,0.4)",
                }}
              >
                Next
                <ChevronRight size={15} />
              </button>
            </motion.div>
          )}

          {step === TOTAL_STEPS && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mt-5"
            >
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.16] text-sm transition-all"
              >
                <ChevronLeft size={15} />
                Back
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
