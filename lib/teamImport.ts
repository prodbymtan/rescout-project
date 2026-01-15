import { storage, TeamData } from './storage';
import { fetchEventTeams, parseTeamNumber, TBATeam } from './tba';

// Parse CSV content and import teams
export function importTeamsFromCSV(csvContent: string): TeamData[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const teams: TeamData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < headers.length) continue;

    const teamData: TeamData = {
      teamNumber: parseInt(values[0], 10),
    };

    // Map CSV columns to team data
    const teamNameIndex = headers.indexOf('team_name');
    const cityIndex = headers.indexOf('city');
    const stateIndex = headers.indexOf('state_prov');
    const countryIndex = headers.indexOf('country');

    if (teamNameIndex >= 0 && values[teamNameIndex]) {
      teamData.teamName = values[teamNameIndex];
    }
    if (cityIndex >= 0 && values[cityIndex]) {
      teamData.city = values[cityIndex];
    }
    if (stateIndex >= 0 && values[stateIndex]) {
      teamData.stateProv = values[stateIndex];
    }
    if (countryIndex >= 0 && values[countryIndex]) {
      teamData.country = values[countryIndex];
    }

    if (!isNaN(teamData.teamNumber)) {
      teams.push(teamData);
    }
  }

  return teams;
}

// Import teams from TBA API
export async function importTeamsFromTBA(eventKey: string): Promise<TeamData[]> {
  const tbaTeams = await fetchEventTeams(eventKey);
  
  return tbaTeams.map((team: TBATeam) => ({
    teamNumber: team.team_number,
    teamName: team.nickname || team.name,
    city: team.city,
    stateProv: team.state_prov,
    country: team.country,
  }));
}

// Merge and save teams (avoid duplicates)
export function mergeAndSaveTeams(newTeams: TeamData[]): TeamData[] {
  const existingTeams = storage.getTeams();
  const teamMap = new Map<number, TeamData>();

  // Add existing teams
  existingTeams.forEach(team => {
    teamMap.set(team.teamNumber, team);
  });

  // Merge new teams (new data overwrites old)
  newTeams.forEach(team => {
    const existing = teamMap.get(team.teamNumber);
    teamMap.set(team.teamNumber, {
      ...existing,
      ...team,
      teamNumber: team.teamNumber, // Ensure team number is preserved
    });
  });

  const mergedTeams = Array.from(teamMap.values()).sort((a, b) => a.teamNumber - b.teamNumber);
  storage.saveTeams(mergedTeams);
  return mergedTeams;
}

