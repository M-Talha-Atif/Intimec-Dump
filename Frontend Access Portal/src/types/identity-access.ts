/**
 * Represents a single role assigned to an identity.
 * Maps to the backend user-roles API response structure.
 */
export interface IdentityRole {
  id: string;
  roleId: string;
  roleName: string;
  roleDescription: string;
  roleType: string;
  riskLevel: string;
  permissionCount: number;
  assignmentType: string;
  tags: string[];
  roleActive: boolean;
  isCritical: boolean;
  businessJustification: string;
}

/**
 * Backend response shape for the user-roles API.
 * GET /api/v1/user-roles/user/{identityId}
 */
export interface IdentityRolesResponse {
  data: IdentityRole[];
  count: number;
  message: string;
  status: string;
}

/**
 * Represents a single entitlement assignment as seen from an identity's perspective.
 * Maps to the backend IdentityEntitlementViewDto.
 */
export interface IdentityEntitlement {
  assignmentId: string;
  shadowId: string;
  accountName: string;
  resourceId: string;
  applicationName: string;
  entitlementId: string;
  entitlementName: string;
  description: string | null;
  kind: string;
  objectClass: string | null;
  riskLevel: string | null;
  classification: string[] | null;
  source: string;
  assignedAt: number;
  updatedAt: number;
}

/**
 * Backend response shape for the identity entitlements API.
 * GET /api/v1/identities/{identityId}/entitlements
 * Standard Spring Data Page response.
 */
export interface IdentityEntitlementsResponse {
  content: IdentityEntitlement[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}