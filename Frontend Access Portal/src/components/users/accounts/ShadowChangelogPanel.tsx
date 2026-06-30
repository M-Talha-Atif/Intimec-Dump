"use client";

import React from "react";
import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ChangeType = "ADDED" | "MODIFIED" | "REMOVED";

type ChangelogEntry = {
  id: string;
  shadowId: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  changeType: ChangeType;
  syncRunId: string;
  changedAt: string;
};

type ChangelogResponse = {
  data: ChangelogEntry[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
  };
};

const changeTypeBadge: Record<ChangeType, { label: string; className: string }> = {
  ADDED: { label: "Added", className: "bg-green-100 text-green-800" },
  MODIFIED: { label: "Modified", className: "bg-blue-100 text-blue-800" },
  REMOVED: { label: "Removed", className: "bg-red-100 text-red-800" },
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type ShadowChangelogPanelProps = {
  shadowId: string;
};

export default function ShadowChangelogPanel({
  shadowId,
}: ShadowChangelogPanelProps) {
  const [page, setPage] = React.useState(0);
  const pageSize = 20;

  const { data, isLoading, error } = useSWR<ChangelogResponse>(
    `/api/shadows/${shadowId}/changelog?page=${page}&size=${pageSize}`,
    fetcher
  );

  if (error) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        Failed to load attribute changelog.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        Loading changelog...
      </div>
    );
  }

  const entries = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalElements = data?.pagination?.totalElements ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-semibold">Attribute Changelog</h4>
        {data && (
          <span className="text-xs text-muted-foreground">
            ({totalElements} changes)
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No attribute changes recorded for this shadow.
        </p>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Field</TableHead>
                  <TableHead className="w-[80px]">Change</TableHead>
                  <TableHead>Old Value</TableHead>
                  <TableHead>New Value</TableHead>
                  <TableHead className="w-[160px]">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const badge = changeTypeBadge[entry.changeType];
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-xs">
                        {entry.fieldName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", badge.className)}
                        >
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">
                        {entry.oldValue ?? (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">
                        {entry.newValue ?? (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(entry.changedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
