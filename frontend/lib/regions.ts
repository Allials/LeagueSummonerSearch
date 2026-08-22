export const REGIONS = {
  NA1: { platform: "na1", regional: "americas", tag: "NA1", label: "North America" },
  EUW1: { platform: "euw1", regional: "europe", tag: "EUW", label: "Europe West" },
  EUNE1: { platform: "eune1", regional: "europe", tag: "EUNE", label: "Europe Nordic & East" },
  KR: { platform: "kr", regional: "asia", tag: "KR", label: "Korea" },
  JP1: { platform: "jp1", regional: "asia", tag: "JP", label: "Japan" },
  BR1: { platform: "br1", regional: "americas", tag: "BR", label: "Brazil" },
  LAN1: { platform: "lan1", regional: "americas", tag: "LAN", label: "Latin America North" },
  LAS1: { platform: "las1", regional: "americas", tag: "LAS", label: "Latin America South" },
  OC1: { platform: "oc1", regional: "americas", tag: "OCE", label: "Oceania" },
  TR1: { platform: "tr1", regional: "europe", tag: "TR", label: "Türkiye" },
  RU1: { platform: "ru1", regional: "europe", tag: "RU", label: "Russia" },
  SG2: { platform: "sg2", regional: "sea", tag: "SG", label: "Singapore" },
  PH2: { platform: "ph2", regional: "sea", tag: "PH", label: "Philippines" },
  TW2: { platform: "tw2", regional: "sea", tag: "TW", label: "Taiwan" },
  VN2: { platform: "vn2", regional: "sea", tag: "VN", label: "Vietnam" },
  TH2: { platform: "th2", regional: "sea", tag: "TH", label: "Thailand" },
  ME1: { platform: "me1", regional: "middle-east", tag: "ME1", label: "Middle East" },
} as const;

export type RegionKey = keyof typeof REGIONS;

export const DEFAULT_REGION: RegionKey = "NA1";

export const CLUSTERS: string[] = Array.from(
  new Set(Object.values(REGIONS).map((region) => region.regional))
);

export function platformsForCluster(regional: string): string[] {
  return (Object.keys(REGIONS) as RegionKey[])
    .filter((key) => REGIONS[key].regional === regional)
    .map((key) => REGIONS[key].platform);
}

// Riot taglines differ from platform codes ("EUW" vs euw1); accept both.
const TAG_ALIASES: Record<string, RegionKey> = Object.fromEntries(
  (Object.keys(REGIONS) as RegionKey[]).flatMap((key) => [
    [key, key] as [string, RegionKey],
    [REGIONS[key].tag.toUpperCase(), key] as [string, RegionKey],
  ])
);

export function regionForTag(tag: string): RegionKey | undefined {
  return TAG_ALIASES[tag.trim().toUpperCase()];
}

export function regionKeyForPlatform(platform: string): RegionKey | undefined {
  return (Object.keys(REGIONS) as RegionKey[]).find((key) => REGIONS[key].platform === platform);
}

export interface ResolvedRiotId {
  gameName: string;
  tagLine: string;
  platform: string;
  regional: string;
  /** True when the user typed a tagline that is not a known region code. */
  isCustomTag: boolean;
}

// Deterministic: an explicitly typed region tag wins; otherwise the selected
// region applies. Searches are strictly scoped to one region.
export function resolveRiotId(riotId: string, region?: string): ResolvedRiotId {
  const [rawGameName, rawTagLine] = riotId.split("#");
  const gameName = rawGameName.trim();
  const typedTag = rawTagLine?.trim().toUpperCase();

  const typedRegion = typedTag ? regionForTag(typedTag) : undefined;
  const selectedRegion =
    region && region in REGIONS ? (region as RegionKey) : DEFAULT_REGION;
  const config = REGIONS[typedRegion ?? selectedRegion];

  return {
    gameName,
    tagLine: typedRegion ? REGIONS[typedRegion].tag : typedTag || config.tag,
    platform: config.platform,
    regional: config.regional,
    isCustomTag: Boolean(typedTag) && !typedRegion,
  };
}