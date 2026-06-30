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
import { Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getRiskBadgeClass } from "@/utils/getRiskColor";
import {
  fetchDrilldown,
  type DrilldownAuditLog,
  type DrilldownFilters,
} from "@/hooks/auditing/analytics/useAuditAnalytics";

// Filters passed in when a KPI card, chart bar, actor row, or heatmap cell
// is clicked. Determines what subset of audit logs the drawer fetches.
export interface DrilldownContext {
  // Human readable title shown in the sheet header
  title: string;
  // Human readable description shown under the title
  description?: string;
  // Backend filters forwarded to GET /api/v1/audit-logs
  filters: DrilldownFilters;
}

interface AuditDrilldownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: DrilldownContext | null;
}

const PAGE_SIZE = 25;

const AuditDrilldownDrawer = ({
  open,
  onOpenChange,
  context,
}: AuditDrilldownDrawerProps) => {
  const [logs, setLogs] = useState<DrilldownAuditLog[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset page to 0 whenever the drawer opens with a new context
  useEffect(() => {
    if (open && context) {
      setCurrentPage(0);
      setLogs([]);
      setTotalElements(0);
      setTotalPages(0);
    }
  }, [open, context?.title]);

  // Fetch logs whenever context or page changes while open
  useEffect(() => {
    if (!open || !context) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchDrilldown({
          ...context.filters,
          page: currentPage,
          size: PAGE_SIZE,
        });
        setLogs(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(result.totalPages);
      } catch {
        setError("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, context, currentPage]);

  // Export currently loaded page as CSV
  const exportCsv = () => {
    const headers = ["Timestamp", "Event", "Object Type", "Actor", "Risk", "Status"];
    const rows = logs.map((l) => [
      new Date(l.timestamp).toLocaleString(),
      l.event,
      l.objectType,
      l.actorName,
      l.risk,
      l.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c ?? ""}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-drilldown-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case "failure":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 h-full w-[50vw]">
        {/* Header with title, description, total count, and export */}
        <SheetHeader className="flex-shrink-0 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <SheetTitle className="truncate">
                {context?.title ?? "Audit Events"}
              </SheetTitle>
              {context?.description && (
                <SheetDescription>{context.description}</SheetDescription>
              )}
              <div className="text-sm text-muted-foreground mt-1">
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    {totalElements.toLocaleString()} total events
                    {totalPages > 1 && (
                      <span className="ml-2 text-xs">
                        (page {currentPage + 1} of {totalPages})
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={logs.length === 0}
              className="mr-8 shrink-0"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </SheetHeader>

        {/* Scrollable table body */}
        <ScrollArea className="flex-1">
          <div className="px-6 pb-4">
            {/* Loading spinner */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="text-center text-destructive py-8 text-sm">
                {error}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && logs.length === 0 && (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No events found
              </div>
            )}

            {/* Logs table -- only shown when not loading and data exists */}
            {!loading && !error && logs.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Timestamp</TableHead>
                    <TableHead className="text-xs">Event</TableHead>
                    <TableHead className="text-xs">Object Type</TableHead>
                    <TableHead className="text-xs">Actor</TableHead>
                    <TableHead className="text-xs">Risk</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {log.event}
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {log.objectType}
                      </TableCell>
                      <TableCell className="text-sm">{log.actorName}</TableCell>
                      <TableCell>
                        {log.risk ? (
                          <Badge
                            className={`${getRiskBadgeClass(log.risk.toLowerCase())} border text-xs`}
                          >
                            {log.risk?.charAt(0).toUpperCase() + log.risk?.slice(1).toLowerCase()}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusBadge(log.status)} border text-xs`}
                        >
                          {log.status?.charAt(0).toUpperCase() + log.status?.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </ScrollArea>

        {/* Pagination footer -- only shown when there are multiple pages */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-background">
            <span className="text-xs text-muted-foreground">
              Showing {currentPage * PAGE_SIZE + 1}
              {" - "}
              {Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} of{" "}
              {totalElements.toLocaleString()}
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

export default AuditDrilldownDrawer;