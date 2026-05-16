"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Resource } from "@/lib/types";

interface Props {
  resources: Resource[];
}

export default function CompareSelector({ resources }: Props) {
  const router = useRouter();
  const [slug1, setSlug1] = useState("");
  const [slug2, setSlug2] = useState("");

  const handleCompare = () => {
    if (slug1 && slug2 && slug1 !== slug2) {
      router.push(`/compare/${slug1}/${slug2}`);
    }
  };

  const selectClass =
    "flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all appearance-none cursor-pointer";

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <select
        value={slug1}
        onChange={(e) => setSlug1(e.target.value)}
        className={selectClass}
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <option value="" disabled>Pick first resource...</option>
        {resources.map((r) => (
          <option key={r.slug} value={r.slug} disabled={r.slug === slug2}>
            {r.name}
          </option>
        ))}
      </select>

      <span className="text-center text-slate-600 font-semibold text-sm shrink-0 py-2 sm:py-0">vs</span>

      <select
        value={slug2}
        onChange={(e) => setSlug2(e.target.value)}
        className={selectClass}
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <option value="" disabled>Pick second resource...</option>
        {resources.map((r) => (
          <option key={r.slug} value={r.slug} disabled={r.slug === slug1}>
            {r.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleCompare}
        disabled={!slug1 || !slug2 || slug1 === slug2}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        Compare →
      </button>
    </div>
  );
}
