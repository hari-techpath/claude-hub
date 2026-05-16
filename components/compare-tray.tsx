"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, GitFork, BarChart2 } from "lucide-react";
import { Resource, TYPE_META } from "@/lib/types";

interface CompareTrayProps {
  resources: Resource[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

function CompareModal({ resources, onClose }: { resources: Resource[]; onClose: () => void }) {
  const [a, b] = resources;
  const metaA = TYPE_META[a.type];
  const metaB = TYPE_META[b.type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl rounded-2xl bg-[#030712]/95 backdrop-blur-xl border border-white/[0.1] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <BarChart2 size={15} className="text-violet-400" />
              Comparing resources
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Comparison grid */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.07]">
            {[{ r: a, meta: metaA }, { r: b, meta: metaB }].map(({ r, meta }) => (
              <div key={r.id} className="p-6 space-y-5">
                {/* Name + type */}
                <div>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold mb-2"
                    style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                  >
                    <span>{meta.icon}</span>
                    {meta.label}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 leading-tight">{r.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{r.tagline}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-sm text-slate-300">
                    <Star size={13} className="text-yellow-400" />
                    {formatNumber(r.stars)}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-slate-300">
                    <GitFork size={13} className="text-slate-400" />
                    {formatNumber(r.forks)}
                  </span>
                </div>

                {/* Complexity */}
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Complexity</div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      {["beginner", "intermediate", "advanced"].map((level, i) => (
                        <div
                          key={level}
                          className={`w-6 h-1.5 rounded-full transition-colors ${
                            ["beginner", "intermediate", "advanced"].indexOf(r.complexity) >= i
                              ? r.complexity === "beginner" ? "bg-green-400"
                                : r.complexity === "intermediate" ? "bg-yellow-400" : "bg-red-400"
                              : "bg-white/[0.1]"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-300 capitalize">{r.complexity}</span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {r.tags.slice(0, 6).map((tag) => (
                      <span key={tag} className="tag-pill">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">About</div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function CompareTray({ resources, onRemove, onClear }: CompareTrayProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const canCompare = resources.length === 2;

  return (
    <>
      <AnimatePresence>
        {resources.length > 0 && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4"
          >
            <div className="w-full max-w-xl rounded-2xl bg-[#030712]/95 backdrop-blur-xl border border-white/[0.1] shadow-2xl px-5 py-4 flex items-center gap-4">
              {/* Selected items */}
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                  Compare:
                </span>
                {resources.map((r) => {
                  const meta = TYPE_META[r.type];
                  return (
                    <span
                      key={r.id}
                      className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg text-xs font-medium"
                      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                    >
                      {r.name}
                      <button
                        onClick={() => onRemove(r.id)}
                        className="p-0.5 rounded hover:opacity-70 transition-opacity"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  );
                })}
                {resources.length < 2 && (
                  <span className="text-xs text-slate-600 italic">
                    {2 - resources.length} more to compare
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onClear}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
                >
                  Clear
                </button>
                {canCompare && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                  >
                    Compare
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {modalOpen && canCompare && (
        <CompareModal resources={resources} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
