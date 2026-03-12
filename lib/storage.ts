import { MatchScoutData, TeamStats, Match, GameConfig } from '@/types';
import { supabase } from './supabase';

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
  mechanismPhotoUrl?: string;
  photoCapturedAt?: number;
  photoTags?: string[];
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
  // Structured pit scouting
  speedAgilityRating?: 'elite' | 'fast' | 'average' | 'slow';
  drivingAbilityRating?: 'smooth' | 'aggressive' | 'shaky' | 'inexperienced';
  reliabilityRating?: 'rock_solid' | 'minor_issues' | 'frequent_issues' | 'dnp_risk';
  defenseRating?: 'none' | 'opportunistic' | 'dedicated' | 'elite';
  intakeFrom?: Array<'floor' | 'source' | 'station' | 'not_sure'>;
  /** Where does the robot feed from? Ground = floor, Top = source/station */
  feedFrom?: 'ground' | 'top' | 'both' | 'not_sure';
  /** Does the robot have autoaim / vision for shooting? */
  hasAutoAim?: 'yes' | 'no' | 'not_sure';
  /** Can the robot climb? */
  canClimb?: 'yes' | 'no' | 'not_sure';
  /** Cycle length when uninterrupted */
  cycleLength?: 'fast' | 'average' | 'slow' | 'not_sure';
  scoresInto?: Array<'high' | 'mid' | 'low' | 'amp' | 'trap'>;
  rolePreference?: 'scorer' | 'defender' | 'support' | 'mixed';
  trafficFootprint?: 'slim' | 'normal' | 'wide';
  needsProtectedLane?: 'yes' | 'no' | 'not_sure';
  canPassHandoff?: 'yes' | 'no' | 'not_sure';
  commonFailureMode?:
    | 'brownout'
    | 'chain'
    | 'breaker'
    | 'comms'
    | 'intake_jam'
    | 'elevator_bind'
    | 'shooter_inconsistency'
    | 'auto_fails'
    | 'other';
  failureModeNotes?: string;
  averagePitFixTime?: '0-5' | '5-10' | '10-20' | '20+';
  sparePartsReadiness?: 'fully_stocked' | 'some' | 'minimal';
  autoConsistency?: 'high' | 'medium' | 'low' | 'unknown';
  autoPartnerRequirement?: 'needs_space' | 'needs_clear_lane' | 'doesnt_matter';
  cyclePreference?: 'short_cycles' | 'long_cycles' | 'either';
  defensiveTolerance?: 'shrugs_off' | 'slows_bit' | 'falls_apart';
  bestAutoSummary?: string;
  avgTeleopCycleTime?: string;
  roleInPlayoffs?: string;
  upgradeWish?: string;
  interviewQuote?: string;
  sourceOfClaims?: 'pit_said' | 'observed' | 'both';
  confidenceLevel?: 'certain' | 'likely' | 'unsure';
  needsRecheck?: boolean;
  lastPitUpdatedAt?: number;
  pitVersion?: number;
  pitHistory?: Array<{ timestamp: number; summary: string }>;
}

