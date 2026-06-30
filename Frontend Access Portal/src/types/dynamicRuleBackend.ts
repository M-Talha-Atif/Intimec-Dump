/**
 * Backend API types for Dynamic Rules
 */

export type ScheduleType = "IMMEDIATE";

export interface DynamicRuleBackendRequest {
  roleId: string;
  ruleIsActive: boolean;
  ruleConditionScript: string;
  sendNotificationOnAssignment: boolean;
  requireApprovalBeforeAssignment: boolean;
  scheduleType: ScheduleType;
  time?: string | null; // HH:mm format, null for IMMEDIATE
}

export interface DynamicRuleBackendResponse {
  id: string;
  roleId: string;
  roleName: string;
  ruleIsActive: boolean;
  ruleConditionScript: string;
  sendNotificationOnAssignment: boolean;
  requireApprovalBeforeAssignment: boolean;
  scheduleType: ScheduleType;
  time?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DynamicRuleApiResponse {
  message: string;
  status: string;
  data?: DynamicRuleBackendResponse;
  timestamp?: string;
}
