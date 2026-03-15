'use client';

import { useState, useEffect } from 'react';
import { TeamStats } from '@/types';
import { storage, TeamData } from '@/lib/storage';
import { calculateTeamStats } from '@/lib/stats';

type Option<T extends string> = {
  value: T;
  label: string;
};

const SPEED_OPTIONS: Option<NonNullable<TeamData['speedAgilityRating']>>[] = [
  { value: 'elite', label: 'Elite' },
  { value: 'fast', label: 'Fast' },
  { value: 'average', label: 'Average' },
  { value: 'slow', label: 'Slow' },
];

const DRIVING_OPTIONS: Option<NonNullable<TeamData['drivingAbilityRating']>>[] = [
  { value: 'smooth', label: 'Smooth' },
  { value: 'aggressive', label: 'Aggressive' },
  { value: 'shaky', label: 'Shaky' },
  { value: 'inexperienced', label: 'Inexperienced' },
];

const RELIABILITY_OPTIONS: Option<NonNullable<TeamData['reliabilityRating']>>[] = [
  { value: 'rock_solid', label: 'Rock-solid' },
  { value: 'minor_issues', label: 'Minor issues' },
  { value: 'frequent_issues', label: 'Frequent issues' },
  { value: 'dnp_risk', label: 'DNP risk' },
];

const DEFENSE_OPTIONS: Option<NonNullable<TeamData['defenseRating']>>[] = [
  { value: 'none', label: 'None' },
  { value: 'opportunistic', label: 'Opportunistic' },
  { value: 'dedicated', label: 'Dedicated' },
  { value: 'elite', label: 'Elite' },
];

const YES_NO_UNKNOWN_OPTIONS: Option<'yes' | 'no' | 'not_sure'>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_sure', label: 'Not sure' },
];

const SHOOTER_TYPE_OPTIONS: Option<NonNullable<TeamData['shooterType']>>[] = [
  { value: 'turret', label: 'Turret' },
  { value: 'multi_turret', label: 'Multi-turret' },
  { value: 'other', label: 'Other' },
  { value: 'not_sure', label: 'Unknown' },
];

const INTAKE_LOCATION_OPTIONS: Option<NonNullable<TeamData['intakeLocation']>>[] = [
  { value: 'ground', label: 'Ground' },
  { value: 'outpost', label: 'Outpost' },
  { value: 'both', label: 'Both' },
  { value: 'neither', label: 'Neither' },
  { value: 'not_sure', label: 'Unknown' },
];

const AUTO_FLEX_OPTIONS: Option<NonNullable<TeamData['autoFlexibility']>>[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'not_sure', label: 'Unknown' },
];

const GENERAL_ACCURACY_OPTIONS: Option<NonNullable<TeamData['generalAccuracy']>>[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'not_sure', label: 'Unknown' },
];

const CLIMB_LEVEL_OPTIONS: Option<NonNullable<TeamData['climbLevel']>>[] = [
  { value: 'low', label: 'Low' },
  { value: 'middle', label: 'Middle' },
  { value: 'high', label: 'High' },
  { value: 'not_sure', label: 'Unknown' },
];

const AUTOAIM_OPTIONS: Option<'yes' | 'no' | 'not_sure'>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_sure', label: 'Not sure' },
];

const FAILURE_MODE_OPTIONS: Option<NonNullable<TeamData['commonFailureMode']>>[] = [
  { value: 'brownout', label: 'Brownout' },
  { value: 'chain', label: 'Chain' },
  { value: 'breaker', label: 'Breaker' },
  { value: 'comms', label: 'Comms' },
  { value: 'intake_jam', label: 'Intake jam' },
  { value: 'elevator_bind', label: 'Elevator bind' },
  { value: 'shooter_inconsistency', label: 'Shooter inconsistency' },
  { value: 'auto_fails', label: 'Auto fails' },
  { value: 'other', label: 'Other' },
];

const FIX_TIME_OPTIONS: Option<NonNullable<TeamData['averagePitFixTime']>>[] = [
  { value: '0-5', label: '0-5 min' },
  { value: '5-10', label: '5-10 min' },
  { value: '10-20', label: '10-20 min' },
  { value: '20+', label: '20+ min' },
];

const SPARES_OPTIONS: Option<NonNullable<TeamData['sparePartsReadiness']>>[] = [
  { value: 'fully_stocked', label: 'Fully stocked' },
  { value: 'some', label: 'Some' },
  { value: 'minimal', label: 'Minimal' },
];

