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
  // Legacy fields kept for compatibility with matches-lab screens.
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
  otherReliability?: string;
  intakeFrom?: Array<'floor' | 'source' | 'station' | 'not_sure'>;
  feedFrom?: 'ground' | 'top' | 'both' | 'not_sure';
  canClimb?: 'yes' | 'no' | 'not_sure';
  cycleLength?: 'fast' | 'average' | 'slow' | 'not_sure';
  scoresInto?: Array<'high' | 'mid' | 'low' | 'amp' | 'trap'>;
  rolePreference?: 'scorer' | 'defender' | 'support' | 'mixed';
  trafficFootprint?: 'slim' | 'normal' | 'wide';
  needsProtectedLane?: 'yes' | 'no' | 'not_sure';
  canPassHandoff?: 'yes' | 'no' | 'not_sure';
  // Pit-style scouting fields
  robotPhotoUrl?: string;
  mechanismPhotoUrl?: string;
  photoCapturedAt?: number;
  photoTags?: string[];
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
  endgameCompleted?: string;
  otherCommunication?: string;
  soloScoreEstimate?: number;
  // Structured pit scouting
  speedAgilityRating?: 'elite' | 'fast' | 'average' | 'slow';
  drivingAbilityRating?: 'smooth' | 'aggressive' | 'shaky' | 'inexperienced';
  reliabilityRating?: 'rock_solid' | 'minor_issues' | 'frequent_issues' | 'dnp_risk';
  defenseRating?: 'none' | 'opportunistic' | 'dedicated' | 'elite';
  hasAutoAim?: 'yes' | 'no' | 'not_sure';
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

function parseMatchNumber(value: string): number | null {
  const digits = value.replace(/\D/g, '');
  const normalized = digits.length > 0 ? digits : value;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeMatchLabel(value: string | number): string {
  const raw = String(value ?? '').trim();
  const parsed = parseMatchNumber(raw);
  return parsed == null ? raw : `Q${parsed}`;
}

function readStorageJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`Invalid JSON found in localStorage key '${key}'. Resetting that key.`);
    localStorage.removeItem(key);
    return fallback;
  }
}

function parseAllianceValue(value: unknown): 'red' | 'blue' {
  return String(value ?? '').toLowerCase() === 'blue' ? 'blue' : 'red';
}

function parsePositionValue(value: unknown): 1 | 2 | 3 {
  const digits = String(value ?? '').replace(/\D/g, '');
  const parsed = Number.parseInt(digits, 10);
  return parsed === 1 || parsed === 2 || parsed === 3 ? parsed : 1;
}

