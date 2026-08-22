"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IoCheckmark, IoChevronDown } from "react-icons/io5";
import { REGIONS, type RegionKey } from "@/lib/regions";

interface RegionSelectProps {
  value: RegionKey;
  onChange: (region: RegionKey) => void;
  size?: "md" | "sm";
}

export const RegionSelect = ({ value, onChange, size = "md" }: RegionSelectProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const isMd = size === "md";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const focusOption = (dir: 1 | -1) => {
    const options = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []
    );
    const currentIndex = options.indexOf(document.activeElement as HTMLElement);
    const next = options[(currentIndex + dir + options.length) % options.length];
    next?.focus();
  };

  const openMenu = () => {
    setOpen(true);
    requestAnimationFrame(() => {
      const options = Array.from(
        listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []
      );
      (options.find((el) => el.getAttribute("aria-selected") === "true") ?? options[0])?.focus();
    });
  };

  const closeMenu = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const select = (region: RegionKey) => {
    onChange(region);
    closeMenu();
  };

  return (
    <div ref={rootRef} className="relative">
      <label className="sr-only" htmlFor={`${listId}-native`}>
        Region
      </label>
      <select
        id={`${listId}-native`}
        value={value}
        onChange={(e) => onChange(e.target.value as RegionKey)}
        className={`w-full rounded-xl border border-black/10 bg-white/80 font-semibold shadow-sm outline-none transition-colors duration-200 hover:border-gold-400 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40 dark:border-white/10 dark:bg-white/5 dark:text-gold-300 dark:hover:border-gold-400 dark:focus:border-gold-400 dark:focus:ring-gold-400/30 sm:hidden ${
          isMd
            ? "px-3 py-3 text-sm text-stone-700"
            : "px-2.5 py-1.5 text-xs text-stone-600"
        }`}
      >
        {Object.entries(REGIONS).map(([key]) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>

      <button
        type="button"
        ref={triggerRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(e) => {
          if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
            e.preventDefault();
            openMenu();
          }
        }}
        className={`btn-press hidden items-center justify-between gap-2 rounded-xl border border-black/10 bg-white/80 shadow-sm hover:border-gold-400 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-gold-400 dark:focus:border-gold-400 dark:focus:ring-gold-400/30 sm:flex ${
          isMd
            ? "w-24 px-3 py-3 text-sm font-semibold text-stone-700 dark:text-gold-300"
            : "w-20 px-2.5 py-1.5 text-xs font-semibold text-stone-600 dark:text-gold-300"
        }`}
      >
        <span>{value}</span>
        <IoChevronDown
          className={`text-sm text-stone-400 transition-transform duration-200 ease-out dark:text-stone-500 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-60 origin-top-left animate-panel-in rounded-xl bg-white/95 p-1.5 shadow-xl shadow-black/10 ring-1 ring-black/10 backdrop-blur-md dark:bg-night-900/95 dark:ring-white/10">
          <p className="section-label px-2 pb-1 pt-1.5">Region</p>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Region"
            className="region-scroll max-h-72 overflow-y-auto"
          >
            {Object.entries(REGIONS).map(([key, config]) => {
              const selected = key === value;
              return (
                <li
                  key={key}
                  role="option"
                  aria-selected={selected}
                  tabIndex={-1}
                  onClick={() => select(key as RegionKey)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      focusOption(1);
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      focusOption(-1);
                    }
                    if (e.key === "Home") {
                      e.preventDefault();
                      (listRef.current?.firstElementChild as HTMLElement | null)?.focus();
                    }
                    if (e.key === "End") {
                      e.preventDefault();
                      (listRef.current?.lastElementChild as HTMLElement | null)?.focus();
                    }
                  }}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 hover:bg-gold-400/10 focus-visible:bg-gold-400/10 dark:hover:bg-gold-400/10 dark:focus-visible:bg-gold-400/10 ${
                    selected ? "bg-gold-400/15 dark:bg-gold-400/10" : ""
                  }`}
                >
                  <span className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${
                        selected
                          ? "text-gold-700 dark:text-gold-300"
                          : "text-stone-700 dark:text-stone-200"
                      }`}
                    >
                      {key}
                    </span>
                    <span className="text-xs text-stone-400 dark:text-stone-500">
                      {config.label}
                    </span>
                  </span>
                  {selected && <IoCheckmark className="shrink-0 text-gold-500" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};