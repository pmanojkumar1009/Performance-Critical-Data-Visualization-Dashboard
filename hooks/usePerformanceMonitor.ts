'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PerformanceMetrics } from '@/lib/types';
import { PerformanceMonitor, getMemoryUsage } from '@/lib/performanceUtils';

export function usePerformanceMonitor(dataPointCount: number = 0) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    dataPointCount: 0,
    updateLatency: 0,
  });

  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    monitorRef.current = new PerformanceMonitor();

    const updateMetrics = () => {
      if (!monitorRef.current) return;

      const frameMetrics = monitorRef.current.measureFrame();
      const now = performance.now();
      const updateLatency = now - lastUpdateTimeRef.current;
      lastUpdateTimeRef.current = now;

      setMetrics({
        fps: monitorRef.current.getFPS(),
        memoryUsage: getMemoryUsage(),
        renderTime: frameMetrics.duration,
        dataPointCount,
        updateLatency,
      });

      animationFrameRef.current = requestAnimationFrame(updateMetrics);
    };

    animationFrameRef.current = requestAnimationFrame(updateMetrics);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      monitorRef.current?.reset();
    };
  }, [dataPointCount]);

  const reset = useCallback(() => {
    monitorRef.current?.reset();
    lastUpdateTimeRef.current = performance.now();
  }, []);

  return { metrics, reset };
}



