'use client';

import { BallCount } from '@/types';
import { AllianceDot } from '@/components/icons/HyperIcons';

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
    onUndo(`${delta > 0 ? '+' : ''}${delta} ${type}`);
    
    // Haptic feedback simulation (visual only on web)
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const totalMade = balls.made;
  const totalAttempted = totalMade + balls.miss;
  const accuracy = totalAttempted > 0 ? (totalMade / totalAttempted) * 100 : 0;

  const incrementAmounts = [1, 5, 10] as const;

  const FuelCounter = ({
    type,
    label,
    bgClass,
    hoverClass,
  }: {
    type: 'made' | 'miss';
    label: string;
    bgClass: string;
    hoverClass: string;
  }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-xl font-bold tabular-nums">{balls[type] ?? 0}</span>
      </div>
      <div className="flex gap-1">
        {incrementAmounts.map((n) => (
          <button
            key={n}
            onClick={() => updateBall(type, n)}
            className={`flex-1 min-h-[56px] py-3 text-sm font-bold rounded-xl ${bgClass} text-white active:scale-95 transition-all button-press ${hoverClass} hover:brightness-110 y2k-pill`}
          >
            +{n}
          </button>
        ))}
        <button
          onClick={() => updateBall(type, -1)}
          className="min-w-[56px] min-h-[56px] py-3 px-3 bg-gray-200 text-gray-500 font-bold text-sm rounded-xl hover:border-secondary/40 border border-border active:scale-95 transition-all button-press y2k-panel-soft y2k-pill"
        >
          −
        </button>
      </div>
    </div>
  );

  return (
    <div className="px-3 py-4 space-y-5">
      {/* Fuel Scoring */}
      <div className="space-y-3 y2k-panel y2k-outline rounded-xl p-3">
        <h3 className="text-base font-semibold text-gray-800">Fuel Scoring</h3>
        <div className="space-y-4">
          <FuelCounter
            type="made"
            label="Fuel Made"
            bgClass="y2k-button-primary"
            hoverClass=""
          />
          <FuelCounter
            type="miss"
            label="Fuel Miss"
            bgClass="y2k-button-secondary"
            hoverClass=""
          />
        </div>
      </div>

      {/* Starting Info */}
      <div className="space-y-2 y2k-panel y2k-outline rounded-xl p-3">
        <h3 className="text-base font-semibold text-gray-800">Starting Info</h3>
        <div className="flex items-center justify-between gap-3 p-2.5 y2k-panel-soft rounded-lg">
          <label className="text-sm font-medium flex-1">
            Preloaded balls
          </label>
          <input
            type="number"
            min={0}
            max={8}
            value={preloadBalls}
            onChange={(e) => onPreloadBallsChange(Math.max(0, Math.min(5, Number(e.target.value) || 0)))}
            className="w-16 px-2 py-1.5 border border-border rounded-lg text-center text-sm bg-background text-foreground y2k-panel-soft y2k-pill"
          />
        </div>
      </div>

      {/* Tower Climb */}
      <div className="space-y-2 y2k-panel y2k-outline rounded-xl p-3">
        <h3 className="text-base font-semibold text-gray-800">Tower Climb</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['none', 'level1', 'failed'] as const).map((level) => (
            <button
              key={level}
              onClick={() => {
                onTowerClimbChange(level);
                onUndo(`Tower climb: ${level}`);
              }}
              className={`min-h-[52px] py-2.5 px-2 rounded-lg font-semibold text-xs capitalize transition-colors y2k-pill ${
                towerClimb === level
                  ? 'y2k-button-primary text-white border-2 border-primary-dark y2k-orange-glow'
                  : 'bg-gray-200 text-gray-500 border-2 border-border hover:border-secondary/40 y2k-panel-soft'
              }`}
            >
              {level === 'level1' ? 'Level 1' : level === 'none' ? 'None' : 'Failed'}
            </button>
          ))}
        </div>
        {towerClimb === 'level1' && (
          <p className="text-xs text-gray-500 mt-1">✓ Level 1 climbed</p>
        )}
      </div>

      {/* Auto Winner Question */}
      <div className="space-y-2 y2k-panel y2k-outline rounded-xl p-3">
        <h3 className="text-base font-semibold text-gray-800">Auto Result</h3>
        <p className="text-xs text-gray-600">Which alliance scored more fuel?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const newWinner = autoWinner === 'red' ? undefined : 'red';
              onAutoWinnerChange(newWinner);
              onUndo(`Auto winner: ${newWinner || 'none'}`);
            }}
            className={`min-h-[52px] py-2.5 px-2 rounded-lg font-semibold text-xs transition-colors y2k-pill ${
              autoWinner === 'red'
                ? 'bg-red-600 text-white border-2 border-red-700 y2k-orange-glow'
                : 'bg-red-500/10 text-red-300 border-2 border-red-500/30 hover:border-red-400/60 y2k-panel-soft'
            }`}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <AllianceDot alliance="red" />
              Red Alliance
            </span>
          </button>
          <button
            onClick={() => {
              const newWinner = autoWinner === 'blue' ? undefined : 'blue';
              onAutoWinnerChange(newWinner);
              onUndo(`Auto winner: ${newWinner || 'none'}`);
            }}
            className={`min-h-[52px] py-2.5 px-2 rounded-lg font-semibold text-xs transition-colors y2k-pill ${
              autoWinner === 'blue'
                ? 'bg-blue-600 text-white border-2 border-blue-700 y2k-blue-glow'
                : 'bg-blue-500/10 text-blue-300 border-2 border-blue-500/30 hover:border-blue-400/60 y2k-panel-soft'
            }`}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <AllianceDot alliance="blue" />
              Blue Alliance
            </span>
          </button>
        </div>
        {autoWinner && (
          <div className="text-xs text-gray-500 mt-2 p-2 y2k-panel-soft rounded">
            <span className="font-semibold">Hub:</span>{' '}
            <span className="inline-flex items-center gap-1">
              S1/3:
              <AllianceDot alliance={autoWinner === 'red' ? 'blue' : 'red'} />
            </span>{' '}
            ·{' '}
            <span className="inline-flex items-center gap-1">
              S2/4:
              <AllianceDot alliance={autoWinner === 'red' ? 'red' : 'blue'} />
            </span>
          </div>
        )}
      </div>

      {/* Summary Bar */}
      <div className="y2k-panel-soft border border-secondary/30 rounded-xl p-3 shadow-sm y2k-outline">
        <div className="text-xs font-bold text-gray-400">
          Auto: <span className="font-semibold text-gray-200 y2k-readout">{totalMade}/{totalAttempted}</span> fuel · <span className="text-success font-semibold">{accuracy.toFixed(1)}%</span> acc
        </div>
      </div>
    </div>
  );
}
