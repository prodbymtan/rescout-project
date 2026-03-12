// The Blue Alliance API integration
// API docs: https://www.thebluealliance.com/apidocs/v3

import { Match } from '@/types';

const TBA_API_BASE = 'https://www.thebluealliance.com/api/v3';

export interface TBATeam {
  team_number: number;
  nickname?: string;
  name: string;
  city?: string;
  state_prov?: string;
  country?: string;
}

export interface TBAMatch {
  key: string;
  comp_level: string; // 'qm', 'qf', 'sf', 'f'
  match_number: number;
  alliances?: {
    red?: {
      team_keys: string[];
      score?: number;
    };
    blue?: {
      team_keys: string[];
      score?: number;
    };
  };
  time?: number;
  predicted_time?: number;
  actual_time?: number;
  post_result_time?: number;
}

// Get TBA API key from localStorage or environment
export function getTBAKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tba_api_key') || null;
}

export function setTBAKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tba_api_key', key);
}

// Fetch teams from an event
export async function fetchEventTeams(eventKey: string): Promise<TBATeam[]> {
  const apiKey = getTBAKey();
  if (!apiKey) {
    throw new Error('TBA API key not set. Please set it in Settings.');
  }

  try {
    const response = await fetch(`${TBA_API_BASE}/event/${eventKey}/teams/simple`, {
      headers: {
        'X-TBA-Auth-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`TBA API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching teams from TBA:', error);
    throw error;
  }
}

// Fetch matches from an event
export async function fetchEventMatches(eventKey: string): Promise<TBAMatch[]> {
  const apiKey = getTBAKey();
  if (!apiKey) {
    throw new Error('TBA API key not set. Please set it in Settings.');
  }

  try {
    const response = await fetch(`${TBA_API_BASE}/event/${eventKey}/matches/simple`, {
      headers: {
        'X-TBA-Auth-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`TBA API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching matches from TBA:', error);
    throw error;
  }
}

// Parse team number from team key (e.g., "frc69" -> 69)
export function parseTeamNumber(teamKey: string): number {
  return parseInt(teamKey.replace('frc', ''), 10);
}

// Convert TBA match to our Match format
export function convertTBAMatch(tbaMatch: TBAMatch): { redAlliance: number[]; blueAlliance: number[] } | null {
  if (!tbaMatch.alliances) return null;

  const red = tbaMatch.alliances.red?.team_keys.map(parseTeamNumber) || [];
  const blue = tbaMatch.alliances.blue?.team_keys.map(parseTeamNumber) || [];

  return { redAlliance: red, blueAlliance: blue };
}

function getMatchStatus(tbaMatch: TBAMatch): Match['status'] {
  const hasScore =
    typeof tbaMatch.alliances?.red?.score === 'number' &&
    typeof tbaMatch.alliances?.blue?.score === 'number' &&
    (tbaMatch.alliances?.red?.score ?? -1) >= 0 &&
    (tbaMatch.alliances?.blue?.score ?? -1) >= 0;

  if (hasScore) return 'completed';
  return 'upcoming';
}

export function convertTBAMatchToMatch(tbaMatch: TBAMatch): Match | null {
  const parsed = convertTBAMatch(tbaMatch);
  if (!parsed) return null;

  const matchLabel =
    tbaMatch.comp_level === 'qm'
      ? `Q${tbaMatch.match_number}`
      : `${tbaMatch.comp_level.toUpperCase()}${tbaMatch.match_number}`;

  return {
    matchNumber: matchLabel,
    redAlliance: parsed.redAlliance,
    blueAlliance: parsed.blueAlliance,
    redScore: tbaMatch.alliances?.red?.score,
    blueScore: tbaMatch.alliances?.blue?.score,
    timestamp:
      (tbaMatch.actual_time ||
        tbaMatch.predicted_time ||
        tbaMatch.time ||
        tbaMatch.post_result_time ||
        0) * 1000,
    status: getMatchStatus(tbaMatch),
  };
}

// TBA OPR/DPR data structure
export interface TBAOPRs {
  [teamKey: string]: number;
}

// Fetch OPRs from an event
export async function fetchEventOPRs(eventKey: string): Promise<TBAOPRs> {
  const apiKey = getTBAKey();
  if (!apiKey) {
    throw new Error('TBA API key not set. Please set it in Settings.');
  }

  try {
    const response = await fetch(`${TBA_API_BASE}/event/${eventKey}/oprs`, {
      headers: {
        'X-TBA-Auth-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`TBA API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.oprs || {};
  } catch (error) {
    console.error('Error fetching OPRs from TBA:', error);
    throw error;
  }
}

// Fetch DPRs from an event
export async function fetchEventDPRs(eventKey: string): Promise<TBAOPRs> {
  const apiKey = getTBAKey();
  if (!apiKey) {
    throw new Error('TBA API key not set. Please set it in Settings.');
  }

  try {
    const response = await fetch(`${TBA_API_BASE}/event/${eventKey}/oprs`, {
      headers: {
        'X-TBA-Auth-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`TBA API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.dprs || {};
  } catch (error) {
    console.error('Error fetching DPRs from TBA:', error);
    throw error;
  }
}

// Fetch detailed match results (with scores)
export async function fetchEventMatchesDetailed(eventKey: string): Promise<TBAMatch[]> {
  const apiKey = getTBAKey();
  if (!apiKey) {
    throw new Error('TBA API key not set. Please set it in Settings.');
  }

  try {
    const response = await fetch(`${TBA_API_BASE}/event/${eventKey}/matches`, {
      headers: {
        'X-TBA-Auth-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`TBA API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching detailed matches from TBA:', error);
    throw error;
  }
}
