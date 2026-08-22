export const REGIONS = {
  NA1: { platform: "na1", regional: "americas", tag: "NA1", label: "North America" },
  EUW1: { platform: "euw1", regional: "europe", tag: "EUW1", label: "Europe West" },
  EUNE1: { platform: "eune1", regional: "europe", tag: "EUNE1", label: "Europe Nordic & East" },
  KR: { platform: "kr", regional: "asia", tag: "KR", label: "Korea" },
  JP1: { platform: "jp1", regional: "asia", tag: "JP1", label: "Japan" },
  BR1: { platform: "br1", regional: "americas", tag: "BR1", label: "Brazil" },
  LAN1: { platform: "lan1", regional: "americas", tag: "LAN1", label: "Latin America North" },
  LAS1: { platform: "las1", regional: "americas", tag: "LAS1", label: "Latin America South" },
  OC1: { platform: "oc1", regional: "americas", tag: "OC1", label: "Oceania" },
  TR1: { platform: "tr1", regional: "europe", tag: "TR1", label: "Türkiye" },
  RU1: { platform: "ru1", regional: "europe", tag: "RU1", label: "Russia" },
  SG2: { platform: "sg2", regional: "sea", tag: "SG2", label: "Singapore" },
  PH2: { platform: "ph2", regional: "sea", tag: "PH2", label: "Philippines" },
  TW2: { platform: "tw2", regional: "sea", tag: "TW2", label: "Taiwan" },
  VN2: { platform: "vn2", regional: "sea", tag: "VN2", label: "Vietnam" },
  TH2: { platform: "th2", regional: "sea", tag: "TH2", label: "Thailand" },
  ME1: { platform: "me1", regional: "middle-east", tag: "ME1", label: "Middle East" },
} as const;

export type RegionKey = keyof typeof REGIONS;

export const DEFAULT_REGION: RegionKey = "NA1";

export interface ResolvedRiotId {
  gameName: string;
  tagLine: string;
  platform: string;
  regional: string;
}

export function resolveRiotId(riotId: string, region?: string): ResolvedRiotId {
  const [rawGameName, rawTagLine] = riotId.split("#");
  const gameName = rawGameName.trim();
  const typedTag = rawTagLine?.trim().toUpperCase();

  const typedConfig =
    typedTag && typedTag in REGIONS ? REGIONS[typedTag as RegionKey] : undefined;
  const regionConfig =
    region && region in REGIONS ? REGIONS[region as RegionKey] : undefined;
  const config = typedConfig ?? regionConfig ?? REGIONS[DEFAULT_REGION];

  return {
    gameName,
    tagLine: typedTag ?? config.tag,
    platform: config.platform,
    regional: config.regional,
  };
}