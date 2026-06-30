import {
  DynamicAssignmentRule,
  RuleGroup,
  RuleCondition,
} from "@/types/dynamicRules";
import { USER_ATTRIBUTES, RULE_OPERATORS } from "../data/ruleBuilderData";

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const createEmptyRule = (
  roleId: string
): Partial<DynamicAssignmentRule> => ({
  name: "",
  description: "",
  roleId,
  isActive: true,
  priority: 1,
  conditions: {
    id: "root",
    operator: "AND",
    conditions: [],
    groups: [],
  },
  schedule: { type: "immediate" as const },
  actions: {
    assignRole: true,
    removeRole: false,
    sendNotification: true,
    requireApproval: false,
  },
});

export const createEmptyCondition = (): RuleCondition => ({
  id: generateId(),
  field: "",
  operator: "equals",
  value: "",
  valueType: "text",
});

export const createEmptyGroup = (): RuleGroup => ({
  id: generateId(),
  operator: "AND",
  conditions: [],
  groups: [],
});

export const updateGroupRecursively = (
  group: RuleGroup,
  targetGroupId: string,
  updater: (group: RuleGroup) => RuleGroup
): RuleGroup => {
  if (group.id === targetGroupId) {
    return updater(group);
  }
  return {
    ...group,
    groups:
      group.groups?.map((subGroup) =>
        updateGroupRecursively(subGroup, targetGroupId, updater)
      ) || [],
  };
};

export const addConditionToGroup = (
  conditions: RuleGroup,
  groupId: string,
  newCondition: RuleCondition
): RuleGroup => {
  return updateGroupRecursively(conditions, groupId, (group) => ({
    ...group,
    conditions: [...group.conditions, newCondition],
  }));
};

export const removeConditionFromGroup = (
  conditions: RuleGroup,
  groupId: string,
  conditionId: string
): RuleGroup => {
  return updateGroupRecursively(conditions, groupId, (group) => ({
    ...group,
    conditions: group.conditions.filter((c) => c.id !== conditionId),
  }));
};

export const updateConditionInGroup = (
  conditions: RuleGroup,
  groupId: string,
  conditionId: string,
  updates: Partial<RuleCondition>
): RuleGroup => {
  return updateGroupRecursively(conditions, groupId, (group) => ({
    ...group,
    conditions: group.conditions.map((c) =>
      c.id === conditionId ? { ...c, ...updates } : c
    ),
  }));
};

export const addGroupToParent = (
  conditions: RuleGroup,
  parentGroupId: string,
  newGroup: RuleGroup
): RuleGroup => {
  return updateGroupRecursively(conditions, parentGroupId, (group) => ({
    ...group,
    groups: [...(group.groups || []), newGroup],
  }));
};

export const updateGroupOperator = (
  conditions: RuleGroup,
  groupId: string,
  operator: "AND" | "OR"
): RuleGroup => {
  return updateGroupRecursively(conditions, groupId, (group) => ({
    ...group,
    operator,
  }));
};

export const handleFieldChange = (
  conditions: RuleGroup,
  groupId: string,
  conditionId: string,
  field: string
): RuleGroup => {
  const attribute = USER_ATTRIBUTES.find((attr) => attr.field === field);
  if (!attribute) return conditions;

  const updates: Partial<RuleCondition> = {
    field,
    valueType: attribute.type,
    operator: RULE_OPERATORS[attribute.type][0]
      .value as RuleCondition["operator"],
    value: attribute.type === "list" ? [] : "",
  };

  return updateConditionInGroup(conditions, groupId, conditionId, updates);
};

export const validateRule = (
  rule: Partial<DynamicAssignmentRule>
): string[] => {
  const errors: string[] = [];

  if (!rule.name?.trim()) {
    errors.push("Rule name is required");
  }

  if (!rule.conditions || rule.conditions.conditions.length === 0) {
    errors.push("At least one condition is required");
  }

  if (rule.priority && (rule.priority < 1 || rule.priority > 100)) {
    errors.push("Priority must be between 1 and 100");
  }

  return errors;
};

export const buildTestRule = (
  rule: Partial<DynamicAssignmentRule>,
  roleId: string
): DynamicAssignmentRule => ({
  id: rule.id || "test",
  name: rule.name || "",
  description: rule.description || "",
  roleId,
  isActive: rule.isActive ?? true,
  priority: rule.priority || 1,
  conditions: rule.conditions || createEmptyRule(roleId).conditions!,
  actions: rule.actions || createEmptyRule(roleId).actions!,
  schedule: rule.schedule || createEmptyRule(roleId).schedule!,
  createdAt: new Date().toISOString(),
  createdBy: "current-user",
  lastModified: new Date().toISOString(),
});

export const buildSaveRule = (
  rule: Partial<DynamicAssignmentRule>,
  roleId: string,
  existingRule?: DynamicAssignmentRule
): DynamicAssignmentRule => ({
  id: existingRule?.id || generateId(),
  name: rule.name || "",
  description: rule.description || "",
  roleId: roleId || existingRule?.roleId || "",
  isActive: rule.isActive ?? true,
  priority: rule.priority || 1,
  conditions: rule.conditions || createEmptyRule(roleId).conditions!,
  actions: rule.actions || createEmptyRule(roleId).actions!,
  schedule: rule.schedule || createEmptyRule(roleId).schedule!,
  createdAt: existingRule?.createdAt || new Date().toISOString(),
  createdBy: existingRule?.createdBy || "current-user",
  lastModified: new Date().toISOString(),
});

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
