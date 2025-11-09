'use client';

import React, { useCallback, useMemo, useState, useTransition, useRef } from 'react';

import { useData } from '@/components/providers/DataProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { BarChart } from '@/components/charts/BarChart';
import { Heatmap } from '@/components/charts/Heatmap';
import { LineChart } from '@/components/charts/LineChart';
import { EnhancedLineChart } from '@/components/charts/EnhancedLineChart';
import { ScatterPlot } from '@/components/charts/ScatterPlot';
import { FilterPanel } from '@/components/controls/FilterPanel';
import { TimeRangeSelector } from '@/components/controls/TimeRangeSelector';
import { DataTable } from '@/components/ui/DataTable';
import { PerformanceMonitor } from '@/components/ui/PerformanceMonitor';
import { useDataStream } from '@/hooks/useDataStream';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ChartConfig } from '@/lib/types';
import { exportDashboardToPDF } from '@/lib/pdfExport';
import { exportChartToPNG, exportChartToSVG } from '@/lib/chartExport';
import { exportToCSV, exportToExcel, exportToJSON } from '@/lib/dataExport';
import { ExportDropdown } from '@/components/ui/ExportDropdown';

const CHART_CONFIG: ChartConfig = {
  width: 800,
  height: 400,
  padding: {
    top: 20,
    right: 20,
    bottom: 60,
    left: 60,
  },
  xAxis: {
    label: 'Time',
    showGrid: true,
  },
  yAxis: {
    label: 'Value',
    showGrid: true,
  },
};

const CHART_TYPES = ['line', 'bar', 'scatter', 'heatmap'] as const;
type ChartType = (typeof CHART_TYPES)[number];

