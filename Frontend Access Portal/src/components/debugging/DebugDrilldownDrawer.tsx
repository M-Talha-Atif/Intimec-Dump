import { useState, useEffect } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download, ChevronLeft, ChevronRight, Loader2, AlertCircle,
} from "lucide-react";
import {
  fetchErrorVolumeEntries,
  fetchErrorCategoryEntries,
  fetchRecurringPatternEntries,
  fetchKpiDrilldown,
  type KpiDrilldownResponse,
  type DrilldownLogEntry,
  type RecurringPatternEntriesResponse,
  type ErrorVolumeEntriesResponse,
  type ErrorCategoryEntriesResponse,
} from "@/hooks/logging/analytics/useLogAnalytics";

const PAGE_SIZE = 20;

// When totalElements hits this value the drawer shows a cap warning.
// Matches OpenSearch default index.max_result_window = 10,000.
// Raise via PUT main-logs/_settings { "index.max_result_window": 50000 }
// then update this constant to match.
const MAX_BROWSABLE_RESULTS = 10_000;

// ---- Context types ----

// Three distinct drilldown modes -- each routes to a different API
export type DebugDrilldownMode =
  | "volume"     // error volume chart click  -> error-volume-entries API
  | "heatmap"    // heatmap cell click        -> error-volume-entries API (same)
  | "category"   // category chart click      -> error-category-entries API
  | "recurring"  // recurring patterns        -> recurring-pattern-entries API
  | "kpi"        // KPI card click           -> kpi-drilldown API
  | "search";    // everything else           -> POST /logs/search

export interface DebugDrilldownContext {
  title: string;
  description?: string;
  mode: DebugDrilldownMode;
  filters: DebugSearchFilters;
}

export interface DebugSearchFilters {
  // Used by mode=volume and mode=heatmap
  hour?: string;         // "HH:00" label clicked on chart
  timezone?: string;     // IANA timezone e.g. "Asia/Karachi"
  sources?: string[];    // source names from chart -- exact strings from API
  windowHours?: number;  // must match the hours param used to fetch the chart

  // Used by mode=category
  category?: string;     // exact category value from the chart
  categoryHours?: number; // 0 = all time (default), >0 = time-windowed

  // Used by mode=search (KPI cards, correlation chains, etc.)
  globalSearch?: string;
  level?: string[];
  source?: string[];
  isResolved?: boolean;
  correlationId?: string;
  dateFrom?: number;     // epoch ms
  dateTo?: number;       // epoch ms
  patternMessage?: string;
  patternHours?: number;  // 0 = all history
  // Used by mode=kpi
  kpiType?: string;  // "total_errors", "critical", "slow_responses", "recurring"
  kpiRange?: string; // optional range parameter
}

interface DebugDrilldownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: DebugDrilldownContext | null;
}

// ---- Log search fetcher (mode=search fallback) ----