function parseTimestamp(value: unknown): number {
  const parsed = Date.parse(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function parsePositiveInteger(value: unknown): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function buildScoutEntryId(raw: Partial<MatchScoutData>, index: number): string {
  const existingId = String(raw.id ?? '').trim();
  if (existingId.length > 0) return existingId;

  const match = normalizeMatchLabel(String(raw.matchNumber ?? ''));
  const alliance = parseAllianceValue(raw.alliance);
  const team = parsePositiveInteger(raw.teamNumber);
  const position = parsePositionValue(raw.position);
  const timestamp = Number.isFinite(Number(raw.timestamp)) ? Number(raw.timestamp) : Date.now();
  return `legacy-${match}-${alliance}-${team}-${position}-${timestamp}-${index}`;
}

function normalizeScoutEntry(raw: Partial<MatchScoutData>, index: number): MatchScoutData {
  const auto = (raw.auto ?? {}) as MatchScoutData['auto'];
  const teleop = (raw.teleop ?? {}) as MatchScoutData['teleop'];
  const endgame = (raw.endgame ?? {}) as MatchScoutData['endgame'];

  return {
    id: buildScoutEntryId(raw, index),
    matchNumber: normalizeMatchLabel(String(raw.matchNumber ?? '')),
    alliance: parseAllianceValue(raw.alliance),
    teamNumber: parsePositiveInteger(raw.teamNumber),
    position: parsePositionValue(raw.position),
    auto: {
      ballCounts: {
        made: parsePositiveInteger(auto?.ballCounts?.made),
        miss: parsePositiveInteger(auto?.ballCounts?.miss),
      },
      preloadBalls: parsePositiveInteger(auto?.preloadBalls),
      towerClimb:
        auto?.towerClimb === 'level1' || auto?.towerClimb === 'failed' ? auto.towerClimb : 'none',
      autoWinner: auto?.autoWinner === 'blue' ? 'blue' : auto?.autoWinner === 'red' ? 'red' : undefined,
    },
    teleop: {
      ballCounts: {
        made: parsePositiveInteger(teleop?.ballCounts?.made),
        miss: parsePositiveInteger(teleop?.ballCounts?.miss),
      },
      cycles: Array.isArray(teleop?.cycles) ? teleop.cycles : [],
    },
    endgame: {
      climb:
        endgame?.climb === 'low' ||
        endgame?.climb === 'mid' ||
        endgame?.climb === 'high' ||
        endgame?.climb === 'failed'
          ? endgame.climb
          : 'none',
      parked: Boolean(endgame?.parked),
      gotDefended:
        endgame?.gotDefended === 'light' || endgame?.gotDefended === 'heavy' ? endgame.gotDefended : 'none',
      playedDefense:
        endgame?.playedDefense === 'light' || endgame?.playedDefense === 'heavy'
          ? endgame.playedDefense
          : 'none',
      notes: typeof endgame?.notes === 'string' ? endgame.notes : '',
      tags: Array.isArray(endgame?.tags) ? endgame.tags.map((tag) => String(tag ?? '')) : [],
      energizedRP: Boolean(endgame?.energizedRP),
      superchargedRP: Boolean(endgame?.superchargedRP),
      traversalRP: Boolean(endgame?.traversalRP),
      matchWin: Boolean(endgame?.matchWin),
      matchTie: Boolean(endgame?.matchTie),
      majorContributor: Boolean(endgame?.majorContributor),
      harmony: Boolean(endgame?.harmony),
      buddy: Boolean(endgame?.buddy),
      coop: Boolean(endgame?.coop),
    },
    timestamp: Number.isFinite(Number(raw.timestamp)) ? Number(raw.timestamp) : Date.now(),
    scoutName: typeof raw.scoutName === 'string' ? raw.scoutName : undefined,
  };
}

function isMeaningfulValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length > 0;
  return true;
}

function normalizeForCompare(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => normalizeForCompare(item))
      .filter((item) => item !== undefined);
    return normalized.length > 0 ? normalized : undefined;
  }
  if (typeof value === 'object') {
    const normalizedEntries = Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => [key, normalizeForCompare(entry)] as const)
      .filter(([, entry]) => entry !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return normalizedEntries.length > 0 ? Object.fromEntries(normalizedEntries) : undefined;
  }
  return value;
}

function stableSerialize(value: unknown): string {
  return JSON.stringify(normalizeForCompare(value) ?? null);
}

function mergeTeamRecords(
  localTeam: TeamData | undefined,
  remoteTeam: TeamData | undefined,
  localFreshness: number,
  remoteFreshness: number
): TeamData | undefined {
  if (!localTeam && !remoteTeam) return undefined;
  if (!localTeam) return remoteTeam;
  if (!remoteTeam) return localTeam;

  const localVersion = localTeam.pitVersion ?? 0;
  const remoteVersion = remoteTeam.pitVersion ?? 0;
  const shouldPreferRemote =
    remoteFreshness > localFreshness ||
    (remoteFreshness === localFreshness && remoteVersion > localVersion);

  const preferred = shouldPreferRemote ? remoteTeam : localTeam;
  const fallback = shouldPreferRemote ? localTeam : remoteTeam;
  const merged: TeamData = { teamNumber: preferred.teamNumber };

  const keys = new Set<keyof TeamData>([
    ...(Object.keys(preferred) as Array<keyof TeamData>),
    ...(Object.keys(fallback) as Array<keyof TeamData>),
  ]);

  keys.forEach((key) => {
    if (key === 'teamNumber') return;
    const preferredValue = preferred[key];
    const fallbackValue = fallback[key];
    (merged as Record<keyof TeamData, unknown>)[key] = isMeaningfulValue(preferredValue)
      ? preferredValue
      : fallbackValue;
  });

  return merged;
}

