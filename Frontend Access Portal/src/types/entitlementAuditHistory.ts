/**
 * Matches EntitlementAuditHistoryDto from the backend.
 */
export interface EntitlementAuditHistoryEntry {
  id: string;
  actorUsername: string;
  activity: string;
  description: string;
  triggerSource: string | null;
  entitlementName: string | null;
  ruleName: string | null;
  stateBefore: Record<string, unknown> | null;
  stateAfter: Record<string, unknown> | null;
  changedFields: string[] | null;
  createdAt: number;
}

export interface PaginatedAuditHistoryResponse {
  content: EntitlementAuditHistoryEntry[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}