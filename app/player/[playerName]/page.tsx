import type { Metadata } from "next";
import PlayerData from "@/components/PlayerData";
import { PlayerNotFound } from "@/components/PlayerNotFound";
import { getSummonerProfile, getMatchHistory, RiotApiError, friendlyRiotMessage } from "@/lib/riot";
import type { MatchSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PlayerPageProps {
  params: Promise<{ playerName: string }>;
  searchParams: Promise<{ region?: string }>;
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { playerName } = await params;
  return { title: `${playerName} - Summoner Stats` };
}

export default async function PlayerPage({ params, searchParams }: PlayerPageProps) {
  const { playerName } = await params;
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

  let matches: MatchSummary[] = [];
  try {
    matches = await getMatchHistory(profile.summoner.puuid, profile.meta?.regional);
  } catch (error) {
    console.error(`Match history failed for ${playerName}:`, error);
  }

  return <PlayerData {...profile} matches={matches} />;
}