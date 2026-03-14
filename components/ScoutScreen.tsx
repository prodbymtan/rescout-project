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
  const makeScoutId = () =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `fallback-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [matchNumber, setMatchNumber] = useState('Q42');
  const [alliance, setAlliance] = useState<Alliance>('red');
  const [teamNumber, setTeamNumber] = useState(0);
  const [position, setPosition] = useState<Position>(2);
  const [activePhase, setActivePhase] = useState<Phase>('auto');
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
  const [phaseKey, setPhaseKey] = useState(0);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  useEffect(() => {
    setPhaseKey((prev) => prev + 1);
  }, [activePhase]);

  const addUndoAction = (action: string) => {
    setUndoStack((prev) => [{ action, timestamp: Date.now() }, ...prev.slice(0, 2)]);
  };

  const resetForm = () => {
    setAutoBalls({ made: 0, miss: 0 });
    setPreloadBalls(0);
    setTowerClimb('none');
    setAutoWinner(undefined);
    setTeleopBalls({ made: 0, miss: 0 });
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
    setEditingEntryId(null);
  };

  useEffect(() => {
    if (!matchNumber || teamNumber <= 0) {
      setEditingEntryId(null);
      return;
    }

    const existing = storage
      .getScoutData()
      .filter(
        (entry) =>
          entry.matchNumber === matchNumber &&
          entry.teamNumber === teamNumber &&
          entry.alliance === alliance &&
          entry.position === position &&
          (scoutProfile ? entry.scoutName === scoutProfile : true)
      )
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (!existing) {
      setEditingEntryId(null);
      return;
    }

    setEditingEntryId(existing.id);
    setAutoBalls(existing.auto?.ballCounts ?? { made: 0, miss: 0 });
    setPreloadBalls(existing.auto?.preloadBalls ?? 0);
    setTowerClimb(existing.auto?.towerClimb ?? 'none');
    setAutoWinner(existing.auto?.autoWinner);
    setTeleopBalls(existing.teleop?.ballCounts ?? { made: 0, miss: 0 });
    setClimb(existing.endgame?.climb ?? 'none');
    setParked(existing.endgame?.parked ?? false);
    setGotDefended(existing.endgame?.gotDefended ?? 'none');
    setPlayedDefense(existing.endgame?.playedDefense ?? 'none');
    setNotes(existing.endgame?.notes ?? '');
    setTags(Array.isArray(existing.endgame?.tags) ? existing.endgame.tags : []);
    setEnergizedRP(existing.endgame?.energizedRP ?? false);
    setSuperchargedRP(existing.endgame?.superchargedRP ?? false);
    setTraversalRP(existing.endgame?.traversalRP ?? false);
    setMatchWin(existing.endgame?.matchWin ?? false);
    setMatchTie(existing.endgame?.matchTie ?? false);
    setMajorContributor(existing.endgame?.majorContributor ?? false);
    setUndoStack([]);
  }, [matchNumber, teamNumber, alliance, position, scoutProfile]);

  const handleSubmit = () => {
    const config = storage.getConfig();
    const submitTotalTeleopMade = teleopBalls.made;
    const submitTotalTeleopAttempted = submitTotalTeleopMade + teleopBalls.miss;
    
    // Error checks as per ChiefDelphi post priorities
    const warnings: string[] = [];
    
    
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
      id: editingEntryId ?? makeScoutId(),
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
        cycles: [],
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

    alert(editingEntryId ? 'Match data updated!' : 'Match data saved!');
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
        onMatchChange={setMatchNumber}
        onAllianceChange={setAlliance}
        onTeamChange={setTeamNumber}
        onPositionChange={setPosition}
      />

      {undoStack.length > 0 && (
        <UndoBar undoStack={undoStack} onUndo={() => setUndoStack((prev) => prev.slice(1))} />
      )}
      <div className="px-3 pt-2">
        {editingEntryId ? (
          <div className="text-xs px-3 py-2 rounded-lg border border-orange-300 bg-orange-50 text-orange-700 flex items-center justify-between">
            <span>Editing existing scout entry for this match/team.</span>
            <button
              type="button"
              onClick={resetForm}
              className="ml-2 px-2 py-1 rounded border border-orange-400 text-orange-700 hover:bg-orange-100"
            >
              New Blank Entry
            </button>
          </div>
        ) : (
          <div className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
            No existing entry found for this match/team slot.
          </div>
        )}
      </div>

      {/* Phase Tabs */}
      <div className="flex border-b border-border bg-card shrink-0 px-2 py-2 gap-2">
        {(['auto', 'teleop', 'endgame'] as Phase[]).map((phase) => (
          <button
            key={phase}
            onClick={() => setActivePhase(phase)}
            className={`flex-1 min-h-[44px] py-2.5 px-2 text-xs sm:text-sm font-semibold uppercase tracking-wide transition-all rounded-md y2k-segment y2k-pill ${
              activePhase === phase
                ? 'text-secondary border border-secondary/50 y2k-blue-glow'
                : 'text-gray-500 border border-border hover:border-secondary/40 hover:text-secondary'
            }`}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Phase Content */}
      <div key={phaseKey} className="flex-1 overflow-y-auto y2k-phase-enter">
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
      <div className="px-3 py-3 y2k-panel border-t border-border shadow-lg shrink-0">
        {activePhase === 'teleop' && (
          <div className="mb-2 p-2 y2k-panel-soft border border-secondary/30 rounded-lg text-xs text-gray-500">
            <span className="font-semibold text-gray-300">Live: </span>
            <span className="font-bold text-secondary y2k-readout">{teleopBalls.made}/{teleopBalls.made + teleopBalls.miss}</span>
            <span className="mx-1.5">·</span>
            <span className="font-bold text-success">{totalTeleopMade}</span> made
            <span className="mx-1.5">·</span>
            <span className="font-bold text-gray-300">{teleopAccuracy.toFixed(0)}%</span> acc
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="w-full min-h-[56px] py-3 text-white font-bold text-base rounded-xl active:scale-[0.98] transition-all shadow-lg button-press y2k-button-primary y2k-pill y2k-orange-glow"
        >
          {editingEntryId ? '✓ Update Match Data' : '✓ Submit Match Data'}
        </button>
      </div>
    </div>
  );
}
