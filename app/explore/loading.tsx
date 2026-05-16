// Explore loading — 6 shimmer skeleton cards in a grid
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Header skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8">
        <div className="shimmer h-8 w-48 rounded-lg mb-2" />
        <div className="shimmer h-4 w-72 rounded-md" />
      </div>

      {/* Filter bar skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shimmer h-8 w-20 rounded-full" />
        ))}
      </div>

      {/* 6-card grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.08] p-5 flex flex-col gap-3"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              {/* Icon + badge row */}
              <div className="flex items-center justify-between">
                <div className="shimmer w-10 h-10 rounded-xl" />
                <div className="shimmer h-5 w-16 rounded-full" />
              </div>
              {/* Title */}
              <div className="shimmer h-5 w-3/4 rounded-md" />
              {/* Description lines */}
              <div className="flex flex-col gap-2">
                <div className="shimmer h-3 w-full rounded" />
                <div className="shimmer h-3 w-5/6 rounded" />
              </div>
              {/* Tags row */}
              <div className="flex gap-2 mt-1">
                <div className="shimmer h-5 w-14 rounded-full" />
                <div className="shimmer h-5 w-18 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
