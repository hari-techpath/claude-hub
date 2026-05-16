import { redirect } from "next/navigation";
import Link from "next/link";
import { getBySlug, resources } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import ShareButton from "./share-button";

interface Props {
  params: Promise<{ slug1: string; slug2: string }>;
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

const COMPLEXITY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

export async function generateMetadata({ params }: Props) {
  const { slug1, slug2 } = await params;
  const a = getBySlug(slug1);
  const b = getBySlug(slug2);
  if (!a || !b) return { title: "Compare | ClaudeHub" };
  return {
    title: `${a.name} vs ${b.name} | ClaudeHub`,
    description: `Compare ${a.name} and ${b.name} — stars, complexity, use cases, and more.`,
  };
}

export default async function ComparePage({ params }: Props) {
  const { slug1, slug2 } = await params;
  const aRaw = getBySlug(slug1);
  const bRaw = getBySlug(slug2);

  if (!aRaw || !bRaw) {
    redirect("/explore");
  }

  // Non-null after redirect guard — TS can't narrow through `redirect()`
  const a = aRaw!;
  const b = bRaw!;

  const metaA = TYPE_META[a.type];
  const metaB = TYPE_META[b.type];

  // Helper to determine winner for a row (returns "a", "b", or null)
  function winnerStars() {
    if (a.stars > b.stars) return "a";
    if (b.stars > a.stars) return "b";
    return null;
  }
  function winnerForks() {
    if (a.forks > b.forks) return "a";
    if (b.forks > a.forks) return "b";
    return null;
  }
  function winnerComplexity() {
    // Lower complexity = better for beginners (winner)
    const ca = COMPLEXITY_ORDER[a.complexity];
    const cb = COMPLEXITY_ORDER[b.complexity];
    if (ca < cb) return "a";
    if (cb < ca) return "b";
    return null;
  }
  function winnerViews() {
    if (a.weeklyViews > b.weeklyViews) return "a";
    if (b.weeklyViews > a.weeklyViews) return "b";
    return null;
  }

  const winnerClass = "bg-green-500/10 border-green-500/20";
  const neutralClass = "border-white/[0.06]";

  function cellClass(winner: string | null, side: "a" | "b") {
    return `px-4 py-4 text-sm border-b ${winner === side ? winnerClass : neutralClass}`;
  }

  const rows: { label: string; winner: string | null; valA: React.ReactNode; valB: React.ReactNode }[] = [
    {
      label: "Type",
      winner: null,
      valA: (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: metaA.bg, color: metaA.color, border: `1px solid ${metaA.border}` }}
        >
          {metaA.icon} {metaA.label}
        </span>
      ),
      valB: (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: metaB.bg, color: metaB.color, border: `1px solid ${metaB.border}` }}
        >
          {metaB.icon} {metaB.label}
        </span>
      ),
    },
    {
      label: "Stars",
      winner: winnerStars(),
      valA: <span className="flex items-center gap-1">⭐ {formatNumber(a.stars)}</span>,
      valB: <span className="flex items-center gap-1">⭐ {formatNumber(b.stars)}</span>,
    },
    {
      label: "Forks",
      winner: winnerForks(),
      valA: <span>{formatNumber(a.forks)}</span>,
      valB: <span>{formatNumber(b.forks)}</span>,
    },
    {
      label: "Complexity",
      winner: winnerComplexity(),
      valA: (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {["beginner", "intermediate", "advanced"].map((level, i) => (
              <div
                key={level}
                className={`w-5 h-1.5 rounded-full ${
                  COMPLEXITY_ORDER[a.complexity] >= i
                    ? a.complexity === "beginner" ? "bg-green-400"
                      : a.complexity === "intermediate" ? "bg-yellow-400" : "bg-red-400"
                    : "bg-white/[0.1]"
                }`}
              />
            ))}
          </div>
          <span className="capitalize text-slate-300">{a.complexity}</span>
        </div>
      ),
      valB: (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {["beginner", "intermediate", "advanced"].map((level, i) => (
              <div
                key={level}
                className={`w-5 h-1.5 rounded-full ${
                  COMPLEXITY_ORDER[b.complexity] >= i
                    ? b.complexity === "beginner" ? "bg-green-400"
                      : b.complexity === "intermediate" ? "bg-yellow-400" : "bg-red-400"
                    : "bg-white/[0.1]"
                }`}
              />
            ))}
          </div>
          <span className="capitalize text-slate-300">{b.complexity}</span>
        </div>
      ),
    },
    {
      label: "Weekly Views",
      winner: winnerViews(),
      valA: <span>{formatNumber(a.weeklyViews)}</span>,
      valB: <span>{formatNumber(b.weeklyViews)}</span>,
    },
    {
      label: "Tags",
      winner: null,
      valA: (
        <div className="flex flex-wrap gap-1">
          {a.tags.slice(0, 5).map((t) => (
            <span key={t} className="tag-pill">{t}</span>
          ))}
        </div>
      ),
      valB: (
        <div className="flex flex-wrap gap-1">
          {b.tags.slice(0, 5).map((t) => (
            <span key={t} className="tag-pill">{t}</span>
          ))}
        </div>
      ),
    },
    {
      label: "Use Cases",
      winner: null,
      valA: (
        <div className="flex flex-wrap gap-1">
          {a.useCases.map((u) => (
            <span key={u} className="tag-pill capitalize">{u.replace(/-/g, " ")}</span>
          ))}
        </div>
      ),
      valB: (
        <div className="flex flex-wrap gap-1">
          {b.useCases.map((u) => (
            <span key={u} className="tag-pill capitalize">{u.replace(/-/g, " ")}</span>
          ))}
        </div>
      ),
    },
    ...(a.installCommand || b.installCommand
      ? [{
          label: "Install Command",
          winner: null as string | null,
          valA: a.installCommand ? (
            <code className="text-xs font-mono text-violet-300 bg-white/[0.04] px-2 py-1 rounded break-all">
              {a.installCommand}
            </code>
          ) : <span className="text-slate-600 italic">N/A</span>,
          valB: b.installCommand ? (
            <code className="text-xs font-mono text-violet-300 bg-white/[0.04] px-2 py-1 rounded break-all">
              {b.installCommand}
            </code>
          ) : <span className="text-slate-600 italic">N/A</span>,
        }]
      : []),
    {
      label: "Description",
      winner: null,
      valA: (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{a.description}</p>
      ),
      valB: (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{b.description}</p>
      ),
    },
  ];

  // Suggested comparisons (exclude current pair)
  const suggested = resources
    .filter((r) => r.slug !== a.slug && r.slug !== b.slug)
    .slice(0, 4);

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Comparison</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center justify-center gap-3 flex-wrap">
            <Link
              href={`/resources/${a.slug}`}
              className="hover:text-violet-300 transition-colors"
            >
              {a.name}
            </Link>
            <span className="text-slate-600 font-light">vs</span>
            <Link
              href={`/resources/${b.slug}`}
              className="hover:text-violet-300 transition-colors"
            >
              {b.name}
            </Link>
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Side-by-side comparison of two Claude resources
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <ShareButton />
            <Link
              href="/compare"
              className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors"
            >
              Browse comparisons
            </Link>
          </div>
        </div>

        {/* Resource name headers */}
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] bg-white/[0.03] border-b border-white/[0.08]">
            <div className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Attribute
            </div>
            <div className="px-4 py-4 border-l border-white/[0.06]">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ background: metaA.bg, color: metaA.color, border: `1px solid ${metaA.border}` }}
                >
                  {metaA.icon} {metaA.label}
                </span>
              </div>
              <div className="font-bold text-slate-100 mt-1 text-sm sm:text-base">{a.name}</div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{a.tagline}</p>
            </div>
            <div className="px-4 py-4 border-l border-white/[0.06]">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ background: metaB.bg, color: metaB.color, border: `1px solid ${metaB.border}` }}
                >
                  {metaB.icon} {metaB.label}
                </span>
              </div>
              <div className="font-bold text-slate-100 mt-1 text-sm sm:text-base">{b.name}</div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{b.tagline}</p>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr]"
            >
              {/* Label */}
              <div className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/[0.06] flex items-start">
                {row.label}
              </div>
              {/* Value A */}
              <div className={`${cellClass(row.winner, "a")} border-l border-white/[0.06]`}>
                <div className="text-slate-200">{row.valA}</div>
                {row.winner === "a" && (
                  <span className="text-[10px] text-green-400 font-semibold mt-1 block">Winner</span>
                )}
              </div>
              {/* Value B */}
              <div className={`${cellClass(row.winner, "b")} border-l border-white/[0.06]`}>
                <div className="text-slate-200">{row.valB}</div>
                {row.winner === "b" && (
                  <span className="text-[10px] text-green-400 font-semibold mt-1 block">Winner</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Links to detail pages */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={`/resources/${a.slug}`}
            className="flex items-center justify-between px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.14] transition-all group"
          >
            <div>
              <div className="text-xs text-slate-500 mb-1">View full details</div>
              <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">{a.name}</div>
            </div>
            <span className="text-slate-500 group-hover:text-slate-300 transition-colors">→</span>
          </Link>
          <Link
            href={`/resources/${b.slug}`}
            className="flex items-center justify-between px-5 py-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.14] transition-all group"
          >
            <div>
              <div className="text-xs text-slate-500 mb-1">View full details</div>
              <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">{b.name}</div>
            </div>
            <span className="text-slate-500 group-hover:text-slate-300 transition-colors">→</span>
          </Link>
        </div>

        {/* Suggested comparisons */}
        {suggested.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold mb-4 text-slate-200">More comparisons</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {suggested.map((r) => (
                <Link
                  key={r.slug}
                  href={`/compare/${a.slug}/${r.slug}`}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.07] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all text-center"
                >
                  <div className="text-xs text-slate-500 mb-1">{a.name} vs</div>
                  <div className="text-sm font-semibold text-slate-300">{r.name}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
