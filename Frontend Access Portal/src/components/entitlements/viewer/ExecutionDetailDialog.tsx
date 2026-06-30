import React from "react";
import type {
  ExecutionHistoryResponse,
  ExecutionDetailResponse,
} from "@/types/executionHistory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  Users,
  XCircle,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Play,
  Timer,
  UserCheck,
  UserMinus,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

// ===================================================================
//  Helpers
// ===================================================================

const capitalize = (val: string | null | undefined): string => {
  if (!val) return "—";
  const cleaned = val.replace(/_/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

const formatEpoch = (epoch: number | null): string => {
  if (!epoch) return "—";
  return format(new Date(epoch), "MMM d, yyyy HH:mm:ss");
};

const formatDuration = (ms: number | null): string => {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
};

const getStatusBadge = (status: string) => {
  switch (status) {
  case "SUCCESS":
      return (
        <Badge
          variant="outline"
          className="font-normal text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
        >
          {capitalize(status)}
        </Badge>
      );
    case "FAILED":
      return (
        <Badge
          variant="outline"
          className="font-normal text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
        >
          {capitalize(status)}
        </Badge>
      );
    case "RUNNING":
      return (
        <Badge
          variant="outline"
          className="font-normal text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
        >
          {capitalize(status)}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-normal text-xs">
          {capitalize(status)}
        </Badge>
      );
  }
};

const getTriggerBadge = (triggerType: string) => {
  return (
    <Badge variant="secondary" className="font-normal text-xs">
      {triggerType === "CRON" ? (
        <Timer className="h-3 w-3 mr-1" />
      ) : (
        <Play className="h-3 w-3 mr-1" />
      )}
      {capitalize(triggerType)}
    </Badge>
  );
};

const getOutcomeBadge = (outcome: string) => {
  switch (outcome) {
    case "ASSIGNED":
      return (
        <Badge
          variant="outline"
          className="font-normal text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
        >
          <UserCheck className="h-3 w-3 mr-1" />
          {capitalize(outcome)}
        </Badge>
      );
    case "REVOKED":
      return (
        <Badge
          variant="outline"
          className="font-normal text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
        >
          <UserMinus className="h-3 w-3 mr-1" />
          {capitalize(outcome)}
        </Badge>
      );
    case "SKIPPED_NO_SHADOW":
         return (
        <Badge variant="outline" className="font-normal text-xs">
           Skipped no account
        </Badge>
      );
    case "SKIPPED_ALREADY_ASSIGNED":
      return (
        <Badge
          variant="outline"
          className="font-normal text-xs bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400"
        >
          <SkipForward className="h-3 w-3 mr-1" />
          {capitalize(outcome)}
        </Badge>
      );
    case "NO_MATCH":
      return (
        <Badge
          variant="outline"
          className="font-normal text-xs bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400"
        >
          <XCircle className="h-3 w-3 mr-1" />
          {capitalize(outcome)}
        </Badge>
      );
    case "ERROR":
      return (
        <Badge
          variant="outline"
          className="font-normal text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          {capitalize(outcome)}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-normal text-xs">
          {capitalize(outcome)}
        </Badge>
      );
  }
};

const MatchEvidenceSummary: React.FC<{
  evidence: Record<string, unknown>;
}> = ({ evidence }) => {
  const overallMatch = evidence.overallMatch as boolean | undefined;

  return (
    <div className="flex items-center gap-1.5">
      {overallMatch === true ? (
        <Badge
          variant="outline"
          className="font-normal text-[10px] bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
        >
          {/* <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> */}
          Match
        </Badge>
      ) : overallMatch === false ? (
        <Badge
          variant="outline"
          className="font-normal text-[10px] bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
        >
          <XCircle className="h-2.5 w-2.5 mr-0.5" />
          No match
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  );
};

// ===================================================================
//  Props
// ===================================================================

interface ExecutionDetailDialogProps {
  execution: ExecutionHistoryResponse | null;
  details: ExecutionDetailResponse[];
  totalDetails: number;
  loading: boolean;
  error: string | null;
  page: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
}

// ===================================================================
//  Component
// ===================================================================

const ExecutionDetailDialog: React.FC<ExecutionDetailDialogProps> = ({
  execution,
  details,
  totalDetails,
  loading,
  error,
  page,
  onPageChange,
  onClose,
}) => {
  const totalPages = Math.ceil(totalDetails / 50);

  return (
    <Dialog
      open={!!execution}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-full sm:max-w-5xl flex flex-col p-0">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Execution Details</DialogTitle>
              <DialogDescription>
                {execution
                  ? `${capitalize(execution.triggerType)} run on ${formatEpoch(execution.startedAt)} | Rule: ${execution.ruleName || execution.ruleId}`
                  : "Execution run details"}
              </DialogDescription>
            </div>
            {execution && (
              <div className="shrink-0">
                {getStatusBadge(execution.status)}
              </div>
            )}
          </div>
        </DialogHeader>

        {execution && (
          <div className="space-y-4 overflow-y-auto max-h-[70vh] pt-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Matched
                  </p>
                  <p className="text-lg font-semibold">
                    {execution.identitiesMatched}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30">
                <UserCheck className="h-4 w-4 text-green-700 dark:text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Assigned
                  </p>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                    {execution.assignmentsCreated}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30">
                <UserMinus className="h-4 w-4 text-yellow-700 dark:text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Revoked
                  </p>
                  <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                    {execution.assignmentsRevoked}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30">
                <Timer className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Duration
                  </p>
                  <p className="text-lg font-semibold">
                    {formatDuration(execution.durationMs)}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Trigger
                </p>
                <div className="mt-1">
                  {getTriggerBadge(execution.triggerType)}
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Triggered by
                </p>
                <p className="text-sm mt-1">
                  {capitalize(execution.triggeredBy) || "System"}
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Skipped (no account)
                </p>
                <p className="text-sm mt-1">{execution.skippedNoShadow}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Skipped (already assigned)
                </p>
                <p className="text-sm mt-1">
                  {execution.skippedAlreadyAssigned}
                </p>
              </div>
            </div>

            {/* Error */}
            {execution.errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-100 dark:bg-red-900/20 p-3">
                <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400">
                  {execution.errorMessage}
                </p>
              </div>
            )}

            {/* Identity Results */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Identity results ({totalDetails})
              </h4>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Loading identity results...
                  </span>
                </div>
              ) : error ? (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-100 dark:bg-red-900/20 p-4">
                  <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              ) : details.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    No identity results for this execution
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Identity</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead>Processed at</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-medium">
                            {detail.identityDisplayName || detail.identityId}
                          </TableCell>
                          <TableCell>
                            {getOutcomeBadge(detail.outcome)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {formatEpoch(detail.processedAt)}
                          </TableCell>
                          <TableCell>
                            {detail.errorMessage ? (
                              <span className="text-xs text-red-700 dark:text-red-400">
                                {detail.errorMessage}
                              </span>
                            ) : detail.matchEvidence &&
                              typeof detail.matchEvidence === "object" ? (
                              <MatchEvidenceSummary
                                evidence={detail.matchEvidence}
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Page {page + 1} of {totalPages} ({totalDetails}{" "}
                        identities)
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 0}
                          onClick={() => onPageChange(page - 1)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page >= totalPages - 1}
                          onClick={() => onPageChange(page + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExecutionDetailDialog;