'use client';

import { Alliance, Position } from '@/types';
import { storage, TeamData } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { AllianceDot } from '@/components/icons/HyperIcons';

interface MatchHeaderProps {
  matchNumber: string;
  alliance: Alliance;
  teamNumber: number;
  position: Position;
  onMatchChange: (value: string) => void;
  onAllianceChange: (value: Alliance) => void;
  onTeamChange: (value: number) => void;
  onPositionChange: (value: Position) => void;
}

export default function MatchHeader({
  matchNumber,
  alliance,
  teamNumber,
  position,
  onMatchChange,
  onAllianceChange,
  onTeamChange,
  onPositionChange,
}: MatchHeaderProps) {
  const [availableTeams, setAvailableTeams] = useState<TeamData[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem('rescout.matchHeaderCollapsed') === '1');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('rescout.matchHeaderCollapsed', collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [collapsed]);

  useEffect(() => {
    const teams = storage.getTeams();
    setAvailableTeams(teams);
    // Listen for team imports
    const interval = setInterval(() => {
      const updatedTeams = storage.getTeams();
      setAvailableTeams(updatedTeams);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const allianceColor = alliance === 'red' ? 'border-l-4 border-l-red-500/70' : 'border-l-4 border-l-blue-500/70';
  const allianceTextColor = alliance === 'red' ? 'text-red-400' : 'text-blue-400';
  const allianceLabel = alliance === 'red' ? 'RED ALLIANCE' : 'BLUE ALLIANCE';

  return (
    <div
      className={`y2k-panel y2k-outline border-b border-border ${collapsed ? 'px-4 py-2' : 'px-4 pt-4 pb-3'} ${allianceColor} transition-colors`}
    >
      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wider text-gray-500">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-secondary font-semibold y2k-readout">Match {matchNumber || '—'}</span>
          <span className="text-gray-500">|</span>
          <span>Team {teamNumber || '—'}</span>
          <span className="text-gray-500">|</span>
          <span className={allianceTextColor}>{allianceLabel}</span>
          <span className="text-gray-500">|</span>
          <span>Position {position}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-gray-500 y2k-readout">Live</span>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            className="px-2 py-1 rounded-md border border-border text-gray-500 hover:text-secondary hover:border-secondary/40 y2k-panel-soft y2k-pill"
            title={collapsed ? 'Show match setup' : 'Hide match setup'}
          >
            {collapsed ? 'Show' : 'Hide'}
          </button>
        </div>
      </div>
      {!collapsed && (
        <>
          <div className="mt-3 h-[2px] w-full y2k-bar rounded-full y2k-blue-glow" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Match</label>
              <input
                type="text"
                value={matchNumber}
                onChange={(e) => onMatchChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm font-semibold bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 y2k-panel-soft y2k-pill"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Team</label>
              {availableTeams.length > 0 ? (
                <select
                  value={teamNumber}
                  onChange={(e) => onTeamChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm font-semibold bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 y2k-panel-soft y2k-pill"
                >
                  <option value={0}>Select team...</option>
                  {availableTeams
                    .sort((a, b) => a.teamNumber - b.teamNumber)
                    .map((team) => (
                      <option key={team.teamNumber} value={team.teamNumber}>
                        {team.teamNumber} {team.teamName ? `- ${team.teamName}` : ''}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={teamNumber || ''}
                  onChange={(e) => onTeamChange(Number(e.target.value))}
                  placeholder="Enter team number"
                  className="w-full px-3 py-2 border border-border rounded-md text-sm font-semibold bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 y2k-panel-soft y2k-pill"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Alliance</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onAllianceChange('red')}
                  className={`flex-1 py-2 px-3 rounded-md font-semibold text-sm transition-colors y2k-pill ${
                    alliance === 'red'
                      ? 'bg-red-600 text-white ring-2 ring-red-400/40 y2k-orange-glow'
                      : 'bg-red-500/10 text-red-300 border border-red-500/30 y2k-panel-soft'
                  }`}
                >
                  Red
                </button>
                <button
                  onClick={() => onAllianceChange('blue')}
                  className={`flex-1 py-2 px-3 rounded-md font-semibold text-sm transition-colors y2k-pill ${
                    alliance === 'blue'
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400/40 y2k-blue-glow'
                      : 'bg-blue-500/10 text-blue-300 border border-blue-500/30 y2k-panel-soft'
                  }`}
                >
                  Blue
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Position</label>
              <div className="flex gap-1">
                {([1, 2, 3] as Position[]).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => onPositionChange(pos)}
                    className={`flex-1 py-2 rounded-md font-semibold text-sm transition-colors y2k-pill ${
                      position === pos
                        ? 'bg-secondary text-white ring-2 ring-secondary/40 y2k-blue-glow'
                        : 'bg-gray-200 text-gray-400 border border-border y2k-panel-soft'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center mt-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-2">
              <AllianceDot alliance={alliance} />
              Alliance ready
            </span>
          </div>
        </>
      )}
    </div>
  );
}
