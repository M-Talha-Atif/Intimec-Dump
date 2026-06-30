import { useState, useEffect, useCallback } from "react";

export interface LogAnalyticsKpisData {
  totalErrors24h: number;
  criticalFailures: number;
  avgResponseTimeMs: number;
  mttrMinutes: number;
  recurringPatterns: number;
}

export interface ErrorVolumeEntry {
  hour: string;     // "HH:00" label in caller timezone
  epochMs: number;  // UTC epoch ms for start of this slot -- computed at fetch time
  [source: string]: string | number;
}

export interface ErrorVolumeResponse {
  hours: number;
  limit: number;
  sources: string[];
  timeline: ErrorVolumeEntry[];
}

export interface ErrorCategoryEntry {
  category: string;
  count: number;
}

export interface LogHeatmapCell {
  source: string;
  hour: string;   // "HH:00" in caller timezone
  count: number;
}

export interface LogHeatmapResponse {
  hours: number;
  limit: number;
  sources: string[];
  data: LogHeatmapCell[];
}

// Shape of each entry returned by both error-volume-entries and
// error-category-entries endpoints (both use LogEntry on the backend)
export interface DrilldownLogEntry {
  id: string;
  timestamp: number;    // epoch ms
  level: string;
  source: string;
  message: string;
  category?: string;
  correlationId?: string;
  microservice?: string;
}

