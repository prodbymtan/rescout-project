'use client';

import { useState, useEffect } from 'react';
import { Match, MatchScoutData, TeamStats } from '@/types';
import { storage, TeamData } from '@/lib/storage';
import { calculateTeamStats, predictMatchScore } from '@/lib/stats';

function getRoleLabel(role: TeamData['rolePreference']): string {
  if (role === 'scorer') return 'Scorer';
  if (role === 'defender') return 'Defender';
  if (role === 'support') return 'Support';
  if (role === 'mixed') return 'Mixed';
  return 'Unknown';
}

function buildStrategyNotes(team: TeamData | null): { doItems: string[]; dontItems: string[] } {
  if (!team) return { doItems: [], dontItems: [] };

  const doItems: string[] = [];
  const dontItems: string[] = [];

  if (team.autoPartnerRequirement === 'needs_clear_lane') {
    doItems.push(`Give ${team.teamNumber} a clear lane in auto.`);
  }
  if (team.autoPartnerRequirement === 'needs_space') {
    doItems.push(`Give ${team.teamNumber} space on auto start.`);
  }
  if (team.needsProtectedLane === 'yes') {
    doItems.push(`Protect ${team.teamNumber}'s cycle lane in traffic.`);
  }
  if (team.intakeFrom && !team.intakeFrom.includes('floor')) {
    doItems.push(`Feed ${team.teamNumber}; they are limited without floor intake.`);
  }
  if (team.reliabilityRating === 'dnp_risk' || team.reliabilityRating === 'frequent_issues') {
    doItems.push(`Plan fallback cycles in case ${team.teamNumber} drops out.`);
  }

  if (team.canPassHandoff === 'no') {
    dontItems.push(`Do not plan handoffs through ${team.teamNumber}.`);
  }
  if (team.defensiveTolerance === 'falls_apart') {
    dontItems.push(`Do not give ${team.teamNumber} first-contact cycles under heavy defense.`);
  }
  if (team.commonFailureMode === 'brownout') {
    dontItems.push(`Avoid early contact that can trigger ${team.teamNumber} brownouts.`);
  }
  if (team.trafficFootprint === 'wide') {
    dontItems.push(`Do not stack ${team.teamNumber} into tight mid-field lanes.`);
  }

  return { doItems, dontItems };
}

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [scoutData, setScoutData] = useState<MatchScoutData[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [teamProfiles, setTeamProfiles] = useState<TeamData[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  useEffect(() => {
    const data = storage.getScoutData();
    setScoutData(data);
    
    const storedMatches = storage.getMatches();
    if (storedMatches.length === 0) {
      // Generate some sample matches
      const sampleMatches: Match[] = [
        {
          matchNumber: 'Q42',
          redAlliance: [3467, 1768, 6329],
          blueAlliance: [456, 4905, 364],
          status: 'upcoming',
          timestamp: Date.now(),
        },
        {
          matchNumber: 'Q43',
          redAlliance: [5846, 254, 118],
          blueAlliance: [1678, 3309, 5012],
          status: 'upcoming',
          timestamp: Date.now() + 3600000,
        },
      ];
      storage.saveMatches(sampleMatches);
      setMatches(sampleMatches);
    } else {
      setMatches(storedMatches);
    }

    // Calculate team stats
    const uniqueTeams = Array.from(new Set(data.map((d) => d.teamNumber)));
    const stats = uniqueTeams.map((teamNum) => calculateTeamStats(teamNum, data));
    setTeamStats(stats);
    setTeamProfiles(storage.getTeams());
  }, []);

  const selectedMatchData = selectedMatch
    ? matches.find((m) => m.matchNumber === selectedMatch)
    : null;

  if (selectedMatchData) {
    const predictions = predictMatchScore(
      selectedMatchData.redAlliance,
      selectedMatchData.blueAlliance,
      teamStats
    );
    const redPrediction = predictions.red;
    const bluePrediction = predictions.blue;
    const predictionTotal = redPrediction + bluePrediction;
    const redWinWidth = predictionTotal > 0 ? (redPrediction / predictionTotal) * 100 : 50;
    const blueWinWidth = predictionTotal > 0 ? (bluePrediction / predictionTotal) * 100 : 50;
    const getTeamProfile = (teamNumber: number) =>
      teamProfiles.find((team) => team.teamNumber === teamNumber) || null;

    return (
      <div className="p-4 space-y-6">
        <button
          onClick={() => setSelectedMatch(null)}
          className="text-primary font-semibold mb-4"
        >
          ← Back to Matches
        </button>

        <div className="y2k-panel y2k-outline rounded-lg p-4 border border-border">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Match {selectedMatchData.matchNumber}
          </h1>
          <div className="text-sm text-gray-600 mb-4">
            Status: <span className="font-semibold capitalize">{selectedMatchData.status}</span>
          </div>

          {/* Predictions */}
          <div className="space-y-4">
            <div className="y2k-panel y2k-outline rounded-lg p-4 border border-red-500/30">
              <div className="font-semibold text-red-300 mb-2">Red Alliance</div>
              <div className="space-y-2">
                {selectedMatchData.redAlliance.map((teamNum) => {
                  const stats = teamStats.find((s) => s.teamNumber === teamNum);
                  const profile = getTeamProfile(teamNum);
                  const strategy = buildStrategyNotes(profile);
                  return (
                    <div key={teamNum} className="y2k-panel-soft y2k-pill p-3 border border-red-500/30">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Team {teamNum}</span>
                        <span className="text-sm text-gray-400">
                          Rating: {stats?.rebuiltRating.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Role: {getRoleLabel(profile?.rolePreference)} | Recheck: {profile?.needsRecheck ? 'Yes' : 'No'}
                      </div>
                      {(strategy.doItems.length > 0 || strategy.dontItems.length > 0) && (
                        <div className="mt-2 space-y-1 text-xs">
                          {strategy.doItems.slice(0, 2).map((item) => (
                            <div key={item} className="text-success">
                              Do: {item}
                            </div>
                          ))}
                          {strategy.dontItems.slice(0, 2).map((item) => (
                            <div key={item} className="text-error">
                              Don't: {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-red-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Predicted Score</span>
                  <span className="text-xl font-bold text-red-300">
                    {redPrediction}
                  </span>
                </div>
                {selectedMatchData.redScore !== undefined && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-400">Actual Score</span>
                    <span className="text-lg font-semibold text-red-300">
                      {selectedMatchData.redScore}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="y2k-panel y2k-outline rounded-lg p-4 border border-blue-500/30">
              <div className="font-semibold text-blue-300 mb-2">Blue Alliance</div>
              <div className="space-y-2">
                {selectedMatchData.blueAlliance.map((teamNum) => {
                  const stats = teamStats.find((s) => s.teamNumber === teamNum);
                  const profile = getTeamProfile(teamNum);
                  const strategy = buildStrategyNotes(profile);
                  return (
                    <div key={teamNum} className="y2k-panel-soft y2k-pill p-3 border border-blue-500/30">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Team {teamNum}</span>
                        <span className="text-sm text-gray-400">
                          Rating: {stats?.rebuiltRating.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Role: {getRoleLabel(profile?.rolePreference)} | Recheck: {profile?.needsRecheck ? 'Yes' : 'No'}
                      </div>
                      {(strategy.doItems.length > 0 || strategy.dontItems.length > 0) && (
                        <div className="mt-2 space-y-1 text-xs">
                          {strategy.doItems.slice(0, 2).map((item) => (
                            <div key={item} className="text-success">
                              Do: {item}
                            </div>
                          ))}
                          {strategy.dontItems.slice(0, 2).map((item) => (
                            <div key={item} className="text-error">
                              Don't: {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-blue-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Predicted Score</span>
                  <span className="text-xl font-bold text-blue-300">
                    {bluePrediction}
                  </span>
                </div>
                {selectedMatchData.blueScore !== undefined && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-400">Actual Score</span>
                    <span className="text-lg font-semibold text-blue-300">
                      {selectedMatchData.blueScore}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Win Probability */}
            <div className="y2k-panel y2k-outline border border-border rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-800 mb-2">Win Probability</div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-xs text-gray-600 mb-1">Red</div>
                  <div className="w-full y2k-panel-soft rounded-full h-3 border border-red-500/30">
                    <div
                      className="bg-red-600 h-3 rounded-full"
                      style={{
                        width: `${redWinWidth}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-600 mb-1">Blue</div>
                  <div className="w-full y2k-panel-soft rounded-full h-3 border border-blue-500/30">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{
                        width: `${blueWinWidth}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="y2k-panel y2k-outline border border-border rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-800 mb-2">Strategy Quick Hits</div>
              <div className="space-y-2 text-sm text-gray-700">
                {[...selectedMatchData.redAlliance, ...selectedMatchData.blueAlliance]
                  .map((teamNumber) => getTeamProfile(teamNumber))
                  .filter((team): team is TeamData => team !== null)
                  .flatMap((team) => {
                    const notes = buildStrategyNotes(team);
                    const firstDo = notes.doItems[0];
                    const firstDont = notes.dontItems[0];
                    const bullets: string[] = [];
                    if (firstDo) bullets.push(firstDo);
                    if (firstDont) bullets.push(firstDont);
                    return bullets;
                  })
                  .slice(0, 6)
                  .map((bullet) => (
                    <div key={bullet} className="text-xs">
                      • {bullet}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const upcomingMatches = matches.filter((m) => m.status === 'upcoming');
  const pastMatches = matches.filter((m) => m.status === 'completed');

  return (
    <div className="p-4 space-y-4">
      <div className="bg-card rounded-lg p-4 border-2 border-primary/20 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">Matches</h1>
      </div>

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcomingMatches.map((match) => {
              const pred = predictMatchScore(match.redAlliance, match.blueAlliance, teamStats);
              const redPred = pred.red;
              const bluePred = pred.blue;
              
              return (
                <button
                  key={match.matchNumber}
                  onClick={() => setSelectedMatch(match.matchNumber)}
                  className="w-full bg-card rounded-lg p-4 border border-border text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-xl font-bold text-gray-800">
                      {match.matchNumber}
                    </div>
                    <div className="text-sm text-gray-500">Upcoming</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-red-600 font-semibold mb-1">Red</div>
                      <div className="text-sm text-gray-800">
                        {match.redAlliance.join(', ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Pred: {redPred}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-600 font-semibold mb-1">Blue</div>
                      <div className="text-sm text-gray-800">
                        {match.blueAlliance.join(', ')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Pred: {bluePred}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Matches */}
      {pastMatches.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Past Matches</h2>
          <div className="space-y-3">
            {pastMatches.map((match) => (
              <button
                key={match.matchNumber}
                onClick={() => setSelectedMatch(match.matchNumber)}
                className="w-full bg-card rounded-lg p-4 border border-border text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xl font-bold text-gray-800">
                    {match.matchNumber}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-red-600 font-semibold mb-1">Red</div>
                    <div className="text-sm text-gray-800">
                      {match.redAlliance.join(', ')}
                    </div>
                    {match.redScore !== undefined && (
                      <div className="text-sm font-bold text-red-800 mt-1">
                        {match.redScore}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 font-semibold mb-1">Blue</div>
                    <div className="text-sm text-gray-800">
                      {match.blueAlliance.join(', ')}
                    </div>
                    {match.blueScore !== undefined && (
                      <div className="text-sm font-bold text-blue-800 mt-1">
                        {match.blueScore}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No matches available. Add matches in Settings.
        </div>
      )}
    </div>
  );
}
