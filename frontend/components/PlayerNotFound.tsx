import Link from "next/link";
import { IoHelpCircleOutline } from "react-icons/io5";

export function PlayerNotFound({ query }: { query: string }) {
  return (
    <div className="animate-fade-up flex flex-col items-center px-4 pt-14 text-center">
      <h1 className="font-display text-5xl leading-none tracking-[-0.01em] text-stone-900 dark:text-gold-300 md:text-7xl">
        Summoner not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        We searched all available servers for{" "}
        <span className="font-semibold text-stone-900 dark:text-gold-300">{query}</span>{" "}
        and came up empty.
      </p>
      <div className="card mt-6 max-w-md p-5 text-left text-xs leading-relaxed">
        <div className="flex items-center gap-2 text-stone-700 dark:text-gold-300 font-semibold mb-2.5">
          <IoHelpCircleOutline className="text-base text-gold-500" />
          <span>Troubleshooting Tips</span>
        </div>
        <ul className="list-disc pl-4 space-y-1.5 text-stone-600 dark:text-stone-300">
          <li>Double-check the spelling of the Riot ID game name.</li>
          <li>
            Custom taglines are unique: include them exactly, like{" "}
            <span className="font-semibold text-stone-800 dark:text-gold-300">Name#TAG</span>. They belong to a specific server, so try selecting another region.
          </li>
          <li>Some Riot accounts exist across Riot games but have never created a League of Legends summoner profile.</li>
        </ul>
      </div>
      <Link
        href="/"
        className="btn-press mt-8 rounded-xl bg-gold-400 px-8 py-3 text-sm font-bold text-night-950 shadow-lg shadow-gold-400/25 hover:bg-gold-300 dark:shadow-gold-400/10"
      >
        Search again
      </Link>
    </div>
  );
}