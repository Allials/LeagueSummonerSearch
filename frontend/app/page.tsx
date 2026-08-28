import Image from "next/image";
import logo from "@/components/imgs/logo.png";
import { rankImages, masteryImages } from "@/components/Images";
import { FormInput } from "@/components/FormInput";
import { FeaturedPlayers } from "@/components/FeaturedPlayers";
import { Reveal } from "@/components/Reveal";

const DD_VERSION = "15.4.1";
const DD = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/champion`;

const masteryRow = [
  { name: "Teemo", badge: masteryImages.Mastery7, icon: `${DD}/Teemo.png` },
  { name: "Ahri", badge: masteryImages.Mastery6, icon: `${DD}/Ahri.png` },
  { name: "Ezreal", badge: masteryImages.Mastery5, icon: `${DD}/Ezreal.png` },
];

const matchRow = [
  {
    name: "Teemo",
    kda: "12/3/7",
    win: true,
    meta: "Summoner's Rift · 24m",
    icon: `${DD}/Teemo.png`,
  },
  {
    name: "Ahri",
    kda: "2/9/4",
    win: false,
    meta: "ARAM · 18m",
    icon: `${DD}/Ahri.png`,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center px-4 pt-8 md:pt-12">
      <Image
        src={logo}
        alt="Teemo Logo"
        priority
        className="animate-fade-up mt-2 h-32 w-32 md:h-36 md:w-36"
      />

      <h1
        className="animate-fade-up mt-3 font-display text-6xl leading-none tracking-[-0.02em] text-stone-900 dark:text-gold-300 md:text-8xl"
        style={{ animationDelay: "40ms" }}
      >
        Kit
        <span className="text-gold-500 dark:text-gold-400">.GG</span>
      </h1>

      <p
        className="animate-fade-up mt-5 max-w-lg text-center text-sm leading-relaxed text-stone-600 dark:text-stone-400 md:text-base"
        style={{ animationDelay: "80ms" }}
      >
        Search any League of Legends account for ranked stats,
        champion mastery, and match history.
      </p>

      <div
        className="animate-fade-up relative z-20 flex w-full justify-center"
        style={{ animationDelay: "120ms" }}
      >
        <FormInput />
      </div>

      <FeaturedPlayers />

      <section className="mt-14 w-full max-w-3xl">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="section-label">What you get</h2>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Sample profile
          </p>
        </div>

        <Reveal className="card mt-4 overflow-hidden">
          <div className="flex items-center gap-3.5 border-b border-black/5 px-5 py-4 dark:border-white/5">
            <div className="relative shrink-0">
              <Image
                src={logo}
                alt=""
                className="h-12 w-12 rounded-xl ring-2 ring-gold-400/40"
              />
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold-400 px-2 py-px text-[10px] font-bold text-night-950">
                Level 385
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-2xl leading-none text-stone-900 dark:text-gold-300">
                Pobelter
              </p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                North America · Mid
              </p>
            </div>
            <Image
              src={rankImages.Platinum}
              alt="Platinum rank emblem"
              className="h-12 w-12 shrink-0 md:h-14 md:w-14"
            />
          </div>

          <div className="grid grid-cols-1 divide-y divide-black/5 px-5 dark:divide-white/5 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="py-4 sm:pr-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                Solo / Duo
              </p>
              <p className="mt-2 font-display text-xl leading-none text-stone-900 dark:text-gold-300">
                Platinum II
              </p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                54 LP · 92W 78L
              </p>
              <div className="mt-2.5 max-w-[8rem]">
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="bar-settle h-full rounded-l-full bg-gold-400"
                    style={{ width: "54%" }}
                  />
                  <div className="h-full flex-1 rounded-r-full bg-stone-400/25 dark:bg-stone-500/25" />
                </div>
                <p className="mt-1 text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                  54% win rate
                </p>
              </div>
            </div>

            <div className="py-4 sm:pl-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                Top Mastery
              </p>
              <div className="mt-2.5 flex items-center gap-3">
                {masteryRow.map((champ) => (
                  <div key={champ.name} className="relative">
                    <Image
                      src={champ.icon}
                      alt={champ.name}
                      width={128}
                      height={128}
                      className="h-11 w-11 rounded-lg"
                    />
                    <Image
                      src={champ.badge}
                      alt=""
                      className="absolute -bottom-1.5 -left-1.5 h-6 w-6 drop-shadow"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-black/5 border-t border-black/5 dark:divide-white/5 dark:border-white/5">
            {matchRow.map((match) => (
              <div key={match.name} className="flex items-center gap-3 px-5 py-2.5">
                <span
                  aria-hidden
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    match.win ? "bg-teal-500" : "bg-red-500"
                  }`}
                />
                <Image
                  src={match.icon}
                  alt=""
                  width={128}
                  height={128}
                  className="h-8 w-8 shrink-0 rounded-md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {match.name}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {match.meta}
                  </p>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {match.kda}
                </p>
                <p
                  className={`w-14 text-right text-xs font-bold ${
                    match.win
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {match.win ? "Victory" : "Defeat"}
                </p>
              </div>
             ))}
          </div>
        </Reveal>

        <p className="mt-3 text-center text-xs text-stone-500 dark:text-stone-400">
          Search your summoner name above to view your profile.
        </p>
      </section>
    </div>
  );
}