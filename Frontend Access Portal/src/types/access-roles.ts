/**
 * Request payload for creating a new access role.
 */
export interface CreateAccessRoleRequest {
  name: string;
  displayName?: string;
  description: string;
  type: string;
  businessUnit?: string;
  classification?: string[];
  complianceTags?: string[];
  riskLevel?: string;
  riskReason?: string;
  ownerId?: string;
  requestable?: boolean;
  requireApproval?: boolean;
  status: string;
  certificationSchedule?: string;
  entitlementIds?: string[];
  childRoleIds?: string[];
}

/**
 * Request payload for updating an existing access role.
 */
export interface UpdateAccessRoleRequest {
  name?: string;
  displayName?: string;
  description?: string;
  type?: string;
  status?: string;
  businessUnit?: string;
  businessFunction?: string;
  classification?: string[];
  complianceTags?: string[];
  riskLevel?: string;
  riskReason?: string;
  ownerId?: string;
  requestable?: boolean;
  requireApproval?: boolean;
  certificationSchedule?: string;
}

/**
 * Response payload for a single access role.
 */
export interface AccessRoleResponse {
  id: string;
  tenantId: string;
  name: string;
  displayName?: string;
  description?: string;
  type: string;
  status: string;
  businessUnit?: string;
  businessFunction?: string;
  classification?: string[];
  complianceTags?: string[];
  riskLevel?: string;
  riskReason?: string;
  ownerId?: string;
  requestable: boolean;
  entitlementCount?: number;
  requireApproval: boolean;
  certificationSchedule?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Extended response with entitlements and child/parent roles.
 */
export interface AccessRoleDetailResponse extends AccessRoleResponse {
  entitlementIds?: string[];
  childRoles?: AccessRoleResponse[];
  parentRoles?: AccessRoleResponse[];
}

/**
 * Generic API response wrapper from the backend.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}