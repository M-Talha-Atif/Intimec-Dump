/**
 * Types for Rule Execution History.
 *
 * Maps to backend DTOs:
 * - ExecutionHistoryResponse (run-level)
 * - ExecutionDetailResponse (identity-level per run)
 */

export interface ExecutionHistoryResponse {
  id: string;
  tenantId: string;
  ruleId: string;
  ruleName: string;
  entitlementId: string;
  entitlementDisplayName: string;
  resourceId: string;
  triggerType: string; // "MANUAL" | "CRON" | "IMMEDIATE"
  triggeredBy: string;
  conditionsSnapshot: Record<string, unknown>[];
  identityType: string;
  status: string; // "COMPLETED" | "FAILED" | "RUNNING"
  identitiesMatched: number;
  assignmentsCreated: number;
  assignmentsRevoked: number;
  skippedNoShadow: number;
  skippedAlreadyAssigned: number;
  errorCount: number;
  errorMessage: string | null;
  startedAt: number | null;
  completedAt: number | null;
  durationMs: number | null;
}

export interface ExecutionDetailResponse {
  id: string;
  tenantId: string;
  executionId: string;
  ruleId: string;
  identityId: string;
  identityDisplayName: string;
  outcome: string; // "ASSIGNED" | "REVOKED" | "SKIPPED_NO_SHADOW" | "SKIPPED_ALREADY_ASSIGNED" | "ERROR" | "NO_MATCH"
  shadowId: string | null;
  matchEvidence: Record<string, unknown>;
  errorMessage: string | null;
  processedAt: number | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}