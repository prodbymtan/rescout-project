import { MatchScoutData, TeamStats } from '@/types';
import { storage } from './storage';

function computeRating(matches: MatchScoutData[]): number {
  if (matches.length === 0) return 0;

  const asNumber = (value: unknown, fallback = 0): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const autoBalls = matches.map((m) => asNumber(m.auto?.ballCounts?.made));
  const teleopBalls = matches.map((m) => asNumber(m.teleop?.ballCounts?.made));
  const avgAutoBalls = autoBalls.reduce((a, b) => a + b, 0) / matches.length;
  const avgTeleopBalls = teleopBalls.reduce((a, b) => a + b, 0) / matches.length;

  const totalMade = matches.reduce(
    (sum, m) => sum + asNumber(m.auto?.ballCounts?.made) + asNumber(m.teleop?.ballCounts?.made),
    0
  );
  const totalAttempted = matches.reduce(
    (sum, m) =>
      sum +
      asNumber(m.auto?.ballCounts?.made) +
      asNumber(m.auto?.ballCounts?.miss) +
      asNumber(m.teleop?.ballCounts?.made) +
      asNumber(m.teleop?.ballCounts?.miss),
    0
  );
  const accuracy = totalAttempted > 0 ? (totalMade / totalAttempted) * 100 : 0;

  const successfulClimbs = matches.filter(
    (m) => m.endgame?.climb !== 'none' && m.endgame?.climb !== 'failed'
  ).length;
  const climbSuccessRate = (successfulClimbs / matches.length) * 100;

  return (avgAutoBalls * 2) + (avgTeleopBalls * 1.5) + (climbSuccessRate / 10) + (accuracy / 2);
}

