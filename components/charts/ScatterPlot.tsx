'use client';

import React, { useRef, useEffect, useMemo, memo } from 'react';
import { DataPoint, ChartConfig } from '@/lib/types';
import { clearCanvas, drawGrid, drawAxes, calculateBounds } from '@/lib/canvasUtils';

interface ScatterPlotProps {
  data: DataPoint[];
  config: ChartConfig;
  color?: string;
  pointSize?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  backgroundColor?: string;
}

export const ScatterPlot = memo(function ScatterPlot({
  data,
  config,
  color = '#f59e0b',
  pointSize = 3,
  showGrid = true,
  showAxes = true,
  backgroundColor = '#ffffff',
}: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { width, height, padding } = config;

  // Sample data for performance
  const sampledData = useMemo(() => {
    if (data.length <= 5000) return data;
    const step = Math.ceil(data.length / 5000);
    return data.filter((_, i) => i % step === 0);
  }, [data]);

  const bounds = useMemo(() => {
    return calculateBounds(sampledData);
  }, [sampledData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    clearCanvas(ctx, width, height, backgroundColor);

    if (sampledData.length === 0) {
      ctx.restore();
      return;
    }

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const xRange = bounds.maxX - bounds.minX || 1;
    const yRange = bounds.maxY - bounds.minY || 1;

    if (showGrid) {
      drawGrid(ctx, config, 'rgba(148, 163, 184, 0.25)', 1);
    }

    if (showAxes) {
      const xValues = sampledData
        .filter((_, i) => i % Math.max(1, Math.ceil(sampledData.length / 8)) === 0)
        .map((p) => p.timestamp);

      const yValues = Array.from({ length: 6 }, (_, i) => {
        return bounds.minY + (yRange * i) / 5;
      });

      drawAxes(ctx, config, xValues, yValues, '#64748b', 12);
    }

    ctx.fillStyle = color;
    sampledData.forEach((point) => {
      const x = padding.left + ((point.timestamp - bounds.minX) / xRange) * plotWidth;
      const y = padding.top + plotHeight - ((point.value - bounds.minY) / yRange) * plotHeight;

      ctx.beginPath();
      ctx.arc(x, y, pointSize, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }, [sampledData, width, height, padding, bounds, color, pointSize, showGrid, showAxes, backgroundColor, config]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
});

