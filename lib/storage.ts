import { MatchScoutData, TeamStats, Match, GameConfig } from '@/types';

const STORAGE_KEYS = {
  SCOUT_DATA: 'rebuilt_scout_data',
  MATCHES: 'rebuilt_matches',
  CONFIG: 'rebuilt_config',
  TEAMS: 'rebuilt_teams',
  EVENT_KEY: 'rebuilt_event_key',
};

export interface TeamData {
  teamNumber: number;
  teamName?: string;
  city?: string;
  stateProv?: string;
  country?: string;
  // Pit-style scouting fields
  robotPhotoUrl?: string;
  robotSize?: string;
  robotHeight?: string;
  robotWeight?: string;
  drivetrainStyle?: string;
  wheelType?: string;
  autoTasks?: string;
  autoStartingLocations?: string;
  autoPathing?: string;
  teleopScoring?: string;
  teleopSpeedAgility?: string;
  teleopDrivingAbility?: string;
  teleopDefenseEffectiveness?: string;
  teleopDefenseLocations?: string;
  teleopFouls?: string;
  endgameAttempted?: string;
  endgameCompleted?: string;
  otherReliability?: string;
  otherCommunication?: string;
  soloScoreEstimate?: number;
}

export const storage = {
  // Scout Data
  getScoutData(): MatchScoutData[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SCOUT_DATA);
    return data ? JSON.parse(data) : [];
  },

  saveScoutData(data: MatchScoutData[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SCOUT_DATA, JSON.stringify(data));
  },

  addScoutData(data: MatchScoutData): void {
    const existing = this.getScoutData();
    existing.push(data);
    this.saveScoutData(existing);
  },

  // Matches
  getMatches(): Match[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return data ? JSON.parse(data) : [];
  },

  saveMatches(matches: Match[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  },

  // Config
  getConfig(): GameConfig {
    if (typeof window === 'undefined') {
      return {
        scoringZones: ['high', 'low'],
        phases: ['auto', 'teleop', 'endgame'],
        normalBallRange: { min: 30, max: 60 },
      };
    }
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : {
      scoringZones: ['high', 'low'],
      phases: ['auto', 'teleop', 'endgame'],
      normalBallRange: { min: 30, max: 60 },
    };
  },

  saveConfig(config: GameConfig): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  // Teams
  getTeams(): TeamData[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return data ? JSON.parse(data) : [];
  },

  saveTeams(teams: TeamData[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  },

  // Event Key
  getEventKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.EVENT_KEY);
  },

  saveEventKey(eventKey: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.EVENT_KEY, eventKey);
  },
};

