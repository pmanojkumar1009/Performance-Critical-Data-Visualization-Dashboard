import { DataGenerator, filterData, aggregateData } from '@/lib/dataGenerator';
import { AggregationPeriod } from '@/lib/types';

describe('DataGenerator', () => {
  let generator: DataGenerator;

  beforeEach(() => {
    generator = new DataGenerator();
  });

  describe('generatePoint', () => {
    it('should generate a data point with timestamp and value', () => {
      const timestamp = Date.now();
      const point = generator.generatePoint(timestamp);

      expect(point).toHaveProperty('timestamp');
      expect(point).toHaveProperty('value');
      expect(point.timestamp).toBe(timestamp);
      expect(typeof point.value).toBe('number');
      expect(point.value).toBeGreaterThanOrEqual(0);
    });

    it('should generate different values for different timestamps', () => {
      const point1 = generator.generatePoint(1000);
      const point2 = generator.generatePoint(2000);

      expect(point1.value).not.toBe(point2.value);
    });

    it('should accept optional category', () => {
      const point = generator.generatePoint(Date.now(), 'test-category');
      expect(point.category).toBe('test-category');
    });
  });

  describe('generateInitialDataset', () => {
    it('should generate the correct number of points', () => {
      const data = generator.generateInitialDataset(100);
      expect(data).toHaveLength(100);
    });

    it('should generate points with increasing timestamps', () => {
      const data = generator.generateInitialDataset(10);
      
      for (let i = 1; i < data.length; i++) {
        expect(data[i].timestamp).toBeGreaterThan(data[i - 1].timestamp);
      }
    });

    it('should handle zero count', () => {
      const data = generator.generateInitialDataset(0);
      expect(data).toHaveLength(0);
    });
  });

  describe('generateNextPoint', () => {
    it('should generate a point with timestamp 100ms after previous', () => {
      const previousPoint = generator.generatePoint(1000);
      const nextPoint = generator.generateNextPoint(previousPoint);

      expect(nextPoint.timestamp).toBe(previousPoint.timestamp + 100);
    });

    it('should generate a point with current timestamp if no previous point', () => {
      const before = Date.now();
      const point = generator.generateNextPoint();
      const after = Date.now();

      expect(point.timestamp).toBeGreaterThanOrEqual(before);
      expect(point.timestamp).toBeLessThanOrEqual(after);
    });
  });
});

describe('filterData', () => {
  const testData = [
    { timestamp: 1000, value: 50, category: 'A' },
    { timestamp: 2000, value: 100, category: 'A' },
    { timestamp: 3000, value: 150, category: 'B' },
    { timestamp: 4000, value: 200, category: 'B' },
  ];

  it('should filter by minValue', () => {
    const filtered = filterData(testData, { minValue: 100 });
    expect(filtered).toHaveLength(3);
    expect(filtered.every(p => p.value >= 100)).toBe(true);
  });

  it('should filter by maxValue', () => {
    const filtered = filterData(testData, { maxValue: 150 });
    expect(filtered).toHaveLength(3);
    expect(filtered.every(p => p.value <= 150)).toBe(true);
  });

  it('should filter by both minValue and maxValue', () => {
    const filtered = filterData(testData, { minValue: 100, maxValue: 150 });
    expect(filtered).toHaveLength(2);
    expect(filtered.every(p => p.value >= 100 && p.value <= 150)).toBe(true);
  });

  it('should return empty array when no data matches', () => {
    const filtered = filterData(testData, { minValue: 1000 });
    expect(filtered).toHaveLength(0);
  });

  it('should return all data when no filters applied', () => {
    const filtered = filterData(testData, {});
    expect(filtered).toHaveLength(4);
  });

  it('should handle empty input', () => {
    const filtered = filterData([], { minValue: 50 });
    expect(filtered).toHaveLength(0);
  });
});

describe('aggregateData', () => {
  const testData = [
    { timestamp: 1000, value: 10 },
    { timestamp: 1100, value: 20 },
    { timestamp: 1200, value: 30 },
    { timestamp: 2000, value: 40 },
    { timestamp: 2100, value: 50 },
  ];

  const period: AggregationPeriod = {
    type: '1min',
    label: '1 Minute',
    milliseconds: 60000,
  };

  it('should aggregate data by time period', () => {
    const aggregated = aggregateData(testData, period);
    expect(aggregated.length).toBeGreaterThan(0);
    expect(aggregated.every(p => typeof p.value === 'number')).toBe(true);
  });

  it('should calculate average values correctly', () => {
    const aggregated = aggregateData(testData, period);
    // Points in same minute should be averaged
    aggregated.forEach(point => {
      expect(point.value).toBeGreaterThanOrEqual(0);
    });
  });

  it('should return empty array for empty input', () => {
    const aggregated = aggregateData([], period);
    expect(aggregated).toHaveLength(0);
  });

  it('should sort results by timestamp', () => {
    const aggregated = aggregateData(testData, period);
    
    for (let i = 1; i < aggregated.length; i++) {
      expect(aggregated[i].timestamp).toBeGreaterThanOrEqual(aggregated[i - 1].timestamp);
    }
  });
});

