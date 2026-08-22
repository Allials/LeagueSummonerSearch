"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoSearch } from "react-icons/io5";
import { DEFAULT_REGION, REGIONS, type RegionKey } from "@/lib/regions";

export const HeaderSearch = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [region, setRegion] = useState<RegionKey>(DEFAULT_REGION);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const summonerName = inputRef.current?.value.trim();
    if (summonerName) {
      const query = region === DEFAULT_REGION ? "" : `?region=${region}`;
      router.push(`/player/${encodeURIComponent(summonerName)}${query}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="hidden items-center gap-2 sm:flex">
      <div className="relative">
        <IoSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400 dark:text-stone-500" />
        <input
          ref={inputRef}
          name="q"
          type="search"
          placeholder={`Search…#${REGIONS[region].tag}`}
          aria-label="Search summoner"
          className="w-36 rounded-lg border border-black/10 bg-white/70 py-1.5 pl-8 pr-3 text-sm outline-none transition-all duration-200 placeholder:text-stone-400 focus:w-48 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-stone-500 dark:focus:border-gold-400 dark:focus:ring-gold-400/30 lg:w-44 lg:focus:w-56"
        />
      </div>
      <label className="sr-only" htmlFor="header-region-select">
        Region
      </label>
      <select
        id="header-region-select"
        value={region}
        onChange={(e) => setRegion(e.target.value as RegionKey)}
        aria-label="Region"
        className="w-20 rounded-lg border border-black/10 bg-white/70 px-1.5 py-1.5 text-xs font-semibold text-stone-600 outline-none transition-all duration-200 hover:border-gold-400 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40 dark:border-white/10 dark:bg-white/5 dark:text-gold-300 dark:hover:border-gold-400 dark:focus:border-gold-400 dark:focus:ring-gold-400/30"
      >
        {Object.entries(REGIONS).map(([key, config]) => (
          <option key={key} value={key} title={config.label}>
            {key}
          </option>
        ))}
      </select>
    </form>
  );
};