/**
 * Web Worker for data processing
 * Processes data aggregation and filtering off the main thread
 */

self.onmessage = function (e) {
  try {
    const { type, payload } = e.data;

    switch (type) {
      case 'AGGREGATE': {
        const { data, period } = payload;
        const aggregated = aggregateData(data, period);
        self.postMessage({ type: 'AGGREGATE_RESULT', payload: aggregated });
        break;
      }

      case 'FILTER': {
        const { data, filters } = payload;
        const filtered = filterData(data, filters);
        self.postMessage({ type: 'FILTER_RESULT', payload: filtered });
        break;
      }

      default:
        console.warn('Unknown worker message type:', type);
        self.postMessage({ type: 'ERROR', error: 'Unknown message type' });
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error.message });
  }
};

function aggregateData(data, period) {
  if (data.length === 0) return [];

  const aggregated = new Map();

  data.forEach((point) => {
    const bucket =
      Math.floor(point.timestamp / period.milliseconds) *
      period.milliseconds;
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

function filterData(data, filters) {
  return data.filter((point) => {
    if (filters.categories && point.category) {
      if (!filters.categories.includes(point.category)) return false;
    }
    if (filters.minValue !== undefined && point.value < filters.minValue) {
      return false;
    }
    if (filters.maxValue !== undefined && point.value > filters.maxValue) {
      return false;
    }
    if (filters.timeRange) {
      if (
        point.timestamp < filters.timeRange.start ||
        point.timestamp > filters.timeRange.end
      ) {
        return false;
      }
    }
    return true;
  });
}



