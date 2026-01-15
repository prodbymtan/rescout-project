'use client';

import { Alliance, Position } from '@/types';
import { storage, TeamData } from '@/lib/storage';
import { useEffect, useState } from 'react';

interface MatchHeaderProps {
  matchNumber: string;
  alliance: Alliance;
  teamNumber: number;
  position: Position;
  matchTime: number;
  isTimerRunning: boolean;
  autoWinner?: 'red' | 'blue';
  onMatchChange: (value: string) => void;
  onAllianceChange: (value: Alliance) => void;
  onTeamChange: (value: number) => void;
  onPositionChange: (value: Position) => void;
  onTimerStart: () => void;
  onTimerPause: () => void;
  onTimerReset: () => void;
}

export default function MatchHeader({
  matchNumber,
  alliance,
  teamNumber,
  position,
  matchTime,
  isTimerRunning,
  autoWinner,
  onMatchChange,
  onAllianceChange,
  onTeamChange,
  onPositionChange,
  onTimerStart,
  onTimerPause,
  onTimerReset,
}: MatchHeaderProps) {
  const [availableTeams, setAvailableTeams] = useState<TeamData[]>([]);

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
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhase = (time: number, autoWinner?: 'red' | 'blue') => {
    // Match timeline: 160 seconds total (2:40)
    // AUTO: 160-140 (2:40 - 2:20) - First 20 seconds - Both hubs active
    if (time > 140) {
      return { 
        name: 'AUTO', 
        color: 'bg-gradient-to-r from-red-600 to-blue-600', 
        progressColor: 'bg-gradient-to-r from-red-500 to-blue-500',
        textColor: 'text-white'
      };
    }
    
    // DELAY: 140-137 (2:20 - 2:17) - 3 second delay between auto and teleop
    if (time > 137) {
      return { 
        name: 'DELAY', 
        color: 'bg-gray-500', 
        progressColor: 'bg-gray-500',
        textColor: 'text-white'
      };
    }
    
    // TRANSITION SHIFT: 137-127 (2:17 - 2:07) - 10 seconds - Both hubs active - PURPLE
    if (time > 127) {
      return { 
        name: 'TRANSITION', 
        color: 'bg-purple-600', 
        progressColor: 'bg-purple-500',
        textColor: 'text-white'
      };
    }
    
    // END GAME: 30-0 (0:30 - 0:00) - Both hubs active
    if (time <= 30) {
      return { 
        name: 'END GAME', 
        color: 'bg-gradient-to-r from-red-600 to-blue-600', 
        progressColor: 'bg-gradient-to-r from-red-500 to-blue-500',
        textColor: 'text-white'
      };
    }
    
    // SHIFTS: Based on autoWinner
    // SHIFT 1: 130-105 (2:10 - 1:45)
    // SHIFT 2: 105-80 (1:45 - 1:20)
    // SHIFT 3: 80-55 (1:20 - 0:55)
    // SHIFT 4: 55-30 (0:55 - 0:30)
    
    // SHIFT 1: 127-102 (2:07 - 1:42) - 25 seconds
    if (time > 102) {
      // Winner's hub INACTIVE, opposite hub ACTIVE
      if (!autoWinner) {
        return { 
          name: 'SHIFT 1', 
          color: 'bg-gray-500', 
          progressColor: 'bg-gray-500',
          textColor: 'text-white'
        };
      }
      const shiftColor = autoWinner === 'red' ? 'bg-blue-600' : 'bg-red-600';
      const activeHub = autoWinner === 'red' ? 'blue' : 'red';
      return { 
        name: 'SHIFT 1', 
        color: shiftColor, 
        progressColor: shiftColor,
        textColor: 'text-white',
        activeHub
      };
    }
    // SHIFT 2: 102-77 (1:42 - 1:17) - 25 seconds
    if (time > 77) {
      // Winner's hub ACTIVE, opposite hub INACTIVE
      if (!autoWinner) {
        return { 
          name: 'SHIFT 2', 
          color: 'bg-gray-500', 
          progressColor: 'bg-gray-500',
          textColor: 'text-white'
        };
      }
      const shiftColor = autoWinner === 'red' ? 'bg-red-600' : 'bg-blue-600';
      return { 
        name: 'SHIFT 2', 
        color: shiftColor, 
        progressColor: shiftColor,
        textColor: 'text-white',
        activeHub: autoWinner
      };
    }
    // SHIFT 3: 77-52 (1:17 - 0:52) - 25 seconds
    if (time > 52) {
      // Winner's hub INACTIVE, opposite hub ACTIVE (same as Shift 1)
      if (!autoWinner) {
        return { 
          name: 'SHIFT 3', 
          color: 'bg-gray-500', 
          progressColor: 'bg-gray-500',
          textColor: 'text-white'
        };
      }
      const shiftColor = autoWinner === 'red' ? 'bg-blue-600' : 'bg-red-600';
      const activeHub = autoWinner === 'red' ? 'blue' : 'red';
      return { 
        name: 'SHIFT 3', 
        color: shiftColor, 
        progressColor: shiftColor,
        textColor: 'text-white',
        activeHub
      };
    }
    // SHIFT 4: 52-30 (0:52 - 0:30) - 22 seconds
    if (time > 30) {
      // Winner's hub ACTIVE, opposite hub INACTIVE (same as Shift 2)
      if (!autoWinner) {
        return { 
          name: 'SHIFT 4', 
          color: 'bg-gray-500', 
          progressColor: 'bg-gray-500',
          textColor: 'text-white'
        };
      }
      const shiftColor = autoWinner === 'red' ? 'bg-red-600' : 'bg-blue-600';
      return { 
        name: 'SHIFT 4', 
        color: shiftColor, 
        progressColor: shiftColor,
        textColor: 'text-white',
        activeHub: autoWinner
      };
    }
    
    // Fallback
    return { 
      name: 'TELEOP', 
      color: 'bg-gray-500', 
      progressColor: 'bg-gray-500',
      textColor: 'text-white'
    };
  };

  const phase = getPhase(matchTime, autoWinner);
  const progress = ((160 - matchTime) / 160) * 100;
  const allianceColor = alliance === 'red' ? 'border-l-4 border-l-red-600 bg-red-50/30' : 'border-l-4 border-l-blue-600 bg-blue-50/30';
  const allianceTextColor = alliance === 'red' ? 'text-red-700' : 'text-blue-700';
  const allianceBg = alliance === 'red' ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className={`bg-card border-b-2 border-border p-4 ${allianceColor} transition-colors`}>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Match</label>
          <input
            type="text"
            value={matchNumber}
            onChange={(e) => onMatchChange(e.target.value)}
            className="w-full px-2 py-1 border border-border rounded text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Team</label>
          {availableTeams.length > 0 ? (
            <select
              value={teamNumber}
              onChange={(e) => onTeamChange(Number(e.target.value))}
              className="w-full px-2 py-1 border border-border rounded text-sm font-semibold bg-white"
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
              className="w-full px-2 py-1 border border-border rounded text-sm font-semibold"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Alliance</label>
          <div className="flex gap-2">
            <button
              onClick={() => onAllianceChange('red')}
              className={`flex-1 py-2 px-3 rounded font-semibold text-sm transition-colors ${
                alliance === 'red'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              Red
            </button>
            <button
              onClick={() => onAllianceChange('blue')}
              className={`flex-1 py-2 px-3 rounded font-semibold text-sm transition-colors ${
                alliance === 'blue'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700'
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
                className={`flex-1 py-2 rounded font-semibold text-sm transition-colors ${
                  position === pos
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${allianceTextColor}`}>
              {alliance === 'red' ? '🔴 RED' : '🔵 BLUE'}
            </span>
            <span className="text-sm font-semibold text-gray-700">{formatTime(matchTime)}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs px-2 py-1 rounded font-semibold ${phase.color} ${phase.textColor || 'text-white'}`}>
              {phase.name}
            </span>
            {phase.name.startsWith('SHIFT') && (phase as any).activeHub && (
              <span className="text-xs text-gray-600">
                {(phase as any).activeHub === 'red' ? '🔴' : '🔵'} Hub Active
              </span>
            )}
            {(phase.name === 'TRANSITION' || phase.name === 'AUTO' || phase.name === 'END GAME') && (
              <span className="text-xs text-gray-600">
                🔴🔵 Both Active
              </span>
            )}
          </div>
        </div>
        
        {/* Timer Controls */}
        <div className="flex gap-2 mb-2">
          {!isTimerRunning ? (
            <button
              onClick={onTimerStart}
              className="flex-1 py-2 bg-success text-white font-semibold rounded-lg hover:bg-green-600 active:scale-95 transition-all shadow-sm"
            >
              ▶ Start
            </button>
          ) : (
            <button
              onClick={onTimerPause}
              className="flex-1 py-2 bg-warning text-white font-semibold rounded-lg hover:bg-yellow-600 active:scale-95 transition-all shadow-sm"
            >
              ⏸ Pause
            </button>
          )}
          <button
            onClick={onTimerReset}
            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 active:scale-95 transition-all shadow-sm"
          >
            ↻ Reset
          </button>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${phase.progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

