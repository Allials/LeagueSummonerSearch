import Link from "next/link";

export function PlayerNotFound({ query }: { query: string }) {
  return (
    <div className="animate-fade-up flex flex-col items-center px-4 pt-14 text-center">
      <h1 className="font-display text-5xl leading-none tracking-[-0.01em] text-stone-900 dark:text-gold-300 md:text-7xl">
        Summoner not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-500 dark:text-stone-400">
        We searched every region for{" "}
        <span className="font-semibold text-stone-700 dark:text-gold-300">{query}</span>{" "}
        and came up empty.
      </p>
      <ul className="mt-5 list-disc space-y-1.5 rounded-xl bg-white/60 px-6 py-4 text-left text-xs leading-relaxed text-stone-500 ring-1 ring-black/5 dark:bg-white/[0.04] dark:text-stone-400 dark:ring-white/10">
        <li>Double-check the spelling of the game name.</li>
        <li>
          Custom taglines are unique — include them exactly, like{" "}
          <span className="font-semibold">Name#TAG</span>. They belong to one
          specific server, so try a different region too.
        </li>
        <li>Some Riot IDs exist but have never created a League of Legends profile.</li>
      </ul>
      <Link
        href="/"
        className="btn-press mt-8 rounded-xl bg-gold-400 px-8 py-3 text-sm font-bold text-night-950 shadow-lg shadow-gold-400/25 hover:bg-gold-300 dark:shadow-gold-400/10"
      >
        Search again
      </Link>
    </div>
  );
}