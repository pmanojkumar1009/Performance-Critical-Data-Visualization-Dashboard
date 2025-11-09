'use client';

import React, { memo } from 'react';
import { DataPoint } from '@/lib/types';
import { useVirtualization } from '@/hooks/useVirtualization';

interface DataTableProps {
  data: DataPoint[];
  height?: number;
}

export const DataTable = memo(function DataTable({
  data,
  height = 400,
}: DataTableProps) {
  const {
    containerRef,
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll,
  } = useVirtualization({
    itemHeight: 40,
    containerHeight: height,
    itemCount: data.length,
    overscan: 5,
  });

  const visibleItems = data.slice(visibleRange.start, visibleRange.end + 1);

  return (
    <div className="surface-card overflow-hidden rounded-2xl">
      <div className="border-b border-slate-200/60 px-4 py-4 dark:border-slate-700/60">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Data Table ({data.length.toLocaleString()} points)
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{
            height: `${height}px`,
            overflowY: 'auto',
            position: 'relative',
          }}
          className="overflow-x-auto"
        >
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            <div
              style={{
                transform: `translateY(${offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500 backdrop-blur-sm dark:bg-slate-800/80 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 bg-white/80 text-sm text-slate-700 dark:divide-slate-800/80 dark:bg-slate-900/80 dark:text-slate-200">
                  {visibleItems.map((point, index) => {
                    const actualIndex = visibleRange.start + index;
                    return (
                      <tr
                        key={`${point.timestamp}-${actualIndex}`}
                        className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/80"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          {new Date(point.timestamp).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {point.value.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-300">
                          {point.category || 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

