import Link from "next/link";
import { IoArrowForward } from "react-icons/io5";

const players = [
  { name: "Doublelift", tag: "ADC" },
  { name: "Fudge", tag: "Top" },
  { name: "Pobelter", tag: "Mid" },
  { name: "Blaber", tag: "Jungle" },
  { name: "Licorice", tag: "Top" },
  { name: "Tyler1", tag: "Streamer" },
];

export const FeaturedPlayers = () => {
  return (
    <section className="mt-14 w-full max-w-3xl">
      <h2 className="section-label text-center">Popular NA Players</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {players.map((player, i) => (
          <Link
            key={player.name}
            href={`/player/${encodeURIComponent(player.name)}`}
            className="card btn-press animate-fade-up group flex items-center justify-between px-5 py-4 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 hover:ring-gold-400/40 dark:hover:shadow-black/20"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-stone-900 group-hover:text-gold-600 dark:text-gold-300 dark:group-hover:text-gold-400">
                {player.name}
              </p>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                {player.tag} · NA
              </p>
            </div>
            <IoArrowForward className="shrink-0 text-stone-300 transition-colors duration-200 group-hover:text-gold-400 dark:text-stone-600" />
          </Link>
        ))}
      </div>
    </section>
  );
};