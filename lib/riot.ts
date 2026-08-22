import type {
  Summoner,
  SummonerProfile,
  ChampionMastery,
  LeagueEntry,
  MatchSummary,
} from "./types";
import {
  CLUSTERS,
  DEFAULT_REGION,
  REGIONS,
  platformsForCluster,
  regionForTag,
  resolveRiotId,
} from "./regions";

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

async function riotGet<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { headers: authHeaders, cache: "no-store" });
  } catch {
    throw new RiotApiError(0, "Could not reach the Riot API.");
  }
  if (!res.ok) {
    throw new RiotApiError(res.status, `Riot API responded ${res.status}`);
  }
  return (await res.json()) as T;
}

function regionalBase(regional: string): string {
  return `https://${regional}.api.riotgames.com`;
}

function platformBase(platform: string): string {
  return `https://${platform}.api.riotgames.com`;
}

function clustersToTry(tagLine: string, region?: string): string[] {
  const known = regionForTag(tagLine);
  if (known) return [REGIONS[known].regional];
  const primary =
    region && region in REGIONS ? REGIONS[region as keyof typeof REGIONS].regional : REGIONS[DEFAULT_REGION].regional;
  return [primary, ...CLUSTERS.filter((cluster) => cluster !== primary)];
}

async function resolveAccount(
  gameName: string,
  tagLine: string,
  region?: string
): Promise<{ account: RiotAccount; regional: string }> {
  let lastStatus = 404;
  for (const cluster of clustersToTry(tagLine, region)) {
    try {
      // Sequential by design: stop at the first cluster holding the account.
      // eslint-disable-next-line no-await-in-loop
      const account = await riotGet<RiotAccount>(
        `${regionalBase(cluster)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
      );
      return { account, regional: cluster };
    } catch (err) {
      const status = err instanceof RiotApiError ? err.status : undefined;
      if (status === 404) {
        lastStatus = 404;
        continue;
      }
      throw err;
    }
  }
  throw new RiotApiError(lastStatus, `No account found for ${gameName}#${tagLine}`);
}

async function locateSummoner(
  regional: string,
  puuid: string,
  region?: string
): Promise<{ platform: string; summoner: Summoner }> {
  const regionConfig = region && region in REGIONS ? REGIONS[region as keyof typeof REGIONS] : undefined;
  const preferred =
    regionConfig && regionConfig.regional === regional ? regionConfig.platform : undefined;

  const candidates = [
    ...(preferred ? [preferred] : []),
    ...platformsForCluster(regional).filter((platform) => platform !== preferred),
  ];

  for (const platform of candidates) {
    try {
      // Sequential by design: stop at the first platform holding the summoner.
      // eslint-disable-next-line no-await-in-loop
      const summoner = await riotGet<Summoner>(
        `${platformBase(platform)}/lol/summoner/v4/summoners/by-puuid/${puuid}`
      );
      return { platform, summoner };
    } catch (err) {
      const status = err instanceof RiotApiError ? err.status : undefined;
      if (status === 404) continue;
      throw err;
    }
  }
  throw new RiotApiError(404, "Summoner profile not found on any server.");
}

export async function getSummonerProfile(
  riotId: string,
  region?: string
): Promise<SummonerProfile> {
  if (!API_KEY) {
    throw new RiotApiError(0, "RIOT_API_KEY is not configured on the server.");
  }

  const { gameName, tagLine } = resolveRiotId(riotId, region);
  const cacheKey = `${gameName}#${tagLine}`;

  const cached = profileCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const { account, regional } = await resolveAccount(gameName, tagLine, region);
    const { platform, summoner } = await locateSummoner(regional, account.puuid, region);

    const [mastery, league] = await Promise.all([
      riotGet<ChampionMastery[]>(
        `${platformBase(platform)}/lol/champion-mastery/v4/champion-masteries/by-puuid/${account.puuid}/top?count=6`
      ),
      riotGet<LeagueEntry[]>(
        `${platformBase(platform)}/lol/league/v4/entries/by-puuid/${account.puuid}`
      ),
    ]);

    const data: SummonerProfile = {
      summoner,
      mastery,
      league,
      meta: { platform, regional },
    };

    profileCache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return data;
  } catch (err) {
    throw err instanceof RiotApiError
      ? err
      : new RiotApiError(0, err instanceof Error ? err.message : "Unknown Riot API error");
  }
}

interface RiotMatchParticipant {
  puuid: string;
  teamId: number;
  championId: number;
  championName: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  goldEarned: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  riotIdGameName?: string;
  riotIdTagLine?: string;
}

interface RiotMatch {
  info: {
    gameMode: string;
    gameDuration: number;
    gameEndTimestamp: number;
    participants: RiotMatchParticipant[];
  };
}

export async function getMatchHistory(
  puuid: string,
  regional?: string,
  count = 10
): Promise<MatchSummary[]> {
  const base = regionalBase(regional ?? REGIONS[DEFAULT_REGION].regional);

  const matchIds = await riotGet<string[]>(
    `${base}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`
  );

  if (matchIds.length === 0) return [];

  const matches = await Promise.all(
    matchIds.map((id) => riotGet<RiotMatch>(`${base}/lol/match/v5/matches/${id}`))
  );

  return matches.map(({ info }, i) => {
    const me = info.participants.find((p) => p.puuid === puuid);
    const participants = info.participants.map((p) => ({
      teamId: p.teamId,
      puuid: p.puuid,
      riotIdGameName: p.riotIdGameName ?? "",
      riotIdTagLine: p.riotIdTagLine ?? "",
      championId: p.championId,
      championName: p.championName ?? "Unknown",
      kills: p.kills ?? 0,
      deaths: p.deaths ?? 0,
      assists: p.assists ?? 0,
      cs: (p.totalMinionsKilled ?? 0) + (p.neutralMinionsKilled ?? 0),
      goldEarned: p.goldEarned ?? 0,
      items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
      win: p.win ?? false,
    }));
    const winningTeamId = participants.find((p) => p.win)?.teamId ?? 0;
    return {
      id: matchIds[i],
      gameMode: info.gameMode,
      championId: me?.championId ?? 0,
      championName: me?.championName ?? "Unknown",
      win: me?.win ?? false,
      kills: me?.kills ?? 0,
      deaths: me?.deaths ?? 0,
      assists: me?.assists ?? 0,
      gameEndTimestamp: info.gameEndTimestamp,
      gameDurationSec: info.gameDuration,
      winningTeamId,
      participants,
    };
  });
}