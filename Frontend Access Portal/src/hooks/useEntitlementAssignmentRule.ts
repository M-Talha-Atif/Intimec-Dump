import { useState, useCallback, useEffect } from "react";
import type {
  AssignmentRuleResponse,
  RuleCreateRequest,
  RuleUpdateRequest,
  RuleConditionGroupRequest,
  RuleEvaluationResult,
} from "@/types/entitlementAssignmentRule";

/**
 * Fetches the assignment rule for a specific entitlement.
 */
export async function fetchAssignmentRule(
  entitlementId: string
): Promise<AssignmentRuleResponse | null> {
  const res = await fetch(
    `/api/access-catalogue/entitlements/${entitlementId}/assignment-rule`
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to fetch assignment rule (${res.status})`
    );
  }

  const data = await res.json();
  if (!data || Object.keys(data).length === 0) {
    return null;
  }
  return data as AssignmentRuleResponse;
}

/**
 * Creates a new assignment rule using grouped conditions.
 */
export async function createAssignmentRule(
  entitlementId: string,
  request: Omit<RuleCreateRequest, "entitlementId">
): Promise<AssignmentRuleResponse> {
  const res = await fetch(
    `/api/access-catalogue/entitlements/${entitlementId}/assignment-rule`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, entitlementId }),
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to create assignment rule (${res.status})`
    );
  }

  return res.json() as Promise<AssignmentRuleResponse>;
}

/**
 * Updates an existing assignment rule using grouped conditions.
 */
export async function updateAssignmentRule(
  entitlementId: string,
  ruleId: string,
  request: RuleUpdateRequest
): Promise<AssignmentRuleResponse> {
  const res = await fetch(
    `/api/access-catalogue/entitlements/${entitlementId}/assignment-rule`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, ruleId }),
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to update assignment rule (${res.status})`
    );
  }

  return res.json() as Promise<AssignmentRuleResponse>;
}

/**
 * Toggles rule enabled/disabled state.
 */
export async function toggleAssignmentRule(
  entitlementId: string,
  ruleId: string,
  enabled: boolean
): Promise<AssignmentRuleResponse> {
  const res = await fetch(
    `/api/access-catalogue/entitlements/${entitlementId}/assignment-rule`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleId, enabled }),
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to toggle assignment rule (${res.status})`
    );
  }

  return res.json() as Promise<AssignmentRuleResponse>;
}

/**
 * Manually triggers evaluation of a specific rule.
 */
export async function evaluateAssignmentRule(
  entitlementId: string,
  ruleId: string
): Promise<RuleEvaluationResult> {
  const res = await fetch(
    `/api/access-catalogue/entitlements/${entitlementId}/assignment-rule/evaluate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleId }),
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Failed to evaluate assignment rule (${res.status})`
    );
  }

  return res.json() as Promise<RuleEvaluationResult>;
}

export interface ScheduleOptions {
  enabled?: boolean;
  scheduleType?: string;
  cronExpression?: string;
  scheduleTime?: string;
  scheduleDate?: string;
  scheduleTimezone?: string;
  identityType?: string;
}

export interface UseEntitlementAssignmentRuleResult {
  rule: AssignmentRuleResponse | null;
  loading: boolean;
  saving: boolean;
  toggling: boolean;
  evaluating: boolean;
  error: string | null;
  saveError: string | null;
  hasRule: boolean;
  refresh: () => void;
  createRule: (
    conditionGroups: RuleConditionGroupRequest[],
    options?: ScheduleOptions
  ) => Promise<AssignmentRuleResponse>;
  updateRule: (
    conditionGroups: RuleConditionGroupRequest[],
    options?: ScheduleOptions
  ) => Promise<AssignmentRuleResponse>;
  toggleRule: (enabled: boolean) => Promise<void>;
  evaluateRule: () => Promise<RuleEvaluationResult | null>;
}

/**
 * Hook for fetching, creating, updating, toggling, and evaluating assignment rules.
 *
 * Now uses grouped conditions (conditionGroups) instead of flat conditions.
 * Per-entitlement rules default to MANUAL schedule type. Evaluation is triggered
 * explicitly via the Run Now button.
 */
export function useEntitlementAssignmentRule(
  entitlementId: string | null | undefined
): UseEntitlementAssignmentRuleResult {
  const [rule, setRule] = useState<AssignmentRuleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAssignmentRule(id);
      setRule(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load assignment rule"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (entitlementId) {
      load(entitlementId);
    } else {
      setRule(null);
      setError(null);
    }
  }, [entitlementId, load]);

  const refresh = useCallback(() => {
    if (entitlementId) load(entitlementId);
  }, [entitlementId, load]);

  const createRule = useCallback(
    async (
      conditionGroups: RuleConditionGroupRequest[],
      options: ScheduleOptions = {}
    ): Promise<AssignmentRuleResponse> => {
      if (!entitlementId) throw new Error("No entitlement ID");

      setSaving(true);
      setSaveError(null);
      try {
        const result = await createAssignmentRule(entitlementId, {
          conditionGroups,
          enabled: options.enabled ?? true,
          scheduleType: options.scheduleType ?? "MANUAL",
          cronExpression: options.cronExpression,
          scheduleTime: options.scheduleTime,
          scheduleDate: options.scheduleDate,
          scheduleTimezone: options.scheduleTimezone,
          identityType: options.identityType ?? "EMPLOYEE",
        });
        setRule(result);
        return result;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to create rule";
        setSaveError(msg);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [entitlementId]
  );

  const updateRuleFn = useCallback(
    async (
      conditionGroups: RuleConditionGroupRequest[],
      options: ScheduleOptions = {}
    ): Promise<AssignmentRuleResponse> => {
      if (!entitlementId || !rule) throw new Error("No entitlement or rule ID");

      setSaving(true);
      setSaveError(null);
      try {
        const result = await updateAssignmentRule(entitlementId, rule.id, {
          conditionGroups,
          enabled: options.enabled,
          scheduleType: options.scheduleType,
          cronExpression: options.cronExpression,
          scheduleTime: options.scheduleTime,
          scheduleDate: options.scheduleDate,
          scheduleTimezone: options.scheduleTimezone,
          identityType: options.identityType,
        });
        setRule(result);
        return result;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to update rule";
        setSaveError(msg);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [entitlementId, rule]
  );

  const toggleRule = useCallback(
    async (enabled: boolean): Promise<void> => {
      if (!entitlementId || !rule) return;

      setToggling(true);
      setSaveError(null);
      try {
        const result = await toggleAssignmentRule(
          entitlementId,
          rule.id,
          enabled
        );
        setRule(result);
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : "Failed to toggle rule"
        );
      } finally {
        setToggling(false);
      }
    },
    [entitlementId, rule]
  );

  const evaluateRuleFn = useCallback(async (): Promise<RuleEvaluationResult | null> => {
    if (!entitlementId || !rule) return null;

    setEvaluating(true);
    setSaveError(null);
    try {
      const result = await evaluateAssignmentRule(entitlementId, rule.id);
      return result;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to evaluate rule";
      setSaveError(msg);
      throw err;
    } finally {
      setEvaluating(false);
    }
  }, [entitlementId, rule]);

  return {
    rule,
    loading,
    saving,
    toggling,
    evaluating,
    error,
    saveError,
    hasRule: rule !== null,
    refresh,
    createRule,
    updateRule: updateRuleFn,
    toggleRule,
    evaluateRule: evaluateRuleFn,
  };
}