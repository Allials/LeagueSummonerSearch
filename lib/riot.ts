import axios from "axios";
import type {
  Summoner,
  SummonerProfile,
  ChampionMastery,
  LeagueEntry,
  MatchSummary,
} from "./types";
import { resolveRiotId } from "./regions";

const API_KEY = process.env.RIOT_API_KEY?.trim();
const CACHE_TTL_MS = 60_000;

const authHeaders = { "X-Riot-Token": API_KEY ?? "" };

interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export function friendlyRiotMessage(status: number): string {
  switch (status) {
    case 429:
      return "Riot's servers are busy right now. Wait a minute and try again.";
    case 401:
    case 403:
      return "The Riot API key is invalid or expired.";
    case 0:
      return "The server isn't configured to fetch Riot data yet.";
    default:
      return "Riot couldn't answer for this summoner. Try again in a moment.";
  }
}

export class RiotApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "RiotApiError";
    this.status = status;
  }
}

const profileCache = new Map<string, { data: SummonerProfile; expiresAt: number }>();

function toRiotError(err: unknown): RiotApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const message =
      status === 429
        ? "Riot API rate limit reached. Try again in a moment."
        : status === 401 || status === 403
          ? "The Riot API key is invalid or expired."
          : err.message;
    return new RiotApiError(status, message);
  }
  return new RiotApiError(0, err instanceof Error ? err.message : "Unknown Riot API error");
}

export async function getSummonerProfile(riotId: string, region?: string): Promise<SummonerProfile> {
  if (!API_KEY) {
    throw new RiotApiError(0, "RIOT_API_KEY is not configured on the server.");
  }

  const { gameName, tagLine, platform, regional } = resolveRiotId(riotId, region);
  const cacheKey = `${gameName}#${tagLine}`;
  const platformBase = `https://${platform}.api.riotgames.com`;
  const regionalBase = `https://${regional}.api.riotgames.com`;

  const cached = profileCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const { data: account } = await axios.get<RiotAccount>(
      `${regionalBase}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: authHeaders }
    );

    const { data: summoner } = await axios.get<Summoner>(
      `${platformBase}/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
      { headers: authHeaders }
    );

    const [masteryRes, leagueRes] = await Promise.all([
      axios.get<ChampionMastery[]>(
        `${platformBase}/lol/champion-mastery/v4/champion-masteries/by-puuid/${account.puuid}/top?count=6`,
        { headers: authHeaders }
      ),
      axios.get<LeagueEntry[]>(
        `${platformBase}/lol/league/v4/entries/by-puuid/${account.puuid}`,
        { headers: authHeaders }
      ),
    ]);

    const data: SummonerProfile = {
      summoner,
      mastery: masteryRes.data,
      league: leagueRes.data,
    };

    profileCache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return data;
  } catch (err) {
    throw toRiotError(err);
  }
}

interface RiotMatch {
  info: {
    gameMode: string;
    gameDuration: number;
    gameEndTimestamp: number;
    participants: Array<{
      puuid: string;
      championId: number;
      championName: string;
      win: boolean;
      kills: number;
      deaths: number;
      assists: number;
    }>;
  };
}

export async function getMatchHistory(puuid: string, region?: string, count = 10): Promise<MatchSummary[]> {
  const { regional } = resolveRiotId(puuid, region);
  const regionalBase = `https://${regional}.api.riotgames.com`;

  const { data: matchIds } = await axios.get<string[]>(
    `${regionalBase}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`,
    { headers: authHeaders }
  );

  if (matchIds.length === 0) return [];

  const matches = await Promise.all(
    matchIds.map((id) =>
      axios.get<RiotMatch>(`${regionalBase}/lol/match/v5/matches/${id}`, { headers: authHeaders })
    )
  );

  return matches.map(({ data }, i) => {
    const me = data.info.participants.find((p) => p.puuid === puuid);
    return {
      id: matchIds[i],
      gameMode: data.info.gameMode,
      championId: me?.championId ?? 0,
      championName: me?.championName ?? "Unknown",
      win: me?.win ?? false,
      kills: me?.kills ?? 0,
      deaths: me?.deaths ?? 0,
      assists: me?.assists ?? 0,
      gameEndTimestamp: data.info.gameEndTimestamp,
      gameDurationSec: data.info.gameDuration,
    };
  });
}