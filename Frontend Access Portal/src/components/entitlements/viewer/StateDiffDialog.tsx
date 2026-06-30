"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface StateDiffDialogProps {
  open: boolean;
  onClose: () => void;
  stateBefore: Record<string, unknown> | null;
  stateAfter: Record<string, unknown> | null;
  changedFields: string[] | null;
  activity: string;
  actorUsername: string;
  createdAt: number;
}

// ===================================================================
//  Value formatters
// ===================================================================

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatFieldName = (field: string): string => {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
};

const formatTimestamp = (epoch: number): string => {
  return new Date(epoch).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatOperator = (op: string): string => {
  const map: Record<string, string> = {
    EQUALS: "equals",
    NOT_EQUALS: "not equals",
    CONTAINS: "contains",
    NOT_CONTAINS: "not contains",
    STARTS_WITH: "starts with",
    ENDS_WITH: "ends with",
    IN: "in",
    NOT_IN: "not in",
    IS_NULL: "is empty",
    IS_NOT_NULL: "is not empty",
    GREATER_THAN: ">",
    LESS_THAN: "<",
  };
  return map[op] || op.toLowerCase().replace(/_/g, " ");
};

// ===================================================================
//  Condition group types
// ===================================================================

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface ConditionGroup {
  conditions: Condition[];
  groupOperator: string;
  conditionGroups?: ConditionGroup[];
  interGroupOperator?: string;
  negated?: boolean;
}

// ===================================================================
//  Condition group renderer
// ===================================================================

const ConditionGroupDisplay: React.FC<{
  groups: ConditionGroup[];
  variant: "before" | "after";
}> = ({ groups, variant }) => {
  const borderColor =
    variant === "before"
      ? "border-red-200 dark:border-red-900"
      : "border-green-200 dark:border-green-900";
  const textColor =
    variant === "before"
      ? "text-red-700 dark:text-red-400"
      : "text-green-700 dark:text-green-400";
  const bgColor =
    variant === "before"
      ? "bg-red-50 dark:bg-red-950/20"
      : "bg-green-50 dark:bg-green-950/20";

  return (
    <div className="space-y-2">
      {groups.map((group, gIdx) => (
        <div key={gIdx}>
          {gIdx > 0 && group.interGroupOperator && (
            <div className="flex justify-center my-1">
              <Badge variant="outline" className="text-[10px] font-mono">
                {group.interGroupOperator}
              </Badge>
            </div>
          )}
          <div className={`p-2 rounded border ${borderColor} ${bgColor}`}>
            {group.negated && (
              <Badge
                variant="destructive"
                className="text-[10px] mb-1.5 font-mono"
              >
                NOT
              </Badge>
            )}

            <div className="space-y-1">
              {group.conditions.map((cond, cIdx) => (
                <div key={cIdx}>
                  {cIdx > 0 && (
                    <span className="text-[10px] text-muted-foreground font-mono ml-2">
                      {group.groupOperator}
                    </span>
                  )}
                  <div
                    className={`flex items-center gap-1.5 text-xs ${textColor}`}
                  >
                    <span className="font-medium">{cond.field}</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono px-1 py-0"
                    >
                      {formatOperator(cond.operator)}
                    </Badge>
                    <span className="break-all">&quot;{cond.value}&quot;</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Nested condition groups */}
            {group.conditionGroups &&
              group.conditionGroups.length > 0 && (
                <div className="ml-3 mt-2 pl-2 border-l-2 border-dashed border-muted-foreground/30">
                  <ConditionGroupDisplay
                    groups={group.conditionGroups}
                    variant={variant}
                  />
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ===================================================================
//  Check if a value is condition groups structure
// ===================================================================

function isConditionGroups(value: unknown): value is ConditionGroup[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const first = value[0];
  return (
    typeof first === "object" &&
    first !== null &&
    "conditions" in first &&
    Array.isArray((first as ConditionGroup).conditions)
  );
}

// ===================================================================
//  Collect all unique field names
// ===================================================================

function getAllFields(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null
): string[] {
  const fields = new Set<string>();
  if (before) Object.keys(before).forEach((k) => fields.add(k));
  if (after) Object.keys(after).forEach((k) => fields.add(k));
  return Array.from(fields).sort();
}

// ===================================================================
//  Main component
// ===================================================================

const StateDiffDialog: React.FC<StateDiffDialogProps> = ({
  open,
  onClose,
  stateBefore,
  stateAfter,
  changedFields,
  activity,
  actorUsername,
  createdAt,
}) => {
  const fieldsToShow =
    changedFields && changedFields.length > 0
      ? changedFields
      : getAllFields(stateBefore, stateAfter);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>State Changes</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {activity} by {actorUsername} on {formatTimestamp(createdAt)}
          </p>
        </DialogHeader>

        {fieldsToShow.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No field-level changes recorded</p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {fieldsToShow.map((field) => {
              const beforeVal = stateBefore?.[field];
              const afterVal = stateAfter?.[field];

              const isConditions = isConditionGroups(beforeVal) || isConditionGroups(afterVal);

              return (
                <div
                  key={field}
                  className="p-3 bg-muted/50 rounded-lg space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      {formatFieldName(field)}
                    </Badge>
                  </div>

                  {isConditions ? (
                    // Condition groups — structured display
                    <div className="flex items-start gap-3">
                      {/* Before */}
                      <div className="flex-1 space-y-1">
                        <span className="text-xs text-muted-foreground block mb-1.5">
                          Before
                        </span>
                        {isConditionGroups(beforeVal) ? (
                          <ConditionGroupDisplay
                            groups={beforeVal}
                            variant="before"
                          />
                        ) : (
                          <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900">
                            <span className="text-xs text-red-700 dark:text-red-400">
                              —
                            </span>
                          </div>
                        )}
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-6" />

                      {/* After */}
                      <div className="flex-1 space-y-1">
                        <span className="text-xs text-muted-foreground block mb-1.5">
                          After
                        </span>
                        {isConditionGroups(afterVal) ? (
                          <ConditionGroupDisplay
                            groups={afterVal}
                            variant="after"
                          />
                        ) : (
                          <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900">
                            <span className="text-xs text-green-700 dark:text-green-400">
                              —
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Simple fields — flat before/after
                    <div className="flex items-center gap-3 text-sm">
                      {/* Before */}
                      <div className="flex-1 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900">
                        <span className="text-xs text-muted-foreground block mb-1">
                          Before
                        </span>
                        <span className="text-red-700 dark:text-red-400 break-all">
                          {formatValue(beforeVal)}
                        </span>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                      {/* After */}
                      <div className="flex-1 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900">
                        <span className="text-xs text-muted-foreground block mb-1">
                          After
                        </span>
                        <span className="text-green-700 dark:text-green-400 break-all">
                          {formatValue(afterVal)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StateDiffDialog;