export const storage = {
  emitChange(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event('storage:rebuilt:update'));
  },
  // --- Syncing Logic ---

  async syncAll(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!supabase) return;

    try {
      // 1. Sync Teams
      const { data: remoteTeams } = await supabase.from('teams').select('*');
      if (remoteTeams) {
        const localTeams = this.getTeams();
        const localMap = new Map(localTeams.map((team) => [team.teamNumber, team]));
        const mappedTeams: TeamData[] = remoteTeams.map(t => {
          const existingLocal = localMap.get(t.team_number);
          return {
            ...existingLocal,
          teamNumber: t.team_number,
          teamName: t.team_name,
          city: t.city,
          stateProv: t.state_prov,
          country: t.country,
          feedFrom: (t as any).feed_from,
          hasAutoAim: (t as any).has_auto_aim,
          canClimb: (t as any).can_climb,
          cycleLength: (t as any).cycle_length,
          robotPhotoUrl: t.robot_photo_url,
          robotSize: t.robot_size,
          robotHeight: t.robot_height,
          robotWeight: t.robot_weight,
          drivetrainStyle: t.drivetrain_style,
          wheelType: t.wheel_type,
          autoTasks: t.auto_tasks,
          autoStartingLocations: t.auto_starting_locations,
          autoPathing: t.auto_pathing,
          teleopScoring: t.teleop_scoring,
          teleopSpeedAgility: t.teleop_speed_agility,
          teleopDrivingAbility: t.teleop_driving_ability,
          teleopDefenseEffectiveness: t.teleop_defense_effectiveness,
          teleopDefenseLocations: t.teleop_defense_locations,
          teleopFouls: t.teleop_fouls,
          endgameAttempted: t.endgame_attempted,
          endgameCompleted: t.endgame_completed,
          otherReliability: t.other_reliability,
          otherCommunication: t.other_communication,
          soloScoreEstimate: t.solo_score_estimate ? Number(t.solo_score_estimate) : undefined
          };
        });
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(mappedTeams));
        storage.emitChange();
      }

      // 2. Sync Scout Data
      const { data: remoteScoutData } = await supabase.from('scout_data').select('*');
      if (remoteScoutData) {
        const mappedData: MatchScoutData[] = remoteScoutData.map(d => ({
          id: d.id,
          matchNumber: d.match_number.toString(),
          alliance: d.alliance as any,
          teamNumber: d.team_number,
          position: parseInt(d.position.replace(/\D/g, '')) as any,
          auto: d.auto_data,
          teleop: d.teleop_data,
          endgame: d.endgame_data,
          timestamp: new Date(d.created_at).getTime(),
          scoutName: d.scout_name
        }));
        localStorage.setItem(STORAGE_KEYS.SCOUT_DATA, JSON.stringify(mappedData));
        storage.emitChange();
      }

      // 3. Sync Matches
      const { data: remoteMatches } = await supabase.from('matches').select('*');
      if (remoteMatches) {
        const mappedMatches: Match[] = remoteMatches.map(m => ({
          matchNumber: m.match_number.toString(),
          redAlliance: [m.red_1, m.red_2, m.red_3],
          blueAlliance: [m.blue_1, m.blue_2, m.blue_3],
          timestamp: new Date(m.created_at).getTime(),
          status: 'upcoming'
        }));
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(mappedMatches));
        storage.emitChange();
      }
    } catch (error) {
      console.error('Failed to sync with Supabase:', error);
    }
  },

  // --- Scout Data ---

  getScoutData(): MatchScoutData[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SCOUT_DATA);
    return data ? JSON.parse(data) : [];
  },

  async saveScoutData(data: MatchScoutData[]): Promise<void> {
    if (typeof window === 'undefined') return;
    const previous = this.getScoutData();
    const previousIds = new Set(previous.map(d => d.id));
    const changed = data.filter(d => !previousIds.has(d.id));

    localStorage.setItem(STORAGE_KEYS.SCOUT_DATA, JSON.stringify(data));
    storage.emitChange();

    // Background push latest to Supabase
    if (!supabase) return;

    try {
      if (changed.length > 0) {
        const payload = changed.map(d => ({
          id: d.id,
          match_number: parseInt(d.matchNumber),
          alliance: d.alliance,
          team_number: d.teamNumber,
          position: `${d.alliance}${d.position}`,
          scout_name: d.scoutName,
          auto_data: d.auto,
          teleop_data: d.teleop,
          endgame_data: d.endgame
        }));
        await supabase.from('scout_data').upsert(payload);
      }
    } catch (e) {
      console.error('Failed to push scout data to Supabase:', e);
    }
  },

  async addScoutData(data: MatchScoutData): Promise<void> {
    const existing = this.getScoutData();
    // Check for duplicates
    const index = existing.findIndex(d => d.id === data.id);
    if (index !== -1) {
      existing[index] = data;
    } else {
      existing.push(data);
    }
    await this.saveScoutData(existing);
  },

  // --- Matches ---

  getMatches(): Match[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return data ? JSON.parse(data) : [];
  },

  async saveMatches(matches: Match[]): Promise<void> {
    if (typeof window === 'undefined') return;
    const previous = this.getMatches();
    const previousKeys = new Set(previous.map(m => m.matchNumber));
    const changed = matches.filter(m => !previousKeys.has(m.matchNumber));

    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    storage.emitChange();

    if (!supabase) return;

    try {
      if (changed.length > 0) {
        const payload = changed.map(m => ({
          match_number: parseInt(m.matchNumber),
          red_1: m.redAlliance[0],
          red_2: m.redAlliance[1],
          red_3: m.redAlliance[2],
          blue_1: m.blueAlliance[0],
          blue_2: m.blueAlliance[1],
          blue_3: m.blueAlliance[2]
        }));
        await supabase.from('matches').upsert(payload);
      }
    } catch (e) {
      console.error('Failed to push matches to Supabase:', e);
    }
  },

  // --- Config ---

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
    storage.emitChange();
  },

  // --- Teams ---

  getTeams(): TeamData[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return data ? JSON.parse(data) : [];
  },

  async saveTeams(teams: TeamData[]): Promise<void> {
    if (typeof window === 'undefined') return;
    const previous = this.getTeams();
    const previousMap = new Map(previous.map((team) => [team.teamNumber, team]));
    const changed = teams.filter((team) => {
      const prev = previousMap.get(team.teamNumber);
      return JSON.stringify(prev || null) !== JSON.stringify(team);
    });

    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    storage.emitChange();

    if (!supabase) return;

    try {
      if (changed.length > 0) {
        const payload = changed.map(t => ({
          team_number: t.teamNumber,
          team_name: t.teamName,
          city: t.city,
          state_prov: t.stateProv,
          country: t.country,
          feed_from: t.feedFrom,
          has_auto_aim: t.hasAutoAim,
          can_climb: t.canClimb,
          cycle_length: t.cycleLength,
          robot_photo_url: t.robotPhotoUrl,
          robot_size: t.robotSize,
          robot_height: t.robotHeight,
          robot_weight: t.robotWeight,
          drivetrain_style: t.drivetrainStyle,
          wheel_type: t.wheelType,
          auto_tasks: t.autoTasks,
          auto_starting_locations: t.autoStartingLocations,
          auto_pathing: t.autoPathing,
          teleop_scoring: t.teleopScoring,
          teleop_speed_agility: t.teleopSpeedAgility,
          teleop_driving_ability: t.teleopDrivingAbility,
          teleop_defense_effectiveness: t.teleopDefenseEffectiveness,
          teleop_defense_locations: t.teleopDefenseLocations,
          teleop_fouls: t.teleopFouls,
          endgame_attempted: t.endgameAttempted,
          endgame_completed: t.endgameCompleted,
          other_reliability: t.otherReliability,
          other_communication: t.otherCommunication,
          solo_score_estimate: t.soloScoreEstimate
        }));
        await supabase.from('teams').upsert(payload);
      }
    } catch (e) {
      console.error('Failed to push teams to Supabase:', e);
    }
  },

  // --- Event Key ---

  getEventKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.EVENT_KEY);
  },

  saveEventKey(eventKey: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.EVENT_KEY, eventKey);
    storage.emitChange();
  },
};
