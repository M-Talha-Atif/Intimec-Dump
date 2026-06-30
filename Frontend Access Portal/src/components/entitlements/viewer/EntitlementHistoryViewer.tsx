import React, { useState } from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { useExecutionHistory } from "@/hooks/useExecutionHistory";
import { useEntitlementAuditHistory } from "@/hooks/useEntitlementAuditHistory";
import ExecutionDetailDialog from "./ExecutionDetailDialog";
import StateDiffDialog from "./StateDiffDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import IconTabs from "@/components/shared/IconTabs";
import { getActivityBadge } from "@/utils/getActivityBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomPagination from "@/components/applications/common/CustomPagination";
import {
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  Users,
  Play,
  Timer,
  UserCheck,
  UserMinus,
  Eye,
  History,
  Zap,
  GitCompareArrows,
} from "lucide-react";
import { format } from "date-fns";
import type { EntitlementAuditHistoryEntry } from "@/types/entitlementAuditHistory";

interface EntitlementHistoryViewerProps {
  entitlement: EntitlementResponseDto;
}

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

const getOutcomeCertBadge = (outcome: string) => {
  if (outcome === "Approved") {
    return (
      <Badge
        variant="outline"
        className="font-normal text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
      >
        <CheckCircle className="h-3 w-3 mr-1" />
        {outcome}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="font-normal text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400"
    >
      <CheckCircle className="h-3 w-3 mr-1" />
      {outcome}
    </Badge>
  );
};

// ===================================================================
//  Tab Config
// ===================================================================

const HISTORY_TABS = [
  { value: "entitlement", label: "Entitlement", icon: History },
  { value: "assignment-runs", label: "Assignment Runs", icon: Zap },
];

// ===================================================================
//  Action filter options for the dropdown
// ===================================================================

const ACTION_FILTER_OPTIONS = [
  { value: "ALL", label: "All Activities" },
  { value: "ENTITLEMENT_UPDATED", label: "Entitlement Updated" },
  { value: "RULE_CREATED", label: "Rule Created" },
  { value: "RULE_UPDATED", label: "Rule Updated" },
  { value: "RULE_DELETED", label: "Rule Deleted" },
  { value: "RULE_EVALUATED", label: "Rule Evaluated" },
];

// ===================================================================
//  Constants
// ===================================================================

const DEFAULT_EXECUTION_PAGE_SIZE = 10;
const DEFAULT_AUDIT_PAGE_SIZE = 10;

// ===================================================================
//  Main Component
// ===================================================================

const EntitlementHistoryViewer: React.FC<EntitlementHistoryViewerProps> = ({
  entitlement,
}) => {
  // Execution history hook (assignment runs tab)
  const {
    executions,
    totalExecutions,
    loadingExecutions,
    executionError,
    executionPage,
    executionSize,
    setExecutionPage,
    setExecutionSize,
    refreshExecutions,
    selectedExecution,
    setSelectedExecution,
    details,
    totalDetails,
    loadingDetails,
    detailError,
    detailPage,
    setDetailPage,
  } = useExecutionHistory(entitlement.id, DEFAULT_EXECUTION_PAGE_SIZE);

  // Audit history hook (entitlement tab)
  const {
    entries: auditEntries,
    totalEntries: totalAuditEntries,
    totalPages: totalAuditPages,
    loading: loadingAudit,
    error: auditError,
    page: auditPage,
    size: auditSize,
    setPage: setAuditPage,
    setSize: setAuditSize,
    refresh: refreshAudit,
    actionFilter,
    setActionFilter,
  } = useEntitlementAuditHistory(entitlement.id, DEFAULT_AUDIT_PAGE_SIZE);

  // State diff dialog
  const [diffEntry, setDiffEntry] = useState<EntitlementAuditHistoryEntry | null>(null);

  // MOCK: certification history
  const certificationHistory: Array<{
    campaign: string;
    outcome: string;
    date: string;
    reviewer: string;
  }> = [];

  const totalExecPages = Math.max(
    Math.ceil(totalExecutions / executionSize),
    1
  );

  return (
    <>
      <Tabs defaultValue="entitlement" className="space-y-4">
        <IconTabs tabs={HISTORY_TABS} columns={2} />

        {/* Tab 1: Entitlement */}
        <TabsContent value="entitlement" className="space-y-6">
          {/* Activity Log Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Log</CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={actionFilter ?? "ALL"}
                    onValueChange={(val) =>
                      setActionFilter(val === "ALL" ? undefined : val)
                    }
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Filter by activity" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_FILTER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshAudit}
                    disabled={loadingAudit}
                  >
                    {loadingAudit ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Refresh"
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Recent modifications and events for this entitlement.
              </p>

              {loadingAudit ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Loading audit history...
                  </span>
                </div>
              ) : auditError ? (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-100 dark:bg-red-900/20 p-4">
                  <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      Failed to load audit history
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {auditError}
                    </p>
                  </div>
                </div>
              ) : auditEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No activity history available</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {auditEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-primary/40 rounded-full mt-2 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getActivityBadge(entry.activity)}
                              {entry.ruleName && (
                                <span className="text-xs text-muted-foreground">
                                  Rule: {entry.ruleName}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatEpoch(entry.createdAt)}
                            </span>
                          </div>

                          <p className="text-sm text-foreground mb-1">
                            {entry.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              by {entry.actorUsername || "System"}
                              {/* {entry.triggerSource &&
                                ` · ${capitalize(entry.triggerSource)}`} */}
                            </p>

                            {(entry.stateBefore || entry.stateAfter) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => setDiffEntry(entry)}
                              >
                                View Changes
                              </Button>
                            )}
                          </div>

                          {entry.changedFields &&
                            entry.changedFields.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                {entry.changedFields.map((field) => (
                                  <Badge
                                    key={field}
                                    variant="secondary"
                                    className="text-[10px] font-mono"
                                  >
                                    {field}
                                  </Badge>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <CustomPagination
                    useCallbackMode={true}
                    totalElements={totalAuditEntries}
                    totalPages={totalAuditPages}
                    page={auditPage}
                    size={auditSize}
                    defaultSize={DEFAULT_AUDIT_PAGE_SIZE}
                    onPageChange={setAuditPage}
                    onSizeChange={setAuditSize}
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Certification History Card */}
          <Card>
            <CardHeader>
              <CardTitle>Certification History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Record of periodic reviews and certifications for this
                entitlement.
              </p>
              {certificationHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reviewer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificationHistory.map((cert, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {cert.campaign}
                        </TableCell>
                        <TableCell>
                          {getOutcomeCertBadge(cert.outcome)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {cert.date}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {cert.reviewer}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No certification records found</p>
                  <p className="text-xs mt-1">
                    This entitlement has not been included in any certification
                    campaigns.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Assignment Runs */}
        <TabsContent value="assignment-runs">
          <div className="space-y-4">
            {/* Header with refresh */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                History of rule evaluations and entitlement assignment runs.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshExecutions}
                disabled={loadingExecutions}
              >
                {loadingExecutions ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            {/* Content */}
            {loadingExecutions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">
                  Loading execution history...
                </span>
              </div>
            ) : executionError ? (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-100 dark:bg-red-900/20 p-4">
                <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    Failed to load execution history
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {executionError}
                  </p>
                </div>
              </div>
            ) : executions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                <Play className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No assignment runs yet</p>
                <p className="text-xs mt-1">
                  Execution history will appear here after you run the
                  assignment rule.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {executions.map((exec) => (
                    <div
                      key={exec.id}
                      className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedExecution(exec)}
                    >
                      {/* Status dot */}
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                          exec.status === "SUCCESS"
                            ? "bg-green-500"
                            : exec.status === "FAILED"
                              ? "bg-red-500"
                              : "bg-yellow-500 animate-pulse"
                        }`}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getStatusBadge(exec.status)}
                            {getTriggerBadge(exec.triggerType)}
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatEpoch(exec.startedAt)}
                          </span>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {exec.identitiesMatched} matched
                          </span>
                          <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
                            <UserCheck className="h-3 w-3" />
                            {exec.assignmentsCreated} assigned
                          </span>
                          <span className="flex items-center gap-1 text-yellow-700 dark:text-yellow-400">
                            <UserMinus className="h-3 w-3" />
                            {exec.assignmentsRevoked} revoked
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {formatDuration(exec.durationMs)}
                          </span>
                        </div>

                        {/* Error preview */}
                        {exec.errorMessage && (
                          <p className="text-xs text-red-700 dark:text-red-400 mt-2 truncate">
                            {exec.errorMessage}
                          </p>
                        )}

                        {/* Triggered by */}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          by {capitalize(exec.triggeredBy) || "System"} | Rule:{" "}
                          {exec.ruleName || exec.ruleId}
                        </p>
                      </div>

                      {/* View details */}
                      <div className="flex items-center shrink-0 mt-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <CustomPagination
                  useCallbackMode={true}
                  totalElements={totalExecutions}
                  totalPages={totalExecPages}
                  page={executionPage}
                  size={executionSize}
                  defaultSize={DEFAULT_EXECUTION_PAGE_SIZE}
                  onPageChange={setExecutionPage}
                  onSizeChange={setExecutionSize}
                  siblingCount={1}
                  boundaryCount={1}
                />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Execution Detail Dialog */}
      <ExecutionDetailDialog
        execution={selectedExecution}
        details={details}
        totalDetails={totalDetails}
        loading={loadingDetails}
        error={detailError}
        page={detailPage}
        onPageChange={setDetailPage}
        onClose={() => setSelectedExecution(null)}
      />

      {/* State Diff Dialog */}
      <StateDiffDialog
        open={diffEntry !== null}
        onClose={() => setDiffEntry(null)}
        stateBefore={diffEntry?.stateBefore ?? null}
        stateAfter={diffEntry?.stateAfter ?? null}
        changedFields={diffEntry?.changedFields ?? null}
        activity={diffEntry?.activity ?? ""}
        actorUsername={diffEntry?.actorUsername ?? ""}
        createdAt={diffEntry?.createdAt ?? 0}
      />
    </>
  );
};

export default EntitlementHistoryViewer;