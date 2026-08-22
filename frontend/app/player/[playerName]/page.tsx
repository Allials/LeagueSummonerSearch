import type { Metadata } from "next";
import PlayerData from "@/components/PlayerData";
import { PlayerNotFound } from "@/components/PlayerNotFound";
import { getSummonerProfile, getMatchHistory, RiotApiError, friendlyRiotMessage } from "@/lib/riot";

export const dynamic = "force-dynamic";

interface PlayerPageProps {
  params: Promise<{ playerName: string }>;
  searchParams: Promise<{ region?: string }>;
}

function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { playerName } = await params;
  return { title: `${decodeParam(playerName)} - Kit` };
}

export default async function PlayerPage({ params, searchParams }: PlayerPageProps) {
  const { playerName: encodedName } = await params;
  const playerName = decodeParam(encodedName);
  const { region } = await searchParams;

  let profile;
  try {
    profile = await getSummonerProfile(playerName, region);
  } catch (error) {
    if (error instanceof RiotApiError && error.status === 404) {
      return <PlayerNotFound query={playerName} />;
    }
    if (error instanceof RiotApiError) {
      throw new Error(friendlyRiotMessage(error.status), { cause: error });
    }
    throw new Error(friendlyRiotMessage(0), { cause: error });
  }

  // Streamed: the profile renders immediately; match history (1 + 10 Riot
  // calls) fills in via Suspense without blocking first paint.
  // null = the fetch failed (rate limit, network), [] = genuinely no matches.
  const matchesPromise = getMatchHistory(profile.summoner.puuid, profile.meta?.regional).catch(
    (error) => {
      console.error(`Match history failed for ${playerName}:`, error);
      return null;
    }
  );

  return <PlayerData {...profile} matchesPromise={matchesPromise} />;
}