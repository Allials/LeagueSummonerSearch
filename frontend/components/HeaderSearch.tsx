"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoSearch } from "react-icons/io5";
import { DEFAULT_REGION, REGIONS, type RegionKey } from "@/lib/regions";
import { RegionSelect } from "./RegionSelect";

export const HeaderSearch = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [region, setRegion] = useState<RegionKey>(DEFAULT_REGION);
  const [query, setQuery] = useState("");

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
    const raw = inputRef.current?.value.trim();
    if (raw) {
      const name = raw.includes("#") ? raw : `${raw}#${REGIONS[region].tag}`;
      const qs = region === DEFAULT_REGION ? "" : `?region=${region}`;
      router.push(`/player/${encodeURIComponent(name)}${qs}`);
    }
  };

  const showTag = query.length > 0 && !query.includes("#");

  return (
    <form onSubmit={handleSubmit} role="search" className="hidden items-center gap-2 sm:flex">
      <RegionSelect value={region} onChange={setRegion} size="sm" />
      <div className="relative">
        <IoSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400 dark:text-stone-500" />
        <input
          ref={inputRef}
          name="q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search…#${REGIONS[region].tag}`}
          aria-label="Search summoner"
          className="w-44 rounded-lg border border-black/10 bg-white/70 py-1.5 pl-8 pr-12 text-sm outline-none transition-[border-color,box-shadow,background-color] duration-180 ease-out placeholder:text-stone-400 focus:border-gold-400 focus:bg-white focus:ring-2 focus:ring-gold-400/40 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-stone-500 dark:focus:border-gold-400 dark:focus:bg-white/10 dark:focus:ring-gold-400/30 lg:w-52"
        />
        {showTag && (
          <span
            aria-hidden
            className="ghost-tag pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400 dark:text-stone-500"
          >
            #{REGIONS[region].tag}
          </span>
        )}
      </div>
    </form>
  );
};