import { useState, useCallback } from 'react';

export interface BrushSelection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isActive: boolean;
}

export function useBrushSelection() {
  const [selection, setSelection] = useState<BrushSelection | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const startSelection = useCallback((x: number, y: number) => {
    setIsSelecting(true);
    setSelection({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      isActive: true,
    });
  }, []);

  const updateSelection = useCallback((x: number, y: number) => {
    if (isSelecting && selection) {
      setSelection({
        ...selection,
        endX: x,
        endY: y,
      });
    }
  }, [isSelecting, selection]);

  const endSelection = useCallback(() => {
    setIsSelecting(false);
    if (selection) {
      setSelection({
        ...selection,
        isActive: false,
      });
    }
  }, [selection]);

  const clearSelection = useCallback(() => {
    setIsSelecting(false);
    setSelection(null);
  }, []);

  return {
    selection,
    isSelecting,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
  };
}

