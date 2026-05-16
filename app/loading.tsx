// Root loading - shows for the home page
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 animate-pulse" />
        <div className="text-slate-500 text-sm">Loading Claude Hub...</div>
      </div>
    </div>
  );
}