const AUTO_CONSISTENCY_OPTIONS: Option<NonNullable<TeamData['autoConsistency']>>[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'unknown', label: 'Unknown' },
];

const AUTO_REQUIREMENT_OPTIONS: Option<NonNullable<TeamData['autoPartnerRequirement']>>[] = [
  { value: 'needs_space', label: 'Needs space' },
  { value: 'needs_clear_lane', label: 'Needs clear lane' },
  { value: 'doesnt_matter', label: "Doesn't matter" },
];

const CYCLE_PREF_OPTIONS: Option<NonNullable<TeamData['cyclePreference']>>[] = [
  { value: 'short_cycles', label: 'Short cycles' },
  { value: 'long_cycles', label: 'Long cycles' },
  { value: 'either', label: 'Either' },
];

const DEF_TOLERANCE_OPTIONS: Option<NonNullable<TeamData['defensiveTolerance']>>[] = [
  { value: 'shrugs_off', label: 'Shrugs off defense' },
  { value: 'slows_bit', label: 'Slows a bit' },
  { value: 'falls_apart', label: 'Falls apart' },
];

const SOURCE_OPTIONS: Option<NonNullable<TeamData['sourceOfClaims']>>[] = [
  { value: 'pit_said', label: 'Pit said' },
  { value: 'observed', label: 'We observed' },
  { value: 'both', label: 'Both' },
];

const CONFIDENCE_OPTIONS: Option<NonNullable<TeamData['confidenceLevel']>>[] = [
  { value: 'certain', label: 'Certain' },
  { value: 'likely', label: 'Likely' },
  { value: 'unsure', label: 'Unsure' },
];

const PIT_FIELDS: Array<keyof TeamData> = [
  'hasAutoProgram',
  'drivetrainType',
  'shooterType',
  'maxFuelCapacity',
  'intakeLocation',
  'autoFlexibility',
  'avgCycleLength',
  'basicStrats',
  'canPassUnderTrench',
  'canGetStuckOnBump',
  'canPlayDefense',
  'generalAccuracy',
  'climbLevel',
  'mostCommonIssue',
  'hasAutoAim',
  'robotPhotoUrl',
  'mechanismPhotoUrl',
  'photoCapturedAt',
  'photoTags',
  'speedAgilityRating',
  'drivingAbilityRating',
  'reliabilityRating',
  'defenseRating',
  'commonFailureMode',
  'failureModeNotes',
  'averagePitFixTime',
  'sparePartsReadiness',
  'autoConsistency',
  'autoPartnerRequirement',
  'cyclePreference',
  'defensiveTolerance',
  'bestAutoSummary',
  'avgTeleopCycleTime',
  'roleInPlayoffs',
  'upgradeWish',
  'interviewQuote',
  'sourceOfClaims',
  'confidenceLevel',
  'needsRecheck',
  'endgameCompleted',
  'otherCommunication',
];

function SingleSelectChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value?: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors y2k-pill ${
              active
                ? 'y2k-button-primary text-white border-primary y2k-orange-glow'
                : 'y2k-panel-soft text-secondary border-secondary/30 hover:border-secondary hover:text-secondary-light'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function getLabel<T extends string>(options: Option<T>[], value: T | undefined): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label || null;
}

