'use client';

import React, { memo } from 'react';
import { PerformanceMetrics } from '@/lib/types';

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
}

export const PerformanceMonitor = memo(function PerformanceMonitor({
  metrics,
}: PerformanceMonitorProps) {
  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-emerald-500';
    if (fps >= 30) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 50) return 'text-emerald-500';
    if (memory < 100) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="surface-section rounded-3xl p-6 transition-colors">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Performance Metrics
      </h3>
      
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">FPS</div>
          <div className={`text-3xl font-bold ${getFPSColor(metrics.fps)}`}>
            {metrics.fps}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">Target: 60</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Memory</div>
          <div className={`text-3xl font-bold ${getMemoryColor(metrics.memoryUsage)}`}>
            {metrics.memoryUsage.toFixed(1)} MB
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">Heap Size</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Render Time</div>
          <div className="text-3xl font-bold text-blue-500">
            {metrics.renderTime.toFixed(1)} ms
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">Per Frame</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Data Points</div>
          <div className="text-3xl font-bold text-purple-500">
            {metrics.dataPointCount.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">Total</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Latency</div>
          <div className="text-3xl font-bold text-indigo-500">
            {metrics.updateLatency.toFixed(1)} ms
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">Update Delay</div>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Performance Status</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              metrics.fps >= 55
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                : metrics.fps >= 30
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
            }`}
          >
            {metrics.fps >= 55 ? 'Optimal' : metrics.fps >= 30 ? 'Good' : 'Needs Optimization'}
          </span>
        </div>
      </div>
    </div>
  );
});

