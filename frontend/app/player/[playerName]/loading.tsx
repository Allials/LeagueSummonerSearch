export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-5 md:gap-7">
        <div className="h-24 w-24 rounded-2xl bg-black/10 dark:bg-white/10 md:h-32 md:w-32" />
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-black/10 dark:bg-white/10 md:h-12 md:w-72" />
          <div className="h-4 w-40 rounded-lg bg-black/10 dark:bg-white/10" />
        </div>
      </div>
      <div className="mt-12">
        <div className="h-3 w-20 rounded bg-black/10 dark:bg-white/10" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            // oxlint-disable-next-line react/no-array-index-key
            <div key={`rank-${i}`} className="card h-64" />
          ))}
        </div>
      </div>
      <div className="mt-12">
        <div className="h-3 w-24 rounded bg-black/10 dark:bg-white/10" />
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            // oxlint-disable-next-line react/no-array-index-key
            <div key={`champ-${i}`} className="card h-44" />
          ))}
        </div>
      </div>
    </div>
  );
}