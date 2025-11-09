'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { DataPoint, FilterOptions, AggregationPeriod } from '@/lib/types';
import { filterData, aggregateData } from '@/lib/dataGenerator';
import { useWebWorker } from '@/hooks/useWebWorker';

interface DataContextValue {
  data: DataPoint[];
  filteredData: DataPoint[];
  aggregatedData: DataPoint[];
  filters: FilterOptions;
  aggregationPeriod: AggregationPeriod | null;
  setData: (data: DataPoint[]) => void;
  setFilters: (filters: FilterOptions) => void;
  setAggregationPeriod: (period: AggregationPeriod | null) => void;
  clearFilters: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({
  children,
  initialData = [],
}: {
  children: ReactNode;
  initialData?: DataPoint[];
}) {
  const [data, setData] = useState<DataPoint[]>(initialData);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [aggregationPeriod, setAggregationPeriod] =
    useState<AggregationPeriod | null>(null);
  const [filteredData, setFilteredData] = useState<DataPoint[]>(initialData);
  const [aggregatedData, setAggregatedData] = useState<DataPoint[]>(initialData);
  const { aggregateData: workerAggregate, filterData: workerFilter, cleanup } = useWebWorker();

  // Apply filters using Web Worker (with fallback)
  useEffect(() => {
    if (Object.keys(filters).length === 0) {
      setFilteredData(data);
      return;
    }
    if (data.length > 5000) {
      // Use Web Worker for large datasets
      workerFilter(data, filters).then(setFilteredData).catch(() => {
        // Fallback to main thread on error
        setFilteredData(filterData(data, filters));
      });
    } else {
      // Use main thread for small datasets
      setFilteredData(filterData(data, filters));
    }
  }, [data, filters, workerFilter]);

  // Apply aggregation using Web Worker (with fallback)
  useEffect(() => {
    if (!aggregationPeriod) {
      setAggregatedData(filteredData);
      return;
    }
    if (filteredData.length > 5000) {
      // Use Web Worker for large datasets
      workerAggregate(filteredData, aggregationPeriod).then(setAggregatedData).catch(() => {
        // Fallback to main thread on error
        setAggregatedData(aggregateData(filteredData, aggregationPeriod));
      });
    } else {
      // Use main thread for small datasets
      setAggregatedData(aggregateData(filteredData, aggregationPeriod));
    }
  }, [filteredData, aggregationPeriod, workerAggregate]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setAggregationPeriod(null);
  }, []);

  const value = useMemo(
    () => ({
      data,
      filteredData,
      aggregatedData,
      filters,
      aggregationPeriod,
      setData,
      setFilters,
      clearFilters,
      setAggregationPeriod,
    }),
    [
      data,
      filteredData,
      aggregatedData,
      filters,
      aggregationPeriod,
      clearFilters,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}