// Response from GET /api/logs/analytics/error-volume-entries
// Also used for heatmap drilldown since it hits the same endpoint
export interface ErrorVolumeEntriesResponse {
  hour: string;
  timezone: string;
  resolvedDateFrom: number;  // UTC epoch ms -- useful for debugging
  resolvedDateTo: number;
  sources: string[];
  logs: DrilldownLogEntry[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Response from GET /api/logs/analytics/error-category-entries
export interface ErrorCategoryEntriesResponse {
  category: string;
  logs: DrilldownLogEntry[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface RecurringPatternEntry {
  id: string;
  message: string;
  occurrences: number;
  firstSeen: string;   // ISO-8601 UTC string e.g. "2026-03-17T10:00:00Z"
  lastSeen: string;    // ISO-8601 UTC string
  source: string;
  severity: string;    // "high", "medium", "low"
}

export interface RecurringPatternsResponse {
  patterns: RecurringPatternEntry[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Response type
export interface RecurringPatternEntriesResponse {
  message: string;
  logs: DrilldownLogEntry[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface MttrTrendEntry {
  day: string;    // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
  mttr: number;   // average minutes to resolution on that day; 0 = no resolved entries
}

// interface for KPI drilldown response
export interface KpiDrilldownResponse {
  type: string;
  logs: DrilldownLogEntry[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export async function fetchKpiDrilldown(
  type: string,
  page: number,
  size: number,
  range?: string
): Promise<KpiDrilldownResponse> {
  const params = new URLSearchParams();
  params.append("type", type);
  params.append("page", String(page));
  params.append("size", String(size));
  if (range) params.append("range", range);

  const res = await fetch(
    `/api/logs/analytics/kpi-drilldown?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch KPI drilldown");
  return res.json();
}

async function fetchMttrTrend(timezone?: string): Promise<MttrTrendEntry[]> {
  const params = new URLSearchParams();
  if (timezone) params.append("timezone", timezone);
  const res = await fetch(
    `/api/logs/analytics/mttr-trend?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch MTTR trend");
  return res.json();
}


// Export so the drawer can call it directly
// hours=0 means all history matching the pattern list default
export async function fetchRecurringPatternEntries(
  message: string,
  hours: number,
  page: number,
  size: number
): Promise<RecurringPatternEntriesResponse> {
  const params = new URLSearchParams();
  params.append("message", message);
  params.append("hours", String(hours));
  params.append("page", String(page));
  params.append("size", String(size));

  const res = await fetch(
    `/api/logs/analytics/recurring-pattern-entries?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch recurring pattern entries");
  return res.json();
}



// ---- Individual fetchers ----
async function fetchRecurringPatterns(
  page = 0,
  size = 5,
  hours = 0
): Promise<RecurringPatternsResponse> {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  params.append("hours", String(hours));
  const res = await fetch(
    `/api/logs/analytics/recurring-patterns?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch recurring patterns");
  return res.json();
}





async function fetchLogKpis(range?: string): Promise<LogAnalyticsKpisData> {
  const params = new URLSearchParams();
  if (range) params.append("range", range);
  const res = await fetch(`/api/logs/analytics/kpis?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch log KPIs");
  return res.json();
}

async function fetchErrorVolume(
  hours = 24,
  limit = 5,
  range?: string,
  timezone?: string
): Promise<ErrorVolumeResponse> {
  const params = new URLSearchParams();
  params.append("hours", String(hours));
  params.append("limit", String(limit));
  if (range) params.append("range", range);
  if (timezone) params.append("timezone", timezone);

  // Record request time before the fetch so windowStartMs is consistent
  // with what the backend used when it built the timeline.
  // The backend computes: windowStart = now - (hours * 3600000)
  // We use the same formula here to attach epochMs to each slot.
  const requestTime = Date.now();
  const windowStartMs = requestTime - hours * 60 * 60 * 1000;

  const res = await fetch(
    `/api/logs/analytics/error-volume?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch error volume");

  const data: ErrorVolumeResponse = await res.json();

  // Attach epochMs to each timeline entry.
  // The backend returns slots in chronological order starting from windowStart.
  // Slot 0 starts at windowStart, slot 1 starts at windowStart + 1h, etc.
  // This gives the frontend the exact UTC bounds without any label parsing.
  //
  // Example: hours=24, current time=16:30 PKT (11:30 UTC)
  // windowStartMs = yesterday 11:30 UTC
  // slot 0 = yesterday 11:30 UTC = "16:00" PKT (truncated to hour by backend)
  // slot 1 = yesterday 12:30 UTC... wait, actually the backend truncates
  // to the hour boundary so each slot is at a clean HH:00.
  // The index-to-epoch mapping is still accurate because the backend
  // always produces exactly one slot per hour in order.
  const enrichedTimeline: ErrorVolumeEntry[] = data.timeline.map(
    (entry, index) => ({
      ...entry,
      epochMs: windowStartMs + index * 60 * 60 * 1000,
    })
  );

  return { ...data, timeline: enrichedTimeline };
}

async function fetchErrorCategoryDistribution(
  limit = 10,
  hours?: number,
  range?: string
): Promise<ErrorCategoryEntry[]> {
  const params = new URLSearchParams();
  params.append("limit", String(limit));
  if (hours !== undefined) params.append("hours", String(hours));
  if (!hours && !range) params.append("range", "all");
  if (range) params.append("range", range);

  const res = await fetch(
    `/api/logs/analytics/error-category-distribution?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch error category distribution");
  return res.json();
}

async function fetchLogHeatmap(
  hours = 24,
  limit = 10,
  range?: string,
  timezone?: string
): Promise<LogHeatmapResponse> {
  const params = new URLSearchParams();
  params.append("hours", String(hours));
  params.append("limit", String(limit));
  if (range) params.append("range", range);
  if (timezone) params.append("timezone", timezone);

  const res = await fetch(
    `/api/logs/analytics/heatmap?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch log heatmap");
  return res.json();
}

// Fetches entries for a specific hour slot from the error volume timeline.
// Used by both error volume chart clicks and heatmap cell clicks.
// source is a single source name for heatmap; multiple for volume chart.
//
// Example (volume chart click at "15:00" with two sources):
//   fetchErrorVolumeEntries("15:00", "Asia/Karachi", ["GatewayPermissionFilter","JwtUtil"], 24, 0, 20)
//
// Example (heatmap cell click at "15:00" for one source):
//   fetchErrorVolumeEntries("15:00", "Asia/Karachi", ["GatewayPermissionFilter"], 24, 0, 20)
export async function fetchErrorVolumeEntries(
  hour: string,
  timezone: string,
  sources: string[],
  windowHours: number,
  page: number,
  size: number
): Promise<ErrorVolumeEntriesResponse> {
  const params = new URLSearchParams();
  params.append("hour", hour);
  params.append("timezone", timezone);
  params.append("windowHours", String(windowHours));
  params.append("page", String(page));
  params.append("size", String(size));

  // Join sources as comma-separated -- backend splits on comma
  // Empty sources array means "all sources in this hour"
  if (sources.length > 0) {
    params.append("sources", sources.join(","));
  }

  const res = await fetch(
    `/api/logs/analytics/error-volume-entries?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch error volume entries");
  return res.json();
}

// Fetches entries for a specific category value from the distribution chart.
//
// Example: fetchErrorCategoryEntries("Security-Auth", 0, 0, 20)
// hours=0 means no time filter (all history) -- matches the chart default
export async function fetchErrorCategoryEntries(
  category: string,
  hours: number,
  page: number,
  size: number
): Promise<ErrorCategoryEntriesResponse> {
  const params = new URLSearchParams();
  params.append("category", category);
  params.append("hours", String(hours));
  params.append("page", String(page));
  params.append("size", String(size));

  const res = await fetch(
    `/api/logs/analytics/error-category-entries?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch error category entries");
  return res.json();
}

// ---- Main hook ----

interface UseLogAnalyticsOptions {
  autoFetch?: boolean;
  range?: "all" | null;
  errorVolumeHours?: number;
  errorVolumeLimit?: number;
  categoryLimit?: number;
  heatmapHours?: number;
  heatmapLimit?: number;
}

export function useLogAnalytics(options: UseLogAnalyticsOptions = {}) {
  const {
    autoFetch = true,
    range,
    errorVolumeHours = 24,
    errorVolumeLimit = 5,
    categoryLimit = 10,
    heatmapHours = 24,
    heatmapLimit = 10,
  } = options;

  const rangeParam = range ?? undefined;

  const [kpis, setKpis] = useState<LogAnalyticsKpisData | null>(null);
  const [errorVolume, setErrorVolume] = useState<ErrorVolumeResponse | null>(null);
  const [errorCategory, setErrorCategory] = useState<ErrorCategoryEntry[]>([]);
  const [heatmap, setHeatmap] = useState<LogHeatmapResponse | null>(null);

  const [kpisLoading, setKpisLoading] = useState(false);
  const [volumeLoading, setVolumeLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [heatmapLoading, setHeatmapLoading] = useState(false);

  const [kpisError, setKpisError] = useState<string | null>(null);
  const [volumeError, setVolumeError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);


  // Update state
  const [recurringPatternsData, setRecurringPatternsData] = useState<RecurringPatternsResponse | null>(null);
  const [recurringPatternsPage, setRecurringPatternsPage] = useState(0);
  const [recurringPatternsLoading, setRecurringPatternsLoading] = useState(false);
  const [recurringPatternsError, setRecurringPatternsError] = useState<string | null>(null);

  const PAGE_SIZE_PATTERNS = 5;

  const [mttrTrend, setMttrTrend] = useState<MttrTrendEntry[]>([]);
  const [mttrTrendLoading, setMttrTrendLoading] = useState(false);
  const [mttrTrendError, setMttrTrendError] = useState<string | null>(null);





  const browserTimezone =
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  const loadMttrTrend = useCallback(async () => {
    setMttrTrendLoading(true);
    setMttrTrendError(null);
    try {
      setMttrTrend(await fetchMttrTrend(browserTimezone));
    } catch {
      setMttrTrendError("Failed to load MTTR trend");
    } finally {
      setMttrTrendLoading(false);
    }
  }, [browserTimezone]);

  const loadKpis = useCallback(async () => {
    setKpisLoading(true);
    setKpisError(null);
    try {
      setKpis(await fetchLogKpis(rangeParam));
    } catch {
      setKpisError("Failed to load log KPIs");
    } finally {
      setKpisLoading(false);
    }
  }, [rangeParam]);

  const loadErrorVolume = useCallback(
    async (hours = errorVolumeHours, limit = errorVolumeLimit) => {
      setVolumeLoading(true);
      setVolumeError(null);
      try {
        setErrorVolume(
          await fetchErrorVolume(hours, limit, rangeParam, browserTimezone)
        );
      } catch {
        setVolumeError("Failed to load error volume");
      } finally {
        setVolumeLoading(false);
      }
    },
    [rangeParam, errorVolumeHours, errorVolumeLimit, browserTimezone]
  );

  const loadErrorCategory = useCallback(
    async (limit = categoryLimit) => {
      setCategoryLoading(true);
      setCategoryError(null);
      try {
        setErrorCategory(
          await fetchErrorCategoryDistribution(limit, undefined, "all")
        );
      } catch {
        setCategoryError("Failed to load error category distribution");
      } finally {
        setCategoryLoading(false);
      }
    },
    [categoryLimit]
  );

  const loadRecurringPatterns = useCallback(async (page = 0) => {
    setRecurringPatternsLoading(true);
    setRecurringPatternsError(null);
    try {
      const data = await fetchRecurringPatterns(page, PAGE_SIZE_PATTERNS, 0);
      setRecurringPatternsData(data);
      setRecurringPatternsPage(page);
    } catch {
      setRecurringPatternsError("Failed to load recurring patterns");
    } finally {
      setRecurringPatternsLoading(false);
    }
  }, []);


  const loadHeatmap = useCallback(
    async (hours = heatmapHours, limit = heatmapLimit) => {
      setHeatmapLoading(true);
      setHeatmapError(null);
      try {
        setHeatmap(
          await fetchLogHeatmap(hours, limit, rangeParam, browserTimezone)
        );
      } catch {
        setHeatmapError("Failed to load log heatmap");
      } finally {
        setHeatmapLoading(false);
      }
    },
    [rangeParam, heatmapHours, heatmapLimit, browserTimezone]
  );

  const loadAll = useCallback(() => {
    loadKpis();
    loadErrorVolume();
    loadErrorCategory();
    loadHeatmap();
    loadRecurringPatterns();
    loadMttrTrend();
  }, [loadKpis, loadErrorVolume, loadErrorCategory, loadHeatmap,
    loadRecurringPatterns, loadMttrTrend]);


  useEffect(() => {
    if (autoFetch) loadAll();
  }, [autoFetch, loadAll]);

  return {
    kpis,
    errorVolume,
    errorCategory,
    heatmap,
    kpisLoading,
    volumeLoading,
    categoryLoading,
    heatmapLoading,
    recurringPatternsLoading,
    kpisError,
    volumeError,
    categoryError,
    heatmapError,
    recurringPatternsData,
    recurringPatternsPage,
    loadKpis,
    loadErrorVolume,
    loadErrorCategory,
    loadHeatmap,
    loadRecurringPatterns,
    loadAll,
    recurringPatternsError,
    // Expose browser timezone so the dashboard can pass it to drilldown calls
    browserTimezone,
    // Expose the window hours so the dashboard passes the correct value
    // when calling fetchErrorVolumeEntries for drilldown
    errorVolumeHours,
    heatmapHours,
    mttrTrend,
    mttrTrendLoading,
    mttrTrendError,
    loadMttrTrend,
    

  };
}