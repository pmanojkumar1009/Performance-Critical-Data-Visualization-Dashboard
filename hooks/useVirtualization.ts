'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface UseVirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  itemCount: number;
  overscan?: number;
}

export function useVirtualization({
  itemHeight,
  containerHeight,
  itemCount,
  overscan = 5,
}: UseVirtualizationOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    );

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(itemCount - 1, end + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan]);

  // Calculate total height
  const totalHeight = itemCount * itemHeight;

  // Calculate offset for visible items
  const offsetY = visibleRange.start * itemHeight;

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Scroll to item
  const scrollToItem = useCallback(
    (index: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = index * itemHeight;
      }
    },
    [itemHeight]
  );

  return {
    containerRef,
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToItem,
  };
}



