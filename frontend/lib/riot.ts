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
  resolveRiotId,
} from "./regions";

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
// puuid -> platform is a stable fact once discovered; remember it so repeat
// views skip the platform probing entirely.
const platformCache = new Map<string, string>();
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

// Riot's account-v1 resolves Riot IDs globally, but the LoL profile lives on
// exactly one platform — which the account response does not reveal. Probe
// platforms in preference order until summoner-v4 answers.
async function locateSummoner(
  puuid: string,
  candidates: string[]
): Promise<{ platform: string; summoner: Summoner }> {
  for (const platform of candidates) {
    try {
      // Sequential by design: stop at the first platform holding the profile.
      // eslint-disable-next-line no-await-in-loop
      const summoner = await riotGet<Summoner>(
        `${platformBase(platform)}/lol/summoner/v4/summoners/by-puuid/${puuid}`
      );
      return { platform, summoner };
    } catch (err) {
      if (!(err instanceof RiotApiError && err.status === 404)) throw err;
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

  // The typed region tag (or selected region) picks the preferred platform;
  // the account lookup stays strictly scoped to it. Since account-v1 mirrors
  // Riot IDs globally, a hit there doesn't prove the profile lives on that
  // platform — locateSummoner probes outward from the preference.
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
    let account: RiotAccount | undefined;
    for (const cluster of [regional, ...CLUSTERS.filter((c) => c !== regional)]) {
      try {
        // Sequential by design: stop at the first mirror answering.
        // eslint-disable-next-line no-await-in-loop
        account = await fetchAccount(cluster, gameName, tagLine);
        break;
      } catch (err) {
        if (!(err instanceof RiotApiError && err.status === 404)) throw err;
      }
    }
    if (!account) {
      throw new RiotApiError(404, `No account found for ${gameName}#${tagLine}`);
    }

    let summonerPlatform = platformCache.get(account.puuid);
    let summoner: Summoner;
    if (summonerPlatform) {
      summoner = await riotGet<Summoner>(
        `${platformBase(summonerPlatform)}/lol/summoner/v4/summoners/by-puuid/${account.puuid}`
      );
    } else {
      const sameCluster = platformsForCluster(regional).filter((p) => p !== platform);
      const elsewhere = (Object.keys(REGIONS) as (keyof typeof REGIONS)[])
        .map((key) => REGIONS[key].platform)
        .filter((p) => p !== platform && !sameCluster.includes(p));

      ({ platform: summonerPlatform, summoner } = await locateSummoner(account.puuid, [
        platform,
        ...sameCluster,
        ...elsewhere,
      ]));
      cacheSet(platformCache, account.puuid, summonerPlatform);
    }

    const [mastery, league] = await Promise.all([
      riotGet<ChampionMastery[]>(
        `${platformBase(summonerPlatform)}/lol/champion-mastery/v4/champion-masteries/by-puuid/${account.puuid}/top?count=6`
      ),
      riotGet<LeagueEntry[]>(
        `${platformBase(summonerPlatform)}/lol/league/v4/entries/by-puuid/${account.puuid}`
      ),
    ]);

    const data: SummonerProfile = {
      summoner,
      mastery,
      league,
      meta: {
        platform: summonerPlatform,
        regional:
          Object.values(REGIONS).find((r) => r.platform === summonerPlatform)?.regional ??
          regional,
        gameName: account.gameName,
        tagLine: account.tagLine,
      },
    };

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