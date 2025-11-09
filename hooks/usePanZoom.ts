'use client';

import { useState, useCallback, useRef } from 'react';
import { ZoomState } from '@/lib/types';

export function usePanZoom(
  initialScale: number = 1,
  initialOffsetX: number = 0,
  initialOffsetY: number = 0
) {
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: initialScale,
    offsetX: initialOffsetX,
    offsetY: initialOffsetY,
  });

  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);

  const handleZoomIn = useCallback(() => {
    setZoomState((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.5, 25),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomState((prev) => ({
      ...prev,
      scale: Math.max(1, prev.scale / 1.5),
    }));
  }, []);

  const handleReset = useCallback(() => {
    setZoomState({
      scale: initialScale,
      offsetX: initialOffsetX,
      offsetY: initialOffsetY,
    });
  }, [initialScale, initialOffsetX, initialOffsetY]);

  const handlePanStart = useCallback((x: number, y: number) => {
    isPanningRef.current = true;
    lastPanPointRef.current = { x, y };
  }, []);

  const handlePanMove = useCallback((x: number, y: number) => {
    if (!isPanningRef.current || !lastPanPointRef.current) return;

    const deltaX = x - lastPanPointRef.current.x;
    const deltaY = y - lastPanPointRef.current.y;

    setZoomState((prev) => ({
      ...prev,
      offsetX: prev.offsetX + deltaX,
      offsetY: prev.offsetY + deltaY,
    }));

    lastPanPointRef.current = { x, y };
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanningRef.current = false;
    lastPanPointRef.current = null;
  }, []);

  return {
    zoomState,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  };
}

