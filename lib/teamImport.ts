import { storage, TeamData } from './storage';
import { fetchEventTeams, parseTeamNumber, TBATeam } from './tba';

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      out.push(current.trim());
      current = '';
      continue;
    }

    current += ch;
  }

  out.push(current.trim());
  return out;
}

function normalizeHeader(header: string): string {
  return header.replace(/^\ufeff/, '').trim().toLowerCase().replace(/\s+/g, '_');
}

// Parse CSV content and import teams
export function importTeamsFromCSV(csvContent: string): TeamData[] {
  const lines = csvContent
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headerCandidate = parseCsvLine(lines[0]).map(normalizeHeader);
  const hasHeader = headerCandidate.some((h) =>
    ['team_number', 'team', 'teamnum', 'team_number_', 'teamnumber'].includes(h)
  );
  const headers = hasHeader ? headerCandidate : ['team_number', 'team_name', 'city', 'state_prov', 'country'];
  const startIndex = hasHeader ? 1 : 0;
  const teams: TeamData[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0) continue;

    const teamNumberIndex = headers.findIndex((h) =>
      ['team_number', 'team', 'teamnum', 'team_number_', 'teamnumber'].includes(h)
    );
    const teamNumberRaw = teamNumberIndex >= 0 ? values[teamNumberIndex] : values[0];
    const parsedTeamNumber = parseTeamNumber(teamNumberRaw);
    if (parsedTeamNumber == null || Number.isNaN(parsedTeamNumber)) continue;

    const teamData: TeamData = {
      teamNumber: parsedTeamNumber,
    };

    // Map CSV columns to team data
    const teamNameIndex = headers.findIndex((h) => ['team_name', 'nickname', 'name'].includes(h));
    const cityIndex = headers.indexOf('city');
    const stateIndex = headers.findIndex((h) => ['state_prov', 'state', 'province'].includes(h));
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

    teams.push(teamData);
  }

  const deduped = new Map<number, TeamData>();
  teams.forEach((team) => {
    const existing = deduped.get(team.teamNumber);
    deduped.set(team.teamNumber, { ...existing, ...team, teamNumber: team.teamNumber });
  });
  return Array.from(deduped.values());
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
export async function mergeAndSaveTeams(newTeams: TeamData[]): Promise<TeamData[]> {
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
  await storage.saveTeams(mergedTeams);
  await storage.syncAll();
  return mergedTeams;
}
