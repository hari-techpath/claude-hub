// Graph loading — centered "Preparing graph..." message
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Animated node cluster */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border border-violet-500/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-blue-500/40 animate-ping" style={{ animationDelay: "0.3s" }} />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 animate-pulse" />
        </div>
        <div className="text-slate-400 text-sm font-medium">Preparing graph...</div>
        <div className="text-slate-600 text-xs">Building resource connections</div>
      </div>
    </div>
  );
}
