import { championFallback } from "./championFallback";

const DD_BASE = "https://ddragon.leagueoflegends.com";
const FALLBACK_VERSION = "14.24.1";

// 8x8 neutral tile used as a blur placeholder for remote Data Dragon icons.
export const ICON_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc4JyBoZWlnaHQ9JzgnPjxyZWN0IHdpZHRoPSc4JyBoZWlnaHQ9JzgnIGZpbGw9JyNlN2U1ZTQnLz48L3N2Zz4=";

export interface ChampionMeta {
  key: string;
  name: string;
}

let versionPromise: Promise<string> | null = null;
let championsPromise: Promise<Map<number, ChampionMeta> | null> | null = null;
let versionFetchedAt = 0;
// Data Dragon patches ship every ~2 weeks; refresh so long-running servers
// don't serve icons from a dead patch URL.
const VERSION_TTL_MS = 12 * 60 * 60 * 1000;

export function getVersion(): Promise<string> {
  if (!versionPromise || Date.now() - versionFetchedAt > VERSION_TTL_MS) {
    versionFetchedAt = Date.now();
    championsPromise = null;
    versionPromise = fetch(`${DD_BASE}/api/versions.json`)
      .then((res) => (res.ok ? (res.json() as Promise<string[]>) : []))
      .then((versions) => versions[0] ?? FALLBACK_VERSION)
      .catch(() => FALLBACK_VERSION);
  }
  return versionPromise;
}

function getChampions(): Promise<Map<number, ChampionMeta> | null> {
  if (!championsPromise) {
    championsPromise = (async () => {
      const version = await getVersion();
      const res = await fetch(`${DD_BASE}/cdn/${version}/data/en_US/champion.json`);
      if (!res.ok) return null;
      const json = (await res.json()) as {
        data: Record<string, { key: string; name: string }>;
      };
      const map = new Map<number, ChampionMeta>();
      for (const [key, entry] of Object.entries(json.data)) {
        map.set(Number(entry.key), { key, name: entry.name });
      }
      return map;
    })().catch(() => null);
  }
  return championsPromise;
}

export async function championMeta(id: number): Promise<ChampionMeta> {
  const champions = await getChampions();
  const meta = champions?.get(id);
  if (meta) return meta;

  const fallbackName = championFallback[id];
  if (fallbackName) return { key: fallbackName, name: fallbackName };

  return { key: "Unknown", name: "Unknown" };
}

export async function profileIconUrl(iconId: number): Promise<string> {
  const version = await getVersion();
  return `${DD_BASE}/cdn/${version}/img/profileicon/${iconId}.png`;
}

export async function championIconUrl(key: string): Promise<string> {
  const version = await getVersion();
  return `${DD_BASE}/cdn/${version}/img/champion/${key}.png`;
}

export async function itemIconUrl(itemId: number): Promise<string> {
  const version = await getVersion();
  return `${DD_BASE}/cdn/${version}/img/item/${itemId}.png`;
}