import { useState, useCallback } from 'react';

export interface CrosshairPosition {
  x: number;
  y: number;
  dataPoint?: {
    timestamp: number;
    value: number;
    index: number;
  };
}

export function useCrosshair() {
  const [position, setPosition] = useState<CrosshairPosition | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const show = useCallback((x: number, y: number, dataPoint?: CrosshairPosition['dataPoint']) => {
    setPosition({ x, y, dataPoint });
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
    setPosition(null);
  }, []);

  const update = useCallback((x: number, y: number, dataPoint?: CrosshairPosition['dataPoint']) => {
    if (isVisible) {
      setPosition({ x, y, dataPoint });
    }
  }, [isVisible]);

  return {
    position,
    isVisible,
    show,
    hide,
    update,
  };
}

