/**
 * Performance monitoring and optimization utilities
 */

export interface FrameMetrics {
  timestamp: number;
  duration: number;
}

export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 60;
  private frameTimes: number[] = [];
  private readonly maxFrameHistory = 60;

  /**
   * Measure frame performance
   */
  measureFrame(): FrameMetrics {
    const now = performance.now();
    const duration = now - this.lastTime;
    this.lastTime = now;

    this.frameTimes.push(duration);
    if (this.frameTimes.length > this.maxFrameHistory) {
      this.frameTimes.shift();
    }

    // Calculate FPS from average frame time
    const avgFrameTime =
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.fps = Math.round(1000 / avgFrameTime);

    this.frameCount++;

    return {
      timestamp: now,
      duration,
    };
  }

  getFPS(): number {
    return this.fps;
  }

  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return (
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    );
  }

  reset(): void {
    this.frameCount = 0;
    this.frameTimes = [];
    this.lastTime = performance.now();
  }
}

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage(): number {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return memory.usedJSHeapSize / 1048576; // Convert to MB
  }
  return 0;
}

/**
 * Measure function execution time
 */
export function measureExecution<T>(
  fn: () => T,
  label?: string
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (label && process.env.NODE_ENV === 'development') {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Request animation frame with fallback
 */
export function requestAnimationFramePolyfill(
  callback: FrameRequestCallback
): number {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    return window.requestAnimationFrame(callback);
  }
  return setTimeout(callback, 16) as unknown as number;
}

/**
 * Cancel animation frame with fallback
 */
export function cancelAnimationFramePolyfill(id: number): void {
  if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
    window.cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
}



