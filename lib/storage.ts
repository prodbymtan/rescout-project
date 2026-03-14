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
  hasAutoProgram?: 'yes' | 'no' | 'not_sure';
  drivetrainType?: string;
  shooterType?: 'turret' | 'multi_turret' | 'other' | 'not_sure';
  maxFuelCapacity?: string;
  intakeLocation?: 'ground' | 'outpost' | 'both' | 'neither' | 'not_sure';
  autoFlexibility?: 'high' | 'medium' | 'low' | 'not_sure';
  avgCycleLength?: string;
  basicStrats?: string;
  canPassUnderTrench?: 'yes' | 'no' | 'not_sure';
  canGetStuckOnBump?: 'yes' | 'no' | 'not_sure';
  canPlayDefense?: 'yes' | 'no' | 'not_sure';
  generalAccuracy?: 'high' | 'medium' | 'low' | 'not_sure';
  climbLevel?: 'low' | 'middle' | 'high' | 'not_sure';
  mostCommonIssue?: string;
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
          mechanismPhotoUrl: (t as any).mechanism_photo_url,
          photoCapturedAt: (t as any).photo_captured_at ? Number((t as any).photo_captured_at) : undefined,
          photoTags: (t as any).photo_tags ?? undefined,
          hasAutoProgram: (t as any).has_auto_program,
          drivetrainType: (t as any).drivetrain_type,
          shooterType: (t as any).shooter_type,
          maxFuelCapacity: (t as any).max_fuel_capacity,
          intakeLocation: (t as any).intake_location,
          autoFlexibility: (t as any).auto_flexibility,
          avgCycleLength: (t as any).avg_cycle_length,
          basicStrats: (t as any).basic_strats,
          canPassUnderTrench: (t as any).can_pass_under_trench,
          canGetStuckOnBump: (t as any).can_get_stuck_on_bump,
          canPlayDefense: (t as any).can_play_defense,
          generalAccuracy: (t as any).general_accuracy,
          climbLevel: (t as any).climb_level,
          mostCommonIssue: (t as any).most_common_issue,
          speedAgilityRating: (t as any).speed_agility_rating,
          drivingAbilityRating: (t as any).driving_ability_rating,
          reliabilityRating: (t as any).reliability_rating,
          defenseRating: (t as any).defense_rating,
          intakeFrom: (t as any).intake_from ?? undefined,
          scoresInto: (t as any).scores_into ?? undefined,
          rolePreference: (t as any).role_preference,
          trafficFootprint: (t as any).traffic_footprint,
          needsProtectedLane: (t as any).needs_protected_lane,
          canPassHandoff: (t as any).can_pass_handoff,
          commonFailureMode: (t as any).common_failure_mode,
          failureModeNotes: (t as any).failure_mode_notes,
          averagePitFixTime: (t as any).average_pit_fix_time,
          sparePartsReadiness: (t as any).spare_parts_readiness,
          autoConsistency: (t as any).auto_consistency,
          autoPartnerRequirement: (t as any).auto_partner_requirement,
          cyclePreference: (t as any).cycle_preference,
          defensiveTolerance: (t as any).defensive_tolerance,
          bestAutoSummary: (t as any).best_auto_summary,
          avgTeleopCycleTime: (t as any).avg_teleop_cycle_time,
          roleInPlayoffs: (t as any).role_in_playoffs,
          upgradeWish: (t as any).upgrade_wish,
          interviewQuote: (t as any).interview_quote,
          sourceOfClaims: (t as any).source_of_claims,
          confidenceLevel: (t as any).confidence_level,
          needsRecheck: (t as any).needs_recheck ?? undefined,
          lastPitUpdatedAt: (t as any).last_pit_updated_at ? Number((t as any).last_pit_updated_at) : undefined,
          pitVersion: (t as any).pit_version ?? undefined,
          pitHistory: (t as any).pit_history ?? undefined,
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
          mechanism_photo_url: t.mechanismPhotoUrl,
          photo_captured_at: t.photoCapturedAt ?? null,
          photo_tags: t.photoTags ?? null,
          has_auto_program: t.hasAutoProgram,
          drivetrain_type: t.drivetrainType,
          shooter_type: t.shooterType,
          max_fuel_capacity: t.maxFuelCapacity,
          intake_location: t.intakeLocation,
          auto_flexibility: t.autoFlexibility,
          avg_cycle_length: t.avgCycleLength,
          basic_strats: t.basicStrats,
          can_pass_under_trench: t.canPassUnderTrench,
          can_get_stuck_on_bump: t.canGetStuckOnBump,
          can_play_defense: t.canPlayDefense,
          general_accuracy: t.generalAccuracy,
          climb_level: t.climbLevel,
          most_common_issue: t.mostCommonIssue,
          speed_agility_rating: t.speedAgilityRating,
          driving_ability_rating: t.drivingAbilityRating,
          reliability_rating: t.reliabilityRating,
          defense_rating: t.defenseRating,
          intake_from: t.intakeFrom ?? null,
          scores_into: t.scoresInto ?? null,
          role_preference: t.rolePreference,
          traffic_footprint: t.trafficFootprint,
          needs_protected_lane: t.needsProtectedLane,
          can_pass_handoff: t.canPassHandoff,
          common_failure_mode: t.commonFailureMode,
          failure_mode_notes: t.failureModeNotes,
          average_pit_fix_time: t.averagePitFixTime,
          spare_parts_readiness: t.sparePartsReadiness,
          auto_consistency: t.autoConsistency,
          auto_partner_requirement: t.autoPartnerRequirement,
          cycle_preference: t.cyclePreference,
          defensive_tolerance: t.defensiveTolerance,
          best_auto_summary: t.bestAutoSummary,
          avg_teleop_cycle_time: t.avgTeleopCycleTime,
          role_in_playoffs: t.roleInPlayoffs,
          upgrade_wish: t.upgradeWish,
          interview_quote: t.interviewQuote,
          source_of_claims: t.sourceOfClaims,
          confidence_level: t.confidenceLevel,
          needs_recheck: t.needsRecheck ?? null,
          last_pit_updated_at: t.lastPitUpdatedAt ?? null,
          pit_version: t.pitVersion ?? null,
          pit_history: t.pitHistory ?? null,
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
