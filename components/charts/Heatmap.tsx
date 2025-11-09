'use client';

import React, { useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { DataPoint, ChartConfig, HeatmapCell } from '@/lib/types';
import { clearCanvas, drawGrid, drawAxes, calculateBounds } from '@/lib/canvasUtils';

interface HeatmapProps {
  data: DataPoint[];
  config: ChartConfig;
  showGrid?: boolean;
  showAxes?: boolean;
  colorScale?: (value: number, min: number, max: number) => string;
  backgroundColor?: string;
}

export const Heatmap = memo(function Heatmap({
  data,
  config,
  showGrid = true,
  showAxes = true,
  colorScale,
  backgroundColor = '#ffffff',
}: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { width, height, padding } = config;

  // Convert data to heatmap cells
  const cells = useMemo(() => {
    if (data.length === 0) return [];

    const bounds = calculateBounds(data);
    const xBins = 50;
    const yBins = 50;
    const xStep = (bounds.maxX - bounds.minX) / xBins;
    const yStep = (bounds.maxY - bounds.minY) / yBins;

    const grid: Map<string, { sum: number; count: number }> = new Map();

    data.forEach((point) => {
      const xBin = Math.floor((point.timestamp - bounds.minX) / xStep);
      const yBin = Math.floor((point.value - bounds.minY) / yStep);
      const key = `${xBin},${yBin}`;
      
      const existing = grid.get(key) || { sum: 0, count: 0 };
      grid.set(key, {
        sum: existing.sum + point.value,
        count: existing.count + 1,
      });
    });

    const result: HeatmapCell[] = [];
    grid.forEach(({ sum, count }, key) => {
      const [xBin, yBin] = key.split(',').map(Number);
      result.push({
        x: xBin,
        y: yBin,
        value: sum / count,
        timestamp: bounds.minX + xBin * xStep,
      });
    });

    return result;
  }, [data]);

  const bounds = useMemo(() => {
    return calculateBounds(data);
  }, [data]);

  // Default color scale (blue to red)
  const defaultColorScale = useMemo(() => {
    return (value: number, min: number, max: number) => {
      const normalized = (value - min) / (max - min || 1);
      const r = Math.floor(normalized * 255);
      const b = Math.floor((1 - normalized) * 255);
      return `rgb(${r}, 100, ${b})`;
    };
  }, []);

  const getColor = colorScale || defaultColorScale;

  const render = useCallback(() => {
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

    if (cells.length === 0) {
      ctx.restore();
      return;
    }

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const cellWidth = plotWidth / 50;
    const cellHeight = plotHeight / 50;

    const cellValues = cells.map((c: HeatmapCell) => c.value);
    const minValue = Math.min(...cellValues);
    const maxValue = Math.max(...cellValues);

    if (showGrid) {
      drawGrid(ctx, config, 'rgba(148, 163, 184, 0.25)', 1);
    }

    cells.forEach((cell: HeatmapCell) => {
      const x = padding.left + cell.x * cellWidth;
      const y = padding.top + (49 - cell.y) * cellHeight;
      const color = getColor(cell.value, minValue, maxValue);

      ctx.fillStyle = color;
      ctx.fillRect(x, y, cellWidth, cellHeight);
    });

    if (showAxes && data.length > 0) {
      const xValues = Array.from({ length: 8 }, (_, i) => {
        return bounds.minX + ((bounds.maxX - bounds.minX) * i) / 7;
      });

      const yValues = Array.from({ length: 6 }, (_, i) => {
        return bounds.minY + ((bounds.maxY - bounds.minY) * i) / 5;
      });

      drawAxes(ctx, config, xValues, yValues, '#64748b', 12);
    }

    ctx.restore();
  }, [
    cells,
    width,
    height,
    padding,
    showGrid,
    showAxes,
    getColor,
    bounds,
    data,
    backgroundColor,
    config,
  ]);

  useEffect(() => {
    render();
  }, [render]);

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

