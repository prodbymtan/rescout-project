'use client';

import { useState, useEffect } from 'react';
import { Match, MatchScoutData, TeamStats } from '@/types';
import { storage } from '@/lib/storage';
import { calculateTeamStats, predictMatchScore } from '@/lib/stats';

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [scoutData, setScoutData] = useState<MatchScoutData[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
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

    return (
      <div className="p-4 space-y-6">
        <button
          onClick={() => setSelectedMatch(null)}
          className="text-primary font-semibold mb-4"
        >
          ← Back to Matches
        </button>

        <div className="bg-card rounded-lg p-4 border border-border">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Match {selectedMatchData.matchNumber}
          </h1>
          <div className="text-sm text-gray-600 mb-4">
            Status: <span className="font-semibold capitalize">{selectedMatchData.status}</span>
          </div>

          {/* Predictions */}
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="font-semibold text-red-800 mb-2">Red Alliance</div>
              <div className="space-y-2">
                {selectedMatchData.redAlliance.map((teamNum) => {
                  const stats = teamStats.find((s) => s.teamNumber === teamNum);
                  return (
                    <div key={teamNum} className="flex justify-between items-center">
                      <span className="font-medium">Team {teamNum}</span>
                      <span className="text-sm text-gray-600">
                        Rating: {stats?.rebuiltRating.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-red-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Predicted Score</span>
                  <span className="text-xl font-bold text-red-800">
                    {redPrediction}
                  </span>
                </div>
                {selectedMatchData.redScore !== undefined && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Actual Score</span>
                    <span className="text-lg font-semibold text-red-800">
                      {selectedMatchData.redScore}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-semibold text-blue-800 mb-2">Blue Alliance</div>
              <div className="space-y-2">
                {selectedMatchData.blueAlliance.map((teamNum) => {
                  const stats = teamStats.find((s) => s.teamNumber === teamNum);
                  return (
                    <div key={teamNum} className="flex justify-between items-center">
                      <span className="font-medium">Team {teamNum}</span>
                      <span className="text-sm text-gray-600">
                        Rating: {stats?.rebuiltRating.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Predicted Score</span>
                  <span className="text-xl font-bold text-blue-800">
                    {bluePrediction}
                  </span>
                </div>
                {selectedMatchData.blueScore !== undefined && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Actual Score</span>
                    <span className="text-lg font-semibold text-blue-800">
                      {selectedMatchData.blueScore}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Win Probability */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-800 mb-2">Win Probability</div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-xs text-gray-600 mb-1">Red</div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-red-600 h-3 rounded-full"
                      style={{
                        width: `${
                          (redPrediction / (redPrediction + bluePrediction)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-600 mb-1">Blue</div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{
                        width: `${
                          (bluePrediction / (redPrediction + bluePrediction)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
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

