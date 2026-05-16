"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface InstallButtonProps {
  installCommands: string;
  stackName: string;
  compact?: boolean;
}

export default function InstallButton({ installCommands, stackName, compact }: InstallButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(installCommands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all text-xs"
      >
        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
        {copied ? "Copied!" : "Copy"}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white transition-all text-sm font-medium"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied!" : `Install ${stackName.split(" ")[0]} stack`}
    </button>
  );
}
