"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  stackName: string;
}

export default function ShareButton({ stackName }: ShareButtonProps) {
  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: stackName, url: window.location.href });
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all text-sm font-medium"
    >
      <Share2 size={14} />
      Share
    </button>
  );
}
