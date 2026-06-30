"use client";

import { useEffect, useRef, useState } from "react";
import { TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { AuditLogRow } from "./audit-log-row";
import { useAuditLogsContext } from "@/contexts/audit-logs-context";
import { Checkbox } from "@/components/ui/checkbox";

export function AuditLogsTable() {
  const {
    logs,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    pageSize,
    setPageSize,
    selectAllRows,
    clearAllSelections,
    isAllSelected,
  } = useAuditLogsContext();

  // State for manual page input
  const [pageInput, setPageInput] = useState("");
  const pageInputRef = useRef<HTMLInputElement>(null);

  // Reset to first page when data changes (filters applied)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  // Update pageInput when currentPage changes
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle manual page input
  const handlePageInputChange = (value: string) => {
    // Allow empty string or valid numbers
    if (value === "" || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const goToPage = () => {
    const pageNumber = parseInt(pageInput);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      handlePageChange(pageNumber);
    } else {
      // Reset to current page if invalid
      setPageInput(currentPage.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToPage();
      pageInputRef.current?.blur();
    }
  };

  // Smart pagination logic
  const getVisiblePageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of pages to show around current page
    const sidePages = Math.floor(showPages / 2);

    if (totalPages <= 7) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of middle section
      let startPage = Math.max(2, currentPage - sidePages);
      let endPage = Math.min(totalPages - 1, currentPage + sidePages);

      // Adjust if we're near the beginning
      if (currentPage <= sidePages + 1) {
        endPage = Math.min(totalPages - 1, showPages);
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - sidePages) {
        startPage = Math.max(2, totalPages - showPages + 1);
      }

      // Add ellipsis before middle section if needed
      if (startPage > 2) {
        pages.push("...");
      }

      // Add middle section
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis after middle section if needed
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page (if not already included)
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePageNumbers();

  // Calculate display information
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalElements);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="table-fixed w-full min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 bg-sidebar p-3">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectAllRows();
                        } else {
                          clearAllSelections();
                        }
                      }}
                      aria-label="Select all rows"
                      className={`w-[18px] h-[18px] border border-black dark:border-white rounded-[6px] cursor-pointer text-white ${
                        isAllSelected ? "bg-primary" : "bg-sidebar"
                      }`}
                    />
                  </div>
                </TableHead>
                <TableHead className="w-40">Timestamp</TableHead>
                <TableHead className="w-32">Event</TableHead>
                <TableHead className="w-40">Object</TableHead>
                <TableHead className="w-32">Actor</TableHead>
                <TableHead className="w-20">Risk</TableHead>
                <TableHead className="w-24">Outcome</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="text-gray-600">
                        Loading audit events...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => <AuditLogRow key={log.id} log={log} />)
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && logs.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No audit events found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find audit
              events.
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalElements > 0 && (
          <div className="flex items-center justify-between px-2 py-4">
            {/* Left side: Page size selector and results info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => setPageSize(parseInt(value))}
                >
                  <SelectTrigger className="w-fit">
                    <SelectValue /> <p>per page</p>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre">
                <span className="font-medium">{startIndex}</span>-{" "}
                <span className="font-medium">{endIndex}</span> of{" "}
                <span className="font-medium">{totalElements}</span>
              </div>
            </div>

            {/* Center: Pagination controls */}
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    size="default"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {visiblePages.map((page, index) => (
                  <PaginationItem key={index}>
                    {page === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page as number);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    size="default"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            {/* Right side: Manual page input */}
            <div className="flex items-center gap-2">
              <Input
                ref={pageInputRef}
                type="text"
                value={pageInput}
                onChange={(e) => handlePageInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (pageInput === "" || parseInt(pageInput) < 1 || parseInt(pageInput) > totalPages) {
                    setPageInput(currentPage.toString());
                  }
                }}
                className="w-16 text-center"
                min={1}
                max={totalPages}
                placeholder="1"
              />
              <Button variant="outline" size="sm" onClick={goToPage}>
                Open
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
