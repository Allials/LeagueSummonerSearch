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
  puuid: string;
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  markRequiredForNextLevel: number;
  tokensEarned: number;
  championSeasonMilestone: number;
  nextSeasonMilestone?: {
    requireGradeCounts: Record<string, number>;
    rewardMarks: number;
    bonus: boolean;
    totalGamesRequires: number;
  };
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
  meta?: {
    platform: string;
    regional: string;
    gameName?: string;
    tagLine?: string;
  };
}

export interface MatchParticipant {
  teamId: number;
  puuid: string;
  riotIdGameName: string;
  riotIdTagLine: string;
  championId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  goldEarned: number;
  totalDamageDealtToChampions: number;
  items: number[];
  win: boolean;
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
  cs: number;
  gameEndTimestamp: number;
  gameDurationSec: number;
  winningTeamId: number;
  participants: MatchParticipant[];
}