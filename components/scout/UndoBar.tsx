'use client';

interface UndoBarProps {
  undoStack: Array<{ action: string; timestamp: number }>;
  onUndo: () => void;
}

export default function UndoBar({ undoStack, onUndo }: UndoBarProps) {
  if (undoStack.length === 0) return null;

  const formatAction = (action: string) => {
    // Format action string for display
    return action.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()).trim();
  };

  return (
    <div className="bg-secondary/10 border-b-2 border-secondary/30 px-4 py-3 flex items-center justify-between gap-3">
      <button
        onClick={onUndo}
        className="flex items-center gap-2 text-sm text-secondary-dark font-semibold hover:text-secondary transition-colors"
      >
        <span className="text-lg">↶</span>
        <span>Undo: {formatAction(undoStack[0].action)}</span>
      </button>
      {undoStack.length > 1 && (
        <span className="text-xs text-gray-500">
          {undoStack.length - 1} more
        </span>
      )}
    </div>
  );
}

