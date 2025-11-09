'use client';

import React, { useState, useCallback, memo, useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { FilterOptions } from '@/lib/types';
import { calculateBounds } from '@/lib/canvasUtils';

export const FilterPanel = memo(function FilterPanel() {
  const { filters, setFilters, clearFilters, data, filteredData } = useData();
  const [minValue, setMinValue] = useState<number | ''>(filters.minValue || '');
  const [maxValue, setMaxValue] = useState<number | ''>(filters.maxValue || '');

  // Calculate actual data range
  const dataRange = useMemo(() => {
    if (data.length === 0) return null;
    const bounds = calculateBounds(data);
    return {
      min: bounds.minY,
      max: bounds.maxY,
    };
  }, [data]);

  // Check if filter results in empty data
  const isFilterEmpty = filteredData.length === 0 && (filters.minValue !== undefined || filters.maxValue !== undefined);

  const handleApplyFilters = useCallback(() => {
    setFilters({
      ...filters,
      minValue: minValue === '' ? undefined : Number(minValue),
      maxValue: maxValue === '' ? undefined : Number(maxValue),
    });
  }, [filters, minValue, maxValue, setFilters]);

  const handleClear = useCallback(() => {
    setMinValue('');
    setMaxValue('');
    clearFilters();
  }, [clearFilters]);

  return (
    <div className="surface-card rounded-2xl p-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filters</h3>
      
      {dataRange && (
        <div className="mb-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2 text-xs">
          <div className="font-medium text-blue-900 dark:text-blue-200">Data Range:</div>
          <div className="text-blue-700 dark:text-blue-300">
            {dataRange.min.toFixed(2)} - {dataRange.max.toFixed(2)}
          </div>
        </div>
      )}

      {isFilterEmpty && (
        <div className="mb-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2 text-xs">
          <div className="font-medium text-amber-900 dark:text-amber-200">⚠️ No data matches filter</div>
          <div className="text-amber-700 dark:text-amber-300 mt-1">
            Your filter range doesn't overlap with the data range. Try values between {dataRange?.min.toFixed(0)} and {dataRange?.max.toFixed(0)}.
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
            Min Value
          </label>
          <input
            type="number"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-offset-2 transition focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Minimum value"
            aria-label="Minimum value filter"
            aria-describedby="min-value-help"
          />
          <p id="min-value-help" className="sr-only">
            Enter the minimum value to filter data points
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
            Max Value
          </label>
          <input
            type="number"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-offset-2 transition focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            placeholder="Maximum value"
            aria-label="Maximum value filter"
            aria-describedby="max-value-help"
          />
          <p id="max-value-help" className="sr-only">
            Enter the maximum value to filter data points
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleApplyFilters}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Apply filters to data"
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label="Clear all filters"
        >
          Clear
        </button>
      </div>
    </div>
  );
});