const unsupportedTeamsColumns = new Set<string>();

function stripUnsupportedTeamsColumns(row: Record<string, unknown>): Record<string, unknown> {
  if (unsupportedTeamsColumns.size === 0) return row;
  const next = { ...row };
  unsupportedTeamsColumns.forEach((column) => {
    delete next[column];
  });
  return next;
}

function extractMissingTeamsColumn(errorMessage: string | undefined): string | null {
  if (!errorMessage) return null;
  const directMatch = errorMessage.match(/column\s+teams\.([a-z0-9_]+)\s+does not exist/i);
  if (directMatch?.[1]) return directMatch[1];

  const schemaCacheMatch = errorMessage.match(/Could not find the '([a-z0-9_]+)' column of 'teams'/i);
  return schemaCacheMatch?.[1] ?? null;
}

async function upsertTeamsWithSchemaFallback(rows: Array<Record<string, unknown>>): Promise<void> {
  if (!supabase || rows.length === 0) return;

  let payload = rows.map(stripUnsupportedTeamsColumns);

  for (let attempt = 0; attempt < 4; attempt++) {
    const { error } = await supabase.from('teams').upsert(payload);
    if (!error) return;

    const missingColumn = extractMissingTeamsColumn(error.message);
    if (!missingColumn || unsupportedTeamsColumns.has(missingColumn)) {
      throw error;
    }

    unsupportedTeamsColumns.add(missingColumn);
    payload = payload.map((row) => {
      const next = { ...row };
      delete next[missingColumn];
      return next;
    });
    console.warn(`Teams column missing in Supabase, skipping '${missingColumn}' until schema is updated.`);
  }
}

