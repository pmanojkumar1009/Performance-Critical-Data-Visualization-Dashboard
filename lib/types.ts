export interface DataPoint {
  timestamp: number;
  value: number;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface ChartData {
  id: string;
  label: string;
  data: DataPoint[];
  color: string;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface FilterOptions {
  categories?: string[];
  minValue?: number;
  maxValue?: number;
  timeRange?: TimeRange;
}

export interface AggregationPeriod {
  type: '1min' | '5min' | '1hour';
  label: string;
  milliseconds: number;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  dataPointCount: number;
  updateLatency: number;
}

export interface ChartConfig {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  xAxis: {
    label: string;
    showGrid: boolean;
  };
  yAxis: {
    label: string;
    showGrid: boolean;
    min?: number;
    max?: number;
  };
  yAxisRight?: {
    label: string;
    showGrid: boolean;
    min?: number;
    max?: number;
  };
}

export interface ChartSeries {
  id: string;
  label: string;
  data: DataPoint[];
  color: string;
  yAxisId?: 'left' | 'right';
  lineWidth?: number;
  showInLegend?: boolean;
}

export interface ZoomState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  timestamp: number;
}



