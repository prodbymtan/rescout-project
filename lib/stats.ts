import { MatchScoutData, TeamStats } from '@/types';
import { storage } from './storage';

export function calculateTeamStats(teamNumber: number, matches: MatchScoutData[]): TeamStats {
  const teamMatches = matches.filter(m => m.teamNumber === teamNumber);
  const teams = storage.getTeams();
  const teamData = teams.find(t => t.teamNumber === teamNumber);
  
  if (teamMatches.length === 0) {
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
      notes: [],
      tags: {},
    };
  }

  // Calculate averages
  const autoBalls = teamMatches.map(m => 
    m.auto.ballCounts.made
  );
  const teleopBalls = teamMatches.map(m =>
    m.teleop.ballCounts.made
  );
  const totalBalls = teamMatches.map(m =>
    autoBalls[teamMatches.indexOf(m)] + teleopBalls[teamMatches.indexOf(m)]
  );

  const avgAutoBalls = autoBalls.reduce((a, b) => a + b, 0) / teamMatches.length;
  const avgTeleopBalls = teleopBalls.reduce((a, b) => a + b, 0) / teamMatches.length;
  const avgTotalBalls = totalBalls.reduce((a, b) => a + b, 0) / teamMatches.length;

  // Calculate accuracy
  const totalMade = teamMatches.reduce((sum, m) => {
    const auto = m.auto.ballCounts.made;
    const teleop = m.teleop.ballCounts.made;
    return sum + auto + teleop;
  }, 0);

  const totalAttempted = teamMatches.reduce((sum, m) => {
    const auto = m.auto.ballCounts.made + m.auto.ballCounts.miss;
    const teleop = m.teleop.ballCounts.made + m.teleop.ballCounts.miss;
    return sum + auto + teleop;
  }, 0);

  const accuracy = totalAttempted > 0 ? (totalMade / totalAttempted) * 100 : 0;

  // Climb success rate
  const successfulClimbs = teamMatches.filter(m => 
    m.endgame.climb !== 'none' && m.endgame.climb !== 'failed'
  ).length;
  const climbSuccessRate = (successfulClimbs / teamMatches.length) * 100;

  // Cycle stats
  const allCycles = teamMatches.flatMap(m => m.teleop.cycles);
  const avgCycleTime = allCycles.length > 0
    ? allCycles.reduce((sum, c) => sum + (c.endTime - c.startTime), 0) / allCycles.length
    : 0;
  const cyclesPerMatch = allCycles.length / teamMatches.length;
  const ballsPerCycle = allCycles.length > 0
    ? allCycles.reduce((sum, c) => sum + c.ballsScored, 0) / allCycles.length
    : 0;

  // Consistency (standard deviation)
  const mean = avgTotalBalls;
  const variance = totalBalls.reduce((sum, balls) => sum + Math.pow(balls - mean, 2), 0) / teamMatches.length;
  const consistency = Math.sqrt(variance);

  // Rebuilt Rating (simplified EPA-like metric)
  const rebuiltRating = (avgAutoBalls * 2) + (avgTeleopBalls * 1.5) + 
                        (climbSuccessRate / 10) + (accuracy / 2);

  // Notes and tags
  const notes = teamMatches.map(m => m.endgame.notes).filter(n => n);
  const tags: Record<string, number> = {};
  teamMatches.forEach(m => {
    m.endgame.tags.forEach(tag => {
      tags[tag] = (tags[tag] || 0) + 1;
    });
  });

  return {
    teamNumber,
    teamName: teamData?.teamName,
    matches: teamMatches,
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
    return sum + (stats?.rebuiltRating || 0);
  }, 0);

  const blueRating = blueTeams.reduce((sum, teamNum) => {
    const stats = allStats.find(s => s.teamNumber === teamNum);
    return sum + (stats?.rebuiltRating || 0);
  }, 0);

  // Convert rating to predicted score (rough approximation)
  const red = Math.round(redRating * 1.2);
  const blue = Math.round(blueRating * 1.2);

  return { red, blue };
}