function buildPitSummary(team: TeamData | null): string {
  if (!team) return '';
  const chunks: string[] = [];

  const shooter = getLabel(SHOOTER_TYPE_OPTIONS, team.shooterType);
  const intake = getLabel(INTAKE_LOCATION_OPTIONS, team.intakeLocation);
  const autoFlex = getLabel(AUTO_FLEX_OPTIONS, team.autoFlexibility);
  const autoaim = getLabel(AUTOAIM_OPTIONS, team.hasAutoAim);
  const accuracy = getLabel(GENERAL_ACCURACY_OPTIONS, team.generalAccuracy);
  const climb = getLabel(CLIMB_LEVEL_OPTIONS, team.climbLevel);

  if (shooter) chunks.push(`shooter: ${shooter}`);
  if (intake) chunks.push(`intake: ${intake}`);
  if (autoaim) chunks.push(`autoaim: ${autoaim}`);
  if (autoFlex && team.hasAutoProgram !== 'no') chunks.push(`auto flex: ${autoFlex}`);
  if (accuracy) chunks.push(`accuracy: ${accuracy}`);
  if (climb) chunks.push(`climb: ${climb}`);

  if (chunks.length === 0) {
    const speed = getLabel(SPEED_OPTIONS, team.speedAgilityRating);
    if (speed) chunks.push(`${speed} speed`);
  }

  return chunks.join(' · ');
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeFitMetrics(team: TeamData | null): {
  offenseFit: number;
  defenseFit: number;
  endgameValue: number;
  reliabilityRisk: 'Low' | 'Medium' | 'High';
} {
  if (!team) {
    return { offenseFit: 0, defenseFit: 0, endgameValue: 0, reliabilityRisk: 'High' };
  }

  const speedScore: Record<NonNullable<TeamData['speedAgilityRating']>, number> = {
    elite: 30,
    fast: 24,
    average: 16,
    slow: 8,
  };
  const reliabilityScore: Record<NonNullable<TeamData['reliabilityRating']>, number> = {
    rock_solid: 30,
    minor_issues: 22,
    frequent_issues: 12,
    dnp_risk: 4,
  };
  const defenseScore: Record<NonNullable<TeamData['defenseRating']>, number> = {
    none: 8,
    opportunistic: 16,
    dedicated: 26,
    elite: 34,
  };
  const autoScore: Record<NonNullable<TeamData['autoConsistency']>, number> = {
    high: 20,
    medium: 12,
    low: 6,
    unknown: 8,
  };

  const offenseFit = clamp(
    (team.speedAgilityRating ? speedScore[team.speedAgilityRating] : 10) +
      (team.reliabilityRating ? reliabilityScore[team.reliabilityRating] : 12) +
      (team.autoConsistency ? autoScore[team.autoConsistency] : 10),
    0,
    100
  );

  const defenseFit = clamp(
    (team.defenseRating ? defenseScore[team.defenseRating] : 8) +
      (team.defensiveTolerance === 'shrugs_off' ? 26 : team.defensiveTolerance === 'slows_bit' ? 16 : 8),
    0,
    100
  );

  const climbScore = team.climbLevel === 'high' ? 35 : team.climbLevel === 'middle' ? 25 : team.climbLevel === 'low' ? 12 : 18;
  const endgameValue = clamp(
    climbScore +
      (team.endgameCompleted?.toLowerCase().includes('high') ? 25 : 0) +
      (team.endgameCompleted?.toLowerCase().includes('trap') ? 20 : 0) +
      (team.soloScoreEstimate ? Math.min(25, Math.round(team.soloScoreEstimate / 4)) : 10),
    0,
    100
  );

  const riskPoints =
    (team.reliabilityRating === 'dnp_risk' ? 4 : 0) +
    (team.reliabilityRating === 'frequent_issues' ? 3 : 0) +
    (team.averagePitFixTime === '20+' ? 3 : team.averagePitFixTime === '10-20' ? 2 : 0) +
    (team.sparePartsReadiness === 'minimal' ? 2 : 0) +
    (team.confidenceLevel === 'unsure' ? 2 : 0);

  const reliabilityRisk: 'Low' | 'Medium' | 'High' = riskPoints >= 5 ? 'High' : riskPoints >= 3 ? 'Medium' : 'Low';

  return { offenseFit, defenseFit, endgameValue, reliabilityRisk };
}

function formatTimestamp(timestamp?: number): string {
  if (!timestamp) return 'Not updated yet';
  return new Date(timestamp).toLocaleString();
}

function shouldAutoFlagRecheck(teamNumber: number, data: ReturnType<typeof storage.getScoutData>): boolean {
  const teamMatches = data
    .filter((match) => match.teamNumber === teamNumber)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (teamMatches.length === 0) return false;

  const recent = teamMatches.slice(-3);
  const hasRecentDnp = recent.some((match) => {
    const notes = String(match.endgame?.notes ?? '').toLowerCase();
    const tags = Array.isArray(match.endgame?.tags) ? match.endgame.tags : [];
    return notes.includes('dnp') || tags.some((tag) => String(tag ?? '').toLowerCase().includes('dnp'));
  });
  if (hasRecentDnp) return true;

  if (teamMatches.length < 5) return false;

  const totals = teamMatches.map((match) => match.auto.ballCounts.made + match.teleop.ballCounts.made);
  const recentAvg = totals.slice(-2).reduce((sum, value) => sum + value, 0) / 2;
  const baselineValues = totals.slice(0, -2);
  const baselineAvg =
    baselineValues.reduce((sum, value) => sum + value, 0) / Math.max(1, baselineValues.length);

  if (baselineAvg <= 0) return false;
  return Math.abs(recentAvg - baselineAvg) / baselineAvg >= 0.35;
}

export default function TeamsScreen() {
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [importedTeams, setImportedTeams] = useState<TeamData[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'stats' | 'imported'>('stats');

  useEffect(() => {
    loadTeams();
    const handleUpdate = () => loadTeams();
    window.addEventListener('storage:rebuilt:update', handleUpdate);
    return () => window.removeEventListener('storage:rebuilt:update', handleUpdate);
  }, []);

  const loadTeams = () => {
    const imported = storage.getTeams();
    const scoutData = storage.getScoutData();
    const recheckedTeams = imported.map((team) => {
      if (team.needsRecheck) return team;
      if (!shouldAutoFlagRecheck(team.teamNumber, scoutData)) return team;
      return { ...team, needsRecheck: true };
    });
    const changed = recheckedTeams.some((team, idx) => team !== imported[idx]);
    if (changed) {
      void storage.saveTeams(recheckedTeams);
    }
    setImportedTeams(recheckedTeams);

    const uniqueTeams = Array.from(new Set(scoutData.map((d) => d.teamNumber)));
    const teamStats = uniqueTeams.map((teamNum) => calculateTeamStats(teamNum, scoutData));
    setTeams(teamStats.sort((a, b) => b.displayRating - a.displayRating));
  };

  const filteredTeams = teams.filter((team) => team.teamNumber.toString().includes(searchQuery));

  const selectedTeamStats = selectedTeam ? teams.find((t) => t.teamNumber === selectedTeam) : null;

  const selectedTeamData = selectedTeam
    ? importedTeams.find((t) => t.teamNumber === selectedTeam) || null
    : null;

  const updateSelectedTeamFields = async (partial: Partial<TeamData>) => {
    if (selectedTeam == null) return;

    const nextImportedTeams = [...importedTeams];
    const idx = nextImportedTeams.findIndex((t) => t.teamNumber === selectedTeam);
    const existing = idx === -1 ? ({ teamNumber: selectedTeam } as TeamData) : nextImportedTeams[idx];

    const next: TeamData = { ...existing, ...partial, teamNumber: selectedTeam };
    const changedKeys = Object.keys(partial) as Array<keyof TeamData>;
    const touchedPitData = changedKeys.some((key) => PIT_FIELDS.includes(key));

    if (touchedPitData) {
      const timestamp = Date.now();
      const summary = buildPitSummary(next) || 'Pit data updated';
      next.lastPitUpdatedAt = timestamp;
      next.pitVersion = (existing.pitVersion ?? 0) + 1;
      next.pitHistory = [{ timestamp, summary }, ...(existing.pitHistory || [])].slice(0, 10);
    }

    if (idx === -1) {
      nextImportedTeams.push(next);
    } else {
      nextImportedTeams[idx] = next;
    }

    setImportedTeams(nextImportedTeams);
    await storage.saveTeams(nextImportedTeams);
  };

  const updateSelectedTeamField = async (field: keyof TeamData, value: TeamData[keyof TeamData]) => {
    await updateSelectedTeamFields({ [field]: value } as Partial<TeamData>);
  };

  const handlePhotoUpload = async (
    field: 'robotPhotoUrl' | 'mechanismPhotoUrl',
    file: File | undefined,
    tag: string
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const nextTags = Array.from(new Set([...(selectedTeamData?.photoTags || []), tag]));
      await updateSelectedTeamFields({
        [field]: result,
        photoCapturedAt: Date.now(),
        photoTags: nextTags,
      });
    };
    reader.readAsDataURL(file);
  };

  const fit = computeFitMetrics(selectedTeamData);
  const pitSummary = buildPitSummary(selectedTeamData);
  const showAutoFields = selectedTeamData?.hasAutoProgram !== 'no';

  if (selectedTeam !== null) {
    return (
      <div className="teams-y2k p-4 space-y-6">
        <button onClick={() => setSelectedTeam(null)} className="text-primary font-semibold mb-4">
          ← Back to Teams
        </button>

        <div className="bg-card rounded-lg p-4 border-2 border-primary/20 shadow-sm space-y-3">
          <h1 className="text-2xl font-bold text-primary mb-1">Team {selectedTeam ?? ''}</h1>
          {selectedTeamStats?.teamName && <p className="text-gray-600">{selectedTeamStats.teamName}</p>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Team Name</label>
              <input
                type="text"
                defaultValue={selectedTeamData?.teamName}
                onBlur={(e) => updateSelectedTeamField('teamName', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. RoboLions"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Pit Summary</label>
              <div className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-gray-50 text-gray-700 min-h-[40px]">
                {pitSummary || 'Add structured tags to auto-generate summary'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 border-2 border-primary/30 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Scouting Prompts</h2>
          <p className="text-sm text-gray-600">Core robot capabilities and match fit.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Has auto?</label>
              <SingleSelectChips
                options={YES_NO_UNKNOWN_OPTIONS}
                value={selectedTeamData?.hasAutoProgram}
                onChange={(value) => updateSelectedTeamField('hasAutoProgram', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Drivetrain type</label>
              <input
                type="text"
                defaultValue={selectedTeamData?.drivetrainType}
                onBlur={(e) => updateSelectedTeamField('drivetrainType', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. West Coast, swerve"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Shooter type</label>
              <SingleSelectChips
                options={SHOOTER_TYPE_OPTIONS}
                value={selectedTeamData?.shooterType}
                onChange={(value) => updateSelectedTeamField('shooterType', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max fuel capacity</label>
              <input
                type="text"
                defaultValue={selectedTeamData?.maxFuelCapacity}
                onBlur={(e) => updateSelectedTeamField('maxFuelCapacity', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. 6"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Intake location</label>
              <SingleSelectChips
                options={INTAKE_LOCATION_OPTIONS}
                value={selectedTeamData?.intakeLocation}
                onChange={(value) => updateSelectedTeamField('intakeLocation', value)}
              />
            </div>
            {showAutoFields && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Auto flexibility</label>
                <SingleSelectChips
                  options={AUTO_FLEX_OPTIONS}
                  value={selectedTeamData?.autoFlexibility}
                  onChange={(value) => updateSelectedTeamField('autoFlexibility', value)}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Avg cycle length</label>
              <input
                type="text"
                defaultValue={selectedTeamData?.avgCycleLength}
                onBlur={(e) => updateSelectedTeamField('avgCycleLength', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. 18s"
              />
              <span className="text-xs text-gray-500 mt-1 block">When uninterrupted</span>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Basic strats</label>
              <textarea
                defaultValue={selectedTeamData?.basicStrats}
                onBlur={(e) => updateSelectedTeamField('basicStrats', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none"
                rows={3}
                placeholder="How they want to play the match"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Can pass under trench?</label>
              <SingleSelectChips
                options={YES_NO_UNKNOWN_OPTIONS}
                value={selectedTeamData?.canPassUnderTrench}
                onChange={(value) => updateSelectedTeamField('canPassUnderTrench', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Can get stuck on bump?</label>
              <SingleSelectChips
                options={YES_NO_UNKNOWN_OPTIONS}
                value={selectedTeamData?.canGetStuckOnBump}
                onChange={(value) => updateSelectedTeamField('canGetStuckOnBump', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Has autoaim?</label>
              <SingleSelectChips
                options={AUTOAIM_OPTIONS}
                value={selectedTeamData?.hasAutoAim}
                onChange={(value) => updateSelectedTeamField('hasAutoAim', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Can play defense?</label>
              <SingleSelectChips
                options={YES_NO_UNKNOWN_OPTIONS}
                value={selectedTeamData?.canPlayDefense}
                onChange={(value) => updateSelectedTeamField('canPlayDefense', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">General accuracy</label>
              <SingleSelectChips
                options={GENERAL_ACCURACY_OPTIONS}
                value={selectedTeamData?.generalAccuracy}
                onChange={(value) => updateSelectedTeamField('generalAccuracy', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Can climb?</label>
              <SingleSelectChips
                options={CLIMB_LEVEL_OPTIONS}
                value={selectedTeamData?.climbLevel}
                onChange={(value) => updateSelectedTeamField('climbLevel', value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Freshness & Confidence</h2>
            <button
              type="button"
              onClick={() => updateSelectedTeamField('needsRecheck', !(selectedTeamData?.needsRecheck || false))}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                selectedTeamData?.needsRecheck
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : 'bg-green-100 text-green-700 border-green-300'
              }`}
            >
              {selectedTeamData?.needsRecheck ? 'Needs recheck' : 'Up to date'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Source</label>
              <SingleSelectChips
                options={SOURCE_OPTIONS}
                value={selectedTeamData?.sourceOfClaims}
                onChange={(value) => updateSelectedTeamField('sourceOfClaims', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Confidence</label>
              <SingleSelectChips
                options={CONFIDENCE_OPTIONS}
                value={selectedTeamData?.confidenceLevel}
                onChange={(value) => updateSelectedTeamField('confidenceLevel', value)}
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {formatTimestamp(selectedTeamData?.lastPitUpdatedAt)} | Version: {selectedTeamData?.pitVersion || 0}
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Photo Capture</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600">Full robot photo</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoUpload('robotPhotoUrl', e.target.files?.[0], 'front')}
                className="w-full text-xs"
              />
              <input
                type="url"
                defaultValue={selectedTeamData?.robotPhotoUrl}
                onBlur={(e) => updateSelectedTeamField('robotPhotoUrl', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="Or paste image URL"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600">Mechanism close-up</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoUpload('mechanismPhotoUrl', e.target.files?.[0], 'mechanism')}
                className="w-full text-xs"
              />
              <input
                type="url"
                defaultValue={selectedTeamData?.mechanismPhotoUrl}
                onBlur={(e) => updateSelectedTeamField('mechanismPhotoUrl', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="Or paste mechanism image URL"
              />
            </div>
          </div>
          {selectedTeamData?.photoCapturedAt && (
            <div className="text-xs text-gray-500">
              Captured: {formatTimestamp(selectedTeamData.photoCapturedAt)}
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Structured Performance Tags</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Speed / agility</label>
              <SingleSelectChips
                options={SPEED_OPTIONS}
                value={selectedTeamData?.speedAgilityRating}
                onChange={(value) => updateSelectedTeamField('speedAgilityRating', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Driving ability</label>
              <SingleSelectChips
                options={DRIVING_OPTIONS}
                value={selectedTeamData?.drivingAbilityRating}
                onChange={(value) => updateSelectedTeamField('drivingAbilityRating', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Reliability</label>
              <SingleSelectChips
                options={RELIABILITY_OPTIONS}
                value={selectedTeamData?.reliabilityRating}
                onChange={(value) => updateSelectedTeamField('reliabilityRating', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Defense</label>
              <SingleSelectChips
                options={DEFENSE_OPTIONS}
                value={selectedTeamData?.defenseRating}
                onChange={(value) => updateSelectedTeamField('defenseRating', value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Extra notes</label>
            <textarea
              defaultValue={selectedTeamData?.otherCommunication}
              onBlur={(e) => updateSelectedTeamField('otherCommunication', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none"
              rows={3}
              placeholder="Optional notes for anything not covered by tags"
            />
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Failure Modes & Recovery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Common failure mode</label>
              <SingleSelectChips
                options={FAILURE_MODE_OPTIONS}
                value={selectedTeamData?.commonFailureMode}
                onChange={(value) => updateSelectedTeamField('commonFailureMode', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Average pit fix time</label>
              <SingleSelectChips
                options={FIX_TIME_OPTIONS}
                value={selectedTeamData?.averagePitFixTime}
                onChange={(value) => updateSelectedTeamField('averagePitFixTime', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Spare parts readiness</label>
              <SingleSelectChips
                options={SPARES_OPTIONS}
                value={selectedTeamData?.sparePartsReadiness}
                onChange={(value) => updateSelectedTeamField('sparePartsReadiness', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Failure notes</label>
              <input
                type="text"
                defaultValue={selectedTeamData?.failureModeNotes}
                onBlur={(e) => updateSelectedTeamField('failureModeNotes', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="Optional details"
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Strategic Constraints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showAutoFields && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Auto consistency</label>
                <SingleSelectChips
                  options={AUTO_CONSISTENCY_OPTIONS}
                  value={selectedTeamData?.autoConsistency}
                  onChange={(value) => updateSelectedTeamField('autoConsistency', value)}
                />
              </div>
            )}
            {showAutoFields && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Auto partner requirement</label>
                <SingleSelectChips
                  options={AUTO_REQUIREMENT_OPTIONS}
                  value={selectedTeamData?.autoPartnerRequirement}
                  onChange={(value) => updateSelectedTeamField('autoPartnerRequirement', value)}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cycle preference</label>
              <SingleSelectChips
                options={CYCLE_PREF_OPTIONS}
                value={selectedTeamData?.cyclePreference}
                onChange={(value) => updateSelectedTeamField('cyclePreference', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Defensive tolerance</label>
              <SingleSelectChips
                options={DEF_TOLERANCE_OPTIONS}
                value={selectedTeamData?.defensiveTolerance}
                onChange={(value) => updateSelectedTeamField('defensiveTolerance', value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Pit Interview Prompts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {showAutoFields && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Best auto + start position</label>
                <input
                  type="text"
                  defaultValue={selectedTeamData?.bestAutoSummary}
                  onBlur={(e) => updateSelectedTeamField('bestAutoSummary', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  placeholder="What is your best auto and where do you start?"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Avg teleop cycle time</label>
              <input
                type="text"
                defaultValue={selectedTeamData?.avgTeleopCycleTime}
                onBlur={(e) => updateSelectedTeamField('avgTeleopCycleTime', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="When uninterrupted"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">#1 thing that breaks</label>
              <input
                type="text"
                defaultValue={selectedTeamData?.mostCommonIssue}
                onBlur={(e) => updateSelectedTeamField('mostCommonIssue', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="Most common issue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">One overnight upgrade</label>
              <input
                type="text"
                defaultValue={selectedTeamData?.upgradeWish}
                onBlur={(e) => updateSelectedTeamField('upgradeWish', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="What would they improve first?"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Preferred playoff role</label>
              <input
                type="text"
                defaultValue={selectedTeamData?.roleInPlayoffs}
                onBlur={(e) => updateSelectedTeamField('roleInPlayoffs', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="What role do they want in playoffs?"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Quote</label>
              <input
                type="text"
                defaultValue={selectedTeamData?.interviewQuote}
                onBlur={(e) => updateSelectedTeamField('interviewQuote', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="Optional direct quote"
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Alliance Fit Scores</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-border">
              <div className="text-xs text-gray-600">Offense fit</div>
              <div className="text-xl font-bold text-gray-800">{fit.offenseFit}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-border">
              <div className="text-xs text-gray-600">Defense fit</div>
              <div className="text-xl font-bold text-gray-800">{fit.defenseFit}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-border">
              <div className="text-xs text-gray-600">Endgame value</div>
              <div className="text-xl font-bold text-gray-800">{fit.endgameValue}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-border">
              <div className="text-xs text-gray-600">Reliability risk</div>
              <div className={`text-xl font-bold ${fit.reliabilityRisk === 'High' ? 'text-red-700' : fit.reliabilityRisk === 'Medium' ? 'text-amber-700' : 'text-green-700'}`}>
                {fit.reliabilityRisk}
              </div>
            </div>
          </div>
        </div>

        {selectedTeamData?.pitHistory && selectedTeamData.pitHistory.length > 0 && (
          <div className="bg-card rounded-lg p-4 border border-border space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">Version History</h2>
            {selectedTeamData.pitHistory.slice(0, 6).map((entry, idx) => (
              <div key={`${entry.timestamp}-${idx}`} className="text-xs text-gray-600 border-b border-gray-100 pb-2">
                <span className="font-semibold">{new Date(entry.timestamp).toLocaleString()}</span>: {entry.summary}
              </div>
            ))}
          </div>
        )}

        {selectedTeamStats && (
          <div className="bg-card rounded-lg p-4 border border-border">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Live Match Stats Snapshot</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="text-xs text-gray-600 mb-1">Model Rating</div>
                <div className="text-lg font-bold text-primary">{selectedTeamStats.displayRating.toFixed(1)}</div>
                <div className="text-[10px] text-gray-500">
                  Manual {selectedTeamStats.manualRating.toFixed(1)} · Synthetic {selectedTeamStats.syntheticRating.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Matches</div>
                <div className="text-lg font-bold text-gray-800">{selectedTeamStats.matches.length}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Accuracy</div>
                <div className="text-lg font-bold text-gray-800">{selectedTeamStats.accuracy.toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Climb Rate</div>
                <div className="text-lg font-bold text-gray-800">{selectedTeamStats.climbSuccessRate.toFixed(0)}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (viewMode === 'imported') {
    const filteredImported = importedTeams.filter(
      (team) =>
        team.teamNumber.toString().includes(searchQuery) ||
        team.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="teams-y2k p-4 space-y-4">
        <div className="bg-card y2k-outline rounded-none p-4 border-2 border-primary/20 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-primary">Dashboard Log</h1>
            <span className="text-sm text-gray-600">{importedTeams.length} teams</span>
          </div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode('stats')}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-none hover:bg-gray-300 transition-colors text-sm"
            >
              Stats View
            </button>
            <button
              onClick={() => setViewMode('imported')}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-none hover:bg-primary-dark transition-colors text-sm"
            >
              Imported Teams
            </button>
          </div>
          <input
            type="text"
            placeholder="Search team number or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        {filteredImported.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {importedTeams.length === 0
              ? 'No teams imported yet. Import teams in Settings!'
              : 'No teams found matching your search.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredImported.map((team) => {
              const stats = teams.find((t) => t.teamNumber === team.teamNumber);
              const teamFit = computeFitMetrics(team);
              const scouted = Boolean(team.lastPitUpdatedAt || team.pitVersion);
              return (
                <button
                  key={team.teamNumber}
                  type="button"
                  onClick={() => setSelectedTeam(team.teamNumber)}
                  className={`w-full text-left bg-card rounded-none p-4 border-2 shadow-sm hover:bg-gray-50 transition-colors ${
                    scouted ? 'border-orange-400 bg-orange-50/40' : 'border-primary/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xl font-bold text-gray-800">Team {team.teamNumber}</div>
                      {team.teamName && <div className="text-sm text-gray-600 font-medium">{team.teamName}</div>}
                      {(team.city || team.stateProv) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {team.city}
                          {team.city && team.stateProv ? ', ' : ''}
                          {team.stateProv}
                        </div>
                      )}
                    </div>
                    {stats && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{stats.displayRating.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Model</div>
                        {scouted && <div className="text-xs font-semibold text-orange-700 mt-1">Scouted</div>}
                      </div>
                    )}
                  </div>
                  {(team.shooterType || team.intakeLocation || team.hasAutoAim || team.climbLevel) && (
                    <div className="flex flex-wrap gap-2 text-xs mt-3 pt-3 border-t border-gray-200">
                      {team.shooterType && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded font-medium">
                          Shooter: {getLabel(SHOOTER_TYPE_OPTIONS, team.shooterType)}
                        </span>
                      )}
                      {team.intakeLocation && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded font-medium">
                          Intake: {getLabel(INTAKE_LOCATION_OPTIONS, team.intakeLocation)}
                        </span>
                      )}
                      {team.hasAutoAim && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded font-medium">
                          Autoaim: {getLabel(AUTOAIM_OPTIONS, team.hasAutoAim)}
                        </span>
                      )}
                      {team.climbLevel && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded font-medium">
                          Climb: {getLabel(CLIMB_LEVEL_OPTIONS, team.climbLevel)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
                    <div>
                      <span className="font-semibold">{teamFit.offenseFit}</span> offense
                    </div>
                    <div>
                      <span className="font-semibold">{teamFit.defenseFit}</span> defense
                    </div>
                    <div>
                      <span className="font-semibold">{teamFit.endgameValue}</span> endgame
                    </div>
                    <div>
                      <span className="font-semibold">{teamFit.reliabilityRisk}</span> risk
                    </div>
                  </div>
                  {team.needsRecheck && (
                    <div className="text-xs text-red-700 mt-2 font-semibold">Needs recheck before next match</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="teams-y2k p-4 space-y-4">
      <div className="bg-card y2k-outline rounded-none p-4 border-2 border-primary/20 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <span className="text-sm text-gray-600">{teams.length} teams scouted</span>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('stats')}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-none hover:bg-primary-dark transition-colors text-sm"
          >
            Stats View
          </button>
          <button
            onClick={() => setViewMode('imported')}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-none hover:bg-gray-300 transition-colors text-sm"
          >
            Imported Teams ({importedTeams.length})
          </button>
        </div>
        <input
          type="text"
          placeholder="Search team number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg"
        />
      </div>

      {filteredTeams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {teams.length === 0
            ? 'No teams scouted yet. Start scouting matches!'
            : 'No teams found matching your search.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTeams.map((team) => {
            const teamData = importedTeams.find((t) => t.teamNumber === team.teamNumber);
            const scouted = Boolean(teamData?.lastPitUpdatedAt || teamData?.pitVersion);
            return (
              <button
                key={team.teamNumber}
                onClick={() => setSelectedTeam(team.teamNumber)}
                className={`w-full bg-card rounded-none p-4 border text-left hover:bg-gray-50 transition-colors ${
                  scouted ? 'border-orange-400 bg-orange-50/40' : 'border-border'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xl font-bold text-gray-800">Team {team.teamNumber}</div>
                    {team.teamName && <div className="text-sm text-gray-600">{team.teamName}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{team.displayRating.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">Model</div>
                    {scouted && <div className="text-xs font-semibold text-orange-700 mt-1">Scouted</div>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-semibold">{team.avgAutoBalls.toFixed(1)}</span> auto
                  </div>
                  <div>
                    <span className="font-semibold">{team.avgTeleopBalls.toFixed(1)}</span> teleop
                  </div>
                  <div>
                    <span className="font-semibold">{team.accuracy.toFixed(0)}%</span> acc
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {team.matches.length} match{team.matches.length !== 1 ? 'es' : ''}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
