"use client";

import { Button } from "@/components/ui/button";
import { useAuditLogsContext } from "@/contexts/audit-logs-context";
import { RefreshCw, Upload, ChevronDown, ScrollText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PageHeader from "@/components/shared/PageHeader";

export function AuditLogsHeader() {
  const {
    refetch,
    exportLogs,
    exportSelectedLogs,
    loading,
    selectedRows,
    logs,
  } = useAuditLogsContext();

  const handleExportSelected = (format: "csv" | "json") => {
    const selectedLogs = logs.filter((log) => selectedRows.has(log.id));
    exportSelectedLogs(selectedLogs, format);
  };

  return (
    <PageHeader
      title="Audit Logs"
      description="Comprehensive audit trail for all identity and access management events"
      icon={<ScrollText className="h-5 w-5 text-primary" />}
      tooltip="Audit logs provide a detailed record of identity lifecycle actions, access requests, approvals, and system events. Use this view to investigate activity, monitor governance operations, and support compliance audits."
      actions={
        <>
          <Button
            variant="outline"
            onClick={refetch}
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {selectedRows.size > 0 ? (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={loading}
                      className="bg-primary dark:text-white hover:opacity-95"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      ({selectedRows.size})
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export selected logs</p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportSelected("csv")}>
                  <Upload className="h-4 w-4 mr-2" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSelected("json")}>
                  <Upload className="h-4 w-4 mr-2" />
                  JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Export
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export logs from current view</p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportLogs("csv")}>
                  <Upload className="h-4 w-4 mr-2" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportLogs("json")}>
                  <Upload className="h-4 w-4 mr-2" />
                  JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      }
    />
  );
}
