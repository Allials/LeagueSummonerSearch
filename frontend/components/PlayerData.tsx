import { Suspense } from "react";
import Image from "next/image";
import { IoAlertCircle } from "react-icons/io5";
import { rankImages } from "./Images";
import { championMeta, championIconUrl, profileIconUrl, getVersion } from "@/lib/ddragon";
import { DEFAULT_REGION, REGIONS, regionKeyForPlatform } from "@/lib/regions";
import { shortDate } from "@/lib/format";
import { MatchRow } from "./MatchRow";
import type { Summoner, ChampionMastery, LeagueEntry, MatchSummary } from "@/lib/types";

interface PlayerDataProps {
  summoner: Summoner;
  mastery: ChampionMastery[];
  league: LeagueEntry[];
  matchesPromise: Promise<MatchSummary[] | null>;
  meta?: { platform: string; regional: string; gameName?: string; tagLine?: string };
}

const masteryPoints = (points: number): string => {
  if (!Number.isFinite(points) || points <= 0) return "No Data";
  if (points >= 1_000_000) return `${(points / 1_000_000).toFixed(1)}M`;
  return points.toLocaleString("en-US");
};

function MasteryBadge({ level }: { level: number }) {
  return (
    <span className="absolute -bottom-2 -left-2 z-10 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-gold-400 px-2 text-[11px] font-bold leading-none text-night-950 shadow-md ring-2 ring-[#F5F2EC] dark:ring-night-950">
      {level}
    </span>
  );
}

function WinRateBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  const pct = total > 0 ? Math.round((wins / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div
          className="h-full rounded-l-full bg-gold-400 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
        <div className="h-full flex-1 rounded-r-full bg-stone-400/25 dark:bg-stone-500/25" />
      </div>
      <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
        {pct}% win rate · {wins}W {losses}L
      </p>
    </div>
  );
}

function RankedCard({ title, entry }: { title: string; entry: LeagueEntry | null }) {
  const src = entry ? rankImages[entry.tier] : rankImages.Unranked;
  return (
    <div className="card animate-fade-up flex flex-col items-center px-6 py-8 text-center">
      <h3 className="section-label">{title}</h3>
      <Image
        src={src ?? rankImages.Unranked}
        alt={`${entry?.tier ?? "Unranked"} rank emblem`}
        className="mt-5 w-24 md:w-28"
      />
      {entry ? (
        <>
          <p className="mt-3 font-display text-2xl leading-none text-stone-900 dark:text-gold-300 md:text-3xl">
            {entry.tier} {entry.rank}
          </p>
          <p className="mt-1 text-sm font-semibold text-stone-500 dark:text-stone-400">
            {entry.leaguePoints} LP
          </p>
          <div className="mt-5 w-full">
            <WinRateBar wins={entry.wins} losses={entry.losses} />
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
          Unranked this season
        </p>
      )}
    </div>
  );
}

function MatchesSkeleton() {
  return (
    <div className="card mt-4 divide-y divide-black/5 dark:divide-white/5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        // oxlint-disable-next-line react/no-array-index-key
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <span className="h-2.5 w-2.5 rounded-full bg-black/10 dark:bg-white/10" />
          <span className="h-10 w-10 animate-pulse rounded-lg bg-black/10 dark:bg-white/10" />
          <span className="min-w-0 flex-1 space-y-1.5">
            <span className="block h-3 w-24 rounded bg-black/10 dark:bg-white/10" />
            <span className="block h-2.5 w-32 rounded bg-black/5 dark:bg-white/5" />
          </span>
          <span className="h-3 w-20 rounded bg-black/5 dark:bg-white/5" />
        </div>
      ))}
    </div>
  );
}

