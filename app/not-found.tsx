import Link from "next/link";

export default function NotFound() {
  return (
    <div className="animate-fade-up flex flex-col items-center px-4 pt-14 text-center">
      <h1 className="font-display text-5xl leading-none text-stone-900 dark:text-gold-300 md:text-7xl">
        Summoner not found
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-500 dark:text-stone-400">
        That page doesn&apos;t exist. Head back home and search for a summoner.
      </p>
      <Link
        href="/"
        className="btn-press mt-8 rounded-xl bg-gold-400 px-8 py-3 text-sm font-bold text-night-950 shadow-lg shadow-gold-400/25 hover:bg-gold-300 dark:shadow-gold-400/10"
      >
        Search again
      </Link>
    </div>
  );
}