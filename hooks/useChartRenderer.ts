'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { DataPoint, ChartConfig, ZoomState } from '@/lib/types';
import {
  dataToCanvas,
  clearCanvas,
  drawGrid,
  drawAxes,
  optimizeDataPoints,
  calculateBounds,
} from '@/lib/canvasUtils';

interface UseChartRendererOptions {
  config: ChartConfig;
  data: DataPoint[];
  color?: string;
  zoom?: ZoomState;
  showGrid?: boolean;
  showAxes?: boolean;
}

export function useChartRenderer({
  config,
  data,
  color = '#3b82f6',
  zoom = { scale: 1, offsetX: 0, offsetY: 0 },
  showGrid = true,
  showAxes = true,
}: UseChartRendererOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderTime = useRef<number>(0);

  // Optimize data for rendering
  const optimizedData = useMemo(() => {
    return optimizeDataPoints(data, config, zoom);
  }, [data, config, zoom]);

  // Calculate bounds
  const bounds = useMemo(() => {
    return calculateBounds(optimizedData);
  }, [optimizedData]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const now = performance.now();
    // Throttle to ~60fps
    if (now - lastRenderTime.current < 16) {
      animationFrameRef.current = requestAnimationFrame(render);
      return;
    }
    lastRenderTime.current = now;

    // Clear canvas
    clearCanvas(ctx, config.width, config.height, '#ffffff');

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, config);
    }

    // Draw axes
    if (showAxes && optimizedData.length > 0) {
      const xValues = optimizedData
        .filter((_, i) => i % Math.ceil(optimizedData.length / 10) === 0)
        .map((p) => p.timestamp);
      const yMin = bounds.minY;
      const yMax = bounds.maxY;
      const yRange = yMax - yMin || 1;
      const yValues = Array.from({ length: 10 }, (_, i) => {
        return yMin + (yRange * i) / 9;
      });
      drawAxes(ctx, config, xValues, yValues);
    }

    // Draw data
    if (optimizedData.length > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const firstPoint = dataToCanvas(optimizedData[0], config, zoom);
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < optimizedData.length; i++) {
        const point = dataToCanvas(optimizedData[i], config, zoom);
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, [config, optimizedData, color, zoom, showGrid, showAxes, bounds]);

  // Start rendering loop
  useEffect(() => {
    if (canvasRef.current) {
      // Set canvas size
      canvasRef.current.width = config.width;
      canvasRef.current.height = config.height;
      animationFrameRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render, config.width, config.height]);

  return { canvasRef, bounds };
}



