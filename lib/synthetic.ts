import { Match, MatchScoutData } from '@/types';
import { TeamEventSignal } from './statbotics';

function seedFromString(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededUnit(seed: string): number {
  const n = seedFromString(seed);
  return (n % 10000) / 10000;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeMap(values: Map<number, number | undefined>): Map<number, number> {
  const present = Array.from(values.values()).filter((v): v is number => typeof v === 'number');
  if (present.length === 0) {
    return new Map(Array.from(values.keys()).map((k) => [k, 0.5]));
  }

  const min = Math.min(...present);
  const max = Math.max(...present);
  const span = Math.max(0.0001, max - min);

  return new Map(
    Array.from(values.entries()).map(([team, value]) => [
      team,
      typeof value === 'number' ? (value - min) / span : 0.5,
    ])
  );
}

export interface SyntheticSeedOptions {
  eventKey: string;
  matches: Match[];
  existingScoutData: MatchScoutData[];
  statboticsSignals: TeamEventSignal[];
  tbaOprs: Record<string, number>;
  tbaDprs: Record<string, number>;
  targetAllianceFuel: number;
  teleopMissRate?: number;
}

export function buildSyntheticScoutData(options: SyntheticSeedOptions): MatchScoutData[] {
  const {
    eventKey,
    matches,
    existingScoutData,
    statboticsSignals,
    tbaOprs,
    tbaDprs,
    targetAllianceFuel,
    teleopMissRate = 0.14,
  } = options;

  const signalByTeam = new Map<number, TeamEventSignal>(
    statboticsSignals.map((signal) => [signal.teamNumber, signal])
  );

  const allTeams = new Set<number>();
  matches.forEach((m) => {
    m.redAlliance.forEach((t) => allTeams.add(t));
    m.blueAlliance.forEach((t) => allTeams.add(t));
  });

  const epaRaw = new Map<number, number | undefined>();
  const oprRaw = new Map<number, number | undefined>();
  const dprRaw = new Map<number, number | undefined>();

  allTeams.forEach((team) => {
    const signal = signalByTeam.get(team);
    epaRaw.set(team, signal?.currentNormEPA ?? signal?.totalPointsMean);
    oprRaw.set(team, tbaOprs[`frc${team}`]);
    dprRaw.set(team, tbaDprs[`frc${team}`]);
  });

  const epaNorm = normalizeMap(epaRaw);
  const oprNorm = normalizeMap(oprRaw);
  const dprNorm = normalizeMap(dprRaw);

  const blendedPower = new Map<number, number>();
  allTeams.forEach((team) => {
    const epa = epaNorm.get(team) ?? 0.5;
    const opr = oprNorm.get(team) ?? 0.5;
    const dpr = dprNorm.get(team) ?? 0.5;
    blendedPower.set(team, (epa + opr + dpr) / 3);
  });

  const oldReal = existingScoutData.filter((d) => !d.id.startsWith('synthetic-'));
  const synthetic: MatchScoutData[] = [];

  const makeAllianceRows = (
    alliance: 'red' | 'blue',
    teams: number[],
    matchNumber: string,
    allianceFuel: number,
    didWin: boolean,
    didTie: boolean
  ) => {
    const baseWeights = teams.map((team) => (blendedPower.get(team) ?? 0.5) + 0.2);
    const totalWeight = baseWeights.reduce((sum, v) => sum + v, 0) || 1;

    teams.forEach((team, i) => {
      const power = blendedPower.get(team) ?? 0.5;
      const weight = baseWeights[i] / totalWeight;
      const jitter = (seededUnit(`${eventKey}-${matchNumber}-${alliance}-${team}-j`) - 0.5) * 18;

      const teleopMade = clamp(Math.round(allianceFuel * weight + jitter), 0, 220);
      const autoMade = clamp(
        Math.round(teleopMade * (0.15 + power * 0.08) + (seededUnit(`${matchNumber}-${team}-a`) - 0.5) * 4),
        0,
        90
      );
      const teleopMiss = Math.round(teleopMade * teleopMissRate);
      const autoMiss = Math.round(autoMade * (teleopMissRate * 0.8));
      const cycleCount = clamp(Math.round(teleopMade / 8), 4, 20);
      const avgCycleBalls = cycleCount > 0 ? teleopMade / cycleCount : 0;

      const cycles = Array.from({ length: cycleCount }).map((_, idx) => {
        const cycleJitter = (seededUnit(`${matchNumber}-${team}-c-${idx}`) - 0.5) * 2;
        const start = 135 - idx * 7;
        const end = Math.max(0, start - (6 + Math.floor(seededUnit(`${matchNumber}-${team}-t-${idx}`) * 4)));
        return {
          id: `${matchNumber}-${team}-cycle-${idx + 1}`,
          startTime: start,
          endTime: end,
          ballsScored: clamp(Math.round(avgCycleBalls + cycleJitter), 0, 18),
        };
      });

      synthetic.push({
        id: `synthetic-${eventKey}-${matchNumber}-${alliance}-${team}`,
        matchNumber,
        alliance,
        teamNumber: team,
        position: ((i + 1) as 1 | 2 | 3),
        auto: {
          ballCounts: { made: autoMade, miss: autoMiss },
          preloadBalls: clamp(Math.round(2 + power * 2), 0, 8),
          towerClimb: power > 0.66 ? 'level1' : 'none',
          autoWinner: undefined,
        },
        teleop: {
          ballCounts: { made: teleopMade, miss: teleopMiss },
          cycles,
        },
        endgame: {
          climb: power > 0.82 ? 'high' : power > 0.6 ? 'mid' : 'none',
          parked: power <= 0.6,
          gotDefended: power > 0.75 ? 'light' : 'heavy',
          playedDefense: power < 0.45 ? 'heavy' : power < 0.6 ? 'light' : 'none',
          notes: `Synthetic seed from OPR + DPR + EPA (${eventKey})`,
          tags: ['synthetic', 'rating-test'],
          energizedRP: allianceFuel >= 100,
          superchargedRP: allianceFuel >= 360,
          traversalRP: power > 0.7,
          matchWin: didWin,
          matchTie: didTie,
          majorContributor: weight >= 0.34,
        },
        timestamp: Date.now(),
        scoutName: 'SIM',
      });
    });
  };

  matches.forEach((match) => {
    if (match.redAlliance.length !== 3 || match.blueAlliance.length !== 3) return;

    const redPower = match.redAlliance.reduce((sum, t) => sum + (blendedPower.get(t) ?? 0.5), 0);
    const bluePower = match.blueAlliance.reduce((sum, t) => sum + (blendedPower.get(t) ?? 0.5), 0);
    const totalPower = redPower + bluePower || 1;

    const baseVariance = targetAllianceFuel * 0.09;
    const redVariance = (seededUnit(`${eventKey}-${match.matchNumber}-red`) - 0.5) * baseVariance;
    const blueVariance = (seededUnit(`${eventKey}-${match.matchNumber}-blue`) - 0.5) * baseVariance;

    const redFuel = clamp(
      Math.round(targetAllianceFuel * (0.75 + redPower / totalPower) + redVariance),
      45,
      520
    );
    const blueFuel = clamp(
      Math.round(targetAllianceFuel * (0.75 + bluePower / totalPower) + blueVariance),
      45,
      520
    );

    const isTie = redFuel === blueFuel;
    makeAllianceRows('red', match.redAlliance, match.matchNumber, redFuel, redFuel > blueFuel, isTie);
    makeAllianceRows('blue', match.blueAlliance, match.matchNumber, blueFuel, blueFuel > redFuel, isTie);
  });

  return [...oldReal, ...synthetic];
}
