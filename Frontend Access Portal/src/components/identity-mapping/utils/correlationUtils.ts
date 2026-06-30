import { CorrelationRule } from "../types/index";

export const validateCorrelationRule = (rule: CorrelationRule): string[] => {
  const errors: string[] = [];

  if (!rule.name) errors.push("Rule name is required");
  if (!rule.sourceAttribute) errors.push("Source attribute is required");
  if (!rule.targetAttribute) errors.push("Target attribute is required");
  if (!rule.joinCondition) errors.push("Join condition is required");
  if (rule.sources.length === 0)
    errors.push("At least one source must be selected");

  return errors;
};

export const generateRuleId = (): string => {
  return Date.now().toString();
};

export const createNewCorrelationRule = (
  rulesLength: number
): CorrelationRule => {
  return {
    id: generateRuleId(),
    name: "New Correlation Rule",
    type: "secondary",
    priority: rulesLength + 1,
    enabled: false,
    sourceAttribute: "",
    targetAttribute: "",
    joinCondition: "",
    conflictResolution: "manual-review",
    sources: [],
    isValid: false,
    validationErrors: ["Incomplete rule configuration"],
  };
};

export const updateRulePriorities = (
  rules: CorrelationRule[]
): CorrelationRule[] => {
  return rules.map((rule, index) => ({
    ...rule,
    priority: index + 1,
  }));
};

export const moveRuleInArray = (
  rules: CorrelationRule[],
  fromIndex: number,
  toIndex: number
): CorrelationRule[] => {
  if (toIndex < 0 || toIndex >= rules.length) return rules;

  const newRules = [...rules];
  [newRules[fromIndex], newRules[toIndex]] = [
    newRules[toIndex],
    newRules[fromIndex],
  ];

  return updateRulePriorities(newRules);
};

export interface CorrelationRuleApiResponse {
  id?: string;
  resourceId: string;
  mode: string;
  ruleGroup: {
    combinator: string;
    rules: Array<{
      field: string;
      operator: string;
      valueSource: string;
      value: string;
    }>;
  };
  /**
   * Internal field — links this apiRule entry to exactly one frontend CorrelationRule card.
   * Prevents multiple cards sharing the same resourceId from clobbering each other.
   */
  _cardId?: string;
}

export const fetchCorrelationRules = async (
  schemaId: string
): Promise<CorrelationRuleApiResponse[]> => {
  try {
    const response = await fetch(
      `/api/identity/mapping/policies/${schemaId}/correlation/rules`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch correlation rules: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching correlation rules:", error);
    throw error;
  }
};

// Transform frontend apiRules back to backend CorrelationRuleDTO[] for saving
// Backend expects: { id, resourceId, mode, ruleGroup: { combinator, rules: [{ field, operator, valueSource, value }] }, script }
export const saveCorrelationRules = async (
  schemaId: string,
  apiRules: CorrelationRuleApiResponse[],
  changedResourceIds?: Set<string>
): Promise<void> => {
  try {
    // Group rules by resourceId — each resourceId is a separate application policy
    const rulesByResource = new Map<string, CorrelationRuleApiResponse[]>();
    for (const rule of apiRules) {
      const existing = rulesByResource.get(rule.resourceId) || [];
      existing.push(rule);
      rulesByResource.set(rule.resourceId, existing);
    }

    // Send one PUT per application (resourceId), but only for resources that were actually changed.
    // Skipping unchanged resources prevents N audit UPDATE events when only 1 rule is modified/deleted.
    const savePromises = Array.from(rulesByResource.entries()).map(
      async ([resourceId, rules]) => {
        if (changedResourceIds !== undefined && !changedResourceIds.has(resourceId)) return;
        const correlationRules = rules.map((rule) => ({
          id: rule.id || null,
          resourceId: rule.resourceId,
          mode: rule.mode || "CORRELATION",
          ruleGroup: {
            combinator: rule.ruleGroup.combinator || "and",
            rules: rule.ruleGroup.rules.map((r) => ({
              field: r.field,
              operator: r.operator,
              valueSource: r.valueSource || "value",
              value: r.value,
            })),
          },
          script: null,
        }));

        const payload = {
          resourceId,
          correlationRules,
        };

        const response = await fetch(
          `/api/identity/mapping/policies/${schemaId}/correlation/rules`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to save rules for resource ${resourceId}: ${response.status}`
          );
        }
      }
    );

    await Promise.all(savePromises);
  } catch (error) {
    console.error("Error saving correlation rules:", error);
    throw error;
  }
};
