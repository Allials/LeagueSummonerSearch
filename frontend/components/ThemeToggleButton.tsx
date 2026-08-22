"use client";

import { useState, useSyncExternalStore } from "react";
import { IoSunny, IoMoon } from "react-icons/io5";
import { resolveInitialTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

const themes: Theme[] = ["light", "dark"];

const emptySubscribe = () => () => undefined;

export const ThemeToggleButton = () => {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [theme, setTheme] = useState<Theme>(() => resolveInitialTheme());

  const applyTheme = (t: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, t);
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  return isMounted ? (
    <div
      className="relative flex items-center rounded-full bg-black/5 p-1 ring-1 ring-black/10 dark:bg-white/10 dark:ring-white/15"
      role="group"
      aria-label="Theme"
    >
      <span
        aria-hidden
        className={`absolute bottom-1 left-1 top-1 w-8 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ease-out dark:bg-night-700 dark:ring-white/10 ${
          theme === "dark" ? "translate-x-8" : "translate-x-0"
        }`}
      />
      {themes.map((t) => {
        const checked = t === theme;
        return (
          <button
            key={t}
            type="button"
            aria-pressed={checked}
            aria-label={`Switch to ${t} mode`}
            onClick={() => applyTheme(t)}
            className={`btn-press relative z-10 grid h-8 w-8 place-items-center rounded-full ${
              checked
                ? "text-amber-500 dark:text-gold-300"
                : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
            }`}
          >
            {t === "light" ? <IoSunny /> : <IoMoon />}
          </button>
        );
      })}
    </div>
  ) : null;
};