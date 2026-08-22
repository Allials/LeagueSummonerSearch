"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoChevronDown, IoStar } from "react-icons/io5";
import type { MatchSummary, MatchParticipant } from "@/lib/types";
import { shortDate, formatDuration, gameModeName, goldK } from "@/lib/format";

const DD_BASE = "https://ddragon.leagueoflegends.com";

interface MatchRowProps {
  match: MatchSummary;
  ddVersion: string;
  champIcons: Record<number, string>;
  selfPuuid: string;
}

type TabKey = "players" | "items" | "gold";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "players", label: "Players" },
  { key: "items", label: "Items" },
  { key: "gold", label: "Gold" },
];

const TAB_WIDTH = 80;

const mvpScore = (p: MatchParticipant) => p.kills * 3 + p.assists - p.deaths;

const itemUrl = (ddVersion: string, itemId: number) =>
  `${DD_BASE}/cdn/${ddVersion}/img/item/${itemId}.png`;

const playerHref = (p: MatchParticipant): string | null =>
  p.riotIdGameName
    ? `/player/${encodeURIComponent(`${p.riotIdGameName}#${p.riotIdTagLine}`)}`
    : null;

const playerLabel = (p: MatchParticipant): string =>
  p.riotIdGameName ? `${p.riotIdGameName}#${p.riotIdTagLine}` : p.championName;

function ChampIcon({ src, alt, className }: { src: string; alt: string; className: string }) {
  if (!src) return <span className={`shrink-0 rounded-md bg-black/10 dark:bg-white/10 ${className}`} aria-hidden />;
  return (
    <Image src={src} alt={alt} width={128} height={128} className={`shrink-0 rounded-md ${className}`} />
  );
}

