'use client';

import React, { useRef, useEffect, useMemo, memo, useCallback, useState } from 'react';
import { DataPoint, ChartConfig, ZoomState, ChartSeries } from '@/lib/types';
import {
  clearCanvas,
  drawGrid,
  drawAxes,
  optimizeDataPoints,
  calculateBounds,
  drawCrosshair,
  drawBrushSelection,
  calculateMovingAverage,
  calculateEMA,
} from '@/lib/canvasUtils';
import { useCrosshair } from '@/hooks/useCrosshair';
import { useBrushSelection } from '@/hooks/useBrushSelection';
import { ChartTooltip } from '@/components/ui/ChartTooltip';

interface EnhancedLineChartProps {
  data?: DataPoint[];
  series?: ChartSeries[];
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
  showCrosshair?: boolean;
  showTooltip?: boolean;
  showBrushSelection?: boolean;
  onBrushSelect?: (startTime: number, endTime: number) => void;
  showMovingAverage?: boolean;
  movingAveragePeriod?: number;
  showEMA?: boolean;
  emaPeriod?: number;
}

export const EnhancedLineChart = memo(function EnhancedLineChart({
  data,
  series,
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
  showCrosshair = true,
  showTooltip = true,
  showBrushSelection = true,
  onBrushSelect,
  showMovingAverage = false,
  movingAveragePeriod = 20,
  showEMA = false,
  emaPeriod = 12,
}: EnhancedLineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [previousPoint, setPreviousPoint] = useState<DataPoint | null>(null);

  const crosshair = useCrosshair();
  const brush = useBrushSelection();

  // Determine if using series or single data
  const useSeries = series && series.length > 0;
  const primaryData = useSeries ? series[0].data : (data || []);

  // Optimize data for rendering
  const optimizedData = useMemo(() => {
    return optimizeDataPoints(primaryData, config, zoomState);
  }, [primaryData, config, zoomState]);

  // Calculate bounds for all series
  const bounds = useMemo(() => {
    if (useSeries && series) {
      const allData = series.flatMap((s) => s.data);
      return calculateBounds(allData);
    }
    return calculateBounds(optimizedData);
  }, [useSeries, series, optimizedData]);

  // Calculate moving averages if enabled
  const movingAverageData = useMemo(() => {
    if (!showMovingAverage) return null;
    return calculateMovingAverage(primaryData, movingAveragePeriod);
  }, [primaryData, showMovingAverage, movingAveragePeriod]);

  const emaData = useMemo(() => {
    if (!showEMA) return null;
    return calculateEMA(primaryData, emaPeriod);
  }, [primaryData, showEMA, emaPeriod]);

  // Find nearest data point to mouse
  const findNearestPoint = useCallback(
    (x: number, y: number): { point: DataPoint; index: number } | null => {
      if (optimizedData.length === 0) return null;

      const { width, height, padding } = config;
      const plotWidth = width - padding.left - padding.right;
      const plotHeight = height - padding.top - padding.bottom;
      const xRange = bounds.maxX - bounds.minX || 1;
      const yRange = bounds.maxY - bounds.minY || 1;

      const canvasX = x - padding.left;
      const canvasY = y - padding.top;

      if (canvasX < 0 || canvasX > plotWidth || canvasY < 0 || canvasY > plotHeight) {
        return null;
      }

      // Convert canvas coordinates to data coordinates
      const normalizedX = canvasX / plotWidth;
      const dataTimestamp = bounds.minX + normalizedX * xRange;

      // Find closest point by timestamp
      let minDist = Infinity;
      let closestIndex = 0;
      optimizedData.forEach((point, index) => {
        const dist = Math.abs(point.timestamp - dataTimestamp);
        if (dist < minDist) {
          minDist = dist;
          closestIndex = index;
        }
      });

      return { point: optimizedData[closestIndex], index: closestIndex };
    },
    [optimizedData, config, bounds]
  );

  // Render chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    if (canvas.width !== config.width * dpr || canvas.height !== config.height * dpr) {
      canvas.width = config.width * dpr;
      canvas.height = config.height * dpr;
      canvas.style.width = `${config.width}px`;
      canvas.style.height = `${config.height}px`;
    }

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);

    clearCanvas(context, config.width, config.height, backgroundColor);

    if (optimizedData.length === 0) {
      context.restore();
      return;
    }

    const { width, height, padding } = config;
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const yRange = bounds.maxY - bounds.minY || 1;
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

    // Draw moving average if enabled
    if (movingAverageData && movingAverageData.length > 0) {
      context.beginPath();
      context.strokeStyle = '#10b981';
      context.lineWidth = 1.5;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.setLineDash([5, 5]);

      movingAverageData.forEach((point, index) => {
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
      context.setLineDash([]);
    }

    // Draw EMA if enabled
    if (emaData && emaData.length > 0) {
      context.beginPath();
      context.strokeStyle = '#f59e0b';
      context.lineWidth = 1.5;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.setLineDash([3, 3]);

      emaData.forEach((point, index) => {
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
      context.setLineDash([]);
    }

    // Draw series or single data line
    if (useSeries && series) {
      series.forEach((s) => {
        const seriesData = optimizeDataPoints(s.data, config, zoomState);
        context.beginPath();
        context.strokeStyle = s.color;
        context.lineWidth = s.lineWidth || lineWidth;
        context.lineCap = 'round';
        context.lineJoin = 'round';

        seriesData.forEach((point, index) => {
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
      });
    } else {
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
    }

    // Draw brush selection
    if (brush.selection && brush.selection.isActive && showBrushSelection) {
      drawBrushSelection(
        context,
        config,
        brush.selection.startX,
        brush.selection.startY,
        brush.selection.endX,
        brush.selection.endY
      );
    }

    // Draw crosshair
    if (crosshair.isVisible && crosshair.position && showCrosshair && !isPanning) {
      drawCrosshair(context, config, crosshair.position.x, crosshair.position.y, '#3b82f6', 1);
    }

    context.restore();
  }, [
    optimizedData,
    series,
    useSeries,
    config,
    color,
    lineWidth,
    showGrid,
    showAxes,
    bounds,
    backgroundColor,
    zoomState,
    crosshair.isVisible,
    crosshair.position,
    brush.selection,
    isPanning,
    showCrosshair,
    showBrushSelection,
    movingAverageData,
    emaData,
    showMovingAverage,
    showEMA,
  ]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isPanning && onPanMove) {
        onPanMove(e.clientX, e.clientY);
        return;
      }

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });

      if (showCrosshair || showTooltip) {
        const nearest = findNearestPoint(x, y);
        if (nearest) {
          // Calculate crosshair position based on nearest point
          const { width, height, padding } = config;
          const plotWidth = width - padding.left - padding.right;
          const plotHeight = height - padding.top - padding.bottom;
          const xRange = bounds.maxX - bounds.minX || 1;
          const normalizedX = (nearest.point.timestamp - bounds.minX) / xRange;
          const crosshairX = padding.left + normalizedX * plotWidth * zoomState.scale + zoomState.offsetX;
          const crosshairY = y; // Use mouse Y for horizontal line

          crosshair.update(crosshairX, crosshairY, {
            timestamp: nearest.point.timestamp,
            value: nearest.point.value,
            index: nearest.index,
          });
          setHoveredPoint(nearest.point);
          if (nearest.index > 0) {
            setPreviousPoint(optimizedData[nearest.index - 1]);
          } else {
            setPreviousPoint(null);
          }
        } else {
          crosshair.hide();
          setHoveredPoint(null);
        }
      }

      if (brush.isSelecting) {
        brush.updateSelection(x, y);
      }
    },
    [isPanning, onPanMove, showCrosshair, showTooltip, findNearestPoint, crosshair, brush]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if shift key is pressed for brush selection
      if (e.shiftKey && showBrushSelection) {
        brush.startSelection(x, y);
      } else if (onPanStart) {
        setIsPanning(true);
        onPanStart(e.clientX, e.clientY);
      }
    },
    [onPanStart, showBrushSelection, brush]
  );

  const handleMouseUp = useCallback(() => {
    if (brush.isSelecting && brush.selection && onBrushSelect) {
      // Convert brush selection to time range
      const { width, height, padding } = config;
      const plotWidth = width - padding.left - padding.right;
      const xRange = bounds.maxX - bounds.minX || 1;

      const startX = Math.min(brush.selection.startX, brush.selection.endX) - padding.left;
      const endX = Math.max(brush.selection.startX, brush.selection.endX) - padding.left;

      const startTime = bounds.minX + (startX / plotWidth) * xRange;
      const endTime = bounds.minX + (endX / plotWidth) * xRange;

      onBrushSelect(startTime, endTime);
      brush.clearSelection();
    } else if (isPanning && onPanEnd) {
      setIsPanning(false);
      onPanEnd();
    }
  }, [brush, onBrushSelect, config, bounds, isPanning, onPanEnd]);

  const handleMouseLeave = useCallback(() => {
    crosshair.hide();
    setHoveredPoint(null);
    setMousePos(null);
    if (brush.isSelecting) {
      brush.clearSelection();
    }
    if (isPanning && onPanEnd) {
      setIsPanning(false);
      onPanEnd();
    }
  }, [crosshair, brush, isPanning, onPanEnd]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
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
          cursor: isPanning ? 'grabbing' : brush.isSelecting ? 'crosshair' : onPanStart ? 'grab' : 'default',
        }}
      />
      {showTooltip && hoveredPoint && mousePos && (
        <ChartTooltip
          x={mousePos.x}
          y={mousePos.y}
          dataPoint={hoveredPoint}
          previousPoint={previousPoint || undefined}
          visible={true}
          chartType="line"
        />
      )}
    </div>
  );
});

