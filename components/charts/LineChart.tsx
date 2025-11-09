'use client';

import React, { useRef, useEffect, useMemo, memo, useCallback, useState } from 'react';
import { DataPoint, ChartConfig, ZoomState } from '@/lib/types';
import {
  clearCanvas,
  drawGrid,
  drawAxes,
  optimizeDataPoints,
  calculateBounds,
} from '@/lib/canvasUtils';

interface LineChartProps {
  data: DataPoint[];
  config: ChartConfig;
  color?: string;
  showGrid?: boolean;
  showAxes?: boolean;
  lineWidth?: number;
  backgroundColor?: string;
  zoomState?: ZoomState;
  onPanStart?: (x: number, y: number) => void;
  onPanMove?: (x: number, y: number) => void;
  onPanEnd?: () => void;
}

export const LineChart = memo(function LineChart({
  data,
  config,
  color = '#3b82f6',
  showGrid = true,
  showAxes = true,
  lineWidth = 2,
  backgroundColor = '#ffffff',
  zoomState = { scale: 1, offsetX: 0, offsetY: 0 },
  onPanStart,
  onPanMove,
  onPanEnd,
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPanning, setIsPanning] = useState(false);

  const { width, height, padding, xAxis, yAxis } = config;

  // Optimize data for rendering
  const optimizedData = useMemo(() => {
    return optimizeDataPoints(data, config, zoomState);
  }, [data, config, zoomState]);

  // Calculate bounds for scaling
  const bounds = useMemo(() => {
    return calculateBounds(optimizedData);
  }, [optimizedData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);

    clearCanvas(context, width, height, backgroundColor);

    if (optimizedData.length === 0) {
      context.restore();
      return;
    }

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const yRange = bounds.maxY - bounds.minY || 1;
    const yScale = plotHeight / yRange;
    const xRange = bounds.maxX - bounds.minX || 1;

    if (showGrid) {
      drawGrid(context, config, 'rgba(148, 163, 184, 0.25)', 1);
    }

    if (showAxes) {
      const xValues = optimizedData
        .filter((_, i) => i % Math.max(1, Math.ceil(optimizedData.length / 8)) === 0)
        .map((p) => p.timestamp);

      const yValues = Array.from({ length: 6 }, (_, i) => {
        return bounds.minY + (yRange * i) / 5;
      });

      drawAxes(context, config, xValues, yValues, '#64748b', 12);
    }

    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    optimizedData.forEach((point, index) => {
      const normalizedX = (point.timestamp - bounds.minX) / xRange;
      const normalizedY = (point.value - bounds.minY) / yRange;
      const x = padding.left + normalizedX * plotWidth * zoomState.scale + zoomState.offsetX;
      const y = padding.top + plotHeight - normalizedY * plotHeight * zoomState.scale + zoomState.offsetY;
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });

    context.stroke();
    context.restore();
  }, [
    optimizedData,
    width,
    height,
    padding,
    xAxis,
    yAxis,
    color,
    lineWidth,
    showGrid,
    showAxes,
    bounds,
    backgroundColor,
    config,
    zoomState,
  ]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (onPanStart) {
        setIsPanning(true);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          onPanStart(e.clientX, e.clientY);
        }
      }
    },
    [onPanStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (onPanMove && isPanning) {
        onPanMove(e.clientX, e.clientY);
      }
    },
    [onPanMove, isPanning]
  );

  const handleMouseUp = useCallback(() => {
    if (onPanEnd && isPanning) {
      setIsPanning(false);
      onPanEnd();
    }
  }, [onPanEnd, isPanning]);

  const handleMouseLeave = useCallback(() => {
    if (onPanEnd && isPanning) {
      setIsPanning(false);
      onPanEnd();
    }
  }, [onPanEnd, isPanning]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: isPanning ? 'grabbing' : onPanStart ? 'grab' : 'default',
      }}
    />
  );
});