async function fetchLogSearch(
  filters: DebugSearchFilters,
  page: number
): Promise<{ logs: DrilldownLogEntry[]; totalElements: number; totalPages: number }> {
  const body: Record<string, unknown> = {
    page,
    size: PAGE_SIZE,
    sortBy: "@timestamp",
    sortOrder: "DESC",
    aggregateOnly: false,
  };

  if (filters.globalSearch) body.globalSearch = filters.globalSearch;
  if (filters.level?.length) body.level = filters.level;
  if (filters.source?.length) body.source = filters.source;
  if (filters.isResolved !== undefined) body.isResolved = filters.isResolved;
  if (filters.correlationId) body.correlationId = filters.correlationId;
  if (filters.dateFrom) body.dateFrom = filters.dateFrom;
  if (filters.dateTo) body.dateTo = filters.dateTo;

  const res = await fetch("/api/logs/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Log search failed: ${res.status}`);

  const data = await res.json();
  const rawLogs: Record<string, unknown>[] = Array.isArray(data.logs)
    ? data.logs
    : [];
  const pagination = data.pagination ?? {};

  return {
    logs: mapRawLogs(rawLogs),
    totalElements: Number(pagination.totalElements ?? 0),
    totalPages: Number(pagination.totalPages ?? 0),
  };
}

// ---- Master fetcher -- routes by mode ----

async function fetchForMode(
  mode: DebugDrilldownMode,
  filters: DebugSearchFilters,
  page: number
): Promise<{ logs: DrilldownLogEntry[]; totalElements: number; totalPages: number }> {

  if (mode === "kpi") {
    const response: KpiDrilldownResponse = await fetchKpiDrilldown(
      filters.kpiType ?? "",
      page,
      PAGE_SIZE,
      filters.kpiRange
    );
    return {
      logs: mapResponseLogs(response.logs),
      totalElements: response.pagination.totalElements,
      totalPages: response.pagination.totalPages,
    };
  }

  if (mode === "recurring") {
    const response: RecurringPatternEntriesResponse =
      await fetchRecurringPatternEntries(
        filters.patternMessage ?? "",
        filters.patternHours ?? 0,
        page,
        PAGE_SIZE
      );
    return {
      logs: mapResponseLogs(response.logs),
      totalElements: response.pagination.totalElements,
      totalPages: response.pagination.totalPages,
    };
  }

  if (mode === "volume" || mode === "heatmap") {
    // Both volume and heatmap use the error-volume-entries endpoint.
    // The only difference is that heatmap passes a single source
    // while volume may pass multiple.
    const response: ErrorVolumeEntriesResponse = await fetchErrorVolumeEntries(
      filters.hour ?? "",
      filters.timezone ?? "UTC",
      filters.sources ?? [],
      filters.windowHours ?? 24,
      page,
      PAGE_SIZE
    );
    return {
      logs: mapResponseLogs(response.logs),
      totalElements: response.pagination.totalElements,
      totalPages: response.pagination.totalPages,
    };
  }

  if (mode === "category") {
    const response: ErrorCategoryEntriesResponse = await fetchErrorCategoryEntries(
      filters.category ?? "",
      filters.categoryHours ?? 0,
      page,
      PAGE_SIZE
    );
    return {
      logs: mapResponseLogs(response.logs),
      totalElements: response.pagination.totalElements,
      totalPages: response.pagination.totalPages,
    };
  }

  // mode=search covers KPI cards, correlation chains, recurring patterns
  return fetchLogSearch(filters, page);
}

// ---- Mappers ----

// Maps raw LogEntry JSON from the dedicated analytics endpoints.
// These endpoints use LogEntry POJO directly so field names are clean.
function mapResponseLogs(logs: DrilldownLogEntry[]): DrilldownLogEntry[] {
  return logs.map((log) => ({
    id: String(log.id ?? ""),
    timestamp: Number(log.timestamp ?? 0),
    level: String(log.level ?? "INFO"),
    source: String(log.source ?? ""),
    message: String(log.message ?? ""),
    correlationId: log.correlationId ? String(log.correlationId) : undefined,
    microservice: log.microservice ? String(log.microservice) : undefined,
    category: log.category ? String(log.category) : undefined,
  }));
}

// Maps raw JSON from the general POST /logs/search endpoint.
// That endpoint may use @timestamp (the OpenSearch field name) rather
// than timestamp (the Java getter name) depending on serialization config.
function mapRawLogs(rawLogs: Record<string, unknown>[]): DrilldownLogEntry[] {
  return rawLogs.map((log) => ({
    id: String(log.id ?? log.documentId ?? log._id ?? ""),
    timestamp: Number(log["@timestamp"] ?? log.timestamp ?? 0),
    level: String(log.level ?? "INFO"),
    source: String(log.source ?? ""),
    message: String(log.message ?? ""),
    correlationId: log.correlationId ? String(log.correlationId) : undefined,
    microservice: log.microservice ? String(log.microservice) : undefined,
    category: log.category ? String(log.category) : undefined,
  }));
}

// ---- Component ----

const DebugDrilldownDrawer = ({
  open,
  onOpenChange,
  context,
}: DebugDrilldownDrawerProps) => {
  const [logs, setLogs] = useState<DrilldownLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset everything when a new context opens
  useEffect(() => {
    if (open && context) {
      setCurrentPage(0);
      setLogs([]);
      setTotal(0);
      setTotalPages(0);
      setError(null);
    }
  }, [open, context?.title]);

  // Fetch on open, context change, or page change
  useEffect(() => {
    if (!open || !context) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchForMode(context.mode, context.filters, currentPage);
        setLogs(result.logs);
        setTotal(result.totalElements);
        setTotalPages(result.totalPages);
      } catch {
        setError("Failed to load log entries. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, context, currentPage]);

  const exportPageCsv = () => {
    const headers = ["Timestamp", "Level", "Source", "Message", "Category", "CorrelationId"];
    const rows = logs.map((l) => [
      new Date(l.timestamp).toLocaleString(),
      l.level,
      l.source,
      l.message,
      l.category ?? "",
      l.correlationId ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${context?.mode ?? "export"}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isCapped = total >= MAX_BROWSABLE_RESULTS;

  const getLevelBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case "ERROR": return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      case "WARN": return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "INFO": return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 h-full w-[55vw]">

        {/* Header */}
        <SheetHeader className="flex-shrink-0 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="truncate">
                {context?.title ?? "Log Entries"}
              </SheetTitle>

              {context?.description && (
                <SheetDescription className="mt-0.5">
                  {context.description}
                </SheetDescription>
              )}

              <div className="text-sm text-muted-foreground mt-1.5">
                {loading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <span>
                    {total.toLocaleString()} total entries
                    {totalPages > 1 && (
                      <span className="ml-1.5 text-xs opacity-70">
                        (page {currentPage + 1} of {totalPages})
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Cap warning -- shown when results hit the max_result_window limit */}
              {!loading && isCapped && (
                <div className="flex items-start gap-2 mt-2 px-3 py-2 rounded-md bg-warning/10 border border-warning/20">
                  <AlertCircle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-warning leading-relaxed">
                    Showing first{" "}
                    <span className="font-semibold">
                      {MAX_BROWSABLE_RESULTS.toLocaleString()}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {total.toLocaleString()}
                    </span>{" "}
                    total entries.
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exportPageCsv}
              disabled={logs.length === 0}
              className="mr-8 shrink-0"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </SheetHeader>

        {/* Table */}
        <ScrollArea className="flex-1">
          <div className="px-6 pb-4">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {!loading && !error && logs.length === 0 && (
              <div className="text-center text-muted-foreground py-12 text-sm">
                No log entries found for the selected filters.
              </div>
            )}

            {!loading && !error && logs.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-36">Timestamp</TableHead>
                    <TableHead className="text-xs w-20">Level</TableHead>
                    <TableHead className="text-xs w-44">Source</TableHead>
                    <TableHead className="text-xs">Message</TableHead>
                    <TableHead className="text-xs w-32">Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs whitespace-nowrap py-2">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge className={`${getLevelBadge(log.level)} border text-xs`}>
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        {/* Full source name e.g. com.aidentx...GatewayPermissionFilter */}
                        {/* Truncated with full name in title for hover */}
                        <span
                          className="block text-xs font-medium truncate max-w-[160px]"
                          title={log.source}
                        >
                          {log.source}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <span
                          className="block text-xs text-muted-foreground truncate max-w-[300px]"
                          title={log.message}
                        >
                          {log.message}
                        </span>
                        {log.correlationId && (
                          <span className="block text-xs text-primary/60 mt-0.5 truncate font-mono">
                            {log.correlationId}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <span
                          className="block text-xs text-muted-foreground truncate max-w-[120px]"
                          title={log.category ?? ""}
                        >
                          {log.category ?? "—"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-background">
            <span className="text-xs text-muted-foreground">
              {(currentPage * PAGE_SIZE + 1).toLocaleString()}
              {" – "}
              {Math.min((currentPage + 1) * PAGE_SIZE, total).toLocaleString()}
              {" of "}
              {total.toLocaleString()}
              {isCapped && (
                <span className="ml-1 opacity-60">(first 10k shown)</span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums px-1">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={currentPage >= totalPages - 1 || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DebugDrilldownDrawer;