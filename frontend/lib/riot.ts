import type {
  Summoner,
  SummonerProfile,
  ChampionMastery,
  LeagueEntry,
  MatchSummary,
} from "./types";
import { DEFAULT_REGION, REGIONS, resolveRiotId } from "./regions";

const API_KEY = process.env.RIOT_API_KEY?.trim();
const CACHE_TTL_MS = 60_000;
const MATCH_CACHE_TTL_MS = 5 * 60_000;

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
// Full lookups can cost a dozen+ requests; remember misses briefly so retries
// don't burn through dev-key rate limits.
const NEGATIVE_TTL_MS = 60_000;
const negativeCache = new Map<string, number>();
const matchCache = new Map<string, { data: MatchSummary[]; expiresAt: number }>();

async function riotGet<T>(url: string, attempt = 0): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { headers: authHeaders, cache: "no-store" });
  } catch {
    throw new RiotApiError(0, "Could not reach the Riot API.");
  }
  // One bounded retry on rate-limit bursts; honor Retry-After when small.
  if (res.status === 429 && attempt === 0) {
    const retryAfterSec = Number(res.headers.get("retry-after"));
    const waitMs =
      Number.isFinite(retryAfterSec) && retryAfterSec > 0
        ? Math.min(retryAfterSec * 1000, 2000)
        : 750;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return riotGet<T>(url, attempt + 1);
  }
  if (!res.ok) {
    throw new RiotApiError(res.status, `Riot API responded ${res.status}`);
  }
  return (await res.json()) as T;
}

const CACHE_LIMIT = 300;

function cacheSet<T>(map: Map<string, T>, key: string, value: T): void {
  if (map.has(key)) map.delete(key);
  else if (map.size >= CACHE_LIMIT) {
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
  }
  map.set(key, value);
}

function regionalBase(regional: string): string {
  return `https://${regional}.api.riotgames.com`;
}

function platformBase(platform: string): string {
  return `https://${platform}.api.riotgames.com`;
}

function fetchAccount(regional: string, gameName: string, tagLine: string): Promise<RiotAccount> {
  return riotGet<RiotAccount>(
    `${regionalBase(regional)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );
}

// Everything a profile page shows, fetched entirely from one platform.
async function buildProfile(
  puuid: string,
  platform: string,
  regional: string,
  identity?: { gameName?: string; tagLine?: string }
): Promise<SummonerProfile> {
  const base = platformBase(platform);
  const summoner = await riotGet<Summoner>(
    `${base}/lol/summoner/v4/summoners/by-puuid/${puuid}`
  );
  const [mastery, league] = await Promise.all([
    riotGet<ChampionMastery[]>(
      `${base}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=6`
    ),
    riotGet<LeagueEntry[]>(`${base}/lol/league/v4/entries/by-puuid/${puuid}`),
  ]);
  return {
    summoner,
    mastery,
    league,
    meta: { platform, regional, ...identity },
  };
}

export async function getSummonerProfile(
  riotId: string,
  region?: string
): Promise<SummonerProfile> {
  if (!API_KEY) {
    throw new RiotApiError(0, "RIOT_API_KEY is not configured on the server.");
  }

  // Strictly scoped: only the selected region (or the typed region tag) is
  // ever queried. No cross-cluster fallback.
  const { gameName, tagLine, platform, regional } = resolveRiotId(riotId, region);
  const cacheKey = `${gameName}#${tagLine}`;

  const cached = profileCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const missedAt = negativeCache.get(cacheKey);
  if (missedAt && Date.now() - missedAt < NEGATIVE_TTL_MS) {
    throw new RiotApiError(404, `No account found for ${gameName}#${tagLine}`);
  }

  try {
    const account = await fetchAccount(regional, gameName, tagLine);
    const data = await buildProfile(account.puuid, platform, regional, {
      gameName: account.gameName,
      tagLine: account.tagLine,
    });
    cacheSet(profileCache, cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return data;
  } catch (err) {
    if (err instanceof RiotApiError && err.status === 404) {
      cacheSet(negativeCache, cacheKey, Date.now());
    }
    throw err instanceof RiotApiError
      ? err
      : new RiotApiError(0, err instanceof Error ? err.message : "Unknown Riot API error");
  }
}

// Match-detail navigation: every participant carries a puuid and played on the
// same platform as the viewed profile, so teammates resolve directly on that
// region — no account-v1 lookup and no tagline required (Riot strips them
// from match data anyway).
export async function getSummonerProfileByPuuid(
  puuid: string,
  region?: string,
  displayName?: string
): Promise<SummonerProfile> {
  if (!API_KEY) {
    throw new RiotApiError(0, "RIOT_API_KEY is not configured on the server.");
  }

  const config =
    region && region in REGIONS ? REGIONS[region as keyof typeof REGIONS] : REGIONS[DEFAULT_REGION];
  const cacheKey = `puuid:${config.platform}:${puuid}`;

  const cached = profileCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const data = await buildProfile(puuid, config.platform, config.regional, {
    gameName: displayName,
  });
  cacheSet(profileCache, cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
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
  totalDamageDealtToChampions: number;
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
  const cluster = regional ?? REGIONS[DEFAULT_REGION].regional;
  const base = regionalBase(cluster);
  const cacheKey = `${puuid}:${cluster}:${count}`;

  const cached = matchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const matchIds = await riotGet<string[]>(
    `${base}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`
  );

  if (matchIds.length === 0) return [];

  const matches = await Promise.all(
    matchIds.map((id) => riotGet<RiotMatch>(`${base}/lol/match/v5/matches/${id}`))
  );

  const result = matches.map(({ info }, i) => {
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
      totalDamageDealtToChampions: p.totalDamageDealtToChampions ?? 0,
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
      cs: (me?.totalMinionsKilled ?? 0) + (me?.neutralMinionsKilled ?? 0),
      gameEndTimestamp: info.gameEndTimestamp,
      gameDurationSec: info.gameDuration,
      winningTeamId,
      participants,
    };
  });

  cacheSet(matchCache, cacheKey, { data: result, expiresAt: Date.now() + MATCH_CACHE_TTL_MS });
  return result;
}