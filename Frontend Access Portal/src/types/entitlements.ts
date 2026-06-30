/**
 * Matches backend EntitlementResponseDto record exactly.
 * Null-safe: fields that can be null in the API are typed as `| null`.
 */
export interface EntitlementResponseDto {
  id: string;
  tenantId: string;
  resourceId: string;
  sourceUid: string;
  resourceName: string;
  displayName: string;
  description: string;
  objectClass: string;
  kind: string;
  /** Free-form key/value bag from the source system */
  attributes: Record<string, unknown>;
  // Governance metadata
  lifecycle: string | null;
  riskLevel: string | null;
  riskReason: string | null;
  requestable: boolean;
  classification: string[] | null;
  identityType: string | null;
  privilegeLevel: string | null;
  ownerId: string | null;
  requireApproval: boolean;
  allowedAutomatedGrant: boolean;
  maxDurationMs: number | null;
  autoExpireDurationMs: number | null;
  // Computed
  assignedUsersCount: number;
  // Timestamps (epoch ms)
  createdAt: number;
  updatedAt: number;
}

/** Spring Data `Pageable` metadata embedded in a Page response */
export interface SpringPageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

/** Generic Spring `Page<T>` response envelope */
export interface SpringPage<T> {
  content: T[];
  pageable: SpringPageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;          // current page index (0-based)
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export type EntitlementsPage = SpringPage<EntitlementResponseDto>;