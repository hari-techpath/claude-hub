"use client";

import Link from "next/link";

const SPONSORS = [
  { name: "Snowflake", color: "#29B5E8" },
  { name: "dbt Labs", color: "#FF694A" },
  { name: "Databricks", color: "#FF3621" },
  { name: "Airbyte", color: "#6161FF" },
  { name: "Prefect", color: "#024DFD" },
  { name: "Monte Carlo", color: "#34d399" },
];

export default function SponsorBanner() {
  return (
    <section className="py-10 border-y border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-center mb-6">
          Trusted by data teams at
        </p>

        {/* Logo wordmarks */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mb-8">
          {SPONSORS.map((sponsor) => (
            <span
              key={sponsor.name}
              className="font-mono text-sm font-semibold px-3 py-1.5 rounded-lg
                bg-white/[0.03] border border-white/[0.07]
                opacity-50 hover:opacity-100 transition-opacity duration-200 cursor-default select-none"
              style={{ color: sponsor.color }}
            >
              {sponsor.name}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Link
            href="/submit?ref=sponsor"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
              bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16]
              text-xs text-slate-400 hover:text-slate-200 transition-all duration-200
              backdrop-blur-sm"
          >
            Want to reach 10k+ data engineers?&nbsp;
            <span className="text-violet-400 font-medium">Partner with Claude Hub →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
