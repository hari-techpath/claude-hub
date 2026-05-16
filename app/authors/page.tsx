import Link from "next/link";
import { Star } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { RESOURCES } from "@/lib/resources";

export const metadata = {
  title: "Authors — ClaudeHub",
  description: "Browse all authors contributing Claude resources",
};

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

function getAvatarGradient(name: string): string {
  const gradients = [
    "from-violet-500 to-blue-500",
    "from-cyan-500 to-violet-500",
    "from-orange-500 to-pink-500",
    "from-green-500 to-cyan-500",
    "from-blue-500 to-indigo-500",
    "from-pink-500 to-violet-500",
    "from-amber-500 to-orange-500",
    "from-teal-500 to-green-500",
  ];
  const idx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradients.length;
  return gradients[idx];
}

export default function AuthorsPage() {
  // Compute per-author stats
  const authorMap: Record<string, { count: number; stars: number }> = {};
  for (const resource of RESOURCES) {
    if (!authorMap[resource.author]) {
      authorMap[resource.author] = { count: 0, stars: 0 };
    }
    authorMap[resource.author].count += 1;
    authorMap[resource.author].stars += resource.stars;
  }

  const authors = Object.entries(authorMap)
    .map(([name, { count, stars }]) => ({ name, count, stars }))
    .sort((a, b) => b.stars - a.stars);

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Authors</h1>
          <p className="text-slate-400 text-sm">
            {authors.length} authors · {RESOURCES.length} total resources
          </p>
        </div>

        {/* Author grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {authors.map(({ name, count, stars }) => {
            const gradient = getAvatarGradient(name);
            const initial = name[0]?.toUpperCase() ?? "?";
            return (
              <Link
                key={name}
                href={`/authors/${encodeURIComponent(name)}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all hover:bg-white/[0.03]"
              >
                {/* Avatar */}
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
                >
                  <span className="text-xl font-bold text-white">{initial}</span>
                </div>

                {/* Name */}
                <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors text-center line-clamp-2 leading-snug">
                  {name}
                </span>

                {/* Stats */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="inline-flex items-center gap-0.5">
                    <Star size={9} className="text-yellow-500/70" />
                    {formatNumber(stars)}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-medium">
                    {count}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
