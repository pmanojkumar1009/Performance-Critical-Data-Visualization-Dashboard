'use client';

import { useCallback, useRef, useEffect } from 'react';
import { DataPoint, FilterOptions, AggregationPeriod } from '@/lib/types';

export function useWebWorker() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize worker
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker(new URL('/worker.js', window.location.origin));
      } catch (error) {
        console.warn('Web Worker not available, falling back to main thread:', error);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const aggregateData = useCallback(
    (data: DataPoint[], period: AggregationPeriod): Promise<DataPoint[]> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || data.length === 0) {
          // Fallback to main thread for small datasets or if worker unavailable
          const { aggregateData: mainThreadAggregate } = require('@/lib/dataGenerator');
          resolve(mainThreadAggregate(data, period));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error('Worker timeout'));
        }, 10000); // 10 second timeout

        const handleMessage = (e: MessageEvent) => {
          if (e.data.type === 'AGGREGATE_RESULT') {
            clearTimeout(timeout);
            workerRef.current?.removeEventListener('message', handleMessage);
            resolve(e.data.payload);
          } else if (e.data.type === 'ERROR') {
            clearTimeout(timeout);
            workerRef.current?.removeEventListener('message', handleMessage);
            // Fallback to main thread on error
            const { aggregateData: mainThreadAggregate } = require('@/lib/dataGenerator');
            resolve(mainThreadAggregate(data, period));
          }
        };

        workerRef.current.addEventListener('message', handleMessage);
        workerRef.current.postMessage({
          type: 'AGGREGATE',
          payload: { data, period },
        });
      });
    },
    []
  );

  const filterData = useCallback(
    (data: DataPoint[], filters: FilterOptions): Promise<DataPoint[]> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || data.length === 0) {
          // Fallback to main thread for small datasets or if worker unavailable
          const { filterData: mainThreadFilter } = require('@/lib/dataGenerator');
          resolve(mainThreadFilter(data, filters));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error('Worker timeout'));
        }, 10000); // 10 second timeout

        const handleMessage = (e: MessageEvent) => {
          if (e.data.type === 'FILTER_RESULT') {
            clearTimeout(timeout);
            workerRef.current?.removeEventListener('message', handleMessage);
            resolve(e.data.payload);
          } else if (e.data.type === 'ERROR') {
            clearTimeout(timeout);
            workerRef.current?.removeEventListener('message', handleMessage);
            // Fallback to main thread on error
            const { filterData: mainThreadFilter } = require('@/lib/dataGenerator');
            resolve(mainThreadFilter(data, filters));
          }
        };

        workerRef.current.addEventListener('message', handleMessage);
        workerRef.current.postMessage({
          type: 'FILTER',
          payload: { data, filters },
        });
      });
    },
    []
  );

  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    aggregateData,
    filterData,
    cleanup,
  };
}

