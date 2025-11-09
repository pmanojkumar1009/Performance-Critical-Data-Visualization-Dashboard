# Performance-Critical Data Visualization Dashboard
**Project:** Performance-Critical Real-Time Data Visualization Dashboard  
**Stack:** Next.js 14+ (App Router) + TypeScript + Canvas + Web Workers + Tailwind CSS  
**Goal:** Sustain 60 FPS with 10k+ data points, low interaction latency (<100ms), memory efficient.

---

## Overview
This document describes the architecture, components, data flow, protocols, and design decisions for the Performance Dashboard. It follows the clear, structured style of the provided reference (collaborative drawing app) and adapts it for a high-throughput real-time charting application.

---

## System Architecture (box diagram)
```
┌───────────────┐   HTTP / SSE / WS   ┌────────────────────────┐
│   Browser     │◄───────────────────►│    Next.js Server      │
│ (Client App)  │                    │  (Server: API, SSR)    │
└──────┬────────┘                    └─────────┬──────────────┘
       │                                         │
       │        Initial data (SSR) / API         │
       │────────────────────────────────────────►│
       │                                         │
       │  Real-time feed (simulated/remote)      │
       │◄────────────────────────────────────────│
       │                                         │
┌──────▼────────┐                                │
│ DataProvider  │                                │
│ (React Context)│                               │
└──────┬────────┘                                │
       │                                         │
       │                             ┌───────────▼──────────┐
       │                             │   Data Generator /   │
       │                             │   External Stream     │
       │                             └───────────┬──────────┘
       │                                         │
       │                                         ▼
┌──────▼────────┐                        ┌─────────────────────────┐
│ Charts (Client)│  Offload heavy work │     Web Worker(s)        │
│ (Canvas Layer) │◄────────────────────►│ (aggregation, decimate)  │
└──────┬────────┘                        └─────────────────────────┘
       │
       ▼
┌──────┴────────┐
│ Performance   │
│ Monitor UI    │
└───────────────┘
```

---

## Components & File Map (full structure)
```
performance-dashboard/
├─ app/
│  ├─ dashboard/
│  │  ├─ page.tsx           # Server component: SSR initial data
│  │  └─ layout.tsx
│  ├─ api/
│  │  └─ data/route.ts      # API endpoints (GET initial, query)
│  └─ globals.css
├─ components/
│  ├─ charts/
│  │  ├─ LineChart.tsx
│  │  ├─ BarChart.tsx
│  │  ├─ ScatterPlot.tsx
│  │  └─ Heatmap.tsx
│  ├─ controls/
│  │  ├─ FilterPanel.tsx
│  │  └─ TimeRangeSelector.tsx
│  ├─ ui/
│  │  ├─ DataTable.tsx
│  │  └─ PerformanceMonitor.tsx
│  └─ providers/
│     └─ DataProvider.tsx
├─ hooks/
│  ├─ useDataStream.ts
│  ├─ useChartRenderer.ts
│  ├─ usePerformanceMonitor.ts
│  └─ useVirtualization.ts
├─ lib/
│  ├─ dataGenerator.ts
│  ├─ canvasUtils.ts
│  ├─ performanceUtils.ts
│  └─ types.ts
├─ public/
│  └─ worker.js             # Web Worker script
├─ package.json
├─ next.config.js
├─ tsconfig.json
└─ README.md
```

---

## Data flow (detailed) — Live update path

### Real-time streaming (normal operation)
```
DataGenerator / External Source
    │
    ├─ emits new DataPoint every 100ms
    ▼
useDataStream (client hook) receives point(s)
    │
    ├─ writes into CircularBuffer (max 10k)
    ├─ posts lightweight update (index/tick) to DataProvider
    ▼
DataProvider (React Context)
    │
    ├─ exposes API to controls and charts:
    │     - getWindow(start,end)
    │     - setFilter(min,max)
    │     - setAggregation(period)
    ├─ sends heavy tasks to Web Worker (aggregate/decimate/filter)
    ▼
Web Worker (worker.js)
    │
    ├─ processes request (aggregation, SMA/EMA, decimation)
    ├─ returns typed Float32Array / indices
    ▼
useChartRenderer (rAF loop)
    │
    ├─ consumes preprocessed buffers
    ├─ draws on Canvas (mainCanvas + overlayCanvas)
    ├─ reports frame timing to usePerformanceMonitor
    ▼
PerformanceMonitor UI (FPS/Memory/Latency)
```

### Why circular buffer + rAF?
- Circular buffer keeps memory bounded (old points dropped).
- rAF loop separates drawing from React render cycles to avoid reconciliation overhead per frame.

---

## Protocols & API (examples)

### HTTP API routes (app/api/data/route.ts)
- `GET /api/data?limit=1000&from=ts&to=ts` → returns historical points (paginated)
- `GET /api/config` → returns chart configs, buckets, thresholds

**Response example**
```json
{
  "data": [
    { "timestamp": 1690000000000, "value": 267245.1 },
    { "timestamp": 1690000000100, "value": 267245.3 }
  ]
}
```

### Worker messaging protocol (postMessage)
**Client → Worker**
```json
{
  "id": "req-123",
  "type": "DECIMATE",
  "payload": {
    "points": "...",   // transferable buffer (Float32Array)
    "pixelWidth": 1200
  }
}
```
**Worker → Client**
```json
{
  "id": "req-123",
  "type": "DECIMATE_RESULT",
  "payload": {
    "indices": "...",  // typed array of indexes to draw
    "minMaxPairs": "..." // optional
  }
}
```

---

## Rendering pipeline & canvas strategy

