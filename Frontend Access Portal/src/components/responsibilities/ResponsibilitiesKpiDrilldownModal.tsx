import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusBadgeClass } from '@/utils/getBadgeClass';
import { ScrollArea } from '../ui/scroll-area';
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export interface DrilldownItem {
  id: string;
  name: string;
  type: string;
  status: string;
  risk: string;
  date: string;
}

const PAGE_SIZE = 10;

interface ResponsibilitiesKpiDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  // All items passed at once -- pagination is handled client-side by slicing
  items: DrilldownItem[];
  // Optional: when true the modal shows a loading spinner instead of the table
  loading?: boolean;
}
export const ResponsibilitiesKpiDrilldownModal: React.FC<ResponsibilitiesKpiDrilldownModalProps> = ({
  open,
  onOpenChange,
  title,
  items,
  loading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Reset to first page whenever the modal opens with new content
  useEffect(() => {
    if (open) setCurrentPage(0);
  }, [open, title]);

  const totalPages = Math.ceil(items.length / PAGE_SIZE);

  // Slice the full items array to the current page
  const pageItems = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, currentPage]);

  const startEntry = items.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const endEntry = Math.min((currentPage + 1) * PAGE_SIZE, items.length);

  const getStatusBadge = (status: string) => (
    <Badge className={cn(getStatusBadgeClass(status.replace('_', ' ')), "border text-xs")}>
      {status.replace('_', ' ')}
    </Badge>
  );

  const getRiskBadge = (risk?: string) => {
    const riskValue = risk?.toLowerCase() || "unknown";
    return (
      <Badge className={cn(getRiskBadgeClass(riskValue), "border text-xs capitalize")}>
        {riskValue.charAt(0).toUpperCase() + riskValue.slice(1)}
      </Badge>
    );
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Type', 'Status', 'Risk', 'Date'].join(','),
      ...items.map(i =>
        [i.id, `"${i.name}"`, i.type, i.status, i.risk, i.date].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responsibilities-${title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cleanTaskTitle = (name: string) => {
    let cleaned = name;
    cleaned = cleaned.replace(
      /^(Approve Role-Assignement - |Approve Access-Portal-Role-Assignement - )/i,
      ""
    );
    cleaned = cleaned.replace(/assignement/gi, "Assignment");
    return cleaned;
  };

  const capitalize = (value?: string) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";

  // Build page number list with ellipsis for large page counts
  const buildPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    const pages: (number | 'ellipsis')[] = [0];
    if (currentPage > 3) pages.push('ellipsis');
    const rangeStart = Math.max(1, currentPage - 1);
    const rangeEnd = Math.min(totalPages - 2, currentPage + 1);
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (currentPage < totalPages - 4) pages.push('ellipsis');
    pages.push(totalPages - 1);
    return pages;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl flex flex-col p-0 gap-0 max-h-[85vh]">
        <div className="flex flex-col h-full min-w-0">

          {/* Header */}
          <div className="flex-shrink-0 pb-4">
            <div className="flex items-start justify-between gap-4">
              <DialogHeader className="p-0">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                  {items.length.toLocaleString()} item{items.length !== 1 ? "s" : ""}
                  {totalPages > 1 && (
                    <span className="ml-1 text-xs opacity-70">
                      -- showing {startEntry}-{endEntry}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={items.length === 0}
                className="gap-1 shrink-0 mr-4"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Table area */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : pageItems.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  No items match this filter.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-[220px] truncate text-sm">
                          {cleanTaskTitle(item.name)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(capitalize(item.status))}
                        </TableCell>
                        <TableCell>
                          {getRiskBadge(capitalize(item.risk))}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.date}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </div>

          {/* Pagination footer -- only shown when more than one page */}
          {totalPages > 1 && (
            <div className="flex-shrink-0 px-6 py-3 flex items-center justify-between gap-4 bg-background">
              <span className="text-xs text-muted-foreground tabular-nums">
                {startEntry}-{endEntry} of {items.length.toLocaleString()}
              </span>

              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.max(0, p - 1));
                      }}
                      className={currentPage === 0
                        ? "pointer-events-none opacity-40"
                        : ""}
                    />
                  </PaginationItem>

                  {buildPageNumbers().map((page, idx) =>
                    page === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
                      }}
                      className={currentPage >= totalPages - 1
                        ? "pointer-events-none opacity-40"
                        : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};