"use client";

import { useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoSearch } from "react-icons/io5";
import { DEFAULT_REGION, REGIONS, type RegionKey } from "@/lib/regions";
import { RegionSelect } from "./RegionSelect";

const RECENT_KEY = "recentSearches";
const RECENT_LIMIT = 5;
const emptySubscribe = () => () => undefined;

const loadRecent = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((n): n is string => typeof n === "string").slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
};

export const FormInput = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [region, setRegion] = useState<RegionKey>(DEFAULT_REGION);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = (summonerName: string) => {
    const raw = summonerName.trim();
    if (!raw) return;
    const name = raw.includes("#") ? raw : `${raw}#${REGIONS[region].tag}`;
    touchRecent(name);
    const qs = region === DEFAULT_REGION ? "" : `?region=${region}`;
    startTransition(() => router.push(`/player/${encodeURIComponent(name)}${qs}`));
  };

  // Reorder + persist without navigating (used when a prefetched chip is opened).
  const touchRecent = (name: string) => {
    const next = [name, ...recent.filter((n) => n !== name)].slice(0, RECENT_LIMIT);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(inputRef.current?.value ?? "");
  };

  const showTag = query.length > 0 && !query.includes("#");

  return (
    <div className="mt-10 w-full max-w-xl px-0">
      <form onSubmit={handleSubmit} role="search">
        <div className="flex flex-col gap-3 sm:flex-row">
          <RegionSelect value={region} onChange={setRegion} size="md" />
          <div className="relative flex-1 rounded-xl">
            <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-stone-400 dark:text-stone-500" />
            <input
              ref={inputRef}
              name="q"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Summoner name#${REGIONS[region].tag}`}
              aria-label="Summoner name"
              autoComplete="off"
              className="w-full rounded-xl border border-black/10 bg-white/80 py-3 pl-11 pr-16 text-sm text-stone-900 shadow-sm outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-stone-400 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40 dark:border-white/10 dark:bg-white/5 dark:text-gold-300 dark:placeholder:text-stone-500 dark:focus:border-gold-400 dark:focus:ring-gold-400/30 md:text-base"
            />
            {showTag && (
              <span
                aria-hidden
                className="ghost-tag pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-stone-400 dark:text-stone-500 md:text-base"
              >
                #{REGIONS[region].tag}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="btn-press flex min-w-[7.5rem] items-center justify-center rounded-xl bg-gold-400 px-7 py-3 text-sm font-bold text-night-950 shadow-lg shadow-gold-400/25 hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-gold-400/10 md:text-base"
          >
            {isPending ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      <div className="mt-4 flex min-h-6 flex-wrap items-center justify-center gap-2">
        {isMounted ? (
          recent.length === 0 ? (
            <Link
              href="/player/Doublelift%23NA1"
              prefetch
              className="btn-press rounded-full bg-black/5 px-3 py-1 text-xs text-stone-500 hover:bg-gold-400/20 hover:text-stone-700 dark:bg-white/5 dark:text-stone-400 dark:hover:bg-gold-400/10 dark:hover:text-gold-300"
            >
              Try: Doublelift
            </Link>
          ) : (
            <>
              {recent.map((name) => (
                <Link
                  key={name}
                  href={`/player/${encodeURIComponent(name)}`}
                  prefetch
                  onClick={() => touchRecent(name)}
                  className="btn-press rounded-full bg-black/5 px-3 py-1 text-xs text-stone-500 hover:bg-gold-400/20 hover:text-stone-700 dark:bg-white/5 dark:text-stone-400 dark:hover:bg-gold-400/10 dark:hover:text-gold-300"
                >
                  {name}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setRecent([]);
                  localStorage.removeItem(RECENT_KEY);
                }}
                className="btn-press px-2 py-1 text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              >
                Clear
              </button>
            </>
          )
        ) : null}
      </div>

      <p className="mt-4 text-center text-xs leading-relaxed text-stone-500 dark:text-stone-400">
        Tip: paste the full Riot ID like <span className="font-semibold text-stone-700 dark:text-gold-300">Name#TAG</span>.
        Custom tags work too. Pick your server with the region menu, or search across all regions.
      </p>
    </div>
  );
};