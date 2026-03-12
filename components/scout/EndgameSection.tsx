'use client';

const SUGGESTED_TAGS = [
  '#fast-intake',
  '#slow-aim',
  '#drops-balls',
  '#good-field-awareness',
  '#accurate',
  '#fragile',
  '#defensive',
  '#aggressive',
];

interface EndgameSectionProps {
  climb: 'none' | 'failed' | 'low' | 'mid' | 'high';
  onClimbChange: (value: 'none' | 'failed' | 'low' | 'mid' | 'high') => void;
  parked: boolean;
  onParkedChange: (value: boolean) => void;
  gotDefended: 'none' | 'light' | 'heavy';
  onGotDefendedChange: (value: 'none' | 'light' | 'heavy') => void;
  playedDefense: 'none' | 'light' | 'heavy';
  onPlayedDefenseChange: (value: 'none' | 'light' | 'heavy') => void;
  notes: string;
  onNotesChange: (value: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  // Ranking Points
  energizedRP: boolean;
  onEnergizedRPChange: (value: boolean) => void;
  superchargedRP: boolean;
  onSuperchargedRPChange: (value: boolean) => void;
  traversalRP: boolean;
  onTraversalRPChange: (value: boolean) => void;
  matchWin: boolean;
  onMatchWinChange: (value: boolean) => void;
  matchTie: boolean;
  onMatchTieChange: (value: boolean) => void;
  // Major Contributor
  majorContributor: boolean;
  onMajorContributorChange: (value: boolean) => void;
}

export default function EndgameSection({
  climb,
  onClimbChange,
  parked,
  onParkedChange,
  gotDefended,
  onGotDefendedChange,
  playedDefense,
  onPlayedDefenseChange,
  notes,
  onNotesChange,
  tags,
  onTagsChange,
  energizedRP,
  onEnergizedRPChange,
  superchargedRP,
  onSuperchargedRPChange,
  traversalRP,
  onTraversalRPChange,
  matchWin,
  onMatchWinChange,
  matchTie,
  onMatchTieChange,
  majorContributor,
  onMajorContributorChange,
}: EndgameSectionProps) {
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  return (
    <div className="px-3 py-4 space-y-4">
      {/* Climb */}
      <div className="space-y-2 y2k-panel y2k-outline rounded-xl p-3">
        <h3 className="text-base font-semibold text-gray-800">Climb</h3>
        <div className="grid grid-cols-5 gap-2">
          {(['none', 'failed', 'low', 'mid', 'high'] as const).map((level) => (
            <button
              key={level}
              onClick={() => onClimbChange(level)}
              className={`min-h-[52px] py-2 px-1 rounded-lg font-semibold text-xs capitalize transition-colors y2k-pill ${
                climb === level
                  ? 'y2k-button-primary text-white border border-primary-dark y2k-orange-glow'
                  : 'bg-gray-200 text-gray-500 border border-border hover:border-secondary/40 y2k-panel-soft'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Parked */}
      <div className="space-y-2 y2k-panel y2k-outline rounded-xl p-3">
        <label className="flex items-center gap-2 p-2.5 y2k-panel-soft rounded-lg cursor-pointer min-h-[44px] y2k-pill">
          <input
            type="checkbox"
            checked={parked}
            onChange={(e) => onParkedChange(e.target.checked)}
            className="w-5 h-5 text-primary rounded"
          />
          <span className="font-medium">Parked?</span>
        </label>
      </div>

      {/* Defense Sliders */}
      <div className="space-y-3 y2k-panel y2k-outline rounded-xl p-3">
        <div>
          <label className="block text-xs font-semibold text-gray-800 mb-1.5">
            Got Defended
          </label>
          <div className="flex gap-1.5">
            {(['none', 'light', 'heavy'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onGotDefendedChange(level)}
                className={`flex-1 min-h-[44px] py-2 rounded-lg font-semibold text-xs capitalize transition-colors y2k-pill ${
                  gotDefended === level
                    ? 'y2k-button-primary text-white y2k-orange-glow'
                    : 'bg-gray-200 text-gray-500 hover:border-secondary/40 border border-border y2k-panel-soft'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-800 mb-1.5">
            Played Defense
          </label>
          <div className="flex gap-1.5">
            {(['none', 'light', 'heavy'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onPlayedDefenseChange(level)}
                className={`flex-1 min-h-[44px] py-2 rounded-lg font-semibold text-xs capitalize transition-colors y2k-pill ${
                  playedDefense === level
                    ? 'y2k-button-secondary text-white y2k-blue-glow'
                    : 'bg-gray-200 text-gray-500 hover:border-secondary/40 border border-border y2k-panel-soft'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2 y2k-panel y2k-outline rounded-xl p-3">
        <label className="block text-xs font-semibold text-gray-800">
          Notes (120 chars)
        </label>
        <textarea
          value={notes}
          onChange={(e) => {
            const value = e.target.value.slice(0, 120);
            onNotesChange(value);
          }}
          className="w-full px-2.5 py-2 text-sm border border-border rounded-lg resize-none bg-background text-foreground y2k-panel-soft y2k-pill"
          rows={2}
          maxLength={120}
          placeholder="Quick notes about robot performance..."
        />
        <div className="text-xs text-gray-500 text-right">
          {notes.length}/120
        </div>
      </div>

      {/* Ranking Points */}
      <div className="space-y-2 y2k-panel y2k-outline rounded-xl p-3">
        <h3 className="text-base font-semibold text-gray-800">Ranking Points</h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 p-2.5 y2k-panel-soft rounded-lg cursor-pointer min-h-[44px] y2k-pill">
            <input
              type="checkbox"
              checked={energizedRP}
              onChange={(e) => onEnergizedRPChange(e.target.checked)}
              className="w-5 h-5 text-primary rounded"
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">Energized RP</span>
              <span className="block text-xs text-gray-500">100+ fuel</span>
            </div>
          </label>
          <label className="flex items-center gap-2 p-2.5 y2k-panel-soft rounded-lg cursor-pointer min-h-[44px] y2k-pill">
            <input
              type="checkbox"
              checked={superchargedRP}
              onChange={(e) => onSuperchargedRPChange(e.target.checked)}
              className="w-5 h-5 text-primary rounded"
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">Supercharged RP</span>
              <span className="block text-xs text-gray-500">360+ fuel</span>
            </div>
          </label>
          <label className="flex items-center gap-2 p-2.5 y2k-panel-soft rounded-lg cursor-pointer min-h-[44px] y2k-pill">
            <input
              type="checkbox"
              checked={traversalRP}
              onChange={(e) => onTraversalRPChange(e.target.checked)}
              className="w-5 h-5 text-primary rounded"
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">Traversal RP</span>
              <span className="block text-xs text-gray-500">50+ tower pts</span>
            </div>
          </label>
          <label className="flex items-center gap-2 p-2.5 y2k-panel-soft rounded-lg cursor-pointer min-h-[44px] y2k-pill">
            <input
              type="checkbox"
              checked={matchWin}
              onChange={(e) => {
                onMatchWinChange(e.target.checked);
                if (e.target.checked) onMatchTieChange(false);
              }}
              className="w-5 h-5 text-primary rounded"
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">Match Win</span>
            </div>
          </label>
          <label className="flex items-center gap-2 p-2.5 y2k-panel-soft rounded-lg cursor-pointer min-h-[44px] y2k-pill">
            <input
              type="checkbox"
              checked={matchTie}
              onChange={(e) => {
                onMatchTieChange(e.target.checked);
                if (e.target.checked) onMatchWinChange(false);
              }}
              className="w-5 h-5 text-primary rounded"
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">Match Tie</span>
            </div>
          </label>
        </div>
      </div>

      {/* Major Contributor */}
      <div className="space-y-2 y2k-panel y2k-outline rounded-xl p-3">
        <h3 className="text-base font-semibold text-gray-800">Contribution</h3>
        <label className="flex items-center gap-2 p-2.5 y2k-panel-soft rounded-lg cursor-pointer min-h-[44px] y2k-pill">
          <input
            type="checkbox"
            checked={majorContributor}
            onChange={(e) => onMajorContributorChange(e.target.checked)}
            className="w-5 h-5 text-primary rounded"
          />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-sm">Major Contributor</span>
            <span className="block text-xs text-gray-500">40%+ alliance pts</span>
          </div>
        </label>
      </div>

      {/* Tags */}
      <div className="space-y-2 y2k-panel y2k-outline rounded-xl p-3">
        <label className="block text-xs font-semibold text-gray-800">
          Tags
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1.5 min-h-[36px] rounded-full text-xs font-medium transition-colors y2k-pill ${
                tags.includes(tag)
                  ? 'y2k-button-primary text-white y2k-orange-glow'
                  : 'bg-gray-200 text-gray-500 hover:border-secondary/40 border border-border y2k-panel-soft'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {tags.length > 0 && (
          <div className="text-xs text-gray-600">
            Selected: {tags.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
