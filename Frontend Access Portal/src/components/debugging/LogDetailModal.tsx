"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  AlertTriangle,
  Info,
  Bug,
  Clock,
  User,
  Pin,
  PinOff,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LogMetadata } from "./log-metadata";
import { useDebugging } from "@/contexts/debugging-context";
import { shortDate } from "@/utils/dateFormat";
import { copyToClipboard } from "@/utils/debug";

interface LogDetailModalProps {
  log: {
    data?: Record<string, unknown>;
    details?: Record<string, unknown>;
    level?: string;
    message?: string;
    source?: string;
    microservice?: string;
    timestamp?: number;
    correlationId?: string;
    objectType?: string;
    objectId?: string;
    pinnedAt?: number;
    pinnerId?: string;
    updatedAt?: number;
    updatedBy?: string;
    resolvedAt?: number;
    resolved?: boolean;
    documentId?: string;
    [key: string]: unknown;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LogDetailModal: React.FC<LogDetailModalProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  const { UnPinnedLog, UnResolvedLog } = useDebugging();
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);
  const [isJsonExpanded, setIsJsonExpanded] = useState(false);
  const logData = log?.data || log;
  // console.log("LogDetailModal logData:", log);
  if (!log) return null;

  // Constants for truncation
  const MESSAGE_TRUNCATE_LENGTH = 200;
  const JSON_TRUNCATE_LENGTH = 1000;

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get the message to display
  const getDisplayMessage = () => {
    const message = (logData?.message as string) || "";
    if (message.length <= MESSAGE_TRUNCATE_LENGTH) return message;
    return isMessageExpanded
      ? message
      : truncateText(message, MESSAGE_TRUNCATE_LENGTH);
  };

  // Get the JSON to display
  const getJsonString = () => {
    const jsonString = JSON.stringify(log.data || log.details, null, 2);
    if (jsonString.length <= JSON_TRUNCATE_LENGTH) return jsonString;
    return isJsonExpanded
      ? jsonString
      : truncateText(jsonString, JSON_TRUNCATE_LENGTH);
  };

  // Type-safe getters
  const getLevel = () => (logData?.level as string) || "INFO";
  const getSource = () =>
    (logData?.source as string) ||
    (logData?.microservice as string) ||
    "Unknown";

  // Helper function to truncate source for display
  const getTruncatedSource = (maxLength: number = 20) => {
    const source = getSource();
    if (source.length <= maxLength) return source;
    return source.substring(0, maxLength) + "...";
  };

  const getTimestamp = () => (logData?.timestamp as number) || null;
  const getCorrelationId = () => {
    const correlationId = (logData?.correlationId || logData?.id) as string;
    return correlationId && correlationId !== "N/A" ? correlationId : "";
  };
  const getMessage = () => (logData?.message as string) || "";
  const getObjectType = () => logData?.objectType as string;
  const getObjectId = () => logData?.objectId as string;

  const getEventIcon = (level: string) => {
    switch (level) {
      case "ERROR":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "DEBUG":
        return <Bug className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-green-500" />;
    }
  };

  const getEventBadgeVariant = (level: string) => {
    switch (level) {
      case "ERROR":
        return "destructive";
      case "DEBUG":
        return "secondary";
      default:
        return "default";
    }
  };