function ParticipantRow({
  p,
  champIcon,
  isMvp,
  isSelf,
  children,
}: {
  p: MatchParticipant;
  champIcon: string;
  isMvp: boolean;
  isSelf: boolean;
  children?: React.ReactNode;
}) {
  const href = playerHref(p);
  const body = (
    <>
      <ChampIcon src={champIcon} alt={p.championName} className="h-8 w-8" />
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="truncate text-xs font-bold text-stone-900 dark:text-gold-300">
          {playerLabel(p)}
        </span>
        {isSelf && (
          <span className="shrink-0 rounded-full bg-gold-400/20 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            You
          </span>
        )}
        {isMvp && (
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-gold-400 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-night-950">
            <IoStar className="h-2.5 w-2.5" />
            MVP
          </span>
        )}
      </span>
      {children}
    </>
  );
  const cls = "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150";
  if (href) {
    return (
      <Link href={href} className={`${cls} hover:bg-black/5 dark:hover:bg-white/5`}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}

export const MatchRow = ({ match, ddVersion, champIcons, selfPuuid }: MatchRowProps) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("players");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const blue = useMemo(() => match.participants.filter((p) => p.teamId === 100), [match]);
  const red = useMemo(() => match.participants.filter((p) => p.teamId === 200), [match]);
  const blueGold = blue.reduce((sum, p) => sum + p.goldEarned, 0);
  const redGold = red.reduce((sum, p) => sum + p.goldEarned, 0);
  const totalGold = blueGold + redGold;
  const blueShare = totalGold > 0 ? Math.round((blueGold / totalGold) * 100) : 50;
  const winnerGold = match.winningTeamId === 100 ? blueGold : redGold;
  const loserGold = match.winningTeamId === 100 ? redGold : blueGold;
  const mvp = useMemo(
    () =>
      [...match.participants]
        .filter((p) => p.teamId === match.winningTeamId)
        .sort((a, b) => mvpScore(b) - mvpScore(a) || b.kills - a.kills)[0],
    [match]
  );
  const sortedByGold = useMemo(
    () => [...match.participants].sort((a, b) => b.goldEarned - a.goldEarned),
    [match]
  );
  const maxGold = sortedByGold[0]?.goldEarned || 1;
  const tabIndex = TABS.findIndex((t) => t.key === tab);
  const rowIcon = champIcons[match.championId];

  return (
    <div className="border-b border-black/5 last:border-b-0 dark:border-white/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`match-${match.id}`}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] md:gap-4"
      >
        <span
          aria-hidden
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            match.win ? "bg-teal-500" : "bg-red-500"
          }`}
        />
        <ChampIcon src={rowIcon} alt={match.championName} className="h-10 w-10" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-stone-900 dark:text-gold-300">
            {match.championName}
          </span>
          <span className="block text-xs text-stone-500 dark:text-stone-400">
            {gameModeName(match.gameMode)} · {formatDuration(match.gameDurationSec)}
          </span>
        </span>
        <span className="text-right">
          <span
            className={`block text-sm font-bold ${
              match.win ? "text-teal-600 dark:text-teal-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {match.win ? "Victory" : "Defeat"}
          </span>
          <span className="block text-xs tabular-nums text-stone-500 dark:text-stone-400">
            {match.kills}/{match.deaths}/{match.assists} · {shortDate(match.gameEndTimestamp)}
          </span>
        </span>
        <IoChevronDown
          aria-hidden
          className={`shrink-0 text-stone-400 transition-transform duration-200 ease-out dark:text-stone-500 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div id={`match-${match.id}`} className="match-panel" data-open={open} inert={!open}>
        <div className="match-panel-inner">
          <div className="border-t border-black/5 px-5 py-3 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs font-semibold tabular-nums text-sky-700 dark:text-sky-400">
                Blue {goldK(blueGold)}
              </span>
              <div
                className="flex h-2 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"
                aria-hidden
              >
                <div
                  className="h-full rounded-l-full bg-sky-500/80"
                  style={{ width: `${blueShare}%` }}
                />
                <div className="h-full flex-1 rounded-r-full bg-red-500/80" />
              </div>
              <span className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-red-600 dark:text-red-400">
                {goldK(redGold)} Red
              </span>
            </div>
            <p className="mt-2 text-center text-[11px] text-stone-500 dark:text-stone-400">
              {match.winningTeamId === 100 ? "Blue" : "Red"} side leads by{" "}
              <span className="font-semibold tabular-nums">{goldK(winnerGold - loserGold)}</span>{" "}
              gold
            </p>
          </div>

          <div className="flex justify-center border-t border-black/5 px-5 py-3 dark:border-white/5">
            <div
              role="tablist"
              aria-label="Match details"
              className="relative inline-flex rounded-full bg-black/5 p-1 dark:bg-white/10"
            >
              <span
                aria-hidden
                className="absolute bottom-1 left-1 top-1 w-20 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ease-out dark:bg-night-700 dark:ring-white/10"
                style={{ transform: `translateX(${tabIndex * TAB_WIDTH}px)` }}
              />
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative z-10 w-20 rounded-full py-1.5 text-xs font-semibold transition-colors duration-150 ${
                    tab === t.key
                      ? "text-stone-900 dark:text-gold-300"
                      : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === "players" && (
            <div className="grid gap-4 px-5 pb-4 pt-3 sm:grid-cols-2">
              {[
                { team: blue, title: "Blue Side", gold: blueGold, won: match.winningTeamId === 100 },
                { team: red, title: "Red Side", gold: redGold, won: match.winningTeamId === 200 },
              ].map(({ team, title, gold, won }) => (
                <div key={title}>
                  <p className="flex items-baseline justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500">
                    <span>
                      {title}
                      {won && (
                        <span className="ml-1.5 text-teal-600 dark:text-teal-400">Win</span>
                      )}
                    </span>
                    <span className="tabular-nums">{goldK(gold)} gold</span>
                  </p>
                  <div className="mt-1.5 space-y-0.5">
                    {team.map((p) => (
                      <ParticipantRow
                        key={p.puuid}
                        p={p}
                        champIcon={champIcons[p.championId]}
                        isMvp={mvp?.puuid === p.puuid}
                        isSelf={p.puuid === selfPuuid}
                      >
                        <span className="shrink-0 text-right">
                          <span className="block text-xs font-semibold tabular-nums text-stone-700 dark:text-stone-200">
                            {p.kills}/{p.deaths}/{p.assists}
                          </span>
                          <span className="block text-[11px] tabular-nums text-stone-400 dark:text-stone-500">
                            {p.cs} CS · {goldK(p.goldEarned)}
                          </span>
                        </span>
                      </ParticipantRow>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "items" && (
            <div className="space-y-1.5 px-5 pb-4 pt-3">
              {[...blue, ...red].map((p) => (
                <div key={p.puuid} className="flex items-center gap-2.5">
                  <ChampIcon src={champIcons[p.championId]} alt={p.championName} className="h-7 w-7" />
                  <span className="w-24 shrink-0 truncate text-xs font-semibold text-stone-700 dark:text-stone-200">
                    {playerLabel(p)}
                  </span>
                  <span className="flex flex-1 gap-1" aria-label={`${playerLabel(p)} items`}>
                    {p.items.map((itemId, i) =>
                      itemId > 0 ? (
                        <Image
                          key={`${itemId}-${i}`}
                          src={itemUrl(ddVersion, itemId)}
                          alt=""
                          width={64}
                          height={64}
                          className="h-7 w-7 rounded-md border border-black/10 dark:border-white/10"
                        />
                      ) : (
                        // oxlint-disable-next-line react/no-array-index-key
                        <span
                          key={`empty-${i}`}
                          aria-hidden
                          className="h-7 w-7 rounded-md border border-dashed border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]"
                        />
                      )
                    )}
                  </span>
                  <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-stone-500 dark:text-stone-400">
                    {p.kills}/{p.deaths}/{p.assists}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === "gold" && (
            <div className="space-y-1.5 px-5 pb-4 pt-3">
              {sortedByGold.map((p) => {
                const pct = Math.max(4, Math.round((p.goldEarned / maxGold) * 100));
                const teamColor = p.teamId === 100 ? "bg-sky-500/80" : "bg-red-500/80";
                return (
                  <div key={p.puuid} className="flex items-center gap-2.5">
                    <ChampIcon src={champIcons[p.championId]} alt={p.championName} className="h-7 w-7" />
                    <span className="w-24 shrink-0 truncate text-xs font-semibold text-stone-700 dark:text-stone-200">
                      {playerLabel(p)}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10" aria-hidden>
                      <div
                        className={`h-full rounded-full ${teamColor} transition-[width] duration-300 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-stone-500 dark:text-stone-400">
                      {goldK(p.goldEarned)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};