export default function DashboardClient() {
  const { aggregatedData, filteredData, data, setData } = useData();
  const { theme, toggleTheme } = useTheme();

  const [chartType, setChartType] = useState<ChartType>('line');
  const [isStreaming, setIsStreaming] = useState(true);
  const [dataLoad, setDataLoad] = useState(1000); // Stress test: initial data count
  const [isExporting, setIsExporting] = useState(false);
  const [, startTransition] = useTransition();

  // Refs for PDF export and fullscreen
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // Pan/Zoom integration
  const { zoomState, handleZoomIn, handleZoomOut, handleReset: handleResetZoom, handlePanStart, handlePanMove, handlePanEnd } = usePanZoom(1);

  // Fullscreen
  const { isFullscreen, toggleFullscreen } = useFullscreen(fullscreenRef);

  // New feature states
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [movingAveragePeriod, setMovingAveragePeriod] = useState(20);
  const [emaPeriod, setEmaPeriod] = useState(12);

  const { data: streamData, startStreaming, stopStreaming, resetData } = useDataStream({
    interval: 100,
    initialCount: dataLoad, // Use dataLoad for initial count
    enabled: isStreaming,
  });

  React.useEffect(() => {
    if (streamData.length === 0) return;
    startTransition(() => {
      setData(streamData);
    });
  }, [streamData, setData, startTransition]);

  // Use aggregatedData (which contains filteredData when no aggregation is set)
  // If aggregatedData is empty, it means all data was filtered out, so show empty (don't fall back to unfiltered data)
  const displayData = aggregatedData;
  const { metrics } = usePerformanceMonitor(displayData.length);

  // Apply zoom to data (show fewer points when zoomed in)
  const zoomedData = useMemo(() => {
    if (zoomState.scale <= 1) return displayData;
    const visibleCount = Math.max(50, Math.floor(displayData.length / zoomState.scale));
    return displayData.slice(-visibleCount);
  }, [displayData, zoomState.scale]);

  const chartBackground = theme === 'dark' ? '#0f172a' : '#ffffff';

  const chartConfig = useMemo(() => {
    if (typeof window === 'undefined') return CHART_CONFIG;

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;

    const width = isMobile
      ? Math.min(400, window.innerWidth - 32)
      : isTablet
      ? Math.min(600, window.innerWidth - 48)
      : Math.min(800, window.innerWidth - 64);

    return {
      ...CHART_CONFIG,
      width,
      height: isMobile ? 300 : 400,
    };
  }, []);

  const handleToggleStreaming = useCallback(() => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
    setIsStreaming((prev) => !prev);
  }, [isStreaming, startStreaming, stopStreaming]);

  // Stress test handlers
  const handleStressTest = useCallback((count: number) => {
    setDataLoad(count);
    resetData(count);
  }, [resetData]);

  // PDF Export handler
  const handleExportPDF = useCallback(async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      // Find the chart canvas
      const chartCanvas = chartContainerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
      const metricsElement = metricsRef.current;
      const tableElement = tableRef.current;

      await exportDashboardToPDF(
        chartCanvas,
        metricsElement,
        tableElement,
        displayData,
        chartType,
        {
          title: 'Performance Dashboard Report',
          includeMetrics: true,
          includeTable: true,
        }
      );
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, displayData, chartType]);

  // Chart export handlers
  const handleExportPNG = useCallback(() => {
    const chartCanvas = chartContainerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (chartCanvas) {
      exportChartToPNG(chartCanvas, `chart-${chartType}-${new Date().toISOString().split('T')[0]}.png`);
    }
  }, [chartType]);

  const handleExportSVG = useCallback(() => {
    const chartCanvas = chartContainerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (chartCanvas) {
      exportChartToSVG(chartCanvas, `chart-${chartType}-${new Date().toISOString().split('T')[0]}.svg`);
    }
  }, [chartType]);

  // Data export handlers
  const handleExportCSV = useCallback(() => {
    exportToCSV(displayData, `dashboard-data-${new Date().toISOString().split('T')[0]}.csv`);
  }, [displayData]);

  const handleExportExcel = useCallback(() => {
    exportToExcel(displayData, `dashboard-data-${new Date().toISOString().split('T')[0]}.xls`);
  }, [displayData]);

  const handleExportJSON = useCallback(() => {
    exportToJSON(displayData, `dashboard-data-${new Date().toISOString().split('T')[0]}.json`);
  }, [displayData]);

  // Brush selection handler
  const handleBrushSelect = useCallback((startTime: number, endTime: number) => {
    // Filter data to selected time range
    const filtered = displayData.filter(
      (point) => point.timestamp >= startTime && point.timestamp <= endTime
    );
    if (filtered.length > 0) {
      // You could update the data or zoom to this range
      console.log('Brush selection:', { startTime, endTime, count: filtered.length });
    }
  }, [displayData]);

  // Keyboard shortcuts
  useKeyboardShortcuts(
    {
      'f': () => toggleFullscreen(),
      'r': () => handleResetZoom(),
      'z': () => handleZoomIn(),
      'x': () => handleZoomOut(),
      'e': () => handleExportPNG(),
      's': () => handleExportPDF(),
      'shift+s': () => handleExportSVG(),
      'm': () => setShowMovingAverage((prev) => !prev),
      'escape': () => {
        if (isFullscreen) {
          toggleFullscreen();
        }
      },
    },
    true
  );

  const renderChart = () => {
    const props = {
      data: zoomedData,
      config: chartConfig,
      showGrid: true,
      showAxes: true,
      backgroundColor: chartBackground,
    };

    switch (chartType) {
      case 'line':
        return (
          <EnhancedLineChart
            {...props}
            color="#3b82f6"
            zoomState={zoomState}
            onPanStart={handlePanStart}
            onPanMove={handlePanMove}
            onPanEnd={handlePanEnd}
            showCrosshair={true}
            showTooltip={true}
            showBrushSelection={true}
            onBrushSelect={handleBrushSelect}
            showMovingAverage={showMovingAverage}
            movingAveragePeriod={movingAveragePeriod}
            showEMA={showEMA}
            emaPeriod={emaPeriod}
          />
        );
      case 'bar':
        return <BarChart {...props} color="#10b981" />;
      case 'scatter':
        return <ScatterPlot {...props} color="#f59e0b" pointSize={3} />;
      case 'heatmap':
        return <Heatmap {...props} />;
      default:
        return (
          <EnhancedLineChart
            {...props}
            color="#3b82f6"
            zoomState={zoomState}
            onPanStart={handlePanStart}
            onPanMove={handlePanMove}
            onPanEnd={handlePanEnd}
            showCrosshair={true}
            showTooltip={true}
            showBrushSelection={true}
            onBrushSelect={handleBrushSelect}
            showMovingAverage={showMovingAverage}
            movingAveragePeriod={movingAveragePeriod}
            showEMA={showEMA}
            emaPeriod={emaPeriod}
          />
        );
    }
  };

  return (
    <div 
      ref={fullscreenRef} 
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : 'min-h-screen'} text-slate-900 transition-colors dark:text-slate-100`}
      role="main"
      aria-label="Performance Dashboard"
    >
      <div className={`${isFullscreen ? 'h-full overflow-y-auto overflow-x-hidden' : ''}`}>
        <header 
          className={`${isFullscreen ? 'sticky top-0' : 'sticky top-0'} z-20 border-b border-slate-200/40 bg-white/70 backdrop-blur-xl transition dark:border-slate-800/40 dark:bg-slate-950/70`}
          role="banner"
        >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100" id="dashboard-title">Performance Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Real-time data visualization with 10,000+ points at 60fps
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="neon-pill border border-transparent px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-200"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={handleToggleStreaming}
              className={`rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition ${
                isStreaming ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
              aria-label={isStreaming ? 'Stop data streaming' : 'Start data streaming'}
              aria-pressed={isStreaming}
            >
              {isStreaming ? 'Stop' : 'Start'} Streaming
            </button>
            <button
              onClick={() => resetData(1000)}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-300"
              aria-label="Reset data to initial state"
            >
              Reset Data
            </button>
            <ExportDropdown
              onExportPDF={handleExportPDF}
              onExportPNG={handleExportPNG}
              onExportSVG={handleExportSVG}
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              isExporting={isExporting}
            />
            <button
              onClick={toggleFullscreen}
              className="rounded-full bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-500 dark:to-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-slate-700 hover:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 flex items-center gap-2 border border-slate-400/30 dark:border-slate-400/20"
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Exit
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Fullscreen
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className={`mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8 ${isFullscreen ? 'pb-8' : ''}`}>
        <div className="mb-8" ref={metricsRef}>
          <PerformanceMonitor metrics={metrics} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-1">
            {/* 1. Chart Type */}
            <div className="surface-card rounded-2xl p-4">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Chart Type</h3>
              <div className="space-y-2">
                {CHART_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`w-full rounded-lg px-4 py-2 text-left text-sm font-semibold capitalize transition ${
                      chartType === type
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Zoom & Pan Controls */}
            <div className="surface-card rounded-2xl p-4">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Zoom & Pan Controls</h3>
              <div className="space-y-2">
                <button
                  onClick={handleZoomIn}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  title="Zoom In (Z)"
                >
                  Zoom In
                </button>
                <button
                  onClick={handleZoomOut}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  title="Zoom Out (X)"
                >
                  Zoom Out
                </button>
                <button
                  onClick={handleResetZoom}
                  className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  title="Reset (R)"
                >
                  Reset Zoom/Pan
                </button>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Zoom: {zoomState.scale.toFixed(2)}x | Drag chart to pan | Shift+Drag to brush select
                </p>
              </div>
            </div>

            {/* 3. Time Aggregation */}
            <TimeRangeSelector />

            {/* 5. Min/Max Filters */}
            <FilterPanel />

            {/* Statistical Overlays (conditional - only for line charts) */}
            {chartType === 'line' && (
              <div className="surface-card rounded-2xl p-4 border-2 border-blue-200/50 dark:border-blue-500/30">
                <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Statistical Overlays</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showMovingAverage}
                      onChange={(e) => setShowMovingAverage(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Moving Average (SMA)</span>
                  </label>
                  {showMovingAverage && (
                    <div className="ml-6 space-y-2">
                      <label className="block text-xs text-slate-600 dark:text-slate-400">Period: {movingAveragePeriod}</label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={movingAveragePeriod}
                        onChange={(e) => setMovingAveragePeriod(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showEMA}
                      onChange={(e) => setShowEMA(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Exponential MA (EMA)</span>
                  </label>
                  {showEMA && (
                    <div className="ml-6 space-y-2">
                      <label className="block text-xs text-slate-600 dark:text-slate-400">Period: {emaPeriod}</label>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={emaPeriod}
                        onChange={(e) => setEmaPeriod(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Toggle with <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">M</kbd> key
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <div className="surface-section rounded-3xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold capitalize text-slate-900 dark:text-slate-100">{chartType} Chart</h2>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {zoomedData.length.toLocaleString()} visible points
                </div>
              </div>
              <div ref={chartContainerRef} className="w-full" style={{ height: '400px' }}>
                {renderChart()}
              </div>
            </div>

            <div className="mt-6" ref={tableRef}>
              <DataTable data={displayData.slice(-1000)} height={400} />
            </div>

            {/* Stress Test Mode - Below Data Table */}
            <div className="mt-8 surface-section rounded-3xl p-8 border-2 border-transparent bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-purple-950/20 dark:border-slate-700/50 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Stress Test Mode</h2>
                </div>
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-200/50 dark:border-blue-500/30">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Current Load</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {dataLoad.toLocaleString()}
                    <span className="text-base font-normal text-slate-500 dark:text-slate-400 ml-2">points</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => handleStressTest(1000)}
                  className={`group relative rounded-xl px-6 py-5 text-sm font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                    dataLoad === 1000
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/50 ring-2 ring-emerald-400/50'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`text-2xl ${dataLoad === 1000 ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>1K</div>
                    <div>Normal</div>
                  </div>
                  {dataLoad === 1000 && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white animate-pulse"></div>
                  )}
                </button>
                
                <button
                  onClick={() => handleStressTest(10000)}
                  className={`group relative rounded-xl px-6 py-5 text-sm font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                    dataLoad === 10000
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl shadow-purple-500/50 ring-2 ring-purple-400/50'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`text-2xl ${dataLoad === 10000 ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`}>10K</div>
                    <div>Standard</div>
                  </div>
                  {dataLoad === 10000 && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white animate-pulse"></div>
                  )}
                </button>
                
                <button
                  onClick={() => handleStressTest(50000)}
                  className={`group relative rounded-xl px-6 py-5 text-sm font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                    dataLoad === 50000
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/50 ring-2 ring-orange-400/50'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/30 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`text-2xl ${dataLoad === 50000 ? 'text-white' : 'text-orange-600 dark:text-orange-400'}`}>50K</div>
                    <div>Extreme</div>
                  </div>
                  {dataLoad === 50000 && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white animate-pulse"></div>
                  )}
                </button>
                
                <button
                  onClick={() => handleStressTest(100000)}
                  className={`group relative rounded-xl px-6 py-5 text-sm font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                    dataLoad === 100000
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl shadow-red-500/50 ring-2 ring-red-400/50'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/30 border-2 border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`text-2xl ${dataLoad === 100000 ? 'text-white' : 'text-red-600 dark:text-red-400'}`}>100K</div>
                    <div>Maximum</div>
                  </div>
                  {dataLoad === 100000 && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white animate-pulse"></div>
                  )}
                </button>
              </div>

              <div className="pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                    Custom Load Configuration
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="100"
                      max="200000"
                      step="1000"
                      value={dataLoad}
                      onChange={(e) => {
                        const value = Math.max(100, Math.min(200000, parseInt(e.target.value) || 1000));
                        setDataLoad(value);
                      }}
                      onBlur={() => resetData(dataLoad)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          resetData(dataLoad);
                        }
                      }}
                      className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-6 py-4 text-lg font-bold text-slate-900 dark:text-slate-100 outline-none ring-offset-2 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 shadow-lg"
                      placeholder="Enter data point count"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
                      points
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Minimum: 100 points</span>
                    <span className="font-semibold">Maximum: 200,000 points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}

