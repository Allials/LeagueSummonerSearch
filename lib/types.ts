export interface Summoner {
  id?: string;
  accountId?: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface ChampionMastery {
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  chestGranted: boolean;
  tokensEarned: number;
  summonerId: string;
}

export interface LeagueEntry {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  summonerId: string;
  summonerName: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries?: {
    losses: number;
    progress: string;
    target: number;
    wins: number;
  };
}

export interface SummonerProfile {
  summoner: Summoner;
  mastery: ChampionMastery[];
  league: LeagueEntry[];
}

export interface MatchSummary {
  id: string;
  gameMode: string;
  championId: number;
  championName: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  gameEndTimestamp: number;
  gameDurationSec: number;
}