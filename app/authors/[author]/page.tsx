import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, BadgeCheck, Star, GitFork } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import ResourceCard from "@/components/resource-card";
import { RESOURCES } from "@/lib/resources";
import type { ResourceType } from "@/lib/types";

interface Props {
  params: Promise<{ author: string }>;
}

export async function generateStaticParams() {
  const authors = Array.from(new Set(RESOURCES.map((r) => r.author)));
  return authors.map((author) => ({ author: encodeURIComponent(author) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { author } = await params;
  const name = decodeURIComponent(author);
  return {
    title: `${name} — ClaudeHub`,
    description: `All Claude resources published by ${name}`,
  };
}

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

export default async function AuthorPage({ params }: Props) {
  const { author } = await params;
  const authorName = decodeURIComponent(author);

  const resources = RESOURCES.filter((r) => r.author === authorName);

  if (resources.length === 0) {
    redirect("/explore");
  }

  const totalStars = resources.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = resources.reduce((sum, r) => sum + r.forks, 0);
  const isVerified = resources.some((r) => r.verified);
  const authorUrl = resources.find((r) => r.authorUrl)?.authorUrl;

  // Most common type
  const typeCounts: Record<string, number> = {};
  for (const r of resources) {
    typeCounts[r.type] = (typeCounts[r.type] ?? 0) + 1;
  }
  const mostCommonType = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as ResourceType | undefined;

  const avatarGradient = getAvatarGradient(authorName);
  const initial = authorName[0]?.toUpperCase() ?? "?";

  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Profile card */}
        <div
          className="rounded-2xl border border-white/[0.08] p-8 mb-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div
              className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center shrink-0`}
            >
              <span className="text-3xl font-bold text-white">{initial}</span>
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{authorName}</h1>
                {isVerified && (
                  <BadgeCheck size={22} className="text-blue-400 shrink-0" />
                )}
              </div>
              {authorUrl && (
                <a
                  href={authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-violet-300 transition-colors mt-1"
                >
                  <ExternalLink size={13} />
                  {authorUrl.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{resources.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Resources</div>
              </div>
              <div className="w-px h-10 bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{formatNumber(totalStars)}</div>
                <div className="text-xs text-slate-500 mt-0.5">Total stars</div>
              </div>
              <div className="w-px h-10 bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{formatNumber(totalForks)}</div>
                <div className="text-xs text-slate-500 mt-0.5">Total forks</div>
              </div>
              {mostCommonType && (
                <>
                  <div className="w-px h-10 bg-white/[0.08]" />
                  <div className="text-center">
                    <div className="text-sm font-semibold text-violet-300 capitalize">{mostCommonType}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Top type</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Section header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-200">
            Resources by {authorName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {resources.length} {resources.length === 1 ? "resource" : "resources"}
          </p>
        </div>

        {/* Resource grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
