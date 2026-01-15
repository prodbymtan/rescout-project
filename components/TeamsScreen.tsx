'use client';

import { useState, useEffect } from 'react';
import { TeamStats } from '@/types';
import { storage, TeamData } from '@/lib/storage';
import { calculateTeamStats } from '@/lib/stats';

export default function TeamsScreen() {
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [importedTeams, setImportedTeams] = useState<TeamData[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'stats' | 'imported'>('stats');

  useEffect(() => {
    loadTeams();
    // Listen for storage changes (when teams are imported)
    const interval = setInterval(() => {
      loadTeams();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadTeams = () => {
    // Load imported teams
    const imported = storage.getTeams();
    setImportedTeams(imported);

    // Load team stats from scout data
    const scoutData = storage.getScoutData();
    const uniqueTeams = Array.from(new Set(scoutData.map((d) => d.teamNumber)));
    const teamStats = uniqueTeams.map((teamNum) => calculateTeamStats(teamNum, scoutData));
    setTeams(teamStats.sort((a, b) => b.rebuiltRating - a.rebuiltRating));
  };

  const filteredTeams = teams.filter((team) =>
    team.teamNumber.toString().includes(searchQuery)
  );

  const selectedTeamStats = selectedTeam
    ? teams.find((t) => t.teamNumber === selectedTeam)
    : null;

  const selectedTeamData = selectedTeam
    ? importedTeams.find((t) => t.teamNumber === selectedTeam) || null
    : null;

  const updateSelectedTeamField = (field: keyof TeamData, value: TeamData[keyof TeamData]) => {
    if (selectedTeam == null) return;
    setImportedTeams((prev) => {
      const idx = prev.findIndex((t) => t.teamNumber === selectedTeam);
      let next: TeamData[];
      if (idx === -1) {
        next = [...prev, { teamNumber: selectedTeam, [field]: value } as TeamData];
      } else {
        next = [...prev];
        next[idx] = { ...next[idx], [field]: value };
      }
      storage.saveTeams(next);
      return next;
    });
  };

  if (selectedTeam !== null) {
    return (
      <div className="p-4 space-y-6">
        <button
          onClick={() => setSelectedTeam(null)}
          className="text-primary font-semibold mb-4"
        >
          ← Back to Teams
        </button>

        <div className="bg-card rounded-lg p-4 border-2 border-primary/20 shadow-sm space-y-3">
          <h1 className="text-2xl font-bold text-primary mb-1">
            Team {selectedTeam ?? ''}
          </h1>
          {selectedTeamStats?.teamName && (
            <p className="text-gray-600">{selectedTeamStats.teamName}</p>
          )}
          {/* Identifying Information */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Team Name
              </label>
              <input
                type="text"
                defaultValue={selectedTeamData?.teamName}
                onBlur={(e) => updateSelectedTeamField('teamName', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. RoboLions"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Robot Photo URL
              </label>
              <input
                type="url"
                defaultValue={selectedTeamData?.robotPhotoUrl}
                onBlur={(e) => updateSelectedTeamField('robotPhotoUrl', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="Link to robot photo"
              />
            </div>
          </div>
        </div>

        {/* Physical Characteristics */}
        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Physical Characteristics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Robot Size / Footprint
              </label>
              <input
                type="text"
                defaultValue={selectedTeamData?.robotSize}
                onBlur={(e) => updateSelectedTeamField('robotSize', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. 28in x 32in"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Height
              </label>
              <input
                type="text"
                defaultValue={selectedTeamData?.robotHeight}
                onBlur={(e) => updateSelectedTeamField('robotHeight', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. 48in"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Weight
              </label>
              <input
                type="text"
                defaultValue={selectedTeamData?.robotWeight}
                onBlur={(e) => updateSelectedTeamField('robotWeight', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. 120 lb"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Drivetrain Style
              </label>
              <input
                type="text"
                defaultValue={selectedTeamData?.drivetrainStyle}
                onBlur={(e) => updateSelectedTeamField('drivetrainStyle', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. Swerve, West Coast"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Wheel Type
              </label>
              <input
                type="text"
                defaultValue={selectedTeamData?.wheelType}
                onBlur={(e) => updateSelectedTeamField('wheelType', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. 4in Colsons"
              />
            </div>
          </div>
        </div>

        {selectedTeamStats && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-lg p-3 border border-border">
                <div className="text-xs text-gray-600 mb-1">Rebuilt Rating</div>
                <div className="text-2xl font-bold text-primary">
                  {selectedTeamStats.rebuiltRating.toFixed(1)}
                </div>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <div className="text-xs text-gray-600 mb-1">Matches</div>
                <div className="text-2xl font-bold text-gray-800">
                  {selectedTeamStats.matches.length}
                </div>
              </div>
            </div>

            {/* Scoring Overview */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Scoring Overview</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Auto Balls</span>
                    <span className="font-semibold">{selectedTeamStats.avgAutoBalls.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-secondary h-2 rounded-full"
                      style={{ width: `${Math.min(100, (selectedTeamStats.avgAutoBalls / 10) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Teleop Balls</span>
                    <span className="font-semibold">{selectedTeamStats.avgTeleopBalls.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${Math.min(100, (selectedTeamStats.avgTeleopBalls / 50) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="font-semibold">{selectedTeamStats.accuracy.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${selectedTeamStats.accuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cycle Stats */}
            {selectedTeamStats.avgCycleTime > 0 && (
              <div className="bg-card rounded-lg p-4 border border-border">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Cycle Stats</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Avg Cycle Time</div>
                    <div className="text-lg font-bold text-gray-800">
                      {selectedTeamStats.avgCycleTime.toFixed(1)}s
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Cycles/Match</div>
                    <div className="text-lg font-bold text-gray-800">
                      {selectedTeamStats.cyclesPerMatch.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Balls/Cycle</div>
                    <div className="text-lg font-bold text-gray-800">
                      {selectedTeamStats.ballsPerCycle.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Climb Stats */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Endgame</h2>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">Climb Success Rate</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${selectedTeamStats.climbSuccessRate}%` }}
                  />
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {selectedTeamStats.climbSuccessRate.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Tags */}
            {Object.keys(selectedTeamStats.tags).length > 0 && (
              <div className="bg-card rounded-lg p-4 border border-border">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Common Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedTeamStats.tags)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([tag, count]) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-secondary/20 text-secondary-dark rounded-full text-sm font-medium"
                      >
                        {tag} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Consistency */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Consistency</h2>
              <div className="text-sm text-gray-600">
                Standard Deviation: {selectedTeamStats.consistency.toFixed(1)} balls
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Lower = more consistent
              </div>
            </div>
          </>
        )}

        {/* Autonomous (pit) */}
        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Autonomous (Pit Notes)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Game tasks completed
              </label>
              <textarea
                defaultValue={selectedTeamData?.autoTasks}
                onBlur={(e) => updateSelectedTeamField('autoTasks', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none"
                rows={3}
                placeholder="e.g. scores 2 high notes, leaves starting zone"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Starting locations
                </label>
                <input
                  type="text"
                  defaultValue={selectedTeamData?.autoStartingLocations}
                  onBlur={(e) => updateSelectedTeamField('autoStartingLocations', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  placeholder="e.g. source side, center"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Pathing notes
                </label>
                <textarea
                  defaultValue={selectedTeamData?.autoPathing}
                  onBlur={(e) => updateSelectedTeamField('autoPathing', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none"
                  rows={2}
                  placeholder="e.g. consistent, avoids traffic, fragile"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Teleoperated */}
        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Teleoperated</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Scoring actions
              </label>
              <textarea
                defaultValue={selectedTeamData?.teleopScoring}
                onBlur={(e) => updateSelectedTeamField('teleopScoring', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none"
                rows={3}
                placeholder="e.g. cycles speaker, can do amp, runs source cycles"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Speed / agility
                </label>
                <input
                  type="text"
                  defaultValue={selectedTeamData?.teleopSpeedAgility}
                  onBlur={(e) => updateSelectedTeamField('teleopSpeedAgility', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  placeholder="e.g. very fast, average, slow"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Driving ability
                </label>
                <input
                  type="text"
                  defaultValue={selectedTeamData?.teleopDrivingAbility}
                  onBlur={(e) => updateSelectedTeamField('teleopDrivingAbility', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  placeholder="e.g. precise, shaky, inconsistent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Defensive effectiveness / where they defend
                </label>
                <textarea
                  defaultValue={selectedTeamData?.teleopDefenseEffectiveness}
                  onBlur={(e) => updateSelectedTeamField('teleopDefenseEffectiveness', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none"
                  rows={2}
                  placeholder="e.g. strong defense near center, slows cycles"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Fouls / cards
                </label>
                <input
                  type="text"
                  defaultValue={selectedTeamData?.teleopFouls}
                  onBlur={(e) => updateSelectedTeamField('teleopFouls', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  placeholder="e.g. frequent G4, 1 yellow card"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Endgame */}
        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Endgame</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Action attempted
              </label>
              <input
                type="text"
                defaultValue={selectedTeamData?.endgameAttempted}
                onBlur={(e) => updateSelectedTeamField('endgameAttempted', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. high climb, trap, park"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Action completed
              </label>
              <input
                type="text"
                defaultValue={selectedTeamData?.endgameCompleted}
                onBlur={(e) => updateSelectedTeamField('endgameCompleted', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. reliable high climb, inconsistent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Estimated solo score (avg)
              </label>
              <input
                type="number"
                min={0}
                defaultValue={selectedTeamData?.soloScoreEstimate ?? ''}
                onBlur={(e) =>
                  updateSelectedTeamField(
                    'soloScoreEstimate',
                    e.target.value === '' ? undefined : Number(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. 65"
              />
            </div>
          </div>
        </div>

        {/* Other */}
        <div className="bg-card rounded-lg p-4 border border-border space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Other</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Reliability
              </label>
              <textarea
                defaultValue={selectedTeamData?.otherReliability}
                onBlur={(e) => updateSelectedTeamField('otherReliability', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none"
                rows={3}
                placeholder="e.g. robust, frequent brownouts, loose chain"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Communication / drive team feedback
              </label>
              <textarea
                defaultValue={selectedTeamData?.otherCommunication}
                onBlur={(e) => updateSelectedTeamField('otherCommunication', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none"
                rows={3}
                placeholder="e.g. great to work with, quiet, hard to reach"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show imported teams view if enabled
  if (viewMode === 'imported') {
    const filteredImported = importedTeams.filter((team) =>
      team.teamNumber.toString().includes(searchQuery) ||
      team.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="p-4 space-y-4">
        <div className="bg-card rounded-lg p-4 border-2 border-primary/20 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-primary">Imported Teams</h1>
            <span className="text-sm text-gray-600">{importedTeams.length} teams</span>
          </div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode('stats')}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Stats View
            </button>
            <button
              onClick={() => setViewMode('imported')}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              Imported Teams
            </button>
          </div>
          <input
            type="text"
            placeholder="Search team number or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        {filteredImported.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {importedTeams.length === 0
              ? 'No teams imported yet. Import teams in Settings!'
              : 'No teams found matching your search.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredImported.map((team) => {
              const stats = teams.find((t) => t.teamNumber === team.teamNumber);
              return (
                <button
                  key={team.teamNumber}
                  type="button"
                  onClick={() => setSelectedTeam(team.teamNumber)}
                  className="w-full text-left bg-card rounded-lg p-4 border-2 border-primary/20 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xl font-bold text-gray-800">
                        Team {team.teamNumber}
                      </div>
                      {team.teamName && (
                        <div className="text-sm text-gray-600 font-medium">{team.teamName}</div>
                      )}
                      {(team.city || team.stateProv) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {team.city}
                          {team.city && team.stateProv ? ', ' : ''}
                          {team.stateProv}
                        </div>
                      )}
                    </div>
                    {stats && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {stats.rebuiltRating.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                    )}
                  </div>
                  {stats && (
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <span className="font-semibold">{stats.avgAutoBalls.toFixed(1)}</span> auto
                      </div>
                      <div>
                        <span className="font-semibold">{stats.avgTeleopBalls.toFixed(1)}</span> teleop
                      </div>
                      <div>
                        <span className="font-semibold">{stats.accuracy.toFixed(0)}%</span> acc
                      </div>
                    </div>
                  )}
                  {!stats && (
                    <div className="text-xs text-gray-400 mt-2 italic">No scout data yet</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="bg-card rounded-lg p-4 border-2 border-primary/20 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-primary">Teams</h1>
          <span className="text-sm text-gray-600">{teams.length} teams scouted</span>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('stats')}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            Stats View
          </button>
          <button
            onClick={() => setViewMode('imported')}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Imported Teams ({importedTeams.length})
          </button>
        </div>
        <input
          type="text"
          placeholder="Search team number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg"
        />
      </div>

      {filteredTeams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {teams.length === 0
            ? 'No teams scouted yet. Start scouting matches!'
            : 'No teams found matching your search.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTeams.map((team) => (
            <button
              key={team.teamNumber}
              onClick={() => setSelectedTeam(team.teamNumber)}
              className="w-full bg-card rounded-lg p-4 border border-border text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-xl font-bold text-gray-800">
                    Team {team.teamNumber}
                  </div>
                  {team.teamName && (
                    <div className="text-sm text-gray-600">{team.teamName}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {team.rebuiltRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-semibold">{team.avgAutoBalls.toFixed(1)}</span> auto
                </div>
                <div>
                  <span className="font-semibold">{team.avgTeleopBalls.toFixed(1)}</span> teleop
                </div>
                <div>
                  <span className="font-semibold">{team.accuracy.toFixed(0)}%</span> acc
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {team.matches.length} match{team.matches.length !== 1 ? 'es' : ''}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

