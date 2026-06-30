import React, { useState, useEffect, useCallback, useMemo, useId, useImperativeHandle, forwardRef } from "react";
import {
  QueryBuilder,
  Field,
  RuleGroupType,
  RuleType,
  RuleGroupTypeAny,
  FieldSelectorProps,
  OperatorSelectorProps,
  CombinatorSelectorProps,
  RuleGroupHeaderComponents,
  RuleGroupBodyComponents,
  useRuleGroup,
  RuleComponents,
  useRule,
  FullCombinator,
  RuleGroupProps,
  RuleProps,
  NotToggleProps,
  ActionProps,
} from "react-querybuilder";
import { EntitlementResponseDto } from "@/types/entitlements";
import { useEntitlementAssignmentRule } from "@/hooks/useEntitlementAssignmentRule";
import type {
  RuleConditionGroupRequest,
  RuleConditionGroup,
} from "@/types/entitlementAssignmentRule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  CircleAlert,
  Plus,
  Trash,
  Loader2,
  Clock,
  Save,
  Shield,
  Play,
} from "lucide-react";

// =============== ====================================================
//  Field & Operator Config, changes test
// ===================================================================

const RULE_FIELDS: Field[] = [
  { name: "department", label: "Department" },
  { name: "jobTitle", label: "Job Title" },
  { name: "firstName", label: "First Name" },
  { name: "lastName", label: "Last Name" },
  { name: "displayName", label: "Display Name" },
  { name: "email", label: "Email" },
  { name: "username", label: "Username" },
  { name: "employeeId", label: "Employee ID" },
  { name: "status", label: "Status" },
  { name: "identityType", label: "Identity Type" },
  { name: "managerRef", label: "Manager Ref" },
];

const RULE_OPERATORS = [
  { name: "EQUALS", label: "equals" },
  { name: "NOT_EQUALS", label: "not equals" },
  { name: "CONTAINS", label: "contains" },
  { name: "STARTS_WITH", label: "starts with" },
  { name: "ENDS_WITH", label: "ends with" },
  { name: "IN", label: "is in" },
  { name: "NOT_IN", label: "is not in" },
];

const RULE_COMBINATORS = [
  { name: "and", label: "AND" },
  { name: "or", label: "OR" },
];

// ===================================================================
//  Shadcn Control Elements
// ===================================================================

