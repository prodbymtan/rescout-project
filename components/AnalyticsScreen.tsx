'use client';

import { useState, useEffect } from 'react';
import { TeamStats } from '@/types';
import { storage } from '@/lib/storage';
import { calculateTeamStats } from '@/lib/stats';

export default function AnalyticsScreen() {
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'auto' | 'teleop' | 'accuracy'>('rating');
  const [filterMinBalls, setFilterMinBalls] = useState(0);
  const [filterMinAccuracy, setFilterMinAccuracy] = useState(0);

  useEffect(() => {
    const scoutData = storage.getScoutData();
    const uniqueTeams = Array.from(new Set(scoutData.map((d) => d.teamNumber)));
    const teamStats = uniqueTeams.map((teamNum) => calculateTeamStats(teamNum, scoutData));
    setTeams(teamStats);
  }, []);

  const sortedTeams = [...teams]
    .filter((t) => t.avgTeleopBalls >= filterMinBalls && t.accuracy >= filterMinAccuracy)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rebuiltRating - a.rebuiltRating;
        case 'auto':
          return b.avgAutoBalls - a.avgAutoBalls;
        case 'teleop':
          return b.avgTeleopBalls - a.avgTeleopBalls;
        case 'accuracy':
          return b.accuracy - a.accuracy;
        default:
          return 0;
      }
    });

  return (
    <div className="p-4 space-y-4">
      <div className="bg-card rounded-lg p-4 border-2 border-primary/20 shadow-sm">
        <h1 className="text-2xl font-bold text-primary mb-4">Analytics</h1>
      </div>

      {/* Picklist View */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Picklist</h2>
        
        {/* Filters */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-border rounded-lg"
            >
              <option value="rating">ReScout Rating</option>
              <option value="auto">Auto Balls</option>
              <option value="teleop">Teleop Balls</option>
              <option value="accuracy">Accuracy</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Teleop Balls
              </label>
              <input
                type="number"
                value={filterMinBalls}
                onChange={(e) => setFilterMinBalls(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Accuracy (%)
              </label>
              <input
                type="number"
                value={filterMinAccuracy}
                onChange={(e) => setFilterMinAccuracy(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Team Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Rank</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Team</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Rating</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Auto</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Teleop</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Acc%</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Climb%</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => (
                <tr
                  key={team.teamNumber}
                  className="border-b border-border hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-2 text-gray-600">{index + 1}</td>
                  <td className="py-3 px-2 font-semibold text-gray-800">
                    {team.teamNumber}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-primary">
                    {team.rebuiltRating.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">
                    {team.avgAutoBalls.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">
                    {team.avgTeleopBalls.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">
                    {team.accuracy.toFixed(1)}%
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">
                    {team.climbSuccessRate.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedTeams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No teams match the current filters.
          </div>
        )}
      </div>

      {/* Role Finder */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Role Finder</h2>
        <div className="space-y-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="font-semibold text-gray-800 mb-2">High Scorers</div>
            <div className="text-sm text-gray-600">
              Teams with &gt; 30 teleop balls, &gt; 70% accuracy
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {sortedTeams
                .filter((t) => t.avgTeleopBalls > 30 && t.accuracy > 70)
                .slice(0, 5)
                .map((t) => (
                  <span
                    key={t.teamNumber}
                    className="px-2 py-1 bg-primary text-white rounded text-xs font-medium"
                  >
                    {t.teamNumber}
                  </span>
                ))}
            </div>
          </div>

          <div className="p-3 bg-secondary/10 rounded-lg">
            <div className="font-semibold text-gray-800 mb-2">Consistent Performers</div>
            <div className="text-sm text-gray-600">
              Teams with low standard deviation (consistent scoring)
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[...teams]
                .sort((a, b) => a.consistency - b.consistency)
                .slice(0, 5)
                .map((t) => (
                  <span
                    key={t.teamNumber}
                    className="px-2 py-1 bg-secondary text-white rounded text-xs font-medium"
                  >
                    {t.teamNumber}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Consistency Metrics */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Consistency Analysis</h2>
        <div className="space-y-2">
          {[...teams]
            .sort((a, b) => a.consistency - b.consistency)
            .slice(0, 10)
            .map((team) => (
              <div key={team.teamNumber} className="flex items-center gap-3">
                <div className="w-16 text-sm font-semibold text-gray-800">
                  {team.teamNumber}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Avg: {team.avgTotalBalls.toFixed(1)}</span>
                    <span className="text-gray-600">Std Dev: {team.consistency.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (team.avgTotalBalls / 60) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

