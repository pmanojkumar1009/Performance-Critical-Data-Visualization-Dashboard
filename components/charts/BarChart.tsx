'use client';

import React, { useRef, useEffect, useMemo, memo } from 'react';
import { DataPoint, ChartConfig } from '@/lib/types';
import { clearCanvas, drawGrid, drawAxes, calculateBounds } from '@/lib/canvasUtils';

interface BarChartProps {
  data: DataPoint[];
  config: ChartConfig;
  color?: string;
  showGrid?: boolean;
  showAxes?: boolean;
  backgroundColor?: string;
}

export const BarChart = memo(function BarChart({
  data,
  config,
  color = '#10b981',
  showGrid = true,
  showAxes = true,
  backgroundColor = '#ffffff',
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { width, height, padding } = config;

  // Sample data if too many points
  const sampledData = useMemo(() => {
    if (data.length <= 100) return data;
    const step = Math.ceil(data.length / 100);
    return data.filter((_, i) => i % step === 0);
  }, [data]);

  // Calculate bounds
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
    const barWidth = (plotWidth / sampledData.length) * 0.8;
    const yRange = bounds.maxY - bounds.minY || 1;
    const yScale = plotHeight / yRange;

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
    sampledData.forEach((point, index) => {
      const x = padding.left + (index / sampledData.length) * plotWidth;
      const barHeight = (point.value - bounds.minY) * yScale;
      const y = padding.top + plotHeight - barHeight;

      ctx.fillRect(x, y, barWidth, Math.max(barHeight, 1));
    });

    ctx.restore();
  }, [sampledData, width, height, padding, bounds, color, showGrid, showAxes, backgroundColor, config]);

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

