export type Alliance = 'red' | 'blue';
export type Position = 1 | 2 | 3;
export type Phase = 'auto' | 'teleop' | 'endgame';

export interface BallCount {
  made: number;
  miss: number;
}

export interface Cycle {
  id: string;
  startTime: number;
  endTime: number;
  ballsScored: number;
}

export interface AutoData {
  ballCounts: BallCount;
  // Number of game pieces the robot started auto with preloaded
  preloadBalls: number;
  // Tower climb level achieved in auto (Level 1 max in auto, max 2 robots)
  towerClimb: 'none' | 'level1' | 'failed';
  // Which alliance scored more fuel in auto (determines hub shifts)
  autoWinner?: 'red' | 'blue';
}

export interface TeleopData {
  ballCounts: BallCount;
  cycles: Cycle[];
}

export interface EndgameData {
  climb: 'none' | 'failed' | 'low' | 'mid' | 'high';
  harmony?: boolean;
  buddy?: boolean;
  coop?: boolean;
  parked: boolean;
  gotDefended: 'none' | 'light' | 'heavy';
  playedDefense: 'none' | 'light' | 'heavy';
  notes: string;
  tags: string[];
  // Ranking Points
  energizedRP: boolean; // 100+ fuel scored
  superchargedRP: boolean; // 360+ fuel scored
  traversalRP: boolean; // 50+ tower points
  matchWin: boolean; // Win the match
  matchTie: boolean; // Tie the match
  // Major Contributor (40%+ of match points)
  majorContributor: boolean;
}

export interface MatchScoutData {
  id: string;
  matchNumber: string;
  alliance: Alliance;
  teamNumber: number;
  position: Position;
  auto: AutoData;
  teleop: TeleopData;
  endgame: EndgameData;
  timestamp: number;
  scoutName?: string;
}

export interface TeamStats {
  teamNumber: number;
  teamName?: string;
  matches: MatchScoutData[];
  avgAutoBalls: number;
  avgTeleopBalls: number;
  avgTotalBalls: number;
  accuracy: number;
  climbSuccessRate: number;
  avgCycleTime: number;
  cyclesPerMatch: number;
  ballsPerCycle: number;
  consistency: number; // standard deviation
  rebuiltRating: number; // EPA-like metric
  notes: string[];
  tags: Record<string, number>;
}

export interface Match {
  matchNumber: string;
  redAlliance: number[];
  blueAlliance: number[];
  redScore?: number;
  blueScore?: number;
  predictedRedScore?: number;
  predictedBlueScore?: number;
  timestamp: number;
  status: 'upcoming' | 'in-progress' | 'completed';
}

export interface GameConfig {
  scoringZones: string[];
  phases: Phase[];
  normalBallRange: {
    min: number;
    max: number;
  };
}