export const storage = {
  emitChange(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event('storage:rebuilt:update'));
  },

  async pushLocalToCloud(): Promise<{ scout: number; matches: number; teams: number }> {
    if (typeof window === 'undefined' || !supabase) {
      return { scout: 0, matches: 0, teams: 0 };
    }

    const localScoutData = this.getScoutData();
    const localMatches = this.getMatches();
    const localTeams = this.getTeams();

    const scoutPayload = localScoutData
      .map((d) => {
        const parsedMatchNumber = parseMatchNumber(d.matchNumber);
        if (parsedMatchNumber == null) return null;
        return {
          id: d.id,
          match_number: parsedMatchNumber,
          alliance: d.alliance,
          team_number: d.teamNumber,
          position: `${d.alliance}${d.position}`,
          scout_name: d.scoutName,
          auto_data: d.auto,
          teleop_data: d.teleop,
          endgame_data: d.endgame,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    const matchesPayload = localMatches
      .map((m) => {
        const parsedMatchNumber = parseMatchNumber(m.matchNumber);
        if (parsedMatchNumber == null) return null;
        return {
          match_number: parsedMatchNumber,
          red_1: m.redAlliance[0],
          red_2: m.redAlliance[1],
          red_3: m.redAlliance[2],
          blue_1: m.blueAlliance[0],
          blue_2: m.blueAlliance[1],
          blue_3: m.blueAlliance[2],
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    const teamsPayload: Array<Record<string, unknown>> = localTeams.map((t) => ({
      team_number: t.teamNumber,
      updated_at: new Date().toISOString(),
      team_name: t.teamName,
      city: t.city,
      state_prov: t.stateProv,
      country: t.country,
      robot_photo_url: t.robotPhotoUrl,
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
      endgame_completed: t.endgameCompleted,
      other_communication: t.otherCommunication,
      solo_score_estimate: t.soloScoreEstimate,
    }));

    if (teamsPayload.length > 0) {
      await upsertTeamsWithSchemaFallback(teamsPayload);
    }
    if (matchesPayload.length > 0) {
      await supabase.from('matches').upsert(matchesPayload);
    }
    if (scoutPayload.length > 0) {
      await supabase.from('scout_data').upsert(scoutPayload);
    }

    await this.syncAll();
    return { scout: scoutPayload.length, matches: matchesPayload.length, teams: teamsPayload.length };
  },
  // --- Syncing Logic ---

  async syncAll(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!supabase) return;

    try {
      const localTeams = this.getTeams();
      const localScoutData = this.getScoutData();
      const localMatches = this.getMatches();

      // 1. Sync Teams
      const { data: remoteTeams } = await supabase.from('teams').select('*');
      if (remoteTeams) {
        const mappedRemoteTeams: TeamData[] = remoteTeams.map((t) => ({
          teamNumber: t.team_number,
          teamName: t.team_name ?? undefined,
          city: t.city ?? undefined,
          stateProv: t.state_prov ?? undefined,
          country: t.country ?? undefined,
          hasAutoAim: (t as any).has_auto_aim ?? undefined,
          robotPhotoUrl: t.robot_photo_url ?? undefined,
          mechanismPhotoUrl: (t as any).mechanism_photo_url ?? undefined,
          photoCapturedAt: (t as any).photo_captured_at ? Number((t as any).photo_captured_at) : undefined,
          photoTags: (t as any).photo_tags ?? undefined,
          hasAutoProgram: (t as any).has_auto_program ?? undefined,
          drivetrainType: (t as any).drivetrain_type ?? undefined,
          shooterType: (t as any).shooter_type ?? undefined,
          maxFuelCapacity: (t as any).max_fuel_capacity ?? undefined,
          intakeLocation: (t as any).intake_location ?? undefined,
          autoFlexibility: (t as any).auto_flexibility ?? undefined,
          avgCycleLength: (t as any).avg_cycle_length ?? undefined,
          basicStrats: (t as any).basic_strats ?? undefined,
          canPassUnderTrench: (t as any).can_pass_under_trench ?? undefined,
          canGetStuckOnBump: (t as any).can_get_stuck_on_bump ?? undefined,
          canPlayDefense: (t as any).can_play_defense ?? undefined,
          generalAccuracy: (t as any).general_accuracy ?? undefined,
          climbLevel: (t as any).climb_level ?? undefined,
          mostCommonIssue: (t as any).most_common_issue ?? undefined,
          speedAgilityRating: (t as any).speed_agility_rating ?? undefined,
          drivingAbilityRating: (t as any).driving_ability_rating ?? undefined,
          reliabilityRating: (t as any).reliability_rating ?? undefined,
          defenseRating: (t as any).defense_rating ?? undefined,
          commonFailureMode: (t as any).common_failure_mode ?? undefined,
          failureModeNotes: (t as any).failure_mode_notes ?? undefined,
          averagePitFixTime: (t as any).average_pit_fix_time ?? undefined,
          sparePartsReadiness: (t as any).spare_parts_readiness ?? undefined,
          autoConsistency: (t as any).auto_consistency ?? undefined,
          autoPartnerRequirement: (t as any).auto_partner_requirement ?? undefined,
          cyclePreference: (t as any).cycle_preference ?? undefined,
          defensiveTolerance: (t as any).defensive_tolerance ?? undefined,
          bestAutoSummary: (t as any).best_auto_summary ?? undefined,
          avgTeleopCycleTime: (t as any).avg_teleop_cycle_time ?? undefined,
          roleInPlayoffs: (t as any).role_in_playoffs ?? undefined,
          upgradeWish: (t as any).upgrade_wish ?? undefined,
          interviewQuote: (t as any).interview_quote ?? undefined,
          sourceOfClaims: (t as any).source_of_claims ?? undefined,
          confidenceLevel: (t as any).confidence_level ?? undefined,
          needsRecheck: (t as any).needs_recheck ?? undefined,
          lastPitUpdatedAt: (t as any).last_pit_updated_at ? Number((t as any).last_pit_updated_at) : undefined,
          pitVersion: (t as any).pit_version ?? undefined,
          pitHistory: (t as any).pit_history ?? undefined,
          endgameCompleted: t.endgame_completed ?? undefined,
          otherCommunication: t.other_communication ?? undefined,
          soloScoreEstimate:
            t.solo_score_estimate === null || t.solo_score_estimate === undefined
              ? undefined
              : Number(t.solo_score_estimate),
        }));

        const remoteMap = new Map(mappedRemoteTeams.map((team) => [team.teamNumber, team]));
        const localMap = new Map(localTeams.map((team) => [team.teamNumber, team]));
        const remoteFreshness = new Map<number, number>();

        remoteTeams.forEach((teamRow) => {
          const pitTimestamp = Number((teamRow as any).last_pit_updated_at ?? 0);
          const rowUpdatedAt = Date.parse(String((teamRow as any).updated_at ?? ''));
          const freshness = Number.isFinite(pitTimestamp) && pitTimestamp > 0
            ? pitTimestamp
            : Number.isFinite(rowUpdatedAt)
              ? rowUpdatedAt
              : 0;
          remoteFreshness.set(teamRow.team_number, freshness);
        });

        const allTeamNumbers = new Set<number>([...remoteMap.keys(), ...localMap.keys()]);
        const mergedTeams = Array.from(allTeamNumbers)
          .map((teamNumber) => {
            const localTeam = localMap.get(teamNumber);
            const remoteTeam = remoteMap.get(teamNumber);
            const localFreshness = localTeam?.lastPitUpdatedAt ?? 0;
            const remoteTeamFreshness = remoteFreshness.get(teamNumber) ?? (remoteTeam?.lastPitUpdatedAt ?? 0);
            return mergeTeamRecords(localTeam, remoteTeam, localFreshness, remoteTeamFreshness);
          })
          .filter((team): team is TeamData => Boolean(team))
          .sort((a, b) => a.teamNumber - b.teamNumber);

        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(mergedTeams));
        storage.emitChange();

        const teamsToPush = mergedTeams.filter(
          (team) => stableSerialize(remoteMap.get(team.teamNumber) ?? null) !== stableSerialize(team)
        );
        if (teamsToPush.length > 0) {
          const payload: Array<Record<string, unknown>> = teamsToPush.map((t) => ({
            team_number: t.teamNumber,
            updated_at: new Date().toISOString(),
            team_name: t.teamName,
            city: t.city,
            state_prov: t.stateProv,
            country: t.country,
            robot_photo_url: t.robotPhotoUrl,
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
            endgame_completed: t.endgameCompleted,
            other_communication: t.otherCommunication,
            solo_score_estimate: t.soloScoreEstimate,
          }));
          await upsertTeamsWithSchemaFallback(payload);
        }
      }

      // 2. Sync Scout Data
      const { data: remoteScoutData } = await supabase.from('scout_data').select('*');
      if (remoteScoutData) {
        const mappedRemoteScoutData: MatchScoutData[] = remoteScoutData.flatMap((d) => {
          if (!d?.id || typeof d.team_number !== 'number') return [];
          return [normalizeScoutEntry({
            id: d.id,
            matchNumber: normalizeMatchLabel(d.match_number),
            alliance: parseAllianceValue(d.alliance),
            teamNumber: d.team_number,
            position: parsePositionValue(d.position),
            auto: d.auto_data,
            teleop: d.teleop_data,
            endgame: d.endgame_data,
            timestamp: parseTimestamp(d.created_at),
            scoutName: d.scout_name,
          }, 0)];
        });

        const remoteMap = new Map(mappedRemoteScoutData.map((d) => [d.id, d]));
        const mergedDataMap = new Map(remoteMap);
        localScoutData.forEach((d) => {
          const remote = remoteMap.get(d.id);
          mergedDataMap.set(d.id, { ...remote, ...d, id: d.id });
        });
        const mergedData = Array.from(mergedDataMap.values()).sort((a, b) => a.timestamp - b.timestamp);

        localStorage.setItem(STORAGE_KEYS.SCOUT_DATA, JSON.stringify(mergedData));
        storage.emitChange();

        const scoutToPush = mergedData.filter(
          (d) => stableSerialize(remoteMap.get(d.id) ?? null) !== stableSerialize(d)
        );
        if (scoutToPush.length > 0) {
          const payload = scoutToPush
            .map((d) => {
              const parsedMatchNumber = parseMatchNumber(d.matchNumber);
              if (parsedMatchNumber == null) return null;
              return {
                id: d.id,
                match_number: parsedMatchNumber,
                alliance: d.alliance,
                team_number: d.teamNumber,
                position: `${d.alliance}${d.position}`,
                scout_name: d.scoutName,
                auto_data: d.auto,
                teleop_data: d.teleop,
                endgame_data: d.endgame,
              };
            })
            .filter((row): row is NonNullable<typeof row> => row !== null);
          if (payload.length > 0) {
            await supabase.from('scout_data').upsert(payload);
          }
        }
      }

      // 3. Sync Matches
      const { data: remoteMatches } = await supabase.from('matches').select('*');
      if (remoteMatches) {
        const mappedRemoteMatches: Match[] = remoteMatches.map(m => ({
          matchNumber: normalizeMatchLabel(m.match_number),
          redAlliance: [m.red_1, m.red_2, m.red_3],
          blueAlliance: [m.blue_1, m.blue_2, m.blue_3],
          timestamp: new Date(m.created_at).getTime(),
          status: 'upcoming'
        }));

        const remoteMap = new Map(mappedRemoteMatches.map((m) => [m.matchNumber, m]));
        const mergedMatchesMap = new Map(remoteMap);
        localMatches.forEach((m) => {
          const remote = remoteMap.get(m.matchNumber);
          mergedMatchesMap.set(m.matchNumber, { ...remote, ...m, matchNumber: m.matchNumber });
        });
        const mergedMatches = Array.from(mergedMatchesMap.values()).sort((a, b) => {
          const aNum = parseMatchNumber(a.matchNumber) ?? Number.MAX_SAFE_INTEGER;
          const bNum = parseMatchNumber(b.matchNumber) ?? Number.MAX_SAFE_INTEGER;
          return aNum - bNum;
        });

        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(mergedMatches));
        storage.emitChange();

        const matchesToPush = mergedMatches.filter(
          (m) => stableSerialize(remoteMap.get(m.matchNumber) ?? null) !== stableSerialize(m)
        );
        if (matchesToPush.length > 0) {
          const payload = matchesToPush
            .map((m) => {
              const parsedMatchNumber = parseMatchNumber(m.matchNumber);
              if (parsedMatchNumber == null) return null;
              return {
                match_number: parsedMatchNumber,
                red_1: m.redAlliance[0],
                red_2: m.redAlliance[1],
                red_3: m.redAlliance[2],
                blue_1: m.blueAlliance[0],
                blue_2: m.blueAlliance[1],
                blue_3: m.blueAlliance[2],
              };
            })
            .filter((row): row is NonNullable<typeof row> => row !== null);
          if (payload.length > 0) {
            await supabase.from('matches').upsert(payload);
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync with Supabase:', error);
    }
  },

  // --- Scout Data ---

  getScoutData(): MatchScoutData[] {
    if (typeof window === 'undefined') return [];
    const parsed = readStorageJSON<Array<Partial<MatchScoutData>>>(STORAGE_KEYS.SCOUT_DATA, []);
    const normalized = parsed.map((entry, index) => normalizeScoutEntry(entry, index));
    if (stableSerialize(parsed) !== stableSerialize(normalized)) {
      localStorage.setItem(STORAGE_KEYS.SCOUT_DATA, JSON.stringify(normalized));
    }
    return normalized;
  },

  async saveScoutData(data: MatchScoutData[]): Promise<void> {
    if (typeof window === 'undefined') return;
    const normalizedData = data.map((entry, index) => normalizeScoutEntry(entry, index));
    const previous = this.getScoutData();
    const previousMap = new Map(previous.map((d) => [d.id, d]));
    const changed = normalizedData.filter(
      (d) => stableSerialize(previousMap.get(d.id) ?? null) !== stableSerialize(d)
    );

    localStorage.setItem(STORAGE_KEYS.SCOUT_DATA, JSON.stringify(normalizedData));
    storage.emitChange();

    // Background push latest to Supabase
    if (!supabase) return;

    try {
      if (changed.length > 0) {
        const payload = changed
          .map((d) => {
            const parsedMatchNumber = parseMatchNumber(d.matchNumber);
            if (parsedMatchNumber == null) return null;
            return {
              id: d.id,
              match_number: parsedMatchNumber,
              alliance: d.alliance,
              team_number: d.teamNumber,
              position: `${d.alliance}${d.position}`,
              scout_name: d.scoutName,
              auto_data: d.auto,
              teleop_data: d.teleop,
              endgame_data: d.endgame,
            };
          })
          .filter((row): row is NonNullable<typeof row> => row !== null);
        if (payload.length > 0) {
          await supabase.from('scout_data').upsert(payload);
        }
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
    const parsed = readStorageJSON<Match[]>(STORAGE_KEYS.MATCHES, []);
    return parsed.map((match) => ({
      ...match,
      matchNumber: normalizeMatchLabel(match.matchNumber),
    }));
  },

  async saveMatches(matches: Match[]): Promise<void> {
    if (typeof window === 'undefined') return;
    const normalizedMatches = matches.map((match) => ({
      ...match,
      matchNumber: normalizeMatchLabel(match.matchNumber),
    }));
    const previous = this.getMatches();
    const previousMap = new Map(previous.map((m) => [normalizeMatchLabel(m.matchNumber), m]));
    const changed = normalizedMatches.filter(
      (m) => stableSerialize(previousMap.get(m.matchNumber) ?? null) !== stableSerialize(m)
    );

    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(normalizedMatches));
    storage.emitChange();

    if (!supabase) return;

    try {
      if (changed.length > 0) {
        const payload = changed
          .map((m) => {
            const parsedMatchNumber = parseMatchNumber(m.matchNumber);
            if (parsedMatchNumber == null) return null;
            return {
              match_number: parsedMatchNumber,
              red_1: m.redAlliance[0],
              red_2: m.redAlliance[1],
              red_3: m.redAlliance[2],
              blue_1: m.blueAlliance[0],
              blue_2: m.blueAlliance[1],
              blue_3: m.blueAlliance[2],
            };
          })
          .filter((row): row is NonNullable<typeof row> => row !== null);
        if (payload.length > 0) {
          await supabase.from('matches').upsert(payload);
        }
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
    return readStorageJSON<GameConfig>(STORAGE_KEYS.CONFIG, {
      scoringZones: ['high', 'low'],
      phases: ['auto', 'teleop', 'endgame'],
      normalBallRange: { min: 30, max: 60 },
    });
  },

  saveConfig(config: GameConfig): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    storage.emitChange();
  },

  // --- Teams ---

  getTeams(): TeamData[] {
    if (typeof window === 'undefined') return [];
    return readStorageJSON<TeamData[]>(STORAGE_KEYS.TEAMS, []);
  },

  async saveTeams(teams: TeamData[]): Promise<void> {
    if (typeof window === 'undefined') return;
    const previous = this.getTeams();
    const previousMap = new Map(previous.map((team) => [team.teamNumber, team]));
    const changed = teams.filter((team) => {
      const prev = previousMap.get(team.teamNumber);
      return stableSerialize(prev ?? null) !== stableSerialize(team);
    });

    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    storage.emitChange();

    if (!supabase) return;

    try {
      if (changed.length > 0) {
        const payload: Array<Record<string, unknown>> = changed.map(t => ({
          team_number: t.teamNumber,
          updated_at: new Date().toISOString(),
          team_name: t.teamName,
          city: t.city,
          state_prov: t.stateProv,
          country: t.country,
          robot_photo_url: t.robotPhotoUrl,
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
          endgame_completed: t.endgameCompleted,
          other_communication: t.otherCommunication,
          solo_score_estimate: t.soloScoreEstimate
        }));
        await upsertTeamsWithSchemaFallback(payload);
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