### Canvas layers
```
┌────────────────────────────────────────────┐
│ overlayCanvas (top)   -> tooltips, hover  │  pointer-events: none
├────────────────────────────────────────────┤
│ mainCanvas (bottom)    -> primary chart    │  performant drawing
└────────────────────────────────────────────┘
```

- **mainCanvas**: draws lines, bars, scatter points — uses batched `beginPath` and `stroke`.
- **overlayCanvas**: crosshair, tooltip boxes, brush selection — cleared/redrawn frequently.

### Draw loop (high level)
1. rAF tick
2. If new render data or interaction change:
   - Pull decimated buffer from worker or cached processed data.
   - Map timestamp→x, value→y (cached transforms per zoom level).
   - Batch draw commands; avoid per-point DOM ops.
3. Record frame time and push to monitor.

---

## Aggregation & decimation strategies

- **Time-bucket aggregation**: group into 1min/5min/1hour buckets on worker.
- **Largest-triangle-three-buckets / MinMax decimation**: preserve shape and spikes.
- **Heatmap binning**: 50x50 grid default, counts per cell.
- **Scatter sampling**: deterministic reservoir sampling if points > threshold.

Tradeoffs: decimation reduces visual fidelity slightly but maintains trend & spikes — essential for 60 FPS at 10k+ points.

---

## Interaction & Controls

- **Zoom & Pan**: `usePanZoom` stores transform state; charts recompute mapping only when scale/translate change.
- **Brush Selection**: overlayCanvas handles drag; selected time range sent to DataProvider and worker for aggregation.
- **Filters**: min/max filters pushed to worker to avoid blocking main thread.
- **Keyboard Shortcuts**: global handler with focus checks (Z,X,R,E,S,M).

---

## Performance monitoring

- FPS measured as frames per second (sliding window, 500–1000ms).
- Render time per frame measured in ms.
- JS heap memory via `performance.memory` if available (Chrome).
- Update latency = now - data.timestamp (ms).
- UI shows color-coded badges: green/yellow/red thresholds.

---

## State sync & recovery

- **Initial SSR**: Server renders `page.tsx` providing `initialData` to client for fast FCP.
- **On reconnect**: client requests `GET /api/data?from=lastSeenTs` to fetch missed points.
- **Worker fallback**: if worker fails, fallback to in-thread processing with reduced frequency.

---

## Error handling & edge cases

- **Worker crash**: detect `onerror`, re-initialize worker and notify user with a banner.
- **Memory high**: if heap grows beyond threshold, switch to aggressive aggregation mode automatically.
- **Slow devices**: detect device memory & CPU (navigator.hardwareConcurrency) and lower max points for rendering.
- **Invalid filter input**: validated in UI and server.

---

## Security & production hardening

- Enforce CORS, rate limiting, and input validation on server routes.
- Authenticate API routes with JWT/OAuth for private data sources.
- Limit upload sizes and sanitize inputs.
- Use HTTPS in production.

---

## Scalability & persistence

- Short-term: in-memory circular buffer on client (bounded).
- Medium-term: server stores aggregated summaries in ClickHouse/Timescale for historical queries.
- Horizontal scaling: if server streams real-time, use a pub/sub (Redis Streams / Kafka) and Socket.io Redis adapter for horizontal WS scaling.
- Snapshotting: periodically store compressed snapshots (images / compressed arrays) to reduce rebuild time for long histories.

---

## Testing strategy

- Unit tests: hooks, data transforms, worker functions (Jest).
- Integration: render charts with sample data (Playwright).
- Performance: headless Chrome measuring FPS, memory across scenarios (10k/50k/100k).
- Stress tests: run for hours with continuous streaming to detect memory leaks.

---

## Observability & metrics
- Client-side telemetry: fps, frameTime, visiblePoints, memoryUsage, errors — send to telemetry endpoint.
- Server metrics: API latency, error rate, worker queue length.
- Integrate with Prometheus + Grafana + Sentry.

---

## Future roadmap & enhancements
- OffscreenCanvas in Web Worker for full worker-side rendering.
- WebSocket-based low-latency production stream.
- Per-user dashboards & saved views (Server Actions).
- Collaboration features (annotations, sharing).
- Adaptive rendering quality based on device capability.

---

## ASCII Sequence Diagrams (clear)

### Startup & initial load
```
Server -> Client: SSR initial HTML + initial dataset
Client -> DataProvider: hydrate(initialData)
Client -> useDataStream: start simulated stream
useDataStream -> Web Worker: request decimation for initial viewport
Web Worker -> useChartRenderer: send decimated payload
useChartRenderer -> Canvas: draw frame
```

### Real-time update tick
```
DataGenerator -> useDataStream: newPoint
useDataStream -> CircularBuffer: push(newPoint)
useDataStream -> DataProvider: notify(tick)
DataProvider -> Web Worker: process (if needed)
Web Worker -> useChartRenderer: optimized payload
useChartRenderer -> Canvas: draw
useChartRenderer -> PerformanceMonitor: frame stats
```

---

## Appendix: Data types

```ts
type DataPoint = {
  timestamp: number; // ms
  value: number;
  category?: string;
}

type DecimateRequest = {
  id: string;
  type: "DECIMATE";
  payload: { points: Float32Array; pixelWidth: number; }
}

type DecimateResult = {
  id: string;
  type: "DECIMATE_RESULT";
  payload: { indices: Uint32Array; minMax: Float32Array }
}
```

---

## Conclusion
This document provides a complete, clear, and production-focused architecture for your Performance Dashboard. It mirrors the level of clarity and structure from the collaborative drawing reference while being tailored for large-scale, high-frequency time-series visualization.

