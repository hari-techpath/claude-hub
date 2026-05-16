"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  Users,
  CheckCircle2,
  Star,
  Layers,
  TrendingUp,
  GitPullRequest,
  ArrowRight,
} from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import SearchModal from "@/components/search-modal";
import { RESOURCES } from "@/lib/resources";

/* ─── computed stats ─────────────────────────────────────────── */
const totalResources = RESOURCES.length;
const totalStars = RESOURCES.reduce((sum, r) => sum + r.stars, 0);
const totalTypes = new Set(RESOURCES.map((r) => r.type)).size;
const verifiedCount = RESOURCES.filter((r) => r.verified).length;

/* ─── animated number ────────────────────────────────────────── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const display =
    value >= 1000
      ? `${(value / 1000).toFixed(1)}k`
      : value.toString();

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="tabular-nums"
    >
      {inView ? display : "—"}
      {suffix}
    </motion.span>
  );
}

/* ─── section fade-up wrapper ────────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── pain point card ────────────────────────────────────────── */
const PAIN_POINTS = [
  {
    icon: <Search size={22} className="text-violet-400" />,
    title: "Resources were scattered",
    body: "Finding good Claude integrations meant endless GitHub searches, Reddit threads, and Discord channels — with no guarantee of quality.",
  },
  {
    icon: <ShieldCheck size={22} className="text-blue-400" />,
    title: "Quality was unclear",
    body: "No way to know if an MCP was actively maintained, broken on the latest Claude version, or abandoned three months after launch.",
  },
  {
    icon: <Users size={22} className="text-emerald-400" />,
    title: "Data teams were underserved",
    body: "Most AI tool directories are generic. Data engineers, scientists, and analysts need a curated view built for their specific stack.",
  },
];

/* ─── how it works steps ─────────────────────────────────────── */
const HOW_STEPS = [
  {
    number: "01",
    title: "We curate",
    body: "Our editors and community surface the best resources across MCPs, skills, agents, prompts, and more — so you don't have to.",
    color: "#a78bfa",
  },
  {
    number: "02",
    title: "We verify",
    body: "The Verified badge means actively maintained, tested against the current Claude API, and trusted by the community.",
    color: "#60a5fa",
  },
  {
    number: "03",
    title: "You discover",
    body: "Search, filter by type or use-case, compare options side-by-side, and go build — faster than ever before.",
    color: "#34d399",
  },
];

/* ─── roadmap items ──────────────────────────────────────────── */
const ROADMAP = [
  { label: "Live GitHub star syncing", status: "next" },
  { label: "User accounts and personal libraries", status: "next" },
  { label: "Resource ratings and reviews (community-sourced)", status: "planned" },
  { label: "Claude-powered recommendations", status: "planned" },
  { label: "Browser extension", status: "planned" },
  { label: "Mobile app", status: "future" },
];

const STATUS_COLOR: Record<string, string> = {
  next: "#a78bfa",
  planned: "#60a5fa",
  future: "#94a3b8",
};

