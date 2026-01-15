'use client';

import { useState, useEffect } from 'react';
import { MatchScoutData, Alliance, Position, BallCount } from '@/types';
import { storage } from '@/lib/storage';
import AutoSection from './scout/AutoSection';
import TeleopSection from './scout/TeleopSection';
import EndgameSection from './scout/EndgameSection';
import MatchHeader from './scout/MatchHeader';
import UndoBar from './scout/UndoBar';

type Phase = 'auto' | 'teleop' | 'endgame';

export default function ScoutScreen() {
  const [matchNumber, setMatchNumber] = useState('Q42');
  const [alliance, setAlliance] = useState<Alliance>('red');
  const [teamNumber, setTeamNumber] = useState(0);
  const [position, setPosition] = useState<Position>(2);
  const [activePhase, setActivePhase] = useState<Phase>('auto');
  const [matchTime, setMatchTime] = useState(160); // seconds - 2:40 match duration
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [undoStack, setUndoStack] = useState<Array<{ action: string; timestamp: number }>>([]);
  const [scoutProfile, setScoutProfile] = useState<string | null>(null);

  // Load scout profile on mount
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setScoutProfile(data.profile))
      .catch(() => setScoutProfile(null));
  }, []);

  // Auto state
  const [autoBalls, setAutoBalls] = useState<BallCount>({
    made: 0,
    miss: 0,
  });
  const [preloadBalls, setPreloadBalls] = useState(0);
  const [towerClimb, setTowerClimb] = useState<'none' | 'level1' | 'failed'>('none');
  const [autoWinner, setAutoWinner] = useState<'red' | 'blue' | undefined>(undefined);

  // Teleop state
  const [teleopBalls, setTeleopBalls] = useState<BallCount>({
    made: 0,
    miss: 0,
  });
  const [cycles, setCycles] = useState<Array<{ id: string; startTime: number; endTime: number; ballsScored: number }>>([]);
  const [currentCycle, setCurrentCycle] = useState<{ startTime: number } | null>(null);

  // Endgame state
  const [climb, setClimb] = useState<'none' | 'failed' | 'low' | 'mid' | 'high'>('none');
  const [parked, setParked] = useState(false);
  const [gotDefended, setGotDefended] = useState<'none' | 'light' | 'heavy'>('none');
  const [playedDefense, setPlayedDefense] = useState<'none' | 'light' | 'heavy'>('none');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [energizedRP, setEnergizedRP] = useState(false);
  const [superchargedRP, setSuperchargedRP] = useState(false);
  const [traversalRP, setTraversalRP] = useState(false);
  const [matchWin, setMatchWin] = useState(false);
  const [matchTie, setMatchTie] = useState(false);
  const [majorContributor, setMajorContributor] = useState(false);

  // Timer with start/pause control
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setMatchTime((prev) => {
        if (prev <= 0) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleTimerStart = () => {
    setIsTimerRunning(true);
  };

  const handleTimerPause = () => {
    setIsTimerRunning(false);
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setMatchTime(160); // Reset to 2:40
  };

  const addUndoAction = (action: string) => {
    setUndoStack((prev) => [{ action, timestamp: Date.now() }, ...prev.slice(0, 2)]);
  };

  const handleSubmit = () => {
    const config = storage.getConfig();
    const submitTotalTeleopMade = teleopBalls.made;
    const submitTotalTeleopAttempted = submitTotalTeleopMade + teleopBalls.miss;
    
    // Error checks as per ChiefDelphi post priorities
    const warnings: string[] = [];
    
    // Check for zero teleop balls but notes suggest activity
    if (submitTotalTeleopMade === 0 && notes.toLowerCase().includes('cycle')) {
      warnings.push("You logged 0 teleop fuel but notes mention cycling - confirm?");
    }
    
    // Check for unrealistic ball counts
    if (submitTotalTeleopMade > config.normalBallRange.max) {
      warnings.push(`You logged ${submitTotalTeleopMade} teleop fuel (typical: ${config.normalBallRange.min}-${config.normalBallRange.max}). Confirm?`);
    }
    
    if (warnings.length > 0) {
      if (!confirm(warnings.join('\n\n') + '\n\nProceed with submission?')) {
        return;
      }
    }

    const scoutData: MatchScoutData = {
      id: `${matchNumber}-${teamNumber}-${Date.now()}`,
      matchNumber,
      alliance,
      teamNumber,
      position,
      auto: {
        ballCounts: autoBalls,
        preloadBalls,
        towerClimb,
        autoWinner,
      },
      teleop: {
        ballCounts: teleopBalls,
        cycles: cycles.map(c => ({
          id: c.id,
          startTime: c.startTime,
          endTime: c.endTime,
          ballsScored: c.ballsScored,
        })),
      },
      endgame: {
        climb,
        parked,
        gotDefended,
        playedDefense,
        notes,
        tags,
        energizedRP,
        superchargedRP,
        traversalRP,
        matchWin,
        matchTie,
        majorContributor,
      },
      timestamp: Date.now(),
      scoutName: scoutProfile || undefined,
    };

    storage.addScoutData(scoutData);
    
    // Reset form
    setAutoBalls({ made: 0, miss: 0 });
    setPreloadBalls(0);
    setTowerClimb('none');
    setAutoWinner(undefined);
    setTeleopBalls({ made: 0, miss: 0 });
    setCycles([]);
    setClimb('none');
    setParked(false);
    setGotDefended('none');
    setPlayedDefense('none');
    setNotes('');
    setTags([]);
    setEnergizedRP(false);
    setSuperchargedRP(false);
    setTraversalRP(false);
    setMatchWin(false);
    setMatchTie(false);
    setMajorContributor(false);
    setUndoStack([]);
    
    alert('Match data saved!');
  };

  const totalTeleopMade = teleopBalls.made;
  const totalTeleopAttempted = totalTeleopMade + teleopBalls.miss;
  const teleopAccuracy = totalTeleopAttempted > 0 ? (totalTeleopMade / totalTeleopAttempted) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-background">
      <MatchHeader
        matchNumber={matchNumber}
        alliance={alliance}
        teamNumber={teamNumber}
        position={position}
        matchTime={matchTime}
        isTimerRunning={isTimerRunning}
        autoWinner={autoWinner}
        onMatchChange={setMatchNumber}
        onAllianceChange={setAlliance}
        onTeamChange={setTeamNumber}
        onPositionChange={setPosition}
        onTimerStart={handleTimerStart}
        onTimerPause={handleTimerPause}
        onTimerReset={handleTimerReset}
      />

      {undoStack.length > 0 && (
        <UndoBar undoStack={undoStack} onUndo={() => setUndoStack((prev) => prev.slice(1))} />
      )}

      {/* Phase Tabs */}
      <div className="flex border-b border-border bg-card">
        {(['auto', 'teleop', 'endgame'] as Phase[]).map((phase) => (
          <button
            key={phase}
            onClick={() => setActivePhase(phase)}
            className={`flex-1 py-3 px-4 text-sm font-semibold capitalize transition-colors ${
              activePhase === phase
                ? 'bg-primary text-white'
                : 'bg-card text-gray-600 hover:bg-gray-50'
            }`}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Phase Content */}
      <div className="flex-1 overflow-y-auto">
        {activePhase === 'auto' && (
          <AutoSection
            balls={autoBalls}
            onBallsChange={setAutoBalls}
            preloadBalls={preloadBalls}
            onPreloadBallsChange={setPreloadBalls}
            towerClimb={towerClimb}
            onTowerClimbChange={setTowerClimb}
            autoWinner={autoWinner}
            onAutoWinnerChange={setAutoWinner}
            onUndo={addUndoAction}
          />
        )}

        {activePhase === 'teleop' && (
          <TeleopSection
            balls={teleopBalls}
            onBallsChange={setTeleopBalls}
            cycles={cycles}
            onCyclesChange={setCycles}
            currentCycle={currentCycle}
            onCurrentCycleChange={setCurrentCycle}
            matchTime={matchTime}
            onUndo={addUndoAction}
          />
        )}

        {activePhase === 'endgame' && (
          <EndgameSection
            climb={climb}
            onClimbChange={setClimb}
            parked={parked}
            onParkedChange={setParked}
            gotDefended={gotDefended}
            onGotDefendedChange={setGotDefended}
            playedDefense={playedDefense}
            onPlayedDefenseChange={setPlayedDefense}
            notes={notes}
            onNotesChange={setNotes}
            tags={tags}
            onTagsChange={setTags}
            energizedRP={energizedRP}
            onEnergizedRPChange={setEnergizedRP}
            superchargedRP={superchargedRP}
            onSuperchargedRPChange={setSuperchargedRP}
            traversalRP={traversalRP}
            onTraversalRPChange={setTraversalRP}
            matchWin={matchWin}
            onMatchWinChange={setMatchWin}
            matchTie={matchTie}
            onMatchTieChange={setMatchTie}
            majorContributor={majorContributor}
            onMajorContributorChange={setMajorContributor}
          />
        )}
      </div>

      {/* Submit Button */}
      <div className="p-4 bg-card border-t-2 border-primary/20 shadow-lg">
        {activePhase === 'teleop' && (
          <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-gray-700">
            <div className="font-semibold mb-1 text-gray-800">Live Totals:</div>
            <div className="grid grid-cols-2 gap-2">
              <div>Fuel Made: <span className="font-bold text-primary">{teleopBalls.made}/{teleopBalls.made + teleopBalls.miss}</span></div>
              <div>Total Made: <span className="font-bold text-success">{totalTeleopMade}</span></div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              Accuracy: <span className="font-bold">{teleopAccuracy.toFixed(1)}%</span>
            </div>
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-primary text-white font-bold text-lg rounded-lg hover:bg-primary-dark active:scale-98 transition-all shadow-lg button-press"
        >
          ✓ Submit Match Data
        </button>
      </div>
    </div>
  );
}

