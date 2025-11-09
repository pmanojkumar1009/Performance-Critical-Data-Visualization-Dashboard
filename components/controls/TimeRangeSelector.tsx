'use client';

import React, { useState, useCallback, memo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { AggregationPeriod } from '@/lib/types';

const AGGREGATION_PERIODS: AggregationPeriod[] = [
  { type: '1min', label: '1 Minute', milliseconds: 60 * 1000 },
  { type: '5min', label: '5 Minutes', milliseconds: 5 * 60 * 1000 },
  { type: '1hour', label: '1 Hour', milliseconds: 60 * 60 * 1000 },
];

export const TimeRangeSelector = memo(function TimeRangeSelector() {
  const { aggregationPeriod, setAggregationPeriod } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<AggregationPeriod | null>(
    aggregationPeriod
  );

  const handlePeriodChange = useCallback(
    (period: AggregationPeriod) => {
      setSelectedPeriod(period);
      setAggregationPeriod(period);
    },
    [setAggregationPeriod]
  );

  const handleClear = useCallback(() => {
    setSelectedPeriod(null);
    setAggregationPeriod(null);
  }, [setAggregationPeriod]);

  return (
    <div className="surface-card rounded-2xl p-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Time Aggregation</h3>
      
      <div className="space-y-2">
        {AGGREGATION_PERIODS.map((period) => (
          <button
            key={period.type}
            onClick={() => handlePeriodChange(period)}
            className={`w-full rounded-lg px-4 py-2 text-left text-sm font-semibold transition-colors ${
              selectedPeriod?.type === period.type
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {selectedPeriod && (
        <button
          onClick={handleClear}
          className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Clear Aggregation
        </button>
      )}
    </div>
  );
});

