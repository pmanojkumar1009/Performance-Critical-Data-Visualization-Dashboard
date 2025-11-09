import { DataPoint, ChartConfig, ZoomState } from './types';

/**
 * Canvas utility functions for efficient rendering
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Convert data point to canvas coordinates
 */
export function dataToCanvas(
  point: DataPoint,
  config: ChartConfig,
  zoom: ZoomState = { scale: 1, offsetX: 0, offsetY: 0 }
): Point {
  const { width, height, padding } = config;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Apply zoom and pan
  const x = (point.timestamp * zoom.scale + zoom.offsetX) % (plotWidth * 2);
  const y = point.value * zoom.scale + zoom.offsetY;

  return {
    x: padding.left + (x / (plotWidth * 2)) * plotWidth,
    y: padding.top + plotHeight - (y / 1000) * plotHeight, // Assuming max value of 1000
  };
}

/**
 * Convert canvas coordinates to data point
 */
export function canvasToData(
  point: Point,
  config: ChartConfig,
  zoom: ZoomState = { scale: 1, offsetX: 0, offsetY: 0 }
): { timestamp: number; value: number } | null {
  const { width, height, padding } = config;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const x = point.x - padding.left;
  const y = point.y - padding.top;

  if (x < 0 || x > plotWidth || y < 0 || y > plotHeight) {
    return null;
  }

  const normalizedX = x / plotWidth;
  const normalizedY = 1 - y / plotHeight;

  return {
    timestamp: (normalizedX * (plotWidth * 2) - zoom.offsetX) / zoom.scale,
    value: (normalizedY * 1000 - zoom.offsetY) / zoom.scale,
  };
}

/**
 * Clear canvas with optional background
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor?: string
): void {
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }
}

/**
 * Draw grid lines
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  config: ChartConfig,
  color: string = '#e0e0e0',
  lineWidth: number = 1
): void {
  const { width, height, padding, xAxis, yAxis } = config;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  // Vertical grid lines (X-axis)
  if (xAxis.showGrid) {
    const xStep = plotWidth / 10;
    for (let i = 0; i <= 10; i++) {
      const x = padding.left + i * xStep;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }
  }

  // Horizontal grid lines (Y-axis)
  if (yAxis.showGrid) {
    const yStep = plotHeight / 10;
    for (let i = 0; i <= 10; i++) {
      const y = padding.top + i * yStep;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }
  }
}

/**
 * Draw axis labels
 */
export function drawAxes(
  ctx: CanvasRenderingContext2D,
  config: ChartConfig,
  xValues: number[],
  yValues: number[],
  color: string = '#666',
  fontSize: number = 12
): void {
  const { width, height, padding, xAxis, yAxis } = config;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  ctx.fillStyle = color;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // X-axis labels
  if (xValues.length > 0) {
    const xStep = plotWidth / (xValues.length - 1);
    xValues.forEach((value, index) => {
      const x = padding.left + index * xStep;
      const label = new Date(value).toLocaleTimeString();
      ctx.fillText(label, x, height - padding.bottom + 20);
    });
  }

  // Y-axis labels
  if (yValues.length > 0) {
    const yStep = plotHeight / (yValues.length - 1);
    yValues.forEach((value, index) => {
      const y = padding.top + (yValues.length - 1 - index) * yStep;
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(1), padding.left - 10, y);
    });
  }

  // Axis titles
  ctx.textAlign = 'center';
  ctx.fillText(xAxis.label, width / 2, height - 10);
  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yAxis.label, 0, 0);
  ctx.restore();
}

/**
 * Optimize data points for rendering (reduce points outside viewport)
 */
export function optimizeDataPoints(
  data: DataPoint[],
  config: ChartConfig,
  zoom: ZoomState
): DataPoint[] {
  // Simple optimization: if we have too many points, sample them
  const maxPoints = config.width * 2; // 2 points per pixel max
  if (data.length <= maxPoints) {
    return data;
  }

  // Use decimation to reduce points while preserving shape
  const step = Math.ceil(data.length / maxPoints);
  const optimized: DataPoint[] = [];
  for (let i = 0; i < data.length; i += step) {
    optimized.push(data[i]);
  }
  return optimized;
}

/**
 * Calculate bounds for data
 */
export function calculateBounds(data: DataPoint[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  if (data.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  let minX = data[0].timestamp;
  let maxX = data[0].timestamp;
  let minY = data[0].value;
  let maxY = data[0].value;

  data.forEach((point) => {
    minX = Math.min(minX, point.timestamp);
    maxX = Math.max(maxX, point.timestamp);
    minY = Math.min(minY, point.value);
    maxY = Math.max(maxY, point.value);
  });

  return { minX, maxX, minY, maxY };
}

/**
 * Draw crosshair on canvas
 */
export function drawCrosshair(
  ctx: CanvasRenderingContext2D,
  config: ChartConfig,
  x: number,
  y: number,
  color: string = '#3b82f6',
  lineWidth: number = 1
): void {
  const { width, height, padding } = config;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([5, 5]);

  // Vertical line
  ctx.beginPath();
  ctx.moveTo(x, padding.top);
  ctx.lineTo(x, height - padding.bottom);
  ctx.stroke();

  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(padding.left, y);
  ctx.lineTo(width - padding.right, y);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw brush selection rectangle
 */
export function drawBrushSelection(
  ctx: CanvasRenderingContext2D,
  config: ChartConfig,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  fillColor: string = 'rgba(59, 130, 246, 0.1)',
  strokeColor: string = '#3b82f6',
  lineWidth: number = 2
): void {
  const { padding } = config;

  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  ctx.save();

  // Fill
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, width, height);

  // Stroke
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([]);
  ctx.strokeRect(x, y, width, height);

  ctx.restore();
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(
  data: DataPoint[],
  period: number
): DataPoint[] {
  if (data.length < period) return [];

  const result: DataPoint[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((sum, p) => sum + p.value, 0) / period;
    result.push({
      timestamp: data[i].timestamp,
      value: avg,
    });
  }
  return result;
}

/**
 * Calculate exponential moving average
 */
export function calculateEMA(
  data: DataPoint[],
  period: number
): DataPoint[] {
  if (data.length < period) return [];

  const multiplier = 2 / (period + 1);
  const result: DataPoint[] = [];
  let ema = data[0].value;

  result.push({
    timestamp: data[0].timestamp,
    value: ema,
  });

  for (let i = 1; i < data.length; i++) {
    ema = (data[i].value - ema) * multiplier + ema;
    result.push({
      timestamp: data[i].timestamp,
      value: ema,
    });
  }
  return result;
}



