"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const SHORTCUTS = [
  { keys: ["⌘", "K"], description: "Open search" },
  { keys: ["↑", "↓"], description: "Navigate results" },
  { keys: ["↵"], description: "Open selected resource" },
  { keys: ["Esc"], description: "Close modal" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["G", "H"], description: "Go to home" },
  { keys: ["G", "E"], description: "Go to explore" },
  { keys: ["G", "S"], description: "Go to stacks" },
  { keys: ["B"], description: "Saved resources" },
  { keys: ["R"], description: "Random resource" },
];

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const inputFocused = ["INPUT", "TEXTAREA"].includes(tag);

      if (e.key === "?" && !inputFocused) {
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
      if (e.key === "r" && !inputFocused) {
        window.location.href = "/random";
      }
      if (e.key === "b" && !inputFocused) {
        window.location.href = "/saved";
      }
      // Go to shortcuts
      if (e.key === "g") {
        const next = (e2: KeyboardEvent) => {
          if (e2.key === "h") window.location.href = "/";
          if (e2.key === "e") window.location.href = "/explore";
          if (e2.key === "s") window.location.href = "/stacks";
          window.removeEventListener("keydown", next);
        };
        window.addEventListener("keydown", next);
        setTimeout(() => window.removeEventListener("keydown", next), 1000);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-[#0c0f1a] border border-white/[0.1] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-200">Keyboard shortcuts</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-2.5">
              {SHORTCUTS.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{s.description}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, j) => (
                      <kbd key={j} className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-[11px] text-slate-400 font-mono">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
              <span className="text-xs text-slate-600">Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono">?</kbd> to toggle</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
