/**
 * Types for Dynamic Entitlement Assignment Rules.
 *
 * Supports recursive nested condition groups matching react-querybuilder's
 * nested RuleGroup structure and the backend's recursive conditionGroups model.
 */

// ===================================================================
//  Condition Types
// ===================================================================

export interface RuleCondition {
  field: string;
  operator: string;
  value?: string;
  values?: string[];
}

export interface RuleConditionRequest {
  field: string;
  operator: string;
  value?: string;
  values?: string[];
}

// ===================================================================
//  Condition Group Types (recursive)
// ===================================================================

/**
 * A group of conditions with optional nested sub-groups.
 *
 * - groupOperator: combines conditions and sub-groups WITHIN this group (AND/OR)
 * - interGroupOperator: connects this group TO THE NEXT sibling group (AND/OR)
 * - negated: when true, wraps the group's result in NOT(...)
 * - conditions: leaf conditions within this group
 * - conditionGroups: nested sub-groups within this group (recursive)
 */
export interface RuleConditionGroup {
  groupOperator: "AND" | "OR";
  interGroupOperator: "AND" | "OR";
  negated: boolean;
  conditions: RuleCondition[];
  conditionGroups?: RuleConditionGroup[];
}

export interface RuleConditionGroupRequest {
  groupOperator?: string;
  interGroupOperator?: string;
  negated?: boolean;
  conditions: RuleConditionRequest[];
  conditionGroups?: RuleConditionGroupRequest[];
}

// ===================================================================
//  Response
// ===================================================================

export interface AssignmentRuleResponse {
  id: string;
  tenantId: string;
  name: string;
  entitlementId: string;
  resourceId: string;
  conditionGroups: RuleConditionGroup[];
  conditions: RuleCondition[];
  enabled: boolean;
  scheduleType: string;
  cronExpression: string | null;
  scheduleTime: string | null;
  scheduleDate: string | null;
  scheduleTimezone: string | null;
  lastEvaluatedAt: number | null;
  nextExecutionAt: number | null;
  priority: number;
  identityType: string | null;
  createdBy: string | null;
  createdAt: number;
  updatedAt: number;
}

// ===================================================================
//  Requests
// ===================================================================

export interface RuleCreateRequest {
  entitlementId: string;
  conditionGroups?: RuleConditionGroupRequest[];
  conditions?: RuleConditionRequest[];
  enabled: boolean;
  scheduleType: string;
  cronExpression?: string;
  scheduleTime?: string;
  scheduleDate?: string;
  scheduleTimezone?: string;
  identityType: string;
}

export interface RuleUpdateRequest {
  conditionGroups?: RuleConditionGroupRequest[];
  conditions?: RuleConditionRequest[];
  enabled?: boolean;
  scheduleType?: string;
  cronExpression?: string;
  scheduleTime?: string;
  scheduleDate?: string;
  scheduleTimezone?: string;
  identityType?: string;
}

// ===================================================================
//  Evaluation Result
// ===================================================================

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  identitiesMatched: number;
  assignmentsCreated: number;
  assignmentsRevoked: number;
  skippedNoShadow: number;
  success: boolean;
  errorMessage: string | null;
  durationMs: number;
}