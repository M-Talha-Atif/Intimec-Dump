"use client";

import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  Upload,
  FileText,
  Sparkles,
} from "lucide-react";
import { AuditLogExpandedDetails } from "./audit-log-expanded-details";
import { useAuditLogsContext } from "@/contexts/audit-logs-context";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import {
  getEventIcon,
  getRiskBadgeColor,
  getOutcomeBadgeColor,
  formatTimestamp,
} from "./audit-log-utils";
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import type { TransformedAuditLog } from "@/types/audit-logs";

interface AuditLogRowProps {
  log: TransformedAuditLog;
}

export function AuditLogRow({ log }: AuditLogRowProps) {
  const {
    expandedRows,
    toggleRowExpansion,
    exportSingleLog,
    selectedRows,
    toggleRowSelection,
  } = useAuditLogsContext();
  const { setIsAssistantOpen } = useAIAssistant();

  const isExpanded = expandedRows.has(log.id);
  const isSelected = selectedRows.has(log.id);

  return (
    <React.Fragment>
      <TableRow
        className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${isExpanded ? 'bg-muted/30 ring-1 ring-primary' : ''}`}
        onClick={() => toggleRowExpansion(log.id)}
      >
        <TableCell className="w-16 bg-sidebar p-3">
          <div className="flex justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleRowSelection(log.id)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select row for ${log.eventType}`}
              className={`w-[18px] h-[18px] border border-black dark:border-white rounded-[6px] cursor-pointer text-white ${isSelected ? "bg-primary" : "bg-sidebar"
                }`}
            />
          </div>
        </TableCell>
        <TableCell className="text-sm w-40">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-gray-400 dark:text-gray-100 flex-shrink-0" />
            <span className="truncate" title={formatTimestamp(log.timestamp)}>
              {formatTimestamp(log.timestamp)}
            </span>
          </div>
        </TableCell>
        <TableCell className="w-32">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0">{getEventIcon(log.eventType)}</span>
            <span className="font-medium capitalize truncate">
              {log.eventType}
            </span>
          </div>
        </TableCell>
        <TableCell className="w-40">
          <div>
            <div className="font-medium truncate" title={log.objectName}>
              {log.objectName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-100 capitalize truncate">
              {log.objectType}
            </div>
          </div>
        </TableCell>
        <TableCell className="w-32">
          <div>
            <div className="font-medium truncate" title={log.actor.name}>
              {log.actor.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-100 capitalize truncate">
              {log.actor.type}
            </div>
          </div>
        </TableCell>
        <TableCell className="w-20">
          <Badge className={cn(
            'text-xs font-medium',
            getRiskBadgeClass(log.riskLevel)
          )}>
            {log.riskLevel.charAt(0).toUpperCase() + log.riskLevel.slice(1).toLowerCase()}
          </Badge>
        </TableCell>
        <TableCell className="w-24">
          <Badge className={getOutcomeBadgeColor(log.outcome)}>
            {log.outcome.charAt(0).toUpperCase() + log.outcome.slice(1).toLowerCase()}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Open AI analysis"
              title="Open AI analysis"
              onClick={(e) => {
                e.stopPropagation();
                setIsAssistantOpen(true);
              }}
            >
              <Sparkles className="h-3 w-3" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <DropdownMenu>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Upload className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export</p>
                  </TooltipContent>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportSingleLog(log, "json")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportSingleLog(log, "csv")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export as CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TableCell>
      </TableRow>

      {/* Audit Log Details Dialog */}
      <Dialog open={isExpanded} onOpenChange={(open) => !open && toggleRowExpansion(log.id)}>
        <DialogContent className="p-0">
          <div className="h-full flex flex-col">

            <DialogHeader className="flex-none pb-4 bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                {getEventIcon(log.eventType)}
                <DialogTitle className="text-lg capitalize">
                  {log.eventType}
                </DialogTitle>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getRiskBadgeColor(log.riskLevel)}>
                  {log.riskLevel.toUpperCase()}
                </Badge>

                <Badge className={getOutcomeBadgeColor(log.outcome)}>
                  {log.outcome.toUpperCase()}
                </Badge>

                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1">
              <AuditLogExpandedDetails log={log} />
            </ScrollArea>

          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
