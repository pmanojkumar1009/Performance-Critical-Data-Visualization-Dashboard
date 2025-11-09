'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DataPoint } from '@/lib/types';
import { DataGenerator } from '@/lib/dataGenerator';

interface UseDataStreamOptions {
  interval?: number; // Update interval in ms
  initialCount?: number;
  enabled?: boolean;
}

export function useDataStream(options: UseDataStreamOptions = {}) {
  const { interval = 100, initialCount = 1000, enabled = true } = options;
  const [data, setData] = useState<DataPoint[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const generatorRef = useRef<DataGenerator | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPointRef = useRef<DataPoint | null>(null);

  // Initialize generator and regenerate data when initialCount changes
  useEffect(() => {
    if (!generatorRef.current) {
      generatorRef.current = new DataGenerator();
    }
    const initialData = generatorRef.current.generateInitialDataset(initialCount);
    setData(initialData);
    if (initialData.length > 0) {
      lastPointRef.current = initialData[initialData.length - 1];
    }
  }, [initialCount]);

  // Start/stop streaming
  const startStreaming = useCallback(() => {
    if (!generatorRef.current || intervalRef.current) return;

    setIsStreaming(true);
    intervalRef.current = setInterval(() => {
      if (!generatorRef.current) return;

      const newPoint = generatorRef.current.generateNextPoint(
        lastPointRef.current || undefined
      );
      lastPointRef.current = newPoint;

      setData((prev) => {
        // Keep only last 10000 points to prevent memory issues
        const updated = [...prev, newPoint];
        return updated.slice(-10000);
      });
    }, interval);
  }, [interval]);

  const stopStreaming = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  // Auto-start if enabled
  useEffect(() => {
    if (enabled && generatorRef.current && !isStreaming) {
      startStreaming();
    } else if (!enabled) {
      stopStreaming();
    }

    return () => {
      stopStreaming();
    };
  }, [enabled, isStreaming, startStreaming, stopStreaming]);

  // Add data point manually
  const addDataPoint = useCallback((point: DataPoint) => {
    setData((prev) => {
      const updated = [...prev, point];
      return updated.slice(-10000);
    });
    lastPointRef.current = point;
  }, []);

  // Clear all data
  const clearData = useCallback(() => {
    setData([]);
    lastPointRef.current = null;
  }, []);

  // Reset with new initial data
  const resetData = useCallback((count: number = initialCount) => {
    if (!generatorRef.current) return;
    const newData = generatorRef.current.generateInitialDataset(count);
    setData(newData);
    if (newData.length > 0) {
      lastPointRef.current = newData[newData.length - 1];
    }
  }, [initialCount]);

  return {
    data,
    isStreaming,
    startStreaming,
    stopStreaming,
    addDataPoint,
    clearData,
    resetData,
  };
}



