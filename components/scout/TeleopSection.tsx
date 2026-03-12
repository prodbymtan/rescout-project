'use client';

import { BallCount } from '@/types';

interface TeleopSectionProps {
  balls: BallCount;
  onBallsChange: (balls: BallCount) => void;
  onUndo: (action: string) => void;
}

export default function TeleopSection({
  balls,
  onBallsChange,
  onUndo,
}: TeleopSectionProps) {
  const updateBall = (type: keyof BallCount, delta: number) => {
    const currentValue = balls[type] || 0;
    const newBalls = { ...balls, [type]: Math.max(0, currentValue + delta) };
    onBallsChange(newBalls);
    onUndo(`${delta > 0 ? '+' : ''}${delta} ${type}`);
    
    // Haptic feedback simulation
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

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
    <div className="px-3 py-4 space-y-4">
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
    </div>
  );
}