const ShadcnFieldSelector = ({
  options,
  value,
  handleOnChange,
}: FieldSelectorProps) => (
  <div className="flex flex-col gap-1 min-w-40">
    <Select value={value} onValueChange={handleOnChange}>
      <SelectTrigger className="bg-background w-full">
        <SelectValue placeholder="Select field" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem
            key={(opt as FullCombinator).name}
            value={(opt as FullCombinator).name}
          >
            {opt.label ?? opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const ShadcnOperatorSelector = ({
  options,
  value,
  handleOnChange,
}: OperatorSelectorProps) => (
  <div className="flex flex-col gap-1 min-w-20">
    <Select value={value} onValueChange={handleOnChange}>
      <SelectTrigger className="bg-background w-full">
        <SelectValue placeholder="Select operator" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem
            key={(opt as FullCombinator).name}
            value={(opt as FullCombinator).name}
          >
            {opt.label ?? opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const ShadcnCombinatorSelector = ({
  options,
  value,
  handleOnChange,
}: CombinatorSelectorProps) => (
  <div className="flex items-center gap-2">
    <Badge variant={value === "and" ? "default" : "secondary"}>
      {options.find((opt) => (opt as FullCombinator).name === value)?.label ??
        value}
    </Badge>
    <Select value={value} onValueChange={handleOnChange}>
      <SelectTrigger className="max-w-20 bg-background flex-1">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem
            key={(opt as FullCombinator).name}
            value={(opt as FullCombinator).name}
          >
            {opt.label ?? opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const ShadcnValueEditor = ({
  value,
  handleOnChange,
  operator,
}: {
  value: string;
  handleOnChange: (val: string) => void;
  operator: string;
  [key: string]: unknown;
}) => (
  <div className="flex flex-col gap-1 min-w-40">
    <Input
      className="bg-background"
      placeholder={
        operator === "IN" || operator === "NOT_IN"
          ? "val1, val2, ..."
          : "Enter value"
      }
      value={value}
      onChange={(e) => handleOnChange(e.target.value)}
    />
  </div>
);

const RuleGroupComponent = (props: RuleGroupProps) => {
  const rg = useRuleGroup(props);
  return (
    <div className="w-full flex flex-col gap-3 border-1 rounded-md p-4 border-l-primary border-l-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <RuleGroupHeaderComponents {...rg} />
      </div>
      <div className="flex flex-col gap-2 ps-8 [&:empty]:hidden">
        <RuleGroupBodyComponents {...rg} />
        {rg.ruleGroup.rules.length === 0 && (
          <div className="text-center flex flex-col items-center justify-center py-1.5 text-muted-foreground">
            <CircleAlert className="size-6" />
            <p className="text-sm">No rules or groups defined</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RuleComponent = (props: RuleProps) => {
  const rl = useRule(props);
  return (
    <div className="flex flex-row gap-2 items-start [&>*:last-child]:ml-auto bg-muted/50 border-1 shadow-sm p-2 rounded-md">
      <RuleComponents {...rl} />
    </div>
  );
};

const NotToggleComponent = (props: NotToggleProps) => {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={props.checked}
        onCheckedChange={(checked) => props.handleOnChange(checked === true)}
      />
      <Label htmlFor={id}>{props.label}</Label>
    </div>
  );
};

const controlElements = {
  valueEditor: ShadcnValueEditor,
  fieldSelector: ShadcnFieldSelector,
  operatorSelector: ShadcnOperatorSelector,
  combinatorSelector: ShadcnCombinatorSelector,
  addRuleAction: (props: ActionProps) => (
    <Button
      size="default"
      variant="ghost"
      type="button"
      onClick={props.handleOnClick}
      className="ml-auto flex items-center"
    >
      <Plus /> <p>Rule</p>
    </Button>
  ),
  addGroupAction: (props: ActionProps) => (
    <Button
      size="default"
      variant="ghost"
      type="button"
      onClick={props.handleOnClick}
      className="flex items-center"
    >
      <Plus /> <p>Group</p>
    </Button>
  ),
  removeRuleAction: (props: ActionProps) => (
    <Button
      size="icon"
      type="button"
      variant="ghost"
      onClick={props.handleOnClick}
    >
      <Trash className="text-destructive" />
    </Button>
  ),
  removeGroupAction: (props: ActionProps) => (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={props.handleOnClick}
    >
      <Trash className="text-destructive" />
    </Button>
  ),
  ruleGroup: RuleGroupComponent,
  rule: RuleComponent,
  notToggle: NotToggleComponent,
};

// ===================================================================
//  Recursive Conversion: Backend conditionGroups <-> react-querybuilder
// ===================================================================

const backendGroupToQueryGroup = (
  group: RuleConditionGroup
): RuleGroupType & { not?: boolean } => {
  const rules: RuleGroupTypeAny[] = [];

  if (group.conditions && group.conditions.length > 0) {
    for (const c of group.conditions) {
      rules.push({
        field: c.field || "",
        operator: c.operator || "EQUALS",
        value:
          c.values && c.values.length > 0 ? c.values.join(", ") : c.value || "",
      } as RuleType);
    }
  }

  if (group.conditionGroups && group.conditionGroups.length > 0) {
    for (const subGroup of group.conditionGroups) {
      rules.push(backendGroupToQueryGroup(subGroup));
    }
  }

  return {
    combinator: (group.groupOperator || "AND").toLowerCase(),
    not: group.negated || false,
    rules,
  };
};

const fromBackendToQuery = (
  groups: RuleConditionGroup[] | undefined
): RuleGroupType => {
  if (!groups || groups.length === 0) {
    return { combinator: "and", rules: [] };
  }

  if (groups.length === 1) {
    return backendGroupToQueryGroup(groups[0]);
  }

  const rootCombinator =
    groups[0]?.interGroupOperator?.toLowerCase() === "or" ? "or" : "and";

  const nestedGroups: RuleGroupTypeAny[] = groups.map((g) =>
    backendGroupToQueryGroup(g)
  );

  return {
    combinator: rootCombinator,
    rules: nestedGroups,
  };
};

const queryGroupToBackendGroup = (
  group: RuleGroupType & { not?: boolean },
  interGroupOperator: string
): RuleConditionGroupRequest => {
  const conditions: RuleConditionGroupRequest["conditions"] = [];
  const subGroups: RuleConditionGroupRequest[] = [];

  for (const item of group.rules) {
    if ("rules" in item) {
      const nestedGroup = item as RuleGroupType & { not?: boolean };
      subGroups.push(
        queryGroupToBackendGroup(
          nestedGroup,
          (group.combinator || "and").toUpperCase()
        )
      );
    } else {
      const rule = item as RuleType;
      if (rule.field && rule.value) {
        if (rule.operator === "IN" || rule.operator === "NOT_IN") {
          conditions.push({
            field: rule.field,
            operator: rule.operator,
            values: (rule.value as string)
              .split(",")
              .map((v: string) => v.trim())
              .filter(Boolean),
          });
        } else {
          conditions.push({
            field: rule.field,
            operator: rule.operator,
            value: rule.value as string,
          });
        }
      }
    }
  }

  const result: RuleConditionGroupRequest = {
    groupOperator: (group.combinator || "and").toUpperCase(),
    interGroupOperator: interGroupOperator,
    negated: group.not || false,
    conditions,
  };

  if (subGroups.length > 0) {
    result.conditionGroups = subGroups;
  }

  return result;
};

const fromQueryToBackend = (
  query: RuleGroupType
): RuleConditionGroupRequest[] => {
  const rootCombinator = (query.combinator || "and").toUpperCase();

  const allGroups = query.rules.every((item) => "rules" in item);

  if (allGroups && query.rules.length > 1) {
    return query.rules.map((item) => {
      const nestedGroup = item as RuleGroupType & { not?: boolean };
      return queryGroupToBackendGroup(nestedGroup, rootCombinator);
    });
  }

  const singleGroup = queryGroupToBackendGroup(
    query as RuleGroupType & { not?: boolean },
    rootCombinator
  );

  if (
    singleGroup.conditions.length === 0 &&
    singleGroup.conditionGroups &&
    singleGroup.conditionGroups.length > 0
  ) {
    return singleGroup.conditionGroups.map((sg) => ({
      ...sg,
      interGroupOperator: rootCombinator,
    }));
  }

  return [singleGroup];
};

// ===================================================================
//  Helpers
// ===================================================================

const formatTimestamp = (epoch: number | null): string => {
  if (!epoch) return "Never";
  return new Date(epoch).toLocaleString();
};

// ===================================================================
//  Imperative Handle — exposed to parent
// ===================================================================

export interface ScriptingEditorHandle {
  /** Whether the rule query has been modified since last save/load */
  isDirty: boolean;
  /** Whether the rule is currently being saved */
  isSaving: boolean;
  /** Save the current rule query to the backend */
  save: () => Promise<void>;
  /** Revert the rule query to the last saved state */
  discard: () => void;
}

// ===================================================================
//  Component
// ===================================================================

interface EntitlementScriptingEditorProps {
  entitlement: EntitlementResponseDto;
  isEditing: boolean;
  onChange: (updates: Partial<EntitlementResponseDto>) => void;
  /** Called whenever the rule's dirty state changes */
  onDirtyChange?: (dirty: boolean) => void;
}

const EntitlementScriptingEditor = forwardRef<
  ScriptingEditorHandle,
  EntitlementScriptingEditorProps
>(({ entitlement, onDirtyChange }, ref) => {
  const {
    rule,
    loading,
    saving,
    toggling,
    evaluating,
    error,
    saveError,
    hasRule,
    createRule,
    updateRule,
    toggleRule,
    evaluateRule,
    refresh,
  } = useEntitlementAssignmentRule(entitlement.id);

  // Use a ref for the live query — avoids re-renders on every keystroke
  const queryRef = React.useRef<RuleGroupType>({
    combinator: "and",
    rules: [],
  });

  // Key to force remount QueryBuilder only when we need to reset it
  const [builderKey, setBuilderKey] = useState(0);

  const [defaultQuery, setDefaultQuery] = useState<RuleGroupType>({
    combinator: "and",
    rules: [],
  });

  const [isDirty, setIsDirty] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const [savedQuery, setSavedQuery] = useState<RuleGroupType>({
    combinator: "and",
    rules: [],
  });

  // Sync local state when rule loads — ONLY on initial load
  useEffect(() => {
    if (rule && rule.conditionGroups) {
      const loaded = fromBackendToQuery(rule.conditionGroups);

      if (!initialLoaded) {
        queryRef.current = loaded;
        setDefaultQuery(loaded);
        setSavedQuery(loaded);
        setBuilderKey((k) => k + 1);
        setIsDirty(false);
        setSuccessMessage(null);
        setInitialLoaded(true);
      } else {
        // After save/create, only update the saved baseline
        setSavedQuery(loaded);
      }
    } else if (!rule && !loading) {
      const empty: RuleGroupType = { combinator: "and", rules: [] };
      queryRef.current = empty;
      setDefaultQuery(empty);
      setSavedQuery(empty);
      setBuilderKey((k) => k + 1);
      setIsDirty(false);
      setSuccessMessage(null);
      setInitialLoaded(false);
    }
  }, [rule, loading, initialLoaded]);

  // Reset when entitlement changes
  useEffect(() => {
    setInitialLoaded(false);
  }, [entitlement.id]);

  // Notify parent when dirty state changes
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // This callback updates the ref WITHOUT causing a re-render
  const handleQueryChange = useCallback((q: RuleGroupType) => {
    queryRef.current = q;
    setIsDirty(true);
  }, []);

  const hasValidConditions = useMemo(() => {
    // Read from ref for validation during save
    const groups = fromQueryToBackend(queryRef.current);
    return (
      groups.length > 0 &&
      groups.some(
        (g) =>
          g.conditions.length > 0 ||
          (g.conditionGroups && g.conditionGroups.length > 0)
      )
    );
    // isDirty as dependency ensures this re-evaluates when user edits
  }, [isDirty]);

  // Save
  const handleSave = useCallback(async () => {
    setSuccessMessage(null);

    if (!isDirty) return;

    const currentQuery = queryRef.current;
    const requestGroups = fromQueryToBackend(currentQuery);
    if (requestGroups.length === 0) return;

    const valid = requestGroups.some(
      (g) =>
        g.conditions.length > 0 ||
        (g.conditionGroups && g.conditionGroups.length > 0)
    );

    try {
      if (hasRule) {
        await updateRule(requestGroups, {
          scheduleType: "MANUAL",
          identityType: "EMPLOYEE",
        });
        setSuccessMessage("Rule updated successfully.");
      } else {
        if (!valid) return;
        await createRule(requestGroups, {
          scheduleType: "MANUAL",
          enabled: true,
          identityType: "EMPLOYEE",
        });
        setSuccessMessage("Rule created successfully.");
      }
      setSavedQuery(currentQuery);
      setIsDirty(false);
    } catch {
      throw new Error(saveError || "Failed to save assignment rule");
    }
  }, [isDirty, hasRule, updateRule, createRule, saveError]);

  // Discard
  const handleDiscard = useCallback(() => {
    queryRef.current = savedQuery;
    setDefaultQuery(savedQuery);
    setBuilderKey((k) => k + 1);
    setIsDirty(false);
    setSuccessMessage(null);
  }, [savedQuery]);

  // Expose to parent
  useImperativeHandle(
    ref,
    () => ({
      isDirty,
      isSaving: saving,
      save: handleSave,
      discard: handleDiscard,
    }),
    [isDirty, saving, handleSave, handleDiscard]
  );

  // Run Now
  const handleRunNow = async () => {
    setSuccessMessage(null);
    try {
      const result = await evaluateRule();
      if (result) {
        setSuccessMessage(
          `Evaluation complete: ${result.identitiesMatched} matched, ` +
            `${result.assignmentsCreated} assigned, ` +
            `${result.assignmentsRevoked} revoked.`
        )
      }
    } catch {
      // Error handled by hook
    }
  };

  // Toggle
  const handleToggle = async () => {
    if (!rule) return;
    await toggleRule(!rule.enabled);
  };

  // Loading
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

  // Error
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assignment Rules</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Define condition groups with nesting. Use &quot;Rule&quot; for
                conditions and &quot;Group&quot; for nested sub-groups.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Run Now */}
              {hasRule && rule && rule.enabled && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRunNow}
                        disabled={evaluating || saving}
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
                        {isDirty && (
                          <span className="block mt-1 text-amber-500">
                            Save your changes before running.
                          </span>
                        )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Toggle */}
              {hasRule && rule && (
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="rule-toggle"
                    className="text-sm text-muted-foreground"
                  >
                    {rule.enabled ? "Active" : "Inactive"}
                  </Label>
                  <Switch
                    id="rule-toggle"
                    checked={rule.enabled}
                    onCheckedChange={handleToggle}
                    disabled={toggling}
                  />
                  {toggling && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Rule Metadata */}
          {hasRule && rule && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          )}

          {/* Query Builder */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Condition Groups
            </h4>

            <QueryBuilder
              key={builderKey}
              fields={RULE_FIELDS}
              operators={RULE_OPERATORS}
              combinators={RULE_COMBINATORS}
              defaultQuery={defaultQuery}
              onQueryChange={handleQueryChange}
              suppressStandardClassnames
              showNotToggle
              controlElements={controlElements}
            />
          </div>

          {/* Save Error */}
          {saveError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive">{saveError}</p>
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 p-3">
              <div className="w-2 h-2 bg-emerald-600 rounded-full mt-1.5 shrink-0" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {successMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

EntitlementScriptingEditor.displayName = "EntitlementScriptingEditor";

export default EntitlementScriptingEditor;