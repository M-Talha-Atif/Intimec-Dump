// components/debugging/LogViewer.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Info,
  Bug,
  Eye,
  Pin,
  Copy,
  Sparkles,
} from "lucide-react";
import { useDebugging, type LogItem } from "@/contexts/debugging-context";
import { LogMetadata } from "./log-metadata";
import { LogDetailModal } from "./LogDetailModal";
import { Loader } from "../ui/Loader";
import { shortDate } from "@/utils/dateFormat";
import { copyToClipboard } from "@/utils/debug";
import CustomPagination from "../applications/common/CustomPagination";
import AttributeCategoryBadge from "@/components/debugging/debuggingStatusBadge";
import { useAIPrompt } from "@/contexts/AIPromptContext";
import { useAIAssistant } from "@/contexts/AIAssistantContext";

export const LogViewer: React.FC = () => {
  const {
    logs,
    loading,
    searchLoading,
    error,
    handlePinLog,
    isLogPinned,
    pagination,
  } = useDebugging();

  const { openAssistantWithPrompt } = useAIAssistant();
  const { state } = useAIPrompt();

  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [sheetLog, setSheetLog] = useState<LogItem | null>(null);

  const MESSAGE_TRUNCATE_LENGTH = 120;

  const truncateMessage = (message: string) => {
    if (message.length <= MESSAGE_TRUNCATE_LENGTH) return message;
    return message.substring(0, MESSAGE_TRUNCATE_LENGTH) + "...";
  };

  const getEventIcon = (level: string) => {
    switch (level) {
      case "ERROR":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "WARN":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "DEBUG":
        return <Bug className="h-4 w-4 text-blue-500" />;
      case "TRACE":
        return <Bug className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-green-500" />;
    }
  };

  const getEventBadgeVariant = (level: string) => {
    switch (level) {
      case "ERROR":
        return "ERROR";
      case "WARN":
        return "WARN";
      case "DEBUG":
        return "DEBUG";
      case "TRACE":
        return "TRACE";
      default:
        return "INFO";
    }
  };

  /**
   * Process prompt template by replacing variables with actual log data
   */
  const processPromptTemplate = (template: string, log: LogItem): string => {
    return template
      .replace(/\{description\}/g, log.description || "N/A")
      .replace(/\{docId\}/g, log.documentId || "N/A")
      .replace(/\{level\}/g, log.level)
      .replace(/\{timestamp\}/g, new Date(Number(log.timestamp)).toISOString())
      .replace(/\{source\}/g, log.source)
      .replace(/\{message\}/g, log.message)
      .replace(/\{category\}/g, log.category)
      .replace(/\{correlationId\}/g, log.correlationId || "N/A")
      .replace(/\{details\}/g, JSON.stringify(log.details || {}, null, 2));
  };

  /**
   * Handle AI Analysis button click
   */
  const handleAIAnalysis = (log: LogItem) => (e: React.MouseEvent) => {
    e.stopPropagation();

    const feature = "Debugging Assistant";
    const debugTemplate = state.templates[feature];

    // Get enabled version or fallback to draft
    const enabledVersion = debugTemplate?.versions.find(
      (v) => v.id === debugTemplate.enabledVersionId
    );

    let promptContent = "";

    if (enabledVersion?.content) {
      // Use enabled version and process variables
      promptContent = processPromptTemplate(enabledVersion.content, log);
    } else if (debugTemplate?.draftContent) {
      // Fallback to draft content
      promptContent = processPromptTemplate(debugTemplate.draftContent, log);
    } else {
      // Ultimate fallback: create a basic analysis prompt
      promptContent = `Analyze this ${log.level} log entry:

**Event Details:**
- Timestamp: ${new Date(Number(log.timestamp)).toISOString()}
- Source: ${log.source}
- Category: ${log.category}
- Level: ${log.level}
- Message: ${log.message}

Please provide:
1. Root cause analysis
2. Security and compliance impact
3. Immediate remediation steps
4. Prevention recommendations`;
    }

    // Open assistant with processed prompt
    openAssistantWithPrompt(feature, promptContent);
  };

  if (loading || searchLoading) return <Loader />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-1 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-8 h-full flex items-center justify-center">
              <div>
                <p className="font-semibold text-muted-foreground">
                  No logs match your current filters
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            </div>
          ) : (
            logs.map((log: LogItem) => (
              <Card
                key={log.id}
                className={`cursor-pointer hover:bg-muted/30 transition-colors ${sheetLog?.id === log.id ? "ring-1 ring-primary border-primary" : ""
                  }`}
                onClick={() => setSheetLog(log)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">

                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {getEventIcon(log.level)}

                      <div className="flex-1 min-w-0">

                        {/* badges row */}
                        <div className="flex items-center space-x-2 mb-1 flex-wrap">
                          <AttributeCategoryBadge
                            category={getEventBadgeVariant(log.level)}
                            className="text-xs"
                          >
                            {log.level}
                          </AttributeCategoryBadge>

                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>

                          <span className="text-xs text-muted-foreground">
                            {shortDate(Number(log.timestamp))}
                          </span>

                          {log.correlationId && log.correlationId !== "N/A" && (
                            <Badge variant="outline" className="text-xs">
                              ID: {log.correlationId}
                            </Badge>
                          )}
                        </div>

                        {/* message */}
                        <p className="text-sm font-medium break-words mb-1">
                          {truncateMessage(log.message)}
                        </p>

                      </div>
                    </div>

                    {/* action buttons */}
                    <div className="flex items-center space-x-1 flex-shrink-0">

                      {log.message.length > MESSAGE_TRUNCATE_LENGTH && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          title="View Full Message"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleAIAnalysis(log)}
                        title="Analyze with AI"
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>

                      {!log?.details?.isPinned && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isLogPinned(log.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePinLog(log.documentId);
                          }}
                          title={isLogPinned(log.id) ? "Already Pinned" : "Pin Log"}
                        >
                          <Pin className="h-4 w-4" />
                        </Button>
                      )}

                    </div>

                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {pagination.totalPages > 1 && (
          <CustomPagination
            totalElements={pagination.totalElements}
            totalPages={pagination.totalPages}
          />
        )}
      </div>
      <LogDetailModal
        log={
          selectedLog
            ? {
              ...selectedLog,
              timestamp: Number(selectedLog.timestamp),
            }
            : null
        }
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />

      {/* Event Details Sheet */}
      <Sheet open={!!sheetLog} onOpenChange={(open) => !open && setSheetLog(null)}>
        <SheetContent side="right" className="p-0">
          {sheetLog && (
            <div className="h-full flex flex-col">
              <SheetHeader className="flex-none p-6 pb-4 border-b bg-card/50">
                <div className="flex items-center gap-2 mb-2">
                  {getEventIcon(sheetLog.level)}
                  <SheetTitle className="text-lg">Event Details</SheetTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AttributeCategoryBadge
                    category={getEventBadgeVariant(sheetLog.level)}
                    className="text-xs"
                  >
                    {sheetLog.level}
                  </AttributeCategoryBadge>
                  <Badge variant="outline" className="text-xs">
                    {sheetLog.source}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {shortDate(Number(sheetLog.timestamp))}
                  </span>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                  {/* Message */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Message</h4>
                    <p className="text-sm text-muted-foreground">{sheetLog.message}</p>
                  </div>

                  {/* Metadata */}
                  <LogMetadata log={sheetLog} />

                  {/* JSON Details */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Details (JSON)</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(sheetLog?.details, null, 2)
                          )
                        }
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy JSON
                      </Button>
                    </div>
                    <div className="max-h-64 overflow-y-auto bg-muted/50 p-3 rounded border">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(sheetLog.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
