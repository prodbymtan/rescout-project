'use client';

import { BallCount } from '@/types';

interface AutoSectionProps {
  balls: BallCount;
  onBallsChange: (balls: BallCount) => void;
  preloadBalls: number;
  onPreloadBallsChange: (value: number) => void;
  towerClimb: 'none' | 'level1' | 'failed';
  onTowerClimbChange: (value: 'none' | 'level1' | 'failed') => void;
  autoWinner?: 'red' | 'blue';
  onAutoWinnerChange: (value: 'red' | 'blue' | undefined) => void;
  onUndo: (action: string) => void;
}

export default function AutoSection({
  balls,
  onBallsChange,
  preloadBalls,
  onPreloadBallsChange,
  towerClimb,
  onTowerClimbChange,
  autoWinner,
  onAutoWinnerChange,
  onUndo,
}: AutoSectionProps) {
  const updateBall = (type: keyof BallCount, delta: number) => {
    const currentValue = balls[type] || 0;
    const newBalls = { ...balls, [type]: Math.max(0, currentValue + delta) };
    onBallsChange(newBalls);
    onUndo(`${delta > 0 ? '+' : '-'} ${type}`);
    
    // Haptic feedback simulation (visual only on web)
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const totalMade = balls.made;
  const totalAttempted = totalMade + balls.miss;
  const accuracy = totalAttempted > 0 ? (totalMade / totalAttempted) * 100 : 0;

  return (
    <div className="p-4 space-y-6">
      {/* Fuel Scoring */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Fuel Scoring</h3>
        
        {/* Fuel Made */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => updateBall('made', 1)}
            className="col-span-2 py-6 bg-primary text-white font-bold text-xl rounded-lg hover:bg-primary-dark active:scale-95 transition-all shadow-lg button-press"
          >
            + Fuel Made
          </button>
          <button
            onClick={() => updateBall('made', -1)}
            className="py-6 bg-gray-200 text-gray-700 font-bold text-xl rounded-lg hover:bg-gray-300 active:scale-95 transition-all button-press"
          >
            −
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => updateBall('miss', 1)}
            className="col-span-2 py-6 bg-secondary text-white font-bold text-xl rounded-lg hover:bg-secondary-dark active:scale-95 transition-all shadow-lg button-press"
          >
            + Fuel Miss
          </button>
          <button
            onClick={() => updateBall('miss', -1)}
            className="py-6 bg-gray-200 text-gray-700 font-bold text-xl rounded-lg hover:bg-gray-300 active:scale-95 transition-all button-press"
          >
            −
          </button>
        </div>
      </div>

      {/* Starting Info */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Starting Info</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <label className="font-medium flex-1">
              Preloaded balls
              <span className="block text-xs text-gray-500">
                How many game pieces did the robot start auto with?
              </span>
            </label>
            <input
              type="number"
              min={0}
              max={5}
              value={preloadBalls}
              onChange={(e) => onPreloadBallsChange(Math.max(0, Math.min(5, Number(e.target.value) || 0)))}
              className="w-20 px-2 py-1 border border-border rounded-lg text-center"
            />
          </div>
        </div>
      </div>

      {/* Tower Climb */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Tower Climb</h3>
        <p className="text-sm text-gray-600 mb-3">
          Did the robot climb the tower during AUTO? (Level 1 max, 15 points)
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(['none', 'level1', 'failed'] as const).map((level) => (
            <button
              key={level}
              onClick={() => {
                onTowerClimbChange(level);
                onUndo(`Tower climb: ${level}`);
              }}
              className={`py-4 px-3 rounded-lg font-semibold text-sm capitalize transition-colors ${
                towerClimb === level
                  ? 'bg-primary text-white border-2 border-primary-dark'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {level === 'level1' ? 'Level 1' : level === 'none' ? 'None' : 'Failed'}
            </button>
          ))}
        </div>
        {towerClimb === 'level1' && (
          <p className="text-xs text-gray-500 mt-2">
            ✓ Robot climbed to Level 1 (15 points)
          </p>
        )}
      </div>

      {/* Auto Winner Question */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Auto Result</h3>
        <p className="text-sm text-gray-600 mb-3">
          Which alliance scored more fuel during AUTO? (Determines hub shifts)
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const newWinner = autoWinner === 'red' ? undefined : 'red';
              onAutoWinnerChange(newWinner);
              onUndo(`Auto winner: ${newWinner || 'none'}`);
            }}
            className={`py-4 px-3 rounded-lg font-semibold text-sm transition-colors ${
              autoWinner === 'red'
                ? 'bg-red-600 text-white border-2 border-red-700'
                : 'bg-red-100 text-red-700 border-2 border-red-200 hover:bg-red-200'
            }`}
          >
            🔴 Red Alliance
          </button>
          <button
            onClick={() => {
              const newWinner = autoWinner === 'blue' ? undefined : 'blue';
              onAutoWinnerChange(newWinner);
              onUndo(`Auto winner: ${newWinner || 'none'}`);
            }}
            className={`py-4 px-3 rounded-lg font-semibold text-sm transition-colors ${
              autoWinner === 'blue'
                ? 'bg-blue-600 text-white border-2 border-blue-700'
                : 'bg-blue-100 text-blue-700 border-2 border-blue-200 hover:bg-blue-200'
            }`}
          >
            🔵 Blue Alliance
          </button>
        </div>
        {autoWinner && (
          <div className="text-xs text-gray-600 mt-3 p-2 bg-gray-50 rounded">
            <p className="font-semibold mb-1">Hub Schedule:</p>
            <div className="space-y-1">
              <div>Shift 1 & 3: <span className="font-semibold">{autoWinner === 'red' ? '🔵 Blue' : '🔴 Red'} Hub Active</span></div>
              <div>Shift 2 & 4: <span className="font-semibold">{autoWinner === 'red' ? '🔴 Red' : '🔵 Blue'} Hub Active</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Bar */}
      <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4 shadow-sm">
        <div className="text-sm font-bold text-gray-800 mb-1">
          Auto Summary:
        </div>
        <div className="text-xs text-gray-700">
          <span className="font-semibold">{totalMade}/{totalAttempted}</span> fuel | 
          <span className="font-semibold text-success ml-1">{accuracy.toFixed(1)}%</span> accuracy
        </div>
      </div>
    </div>
  );
}