export function calculateTeamStats(teamNumber: number, matches: MatchScoutData[]): TeamStats {
  const teamMatches = matches.filter(m => m.teamNumber === teamNumber);
  const syntheticMatches = teamMatches.filter((m) => m.id.startsWith('synthetic-'));
  const manualMatches = teamMatches.filter((m) => !m.id.startsWith('synthetic-'));
  const primaryMatches = manualMatches.length > 0 ? manualMatches : teamMatches;
  const teams = storage.getTeams();
  const teamData = teams.find(t => t.teamNumber === teamNumber);
  
  if (primaryMatches.length === 0) {
    return {
      teamNumber,
      teamName: teamData?.teamName,
      matches: [],
      avgAutoBalls: 0,
      avgTeleopBalls: 0,
      avgTotalBalls: 0,
      accuracy: 0,
      climbSuccessRate: 0,
      avgCycleTime: 0,
      cyclesPerMatch: 0,
      ballsPerCycle: 0,
      consistency: 0,
      rebuiltRating: 0,
      manualRating: 0,
      syntheticRating: 0,
      displayRating: 0,
      manualMatchCount: 0,
      syntheticMatchCount: 0,
      notes: [],
      tags: {},
    };
  }

  // Calculate averages
  const asNumber = (value: unknown, fallback = 0): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const autoBalls = primaryMatches.map((m) => asNumber(m.auto?.ballCounts?.made));
  const teleopBalls = primaryMatches.map((m) => asNumber(m.teleop?.ballCounts?.made));
  const totalBalls = primaryMatches.map((_, idx) => autoBalls[idx] + teleopBalls[idx]);

  const avgAutoBalls = autoBalls.reduce((a, b) => a + b, 0) / primaryMatches.length;
  const avgTeleopBalls = teleopBalls.reduce((a, b) => a + b, 0) / primaryMatches.length;
  const avgTotalBalls = totalBalls.reduce((a, b) => a + b, 0) / primaryMatches.length;

  // Calculate accuracy
  const totalMade = primaryMatches.reduce((sum, m) => {
    const auto = asNumber(m.auto?.ballCounts?.made);
    const teleop = asNumber(m.teleop?.ballCounts?.made);
    return sum + auto + teleop;
  }, 0);

  const totalAttempted = primaryMatches.reduce((sum, m) => {
    const auto = asNumber(m.auto?.ballCounts?.made) + asNumber(m.auto?.ballCounts?.miss);
    const teleop = asNumber(m.teleop?.ballCounts?.made) + asNumber(m.teleop?.ballCounts?.miss);
    return sum + auto + teleop;
  }, 0);

  const accuracy = totalAttempted > 0 ? (totalMade / totalAttempted) * 100 : 0;

  // Climb success rate
  const successfulClimbs = primaryMatches.filter(
    (m) => m.endgame?.climb !== 'none' && m.endgame?.climb !== 'failed'
  ).length;
  const climbSuccessRate = (successfulClimbs / primaryMatches.length) * 100;

  // Cycle stats
  const allCycles = primaryMatches.flatMap((m) =>
    Array.isArray(m.teleop?.cycles)
      ? m.teleop.cycles.filter(
          (cycle) =>
            cycle &&
            Number.isFinite(Number(cycle.startTime)) &&
            Number.isFinite(Number(cycle.endTime))
        )
      : []
  );
  const avgCycleTime = allCycles.length > 0
    ? allCycles.reduce((sum, c) => sum + (asNumber(c.endTime) - asNumber(c.startTime)), 0) / allCycles.length
    : 0;
  const cyclesPerMatch = allCycles.length / primaryMatches.length;
  const ballsPerCycle = allCycles.length > 0
    ? allCycles.reduce((sum, c) => sum + asNumber(c.ballsScored), 0) / allCycles.length
    : 0;

  // Consistency (standard deviation)
  const mean = avgTotalBalls;
  const variance = totalBalls.reduce((sum, balls) => sum + Math.pow(balls - mean, 2), 0) / primaryMatches.length;
  const consistency = Math.sqrt(variance);

  const manualRating = computeRating(manualMatches);
  const syntheticModelTags = syntheticMatches
    .flatMap((m) => (Array.isArray(m.endgame?.tags) ? m.endgame.tags : []))
    .map((tag) => {
      const match = String(tag ?? '').match(/^model_(\d{1,3})$/i);
      return match ? Number.parseInt(match[1], 10) : null;
    })
    .filter((value): value is number => value !== null && Number.isFinite(value));

  const syntheticRating =
    syntheticModelTags.length > 0
      ? syntheticModelTags.reduce((sum, value) => sum + value, 0) / syntheticModelTags.length
      : computeRating(syntheticMatches);
  const displayRating = syntheticMatches.length > 0 ? syntheticRating : manualRating;
  const rebuiltRating = displayRating;

  // Notes and tags
  const notes = primaryMatches
    .map((m) => (typeof m.endgame?.notes === 'string' ? m.endgame.notes : ''))
    .filter((n) => n);
  const tags: Record<string, number> = {};
  primaryMatches.forEach((m) => {
    const matchTags = Array.isArray(m.endgame?.tags) ? m.endgame.tags : [];
    matchTags.forEach((tag) => {
      const safeTag = String(tag ?? '').trim();
      if (!safeTag) return;
      tags[safeTag] = (tags[safeTag] || 0) + 1;
    });
  });

  return {
    teamNumber,
    teamName: teamData?.teamName,
    matches: primaryMatches,
    avgAutoBalls,
    avgTeleopBalls,
    avgTotalBalls,
    accuracy,
    climbSuccessRate,
    avgCycleTime,
    cyclesPerMatch,
    ballsPerCycle,
    consistency,
    rebuiltRating,
    manualRating,
    syntheticRating,
    displayRating,
    manualMatchCount: manualMatches.length,
    syntheticMatchCount: syntheticMatches.length,
    notes,
    tags,
  };
}

export function predictMatchScore(redTeams: number[], blueTeams: number[], allStats: TeamStats[]): {
  red: number;
  blue: number;
} {
  const redRating = redTeams.reduce((sum, teamNum) => {
    const stats = allStats.find(s => s.teamNumber === teamNum);
    return sum + (stats?.displayRating || stats?.rebuiltRating || 0);
  }, 0);

  const blueRating = blueTeams.reduce((sum, teamNum) => {
    const stats = allStats.find(s => s.teamNumber === teamNum);
    return sum + (stats?.displayRating || stats?.rebuiltRating || 0);
  }, 0);

  // Convert rating to predicted score (rough approximation)
  const red = Math.round(redRating * 1.2);
  const blue = Math.round(blueRating * 1.2);

  return { red, blue };
}
