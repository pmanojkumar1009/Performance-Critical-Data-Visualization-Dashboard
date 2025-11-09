import { DataPoint, AggregationPeriod } from './types';

/**
 * Generates realistic time-series data for performance testing
 */
export class DataGenerator {
  private baseValue: number;
  private trend: number;
  private noise: number;
  private frequency: number;
  private phase: number;

  constructor(
    baseValue: number = 100,
    trend: number = 0.1,
    noise: number = 10,
    frequency: number = 0.001,
    phase: number = 0
  ) {
    this.baseValue = baseValue;
    this.trend = trend;
    this.noise = noise;
    this.frequency = frequency;
    this.phase = phase;
  }

  /**
   * Generate a single data point at a given timestamp
   */
  generatePoint(timestamp: number, category?: string): DataPoint {
    // Validate timestamp
    if (!Number.isFinite(timestamp) || timestamp < 0) {
      throw new Error(`Invalid timestamp: ${timestamp}. Timestamp must be a positive number.`);
    }

    const time = timestamp / 1000; // Convert to seconds
    
    // Handle edge case: prevent overflow for very large timestamps
    const safeTime = Math.min(time, Number.MAX_SAFE_INTEGER / 1000);
    
    const trendValue = this.baseValue + this.trend * safeTime;
    const sineWave = Math.sin(2 * Math.PI * this.frequency * safeTime + this.phase) * 20;
    const randomNoise = (Math.random() - 0.5) * this.noise;
    const value = Math.max(0, trendValue + sineWave + randomNoise);

    // Validate generated value
    if (!Number.isFinite(value)) {
      console.warn(`Generated invalid value for timestamp ${timestamp}, using baseValue`);
      return {
        timestamp,
        value: this.baseValue,
        category,
        metadata: {
          generated: true,
          error: 'Invalid value generated, used baseValue',
        },
      };
    }

    return {
      timestamp,
      value: Math.round(value * 100) / 100,
      category,
      metadata: {
        generated: true,
      },
    };
  }

  /**
   * Generate multiple data points for a time range
   */
  generateBatch(
    startTime: number,
    endTime: number,
    intervalMs: number = 100,
    category?: string
  ): DataPoint[] {
    const points: DataPoint[] = [];
    for (let time = startTime; time <= endTime; time += intervalMs) {
      points.push(this.generatePoint(time, category));
    }
    return points;
  }

  /**
   * Generate initial dataset for the dashboard
   */
  generateInitialDataset(count: number = 1000): DataPoint[] {
    // Validate count
    if (!Number.isInteger(count) || count < 0) {
      throw new Error(`Invalid count: ${count}. Count must be a non-negative integer.`);
    }

    // Limit count to prevent memory issues
    const safeCount = Math.min(count, 100000);
    
    if (safeCount !== count) {
      console.warn(`Count limited from ${count} to ${safeCount} to prevent memory issues`);
    }

    try {
      const now = Date.now();
      const startTime = now - safeCount * 100; // 100ms intervals
      return this.generateBatch(startTime, now, 100);
    } catch (error) {
      console.error('Error generating initial dataset:', error);
      return [];
    }
  }

  /**
   * Generate new data point for real-time updates
   */
  generateNextPoint(previousPoint?: DataPoint): DataPoint {
    const timestamp = previousPoint
      ? previousPoint.timestamp + 100
      : Date.now();
    return this.generatePoint(timestamp);
  }
}

/**
 * Aggregate data points by time period
 */
export function aggregateData(
  data: DataPoint[],
  period: AggregationPeriod
): DataPoint[] {
  if (data.length === 0) return [];

  const aggregated = new Map<number, { sum: number; count: number }>();

  data.forEach((point) => {
    const bucket = Math.floor(point.timestamp / period.milliseconds) * period.milliseconds;
    const existing = aggregated.get(bucket) || { sum: 0, count: 0 };
    aggregated.set(bucket, {
      sum: existing.sum + point.value,
      count: existing.count + 1,
    });
  });

  return Array.from(aggregated.entries())
    .map(([timestamp, { sum, count }]) => ({
      timestamp,
      value: sum / count,
      metadata: { aggregated: true, originalCount: count },
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Filter data based on criteria
 */
export function filterData(
  data: DataPoint[],
  options: {
    categories?: string[];
    minValue?: number;
    maxValue?: number;
    timeRange?: { start: number; end: number };
  }
): DataPoint[] {
  // Validate input
  if (!Array.isArray(data)) {
    console.error('filterData: data must be an array');
    return [];
  }

  // Validate filter options
  if (options.minValue !== undefined && !Number.isFinite(options.minValue)) {
    console.warn('filterData: minValue is not a valid number, ignoring');
    options.minValue = undefined;
  }

  if (options.maxValue !== undefined && !Number.isFinite(options.maxValue)) {
    console.warn('filterData: maxValue is not a valid number, ignoring');
    options.maxValue = undefined;
  }

  // Validate minValue <= maxValue
  if (
    options.minValue !== undefined &&
    options.maxValue !== undefined &&
    options.minValue > options.maxValue
  ) {
    console.warn('filterData: minValue is greater than maxValue, swapping values');
    [options.minValue, options.maxValue] = [options.maxValue, options.minValue];
  }

  try {
    return data.filter((point) => {
      // Validate point structure
      if (!point || typeof point.value !== 'number' || !Number.isFinite(point.value)) {
        return false;
      }

      if (options.categories && point.category) {
        if (!options.categories.includes(point.category)) return false;
      }
      if (options.minValue !== undefined && point.value < options.minValue) {
        return false;
      }
      if (options.maxValue !== undefined && point.value > options.maxValue) {
        return false;
      }
      if (options.timeRange) {
        if (
          point.timestamp < options.timeRange.start ||
          point.timestamp > options.timeRange.end
        ) {
          return false;
        }
      }
      return true;
    });
  } catch (error) {
    console.error('Error filtering data:', error);
    return [];
  }
}



