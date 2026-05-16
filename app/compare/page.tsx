import Link from "next/link";
import { resources } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import CompareSelector from "./compare-selector";

export const metadata = {
  title: "Compare Claude Resources | ClaudeHub",
  description: "Compare Claude MCPs, skills, agents, and prompts side by side.",
};

const SUGGESTED_PAIRS: { slug1: string; slug2: string; label?: string }[] = [
  { slug1: "mcp-postgres", slug2: "mcp-sqlite" },
  { slug1: "mcp-supabase", slug2: "mcp-postgres" },
  { slug1: "mcp-github", slug2: "mcp-gitlab" },
  { slug1: "agent-data-pipeline", slug2: "agent-code-reviewer" },
  { slug1: "skill-ship", slug2: "skill-qa" },
  { slug1: "prompt-sql-optimizer", slug2: "prompt-code-review" },
  { slug1: "mcp-docker", slug2: "mcp-vercel" },
  { slug1: "skill-review-code", slug2: "skill-investigate" },
];

function getResource(slug: string) {
  return resources.find((r) => r.slug === slug);
}

export default function CompareLandingPage() {
  // Filter pairs where both resources exist
  const validPairs = SUGGESTED_PAIRS.map((p) => ({
    ...p,
    a: getResource(p.slug1),
    b: getResource(p.slug2),
  })).filter((p) => p.a && p.b);

  // All resources sorted by name for selects
  const sorted = [...resources].sort((x, y) => x.name.localeCompare(y.name));

  return (
    <>
      <Nav />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Compare</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Compare Claude resources{" "}
            <span className="gradient-text">side-by-side</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Pick any two MCPs, skills, agents, or prompts and see how they stack up on stars, complexity, use cases, and more.
          </p>
        </div>

        {/* Custom selector */}
        <div className="mb-12 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            Choose any two resources
          </h2>
          <CompareSelector resources={sorted} />
        </div>

        {/* Suggested pairs */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">
            Suggested comparisons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {validPairs.map((pair) => {
              if (!pair.a || !pair.b) return null;
              const metaA = TYPE_META[pair.a.type];
              const metaB = TYPE_META[pair.b.type];
              return (
                <Link
                  key={`${pair.slug1}-${pair.slug2}`}
                  href={`/compare/${pair.slug1}/${pair.slug2}`}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:bg-white/[0.05] hover:border-white/[0.14] transition-all"
                >
                  {/* Resource A */}
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold mb-1"
                      style={{ background: metaA.bg, color: metaA.color, border: `1px solid ${metaA.border}` }}
                    >
                      {metaA.icon} {metaA.label}
                    </span>
                    <div className="text-sm font-semibold text-slate-200 truncate">{pair.a.name}</div>
                  </div>

                  {/* vs */}
                  <div className="shrink-0 text-xs font-bold text-slate-600 bg-white/[0.04] px-2 py-1 rounded-full border border-white/[0.06]">
                    vs
                  </div>

                  {/* Resource B */}
                  <div className="flex-1 min-w-0 text-right">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold mb-1"
                      style={{ background: metaB.bg, color: metaB.color, border: `1px solid ${metaB.border}` }}
                    >
                      {metaB.icon} {metaB.label}
                    </span>
                    <div className="text-sm font-semibold text-slate-200 truncate">{pair.b.name}</div>
                  </div>

                  <span className="text-slate-600 group-hover:text-slate-300 transition-colors shrink-0">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
