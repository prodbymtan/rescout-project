'use client';

import { BallCount } from '@/types';

interface TeleopSectionProps {
  balls: BallCount;
  onBallsChange: (balls: BallCount) => void;
  cycles: Array<{ id: string; startTime: number; endTime: number; ballsScored: number }>;
  onCyclesChange: (cycles: Array<{ id: string; startTime: number; endTime: number; ballsScored: number }>) => void;
  currentCycle: { startTime: number } | null;
  onCurrentCycleChange: (cycle: { startTime: number } | null) => void;
  matchTime: number;
  onUndo: (action: string) => void;
}

export default function TeleopSection({
  balls,
  onBallsChange,
  cycles,
  onCyclesChange,
  currentCycle,
  onCurrentCycleChange,
  matchTime,
  onUndo,
}: TeleopSectionProps) {
  const updateBall = (type: keyof BallCount, delta: number) => {
    const currentValue = balls[type] || 0;
    const newBalls = { ...balls, [type]: Math.max(0, currentValue + delta) };
    onBallsChange(newBalls);
    onUndo(`${delta > 0 ? '+' : '-'} ${type}`);
    
    // Haptic feedback simulation
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleStartCycle = () => {
    if (!currentCycle) {
      onCurrentCycleChange({ startTime: matchTime });
    }
  };

  const handleEndCycle = () => {
    if (currentCycle) {
      const cycleTime = currentCycle.startTime - matchTime;
      const ballsScored = prompt('How many balls scored in this cycle?', '0');
      if (ballsScored !== null) {
        const newCycle = {
          id: `cycle-${Date.now()}`,
          startTime: currentCycle.startTime,
          endTime: matchTime,
          ballsScored: parseInt(ballsScored) || 0,
        };
        onCyclesChange([...cycles, newCycle]);
        onCurrentCycleChange(null);
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Cycle Tracking */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Cycle Tracking</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleStartCycle}
            disabled={!!currentCycle}
            className={`py-4 font-semibold rounded-lg transition-all ${
              currentCycle
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-secondary text-white hover:bg-secondary-dark active:scale-95'
            }`}
          >
            Start Cycle
          </button>
          <button
            onClick={handleEndCycle}
            disabled={!currentCycle}
            className={`py-4 font-semibold rounded-lg transition-all ${
              !currentCycle
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-secondary text-white hover:bg-secondary-dark active:scale-95'
            }`}
          >
            End Cycle
          </button>
        </div>
        {currentCycle && (
          <div className="text-sm text-gray-600 bg-secondary/10 p-2 rounded">
            Cycle in progress (started at {currentCycle.startTime}s)
          </div>
        )}
        {cycles.length > 0 && (
          <div className="text-sm text-gray-600">
            {cycles.length} cycle{cycles.length !== 1 ? 's' : ''} logged
          </div>
        )}
      </div>

      {/* Fuel Scoring */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Fuel Scoring</h3>
        
        {/* Fuel Made/Miss */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <button
              onClick={() => updateBall('made', 1)}
              className="w-full py-6 bg-primary text-white font-bold text-xl rounded-lg hover:bg-primary-dark active:scale-95 transition-all shadow-lg button-press"
            >
              + Fuel Made
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => updateBall('made', -1)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 font-semibold rounded hover:bg-gray-300 active:scale-95"
              >
                −1
              </button>
              <div className="flex-1 py-2 bg-gray-50 text-center font-bold text-lg rounded">
                {balls.made}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => updateBall('miss', 1)}
              className="w-full py-6 bg-secondary text-white font-bold text-xl rounded-lg hover:bg-secondary-dark active:scale-95 transition-all shadow-lg button-press"
            >
              + Fuel Miss
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => updateBall('miss', -1)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 font-semibold rounded hover:bg-gray-300 active:scale-95"
              >
                −1
              </button>
              <div className="flex-1 py-2 bg-gray-50 text-center font-bold text-lg rounded">
                {balls.miss}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

