import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Loader2 } from "lucide-react";
import CustomPagination from "@/components/applications/common/CustomPagination";
import { KpiDrilldownItem, DrilldownColumnConfig } from "./CatalogKpiDrilldownModal";

interface CatalogChartDrilldownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  segmentLabel: string;
  segmentColor?: string;
  items: KpiDrilldownItem[];
  columns?: DrilldownColumnConfig;
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 10;

const getBadgeClass = (value: string): string => {
  const lower = value.toLowerCase();
  switch (lower) {
    case "high":
    case "critical":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    case "low":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "no owner":
    case "unassigned":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "owned":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "active":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "deprecated":
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
    case "orphaned":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "approved":
    case "certified":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case "revoked":
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
  }
};

const CatalogChartDrilldownModal: React.FC<CatalogChartDrilldownSheetProps> = ({
  open,
  onOpenChange,
  title,
  segmentLabel,
  segmentColor,
  items,
  columns,
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  loading = false,
  onPageChange,
  onPageSizeChange,
  pageSize = DEFAULT_PAGE_SIZE,
}) => {
  const [localPageSize, setLocalPageSize] = useState(pageSize);

  const effectivePageSize = onPageSizeChange ? pageSize : localPageSize;
  const effectiveTotalPages = onPageSizeChange
    ? totalPages
    : Math.max(Math.ceil(totalElements / localPageSize), 1);

  const nameHeader = columns?.nameHeader ?? "Name";
  const detailHeader = columns?.detailHeader ?? "Detail";
  const badgeHeader = columns?.badgeHeader ?? "Status";

  const handleExport = () => {
    const csv = [
      `${nameHeader},${detailHeader},${badgeHeader}`,
      ...items.map(
        (i) => `"${i.name}","${i.detail}","${i.badge ?? ""}"`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_").toLowerCase()}_${segmentLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

  const handlePageSizeChange = (size: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(size);
    } else {
      setLocalPageSize(size);
      onPageChange?.(0);
    }
  };

  const showPagination = !loading && items.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[50vw] max-h-[100dvh] p-0 [&>button]:right-4 [&>button]:top-4"
      >
        <div
          className="grid grid-rows-[auto_1fr_auto]"
          style={{ height: "100dvh", maxHeight: "100dvh" }}
        >
          {/* Header */}
          <SheetHeader className="px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <SheetTitle className="flex items-center gap-2 truncate">
                  <span className="truncate">{title}</span>
                  <Badge
                    className="text-xs shrink-0"
                    style={
                      segmentColor
                        ? { backgroundColor: segmentColor, color: "#fff" }
                        : undefined
                    }
                  >
                    {segmentLabel}
                  </Badge>
                </SheetTitle>
                <SheetDescription>
                  {loading ? (
                    "Loading..."
                  ) : (
                    <>
                      {totalElements.toLocaleString()} total items
                      {effectiveTotalPages > 1 && (
                        <span className="ml-2 text-xs">
                          (page {currentPage + 1} of {effectiveTotalPages})
                        </span>
                      )}
                    </>
                  )}
                </SheetDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={items.length === 0}
                className="mr-8 shrink-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </SheetHeader>

          {/* Scrollable table */}
          <div className="overflow-y-auto min-h-0">
            <div className="px-6 py-4">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {!loading && items.length === 0 && (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  No items in this segment.
                </div>
              )}

              {!loading && items.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">
                        {nameHeader}
                      </TableHead>
                      <TableHead className="text-xs">
                        {detailHeader}
                      </TableHead>
                      <TableHead className="text-xs">
                        {badgeHeader}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.detail}
                        </TableCell>
                        <TableCell>
                          {item.badge ? (
                            <Badge
                              className={`${getBadgeClass(item.badge)} border text-xs`}
                            >
                              {item.badge.charAt(0).toUpperCase() +
                                item.badge.slice(1).toLowerCase()}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Pagination */}
          {showPagination && (
            <div className="pb-2">
              <CustomPagination
                useCallbackMode={true}
                totalElements={totalElements}
                totalPages={effectiveTotalPages}
                page={currentPage}
                size={effectivePageSize}
                defaultSize={DEFAULT_PAGE_SIZE}
                onPageChange={handlePageChange}
                onSizeChange={handlePageSizeChange}
                siblingCount={1}
                boundaryCount={1}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CatalogChartDrilldownModal;