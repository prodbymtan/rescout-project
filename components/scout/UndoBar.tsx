'use client';

import { IconUndo } from '@/components/icons/HyperIcons';

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
    <div className="y2k-panel y2k-outline border-b border-border px-3 py-2 flex items-center justify-between gap-2">
      <button
        onClick={onUndo}
        aria-label={`Undo ${formatAction(undoStack[0].action)}`}
        className="flex items-center gap-2 min-w-0 flex-1 text-sm font-semibold text-foreground/90 hover:text-secondary transition-colors"
      >
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-secondary/20 bg-background/60 text-secondary">
          <IconUndo className="h-[18px] w-[18px]" />
        </span>
        <span className="truncate leading-none">
          <span className="text-secondary font-bold">Undo</span>: {formatAction(undoStack[0].action)}
        </span>
      </button>
      {undoStack.length > 1 && (
        <span className="text-xs text-gray-500">
          {undoStack.length - 1} more
        </span>
      )}
    </div>
  );
}
