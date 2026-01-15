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
    <div className="p-4 space-y-6">
      {/* Climb */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Climb</h3>
        <div className="grid grid-cols-5 gap-2">
          {(['none', 'failed', 'low', 'mid', 'high'] as const).map((level) => (
            <button
              key={level}
              onClick={() => onClimbChange(level)}
              className={`py-3 px-2 rounded-lg font-semibold text-sm capitalize transition-colors ${
                climb === level
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Parked */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
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
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Got Defended
          </label>
          <div className="flex gap-2">
            {(['none', 'light', 'heavy'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onGotDefendedChange(level)}
                className={`flex-1 py-3 rounded-lg font-semibold text-sm capitalize transition-colors ${
                  gotDefended === level
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Played Defense
          </label>
          <div className="flex gap-2">
            {(['none', 'light', 'heavy'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onPlayedDefenseChange(level)}
                className={`flex-1 py-3 rounded-lg font-semibold text-sm capitalize transition-colors ${
                  playedDefense === level
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-800">
          Notes (max 120 chars)
        </label>
        <textarea
          value={notes}
          onChange={(e) => {
            const value = e.target.value.slice(0, 120);
            onNotesChange(value);
          }}
          className="w-full px-3 py-2 border border-border rounded-lg resize-none"
          rows={3}
          maxLength={120}
          placeholder="Quick notes about robot performance..."
        />
        <div className="text-xs text-gray-500 text-right">
          {notes.length}/120
        </div>
      </div>

      {/* Ranking Points */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Ranking Points</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={energizedRP}
              onChange={(e) => onEnergizedRPChange(e.target.checked)}
              className="w-5 h-5 text-primary rounded"
            />
            <div className="flex-1">
              <span className="font-medium">Energized RP</span>
              <span className="block text-xs text-gray-500">100+ fuel scored in hub</span>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={superchargedRP}
              onChange={(e) => onSuperchargedRPChange(e.target.checked)}
              className="w-5 h-5 text-primary rounded"
            />
            <div className="flex-1">
              <span className="font-medium">Supercharged RP</span>
              <span className="block text-xs text-gray-500">360+ fuel scored in hub</span>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={traversalRP}
              onChange={(e) => onTraversalRPChange(e.target.checked)}
              className="w-5 h-5 text-primary rounded"
            />
            <div className="flex-1">
              <span className="font-medium">Traversal RP</span>
              <span className="block text-xs text-gray-500">50+ tower points scored</span>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={matchWin}
              onChange={(e) => {
                onMatchWinChange(e.target.checked);
                if (e.target.checked) onMatchTieChange(false);
              }}
              className="w-5 h-5 text-primary rounded"
            />
            <div className="flex-1">
              <span className="font-medium">Match Win</span>
              <span className="block text-xs text-gray-500">Alliance won the match</span>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={matchTie}
              onChange={(e) => {
                onMatchTieChange(e.target.checked);
                if (e.target.checked) onMatchWinChange(false);
              }}
              className="w-5 h-5 text-primary rounded"
            />
            <div className="flex-1">
              <span className="font-medium">Match Tie</span>
              <span className="block text-xs text-gray-500">Match ended in a tie</span>
            </div>
          </label>
        </div>
      </div>

      {/* Major Contributor */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Contribution</h3>
        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={majorContributor}
            onChange={(e) => onMajorContributorChange(e.target.checked)}
            className="w-5 h-5 text-primary rounded"
          />
          <div className="flex-1">
            <span className="font-medium">Major Contributor</span>
            <span className="block text-xs text-gray-500">Robot contributed 40%+ of alliance match points</span>
          </div>
        </label>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-800">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                tags.includes(tag)
                  ? 'bg-secondary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

