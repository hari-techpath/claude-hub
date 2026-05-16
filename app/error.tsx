"use client";
import { useEffect } from "react";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-slate-400 text-sm">{error.message || "An unexpected error occurred"}</p>
        <button onClick={reset} className="px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-300 text-sm hover:bg-violet-500/30 transition-colors">
          Try again
        </button>
      </div>
    </div>
  );
}
