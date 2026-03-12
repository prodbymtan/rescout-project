const STATBOTICS_API_BASE = 'https://api.statbotics.io/v3';

interface StatboticsTeamEventEPA {
  total_points?: {
    mean?: number;
  };
  norm_epa?: {
    current?: number;
  };
}

interface StatboticsTeamEventResponse {
  epa?: StatboticsTeamEventEPA;
}

export interface TeamEventSignal {
  teamNumber: number;
  totalPointsMean?: number;
  currentNormEPA?: number;
}

export async function fetchTeamEventSignal(
  teamNumber: number,
  eventKey: string
): Promise<TeamEventSignal | null> {
  try {
    const response = await fetch(`${STATBOTICS_API_BASE}/team_event/${teamNumber}/${eventKey}`);
    if (!response.ok) return null;

    const data = (await response.json()) as StatboticsTeamEventResponse;
    return {
      teamNumber,
      totalPointsMean: data.epa?.total_points?.mean,
      currentNormEPA: data.epa?.norm_epa?.current,
    };
  } catch (error) {
    console.error(`Error fetching Statbotics team_event for ${teamNumber} @ ${eventKey}:`, error);
    return null;
  }
}
