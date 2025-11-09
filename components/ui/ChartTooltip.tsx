'use client';

import React, { memo } from 'react';
import { DataPoint } from '@/lib/types';

interface ChartTooltipProps {
  x: number;
  y: number;
  dataPoint: DataPoint;
  previousPoint?: DataPoint;
  visible: boolean;
  chartType?: string;
}

export const ChartTooltip = memo(function ChartTooltip({
  x,
  y,
  dataPoint,
  previousPoint,
  visible,
  chartType = 'line',
}: ChartTooltipProps) {
  if (!visible) return null;

  const change = previousPoint
    ? ((dataPoint.value - previousPoint.value) / previousPoint.value) * 100
    : 0;

  const timestamp = new Date(dataPoint.timestamp);
  const timeStr = timestamp.toLocaleString();

  return (
    <div
      className="fixed z-50 rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-xl p-3 pointer-events-none"
      style={{
        left: `${x + 10}px`,
        top: `${y - 10}px`,
        transform: 'translateY(-100%)',
      }}
    >
      <div className="space-y-1 text-sm">
        <div className="font-semibold text-slate-900 dark:text-slate-100">
          {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{timeStr}</div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 dark:text-slate-300">Value:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {dataPoint.value.toFixed(2)}
          </span>
        </div>
        {previousPoint && (
          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-300">Change:</span>
            <span
              className={`font-semibold ${
                change >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {change >= 0 ? '+' : ''}
              {change.toFixed(2)}%
            </span>
          </div>
        )}
        {dataPoint.category && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Category: {dataPoint.category}
          </div>
        )}
      </div>
      {/* Arrow pointer */}
      <div
        className="absolute bottom-0 left-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white/95 dark:border-t-slate-900/95"
        style={{ transform: 'translateY(100%)' }}
      />
    </div>
  );
});