  // Get relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp: number | null) => {
    if (!timestamp) return null;
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  };

  // Check if log is resolved
  const isResolved = log.resolved || (log.resolvedAt && log.resolvedAt !== 0);

  // Handle button click
  const handleButtonClick = async () => {
    if (isResolved) {
      // Unresolve the log
      if (log.documentId) {
        await UnResolvedLog(log.documentId);
        onClose(); // Close modal after resolving
      }
    } else {
      // Handle unpin/resolve
      if (log.documentId) {
        await UnPinnedLog(log.documentId);
        onClose(); // Close modal after resolving
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getEventIcon(log.level || "INFO")}
              <span>Log Details</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            View detailed information about this log
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2">
              <Badge
                variant={getEventBadgeVariant(getLevel())}
                className="text-xs"
              >
                {getLevel()}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs max-w-32 truncate"
                title={getSource()}
              >
                {getTruncatedSource()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {shortDate(getTimestamp() || 0)}
              </span>
              {getCorrelationId() && (
                <Badge variant="outline" className="text-xs">
                  ID: {getCorrelationId()}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium break-words leading-tight">
                {getDisplayMessage()}
                {getMessage() &&
                  getMessage().length > MESSAGE_TRUNCATE_LENGTH && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMessageExpanded(!isMessageExpanded)}
                      className="ml-2 h-auto p-1 text-xs inline-flex"
                    >
                      {isMessageExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          More
                        </>
                      )}
                    </Button>
                  )}
              </h3>
              {(getObjectType() || getObjectId()) && (
                <p className="text-xs text-muted-foreground">
                  {getObjectType() && getObjectId()
                    ? `${getObjectType()}: ${getObjectId()}`
                    : getObjectType() || getObjectId()}
                </p>
              )}
            </div>
          </div>

          {/* Pin & Activity Tracking */}
          {(log.updatedAt ||
            log.pinnerId ||
            log.pinnedAt ||
            log.resolvedAt ||
            log.updatedBy) && (
              <div className="bg-muted/10 rounded-lg p-3 border">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Pin className="h-4 w-4 mr-2" />
                  Activity & Pin Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {log.pinnedAt && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Pin className="h-3 w-3 text-blue-500" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Pinned At
                        </span>
                      </div>
                      <p className="text-xs font-mono">
                        {shortDate(log.pinnedAt)}
                      </p>
                      {getRelativeTime(log.pinnedAt) && (
                        <p className="text-xs text-muted-foreground">
                          {getRelativeTime(log.pinnedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {log.pinnerId && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-green-500" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Pinned By
                        </span>
                      </div>
                      <p className="text-xs">{log.pinnerId}</p>
                    </div>
                  )}

                  {log.updatedAt && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-orange-500" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Last Updated
                        </span>
                      </div>
                      <p className="text-xs font-mono">
                        {shortDate(log.updatedAt)}
                      </p>
                      {getRelativeTime(log.updatedAt) && (
                        <p className="text-xs text-muted-foreground">
                          {getRelativeTime(log.updatedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {log.updatedBy && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-purple-500" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Updated By
                        </span>
                      </div>
                      <p className="text-xs">{log.updatedBy}</p>
                    </div>
                  )}

                  {log.resolvedAt != 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Resolved At
                        </span>
                      </div>
                      <p className="text-xs font-mono">
                        {shortDate(log.resolvedAt || 0)}
                      </p>
                      {getRelativeTime(log.resolvedAt || null) && (
                        <p className="text-xs text-muted-foreground">
                          {getRelativeTime(log.resolvedAt || null)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="md:col-span-2 flex items-center justify-between pt-2">
                    {isResolved && log.resolvedAt != 0 ? (
                      <>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-xs"
                        >
                          Resolved
                        </Badge>
                        <Button
                          onClick={handleButtonClick}
                          variant="outline"
                          size="sm"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Unresolve
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleButtonClick}
                        variant="destructive"
                        size="sm"
                      >
                        <PinOff className="h-4 w-4 mr-2" />
                        Unpin
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Event Details */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Event Details</h4>
              <div className="flex space-x-2">
                {JSON.stringify(log.data || log.details, null, 2).length >
                  JSON_TRUNCATE_LENGTH && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsJsonExpanded(!isJsonExpanded)}
                    >
                      {isJsonExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Expand All
                        </>
                      )}
                    </Button>
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(log.data || log.details, null, 2)
                    )
                  }
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
              </div>
            </div>

            {/* Show full source if it was truncated */}
            {getSource().length > 20 && (
              <div className="mb-3 p-3 bg-muted/10 rounded border">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Full Source
                </div>
                <div className="text-xs font-mono break-words bg-background/50 p-2 rounded border">
                  {getSource()}
                </div>
              </div>
            )}

            <pre className="text-xs bg-muted/20 p-4 rounded-lg overflow-x-auto border whitespace-pre-wrap break-words">
              {getJsonString()}
            </pre>
          </div>

          {/* Additional Metadata */}
          {logData && (
            <div className="pt-4">

              <LogMetadata
                log={{
                  timestamp: getTimestamp()?.toString() || "",
                  source: getSource(),
                  category: (logData.category as string) || "general",
                  correlationId: getCorrelationId(),
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
