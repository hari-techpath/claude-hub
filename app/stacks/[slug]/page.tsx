import { notFound } from "next/navigation";
import Link from "next/link";
import { Layers, ArrowLeft, Clock, Star, Github } from "lucide-react";
import { RESOURCES } from "@/lib/resources";
import { TYPE_META } from "@/lib/types";
import { STACKS, getStackBySlug, getRelatedStacks } from "@/lib/stacks";
import type { Stack } from "@/lib/stacks";
import InstallButton from "./install-button";
import ShareButton from "./share-button";

export function generateStaticParams() {
  return STACKS.map((stack) => ({ slug: stack.id }));
}

function setupTimeLabel(count: number): string {
  if (count < 5) return "~15 min";
  if (count <= 7) return "~30 min";
  return "~1 hour";
}

function ResourceCard({ slug }: { slug: string }) {
  const resource = RESOURCES.find((r) => r.slug === slug);
  if (!resource) return null;

  const meta = TYPE_META[resource.type];

  return (
    <Link
      href={`/resources/${resource.slug}`}
      className="group block glass-card rounded-2xl p-4 hover:border-white/[0.16] transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
        >
          {meta.icon} {meta.label}
        </span>
        <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
          <Star size={10} className="text-yellow-500/70" />
          <span>{resource.stars.toLocaleString()}</span>
        </div>
      </div>

      <h3 className="font-semibold text-slate-100 text-sm group-hover:text-white transition-colors mb-1">
        {resource.name}
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
        {resource.tagline}
      </p>

      {resource.installCommand && (
        <code className="block text-xs text-slate-500 bg-white/[0.04] rounded-lg px-3 py-2 font-mono truncate">
          {resource.installCommand}
        </code>
      )}

      <div className="flex items-center gap-2 mt-3">
        {resource.githubUrl && (
          <span className="flex items-center gap-1 text-xs text-slate-600">
            <Github size={11} />
            <span>{resource.author}</span>
          </span>
        )}
        <span
          className="ml-auto text-xs px-1.5 py-0.5 rounded"
          style={{ background: `${meta.color}15`, color: meta.color }}
        >
          {resource.complexity}
        </span>
      </div>
    </Link>
  );
}

function RelatedStackCard({ stack }: { stack: Stack }) {
  const resources = stack.slugs
    .map((slug) => RESOURCES.find((r) => r.slug === slug))
    .filter(Boolean) as typeof RESOURCES;
  const totalStars = resources.reduce((acc, r) => acc + r.stars, 0);

  return (
    <Link
      href={`/stacks/${stack.id}`}
      className="group block glass-card rounded-2xl p-4 hover:border-white/[0.16] transition-all"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{stack.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 text-sm group-hover:text-white transition-colors truncate">
            {stack.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{stack.tagline}</p>
          <div className="flex items-center gap-3 mt-2">
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded-full"
              style={{
                background: `${stack.color}20`,
                color: stack.color,
                border: `1px solid ${stack.color}30`,
              }}
            >
              {stack.audience}
            </span>
            <span className="text-xs text-slate-600">
              {resources.length} resources · {totalStars.toLocaleString()} ★
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function StackDetailPage({ params }: { params: { slug: string } }) {
  const stack = getStackBySlug(params.slug);
  if (!stack) notFound();

  const resources = stack.slugs
    .map((slug) => RESOURCES.find((r) => r.slug === slug))
    .filter(Boolean) as typeof RESOURCES;

  const totalStars = resources.reduce((acc, r) => acc + r.stars, 0);
  const setupTime = setupTimeLabel(resources.length);
  const relatedStacks = getRelatedStacks(stack);

  const installCommands = resources
    .filter((r) => r.installCommand)
    .map((r) => r.installCommand!)
    .join("\n");

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">
      {/* Back nav */}
      <Link
        href="/stacks"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        All stacks
      </Link>

      {/* Stack header */}
      <div className="glass-card rounded-3xl p-8 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{stack.emoji}</span>
              <span
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{
                  background: `${stack.color}20`,
                  color: stack.color,
                  border: `1px solid ${stack.color}30`,
                }}
              >
                {stack.audience}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">{stack.name}</h1>
            <p className="text-slate-400 text-lg mb-4">{stack.tagline}</p>
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
              {stack.description}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-5 mt-6 pt-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Layers size={14} className="text-slate-500" />
            <span>{resources.length} resources</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Star size={14} className="text-yellow-500/70" />
            <span>{totalStars.toLocaleString()} combined stars</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock size={14} className="text-slate-500" />
            <span>{setupTime} to set up</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <InstallButton installCommands={installCommands} stackName={stack.name} />
            <ShareButton stackName={stack.name} />
          </div>
        </div>
      </div>

      {/* Resources grid */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-100 mb-4">
          Resources in this stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stack.slugs.map((slug) => (
            <ResourceCard key={slug} slug={slug} />
          ))}
        </div>
      </section>

      {/* Install script panel */}
      {installCommands && (
        <section className="glass-card rounded-3xl p-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-100">Install everything</h2>
            <InstallButton installCommands={installCommands} stackName={stack.name} compact />
          </div>
          <pre className="text-xs text-slate-300 font-mono bg-white/[0.03] rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre">
            {installCommands}
          </pre>
          <p className="text-xs text-slate-600 mt-3">
            Run these commands to add all{" "}
            {resources.filter((r) => r.installCommand).length} installable resources to
            your Claude Code environment.
          </p>
        </section>
      )}

      {/* Related stacks */}
      {relatedStacks.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-4">Related stacks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedStacks.map((s) => (
              <RelatedStackCard key={s.id} stack={s} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
