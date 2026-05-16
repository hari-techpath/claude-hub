import Link from "next/link";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { RESOURCES } from "@/lib/resources";

export const metadata = {
  title: "Browse by Tag — ClaudeHub",
  description: "Explore Claude resources organized by tag",
};

export default function TagsPage() {
  // Compute tag frequency
  const tagCounts: Record<string, number> = {};
  for (const resource of RESOURCES) {
    for (const tag of resource.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  const maxCount = Math.max(...Object.values(tagCounts));
  const minCount = 1;

  // Sort alphabetically
  const sortedTags = Object.entries(tagCounts).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  function getFontSize(count: number): number {
    if (maxCount === minCount) return 18;
    const ratio = (count - minCount) / (maxCount - minCount);
    return Math.round(12 + ratio * 12); // 12px to 24px
  }

  function getOpacity(count: number): number {
    if (maxCount === minCount) return 0.85;
    const ratio = (count - minCount) / (maxCount - minCount);
    return 0.45 + ratio * 0.55; // 0.45 to 1.0
  }

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Browse by tag</h1>
          <p className="text-slate-400 text-sm">
            {sortedTags.length} tags across {RESOURCES.length} resources
          </p>
        </div>

        {/* Tag cloud card */}
        <div
          className="p-8 rounded-2xl border border-white/[0.08]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="flex flex-wrap gap-x-5 gap-y-4 items-baseline">
            {sortedTags.map(([tag, count]) => {
              const fontSize = getFontSize(count);
              const opacity = getOpacity(count);
              return (
                <Link
                  key={tag}
                  href={`/explore?q=${encodeURIComponent(tag)}`}
                  className="group flex items-baseline gap-1.5 transition-all hover:opacity-100"
                  style={{ opacity }}
                >
                  <span
                    className="font-medium text-slate-200 group-hover:text-violet-300 transition-colors"
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.3 }}
                  >
                    {tag}
                  </span>
                  <span
                    className="text-slate-500 group-hover:text-slate-400 transition-colors"
                    style={{ fontSize: "11px" }}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block text-slate-400"
              style={{ fontSize: "12px" }}
            >
              small
            </span>
            <span className="text-slate-700">= fewer resources</span>
          </span>
          <span className="text-slate-800">·</span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block text-slate-300 font-medium"
              style={{ fontSize: "18px", lineHeight: 1 }}
            >
              large
            </span>
            <span className="text-slate-700">= more resources</span>
          </span>
        </div>
      </main>
      <Footer />
    </>
  );
}
