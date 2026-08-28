export default function Loading() {
  return (
    <div className="space-y-12">
      <div className="flex items-center gap-5 md:gap-7">
        <div className="skeleton-shimmer h-24 w-24 rounded-2xl md:h-32 md:w-32" />
        <div className="space-y-2">
          <div className="skeleton-shimmer h-8 w-48 rounded-lg md:h-12 md:w-72" />
          <div className="skeleton-shimmer h-4 w-40 rounded-lg" />
        </div>
      </div>
      <div>
        <div className="skeleton-shimmer h-3 w-20 rounded" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            // oxlint-disable-next-line react/no-array-index-key
            <div key={`rank-${i}`} className="card skeleton-shimmer h-64" />
          ))}
        </div>
      </div>
      <div>
        <div className="skeleton-shimmer h-3 w-24 rounded" />
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            // oxlint-disable-next-line react/no-array-index-key
            <div key={`champ-${i}`} className="card skeleton-shimmer h-44" />
          ))}
        </div>
      </div>
    </div>
  );
}