async function MatchesList({
  matchesPromise,
  selfPuuid,
  regionKey,
}: {
  matchesPromise: Promise<MatchSummary[] | null>;
  selfPuuid: string;
  regionKey: ReturnType<typeof regionKeyForPlatform>;
}) {
  const [matches, ddVersion] = await Promise.all([matchesPromise, getVersion()]);

  if (matches === null) {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
        <IoAlertCircle className="shrink-0 text-base text-gold-500 dark:text-gold-400" />
        <span>
          Couldn&apos;t load match history — Riot may be rate-limited. Try again in a minute.
        </span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
        No recent matches for this account yet.
      </p>
    );
  }

  const participantIds = [
    ...new Set(matches.flatMap((match) => match.participants.map((p) => p.championId))),
  ];
  const champIcons: Record<number, string> = {};
  await Promise.all(
    participantIds.map(async (id) => {
      const championMetaData = await championMeta(id);
      champIcons[id] = await championIconUrl(championMetaData.key);
    })
  );

  return (
    <div className="card animate-fade-up mt-4 overflow-hidden">
      {matches.map((match) => (
        <MatchRow
          key={match.id}
          match={match}
          ddVersion={ddVersion}
          champIcons={champIcons}
          selfPuuid={selfPuuid}
          regionKey={regionKey ?? DEFAULT_REGION}
        />
      ))}
    </div>
  );
}

export default async function PlayerData({ summoner, mastery, league, matchesPromise, meta }: PlayerDataProps) {
  const solo = league.find((q) => q.queueType === "RANKED_SOLO_5x5") ?? null;
  const flex = league.find((q) => q.queueType === "RANKED_FLEX_SR") ?? null;
  const iconUrl = await profileIconUrl(summoner.profileIconId);

  const champions = await Promise.all(
    mastery.map(async (champ) => {
      const championMetaData = await championMeta(champ.championId);
      return { champ, meta: championMetaData, iconUrl: await championIconUrl(championMetaData.key) };
    })
  );

  const regionLabel =
    Object.values(REGIONS).find((r) => r.platform === meta?.platform)?.label ?? "North America";
  const regionKey = regionKeyForPlatform(meta?.platform ?? "") ?? DEFAULT_REGION;
  const displayName = meta?.gameName || summoner.name || "Unknown Summoner";
  const displayTag = meta?.tagLine;

  return (
    <div>
      <section className="animate-fade-up flex flex-wrap items-center gap-5 md:gap-7">
        <div className="relative shrink-0">
          <Image
            src={iconUrl}
            alt="Profile Icon"
            width={120}
            height={120}
            priority
            className="h-24 w-24 rounded-2xl ring-2 ring-gold-400/40 md:h-32 md:w-32"
          />
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold-400 px-3 py-0.5 text-xs font-bold text-night-950 shadow-md dark:shadow-black/30">
            Level {summoner.summonerLevel}
          </span>
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-4xl leading-none text-stone-900 dark:text-gold-300 md:text-6xl">
            {displayName}
            {displayTag && (
              <span className="ml-3 align-middle text-base font-semibold tracking-wide text-gold-600 dark:text-gold-400 md:text-xl">
                #{displayTag}
              </span>
            )}
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {regionLabel} · Updated {shortDate(summoner.revisionDate)}
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="section-label">Ranked</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <RankedCard title="Solo / Duo" entry={solo} />
          <RankedCard title="Flex" entry={flex} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="section-label">Top Mastery</h2>
        {champions.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {champions.map(({ champ, meta: champMeta, iconUrl: icon }, i) => (
              <div
                key={champ.championId}
                className="card animate-fade-up p-4 text-center"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="relative mx-auto w-fit">
                  <MasteryBadge level={champ.championLevel} />
                  <Image
                    src={icon}
                    alt={champMeta.name}
                    width={128}
                    height={128}
                    className="h-20 w-20 rounded-xl md:h-24 md:w-24"
                  />
                </div>
                <h3 className="mt-3 truncate text-sm font-bold text-stone-900 dark:text-gold-300">
                  {champMeta.name}
                </h3>
                <p className="mt-0.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
                  {masteryPoints(champ.championPoints)}
                </p>
                <p className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">
                  {champ.nextSeasonMilestone
                    ? `${Object.entries(champ.nextSeasonMilestone.requireGradeCounts)
                        .map(([grade, count]) => `${count} ${grade}`)
                        .join(", ")} from season mark`
                    : `Last played ${shortDate(champ.lastPlayTime)}`}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
            No mastery data for this account.
          </p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="section-label">Recent Matches</h2>
        <Suspense fallback={<MatchesSkeleton />}>
          <MatchesList
            matchesPromise={matchesPromise}
            selfPuuid={summoner.puuid}
            regionKey={regionKey}
          />
        </Suspense>
      </section>
    </div>
  );
}