/* ─── page ───────────────────────────────────────────────────── */
export default function AboutPage() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Nav onSearchOpen={() => setSearchOpen(true)} />

      <main className="pt-16 overflow-x-hidden">
        {/* ── 1. Hero ──────────────────────────────────────────── */}
        <section className="relative min-h-[480px] flex items-center justify-center py-28 px-4 text-center overflow-hidden">
          {/* Aurora blobs */}
          <div className="aurora-blob w-[560px] h-[560px] bg-violet-600 -top-32 -left-32 opacity-[0.14]" />
          <div className="aurora-blob w-[480px] h-[480px] bg-blue-600 top-0 right-0 opacity-[0.12]" />
          <div className="aurora-blob w-[320px] h-[320px] bg-emerald-500 bottom-0 left-1/2 -translate-x-1/2 opacity-[0.10]" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-sm font-medium text-violet-400 uppercase tracking-widest mb-4"
            >
              Our mission
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Built for data professionals,{" "}
              <span className="gradient-text">by data professionals</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
            >
              Claude Hub curates the best Claude MCPs, skills, agents, and
              prompts so data engineers, scientists, and analysts can spend less
              time searching and more time building.
            </motion.p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* divider */}
          <div className="border-t border-white/[0.06] my-2" />

          {/* ── 2. Why we built this ─────────────────────────── */}
          <section className="py-20">
            <FadeUp>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Why we built this
              </h2>
              <p className="text-slate-400 mb-10">
                The problems we kept running into — before ClaudeHub existed.
              </p>
            </FadeUp>

            <div className="grid sm:grid-cols-3 gap-5">
              {PAIN_POINTS.map((p, i) => (
                <FadeUp key={p.title} delay={i * 0.08}>
                  <div className="glass-card rounded-2xl p-6 h-full">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-4">
                      {p.icon}
                    </div>
                    <h3 className="font-semibold text-slate-100 mb-2">
                      {p.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {p.body}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </section>

          <div className="border-t border-white/[0.06]" />

          {/* ── 3. How it works ──────────────────────────────── */}
          <section className="py-20">
            <FadeUp>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                How it works
              </h2>
              <p className="text-slate-400 mb-10">
                Simple process, high-signal output.
              </p>
            </FadeUp>

            <div className="grid sm:grid-cols-3 gap-5">
              {HOW_STEPS.map((step, i) => (
                <FadeUp key={step.number} delay={i * 0.08}>
                  <div className="glass-card rounded-2xl p-6 h-full relative overflow-hidden">
                    {/* large background number */}
                    <span
                      className="absolute -top-3 -right-1 text-[80px] font-black leading-none select-none pointer-events-none"
                      style={{ color: step.color, opacity: 0.07 }}
                    >
                      {step.number}
                    </span>

                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-4"
                      style={{
                        background: `${step.color}18`,
                        color: step.color,
                        border: `1px solid ${step.color}30`,
                      }}
                    >
                      {step.number}
                    </div>
                    <h3 className="font-semibold text-slate-100 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </section>

          <div className="border-t border-white/[0.06]" />

          {/* ── 4. By the numbers ────────────────────────────── */}
          <section className="py-20">
            <FadeUp>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                By the numbers
              </h2>
              <p className="text-slate-400 mb-10">
                Everything in the registry, right now.
              </p>
            </FadeUp>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  icon: <Layers size={18} className="text-violet-400" />,
                  value: totalResources,
                  label: "Total resources",
                  color: "#a78bfa",
                },
                {
                  icon: <Star size={18} className="text-yellow-400" />,
                  value: totalStars,
                  label: "GitHub stars",
                  color: "#facc15",
                },
                {
                  icon: <TrendingUp size={18} className="text-blue-400" />,
                  value: totalTypes,
                  label: "Resource types",
                  color: "#60a5fa",
                },
                {
                  icon: <CheckCircle2 size={18} className="text-emerald-400" />,
                  value: verifiedCount,
                  label: "Verified resources",
                  color: "#34d399",
                },
              ].map((stat, i) => (
                <FadeUp key={stat.label} delay={i * 0.07}>
                  <div className="glass-card rounded-2xl p-6 text-center">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{
                        background: `${stat.color}15`,
                        border: `1px solid ${stat.color}25`,
                      }}
                    >
                      {stat.icon}
                    </div>
                    <div
                      className="text-3xl font-bold mb-1"
                      style={{ color: stat.color }}
                    >
                      <AnimatedNumber value={stat.value} />
                    </div>
                    <div className="text-xs text-slate-500">{stat.label}</div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </section>

          <div className="border-t border-white/[0.06]" />

          {/* ── 5. Open source ───────────────────────────────── */}
          <section className="py-20">
            <FadeUp>
              <div className="gradient-border rounded-2xl p-8 sm:p-12 text-center bg-white/[0.02]">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <GitPullRequest size={22} className="text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  Open to contributions
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
                  Claude Hub is open to contributions. Found a great resource?
                  Submit it — if it passes the quality bar, it gets a Verified
                  badge and a permanent home in the registry.
                </p>
                <Link
                  href="/submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500/10 border border-violet-500/25 hover:bg-violet-500/20 hover:border-violet-500/45 text-violet-300 font-medium transition-all"
                >
                  Submit a resource
                  <ArrowRight size={16} />
                </Link>
              </div>
            </FadeUp>
          </section>

          <div className="border-t border-white/[0.06]" />

          {/* ── 6. Roadmap ───────────────────────────────────── */}
          <section className="py-20">
            <FadeUp>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                What&apos;s coming
              </h2>
              <p className="text-slate-400 mb-10">
                The roadmap, roughly in order.
              </p>
            </FadeUp>

            <div className="relative">
              {/* vertical line */}
              <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/40 via-blue-500/25 to-transparent" />

              <ol className="space-y-5 pl-12">
                {ROADMAP.map((item, i) => (
                  <FadeUp key={item.label} delay={i * 0.06}>
                    <li className="relative flex items-start gap-4">
                      {/* dot */}
                      <span
                        className="absolute -left-[37px] top-[3px] w-3 h-3 rounded-full border-2 border-[#030712]"
                        style={{
                          background: STATUS_COLOR[item.status],
                          boxShadow: `0 0 8px ${STATUS_COLOR[item.status]}60`,
                        }}
                      />
                      <span className="text-slate-200 text-sm leading-relaxed">
                        {item.label}
                      </span>
                      <span
                        className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          color: STATUS_COLOR[item.status],
                          background: `${STATUS_COLOR[item.status]}15`,
                          border: `1px solid ${STATUS_COLOR[item.status]}30`,
                        }}
                      >
                        {item.status}
                      </span>
                    </li>
                  </FadeUp>
                ))}
              </ol>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
