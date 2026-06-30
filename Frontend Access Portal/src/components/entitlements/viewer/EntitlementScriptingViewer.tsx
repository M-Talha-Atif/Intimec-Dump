import React, { useState } from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { useEntitlementAssignmentRule } from "@/hooks/useEntitlementAssignmentRule";
import type {
  RuleConditionGroup,
  RuleCondition,
} from "@/types/entitlementAssignmentRule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Shield,
  Clock,
  AlertCircle,
  Loader2,
  Info,
  CircleAlert,
  Play,
} from "lucide-react";

interface EntitlementScriptingViewerProps {
  entitlement: EntitlementResponseDto;
}

const OPERATOR_LABELS: Record<string, string> = {
  EQUALS: "equals",
  NOT_EQUALS: "not equals",
  CONTAINS: "contains",
  STARTS_WITH: "starts with",
  ENDS_WITH: "ends with",
  IN: "is in",
  NOT_IN: "is not in",
};

const FIELD_LABELS: Record<string, string> = {
  department: "Department",
  jobTitle: "Job Title",
  firstName: "First Name",
  lastName: "Last Name",
  displayName: "Display Name",
  email: "Email",
  username: "Username",
  employeeId: "Employee ID",
  status: "Status",
  identityType: "Identity Type",
  managerRef: "Manager Ref",
};

const formatTimestamp = (epoch: number | null): string => {
  if (!epoch) return "Never";
  return new Date(epoch).toLocaleString();
};

/**
 * Renders a single condition as a read-only row matching the editor's rule style.
 */
const ConditionRow: React.FC<{ condition: RuleCondition }> = ({
  condition,
}) => (
  <div className="flex flex-row gap-2 items-start bg-muted/50 border-1 shadow-sm p-2 rounded-md">
    <div className="flex items-center h-9 px-3 rounded-md border bg-background text-sm font-mono min-w-40">
      {FIELD_LABELS[condition.field] || condition.field}
    </div>
    <div className="flex items-center h-9 px-3 rounded-md border bg-background text-sm min-w-20">
      {OPERATOR_LABELS[condition.operator] || condition.operator}
    </div>
    <div className="flex items-center h-9 px-3 rounded-md border bg-background text-sm min-w-40">
      {condition.values && condition.values.length > 0
        ? condition.values.join(", ")
        : condition.value || "\u2014"}
    </div>
  </div>
);

/**
 * Recursively renders a condition group card matching the editor's group style.
 * Handles nested conditionGroups at any depth.
 */
const ConditionGroupCard: React.FC<{
  group: RuleConditionGroup;
  groupIndex: number;
  isLast: boolean;
}> = ({ group, groupIndex, isLast }) => {
  const hasConditions = group.conditions && group.conditions.length > 0;
  const hasSubGroups =
    group.conditionGroups && group.conditionGroups.length > 0;

  return (
    <div className="space-y-3">
      {/* Group Card - matches RuleGroupComponent style */}
      <div className="w-full flex flex-col gap-3 border-1 rounded-md p-4 border-l-primary border-l-4 shadow-sm">
        {/* Group Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                group.groupOperator === "AND" ? "default" : "secondary"
              }
            >
              {group.groupOperator}
            </Badge>
            {group.negated && (
              <Badge variant="destructive" className="text-xs">
                NOT
              </Badge>
            )}
          </div>
        </div>

        {/* Content: conditions + nested sub-groups */}
        <div className="flex flex-col gap-2 ps-8">
          {/* Leaf conditions */}
          {hasConditions &&
            group.conditions.map((condition, ci) => (
              <React.Fragment key={`c-${groupIndex}-${ci}`}>
                {ci > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        group.groupOperator === "AND"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {group.groupOperator}
                    </Badge>
                  </div>
                )}
                <ConditionRow condition={condition} />
              </React.Fragment>
            ))}

          {/* Combinator between conditions and sub-groups */}
          {hasConditions && hasSubGroups && (
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  group.groupOperator === "AND" ? "default" : "secondary"
                }
              >
                {group.groupOperator}
              </Badge>
            </div>
          )}

          {/* Nested sub-groups (recursive) */}
          {hasSubGroups &&
            group.conditionGroups!.map((subGroup, si) => (
              <ConditionGroupCard
                key={`sg-${groupIndex}-${si}`}
                group={subGroup}
                groupIndex={si}
                isLast={si === group.conditionGroups!.length - 1}
              />
            ))}

          {/* Empty state */}
          {!hasConditions && !hasSubGroups && (
            <div className="text-center flex flex-col items-center justify-center py-1.5 text-muted-foreground">
              <CircleAlert className="size-6" />
              <p className="text-sm">No conditions in this group</p>
            </div>
          )}
        </div>
      </div>

      {/* Inter-group operator between sibling groups */}
      {!isLast && (
        <div className="flex items-center justify-center gap-3 py-1">
          <div className="flex-1 border-t" />
          <Badge
            variant={
              group.interGroupOperator === "OR" ? "secondary" : "default"
            }
          >
            {group.interGroupOperator}
          </Badge>
          <div className="flex-1 border-t" />
        </div>
      )}
    </div>
  );
};

const EntitlementScriptingViewer: React.FC<EntitlementScriptingViewerProps> = ({
  entitlement,
}) => {
  const { rule, loading, evaluating, error, hasRule, evaluateRule, refresh } =
    useEntitlementAssignmentRule(entitlement.id);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRunNow = async () => {
    setSuccessMessage(null);
    try {
      const result = await evaluateRule();
      if (result) {
        setSuccessMessage(
          `Evaluation complete: ${result.identitiesMatched} matched, ` +
            `${result.assignmentsCreated} assigned, ` +
            `${result.assignmentsRevoked} revoked.`
        );
      }
    } catch {
      // Error handled by hook
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">
            Loading assignment rule...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Failed to load assignment rule
              </p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasRule || !rule) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assignment Rules</CardTitle>
          <p className="text-sm text-muted-foreground">
            Conditions that users must meet to be assigned this entitlement.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-lg border border-dashed p-6">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                No assignment rule configured
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This entitlement does not have a dynamic assignment rule.
                Assignments are managed manually or via import.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groups: RuleConditionGroup[] = rule.conditionGroups || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assignment Rules</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Conditions that users must meet to be assigned this entitlement.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Run Now */}
              {rule.enabled && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRunNow}
                        disabled={evaluating}
                      >
                        {evaluating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Run Now
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-xs">
                        Manually evaluate this rule against all active
                        identities.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <Badge variant={rule.enabled ? "default" : "secondary"}>
                {rule.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Success Message */}
          {successMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 p-3 mb-6">
              <div className="w-2 h-2 bg-emerald-600 rounded-full mt-1.5 shrink-0" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {successMessage}
              </p>
            </div>
          )}

          {/* Rule Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Identity Type
                </p>
                <p className="text-sm font-medium mt-1">
                  {rule.identityType || "All Types"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Last Evaluated
                </p>
                <p className="text-sm mt-1">
                  {formatTimestamp(rule.lastEvaluatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Condition Groups */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Condition Groups ({groups.length})
            </h4>

            {groups.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                No conditions defined.
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group, gi) => (
                  <ConditionGroupCard
                    key={`group-${gi}`}
                    group={group}
                    groupIndex={gi}
                    isLast={gi === groups.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntitlementScriptingViewer;