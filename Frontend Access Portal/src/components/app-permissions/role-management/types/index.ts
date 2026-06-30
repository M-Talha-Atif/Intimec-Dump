/**
 * Dynamic rule object as returned from the API
 */
export interface DynamicRule {
  id: string;
  roleId: string;
  roleName: string;
  ruleIsActive: boolean;
  ruleConditionScript: string;
  sendNotificationOnAssignment: boolean;
  requireApprovalBeforeAssignment: boolean;
  scheduleType: string;
  time: string;
  createdAt: number;
  updatedAt: number;
  createdById: string;
  createdByName: string;
  updatedById: string;
  updatedByName: string;
}

/**
 * API response structure for creating a dynamic rule
 */
export interface CreateDynamicRuleResponse {
  data: DynamicRule;
  message: string;
  status: string;
}
/**
 * Create dynamic rule request body for API
 */
export interface CreateDynamicRuleRequest {
  roleId: string;
  ruleIsActive: boolean;
  ruleConditionScript: string;
  sendNotificationOnAssignment: boolean;
  requireApprovalBeforeAssignment: boolean;
  scheduleType: string;
  time: string;
}
/**
 * Role object as returned from the API
 */
export interface ApiRole {
  id: string;
  tenantId: string;
  roleType: string;
  roleName: string;
  description: string;
  businessJustification: string;
  requireOwnerApproval: boolean;
  tags: string[];
  userCount: number;
  permissionsCount: number;
  hasManualAssignments: boolean;
  hasDynamicRules: boolean;
  riskLevel: "Low" | "Medium" | "High";
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  createdByName: string;
  createdById: string;
  ownersData?: ApiUser[];
}

/**
 * API response structure for roles
 */
export interface RolesApiResponse {
  data: ApiRole[];
  count: number;
  message: string;
  status: string;
}

/**
 * Create role request body for API
 */
export interface CreateRoleRequest {
  roleType: string;
  roleName: string;
  description: string;
  businessJustification: string;
  requireOwnerApproval: boolean;
  tags: string[];
  riskLevel: "Low" | "Medium" | "High";
  isActive: boolean;
  ownerIds: string[];
}

/**
 * User object as returned from the API
 */
export interface ApiUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  status: "ACTIVE" | "INACTIVE";
  tenantId: string;
  lastLoginAt?: string;
  passwordChangedAt?: string;
  failedLoginAttempts: number;
  mfaEnabled: boolean;
  isPasswordExpired: boolean;
  profileData: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  hasRole?: boolean;
}

/**
 * API response structure for users with pagination
 */
export interface UsersApiResponse {
  users: ApiUser[];
  totalCount: number;
  usersWithRoleCount: number;
  usersWithoutRoleCount: number;
  page: number;
  size: number;
  totalPages: number;
  currentPageSize: number;
  roleId: string;
  tenantId: string;
  success: boolean;
  message: string;
}

/**
 * API response structure for all users (tenant users)
 */
export interface AllUsersApiResponse {
  users: ApiUser[];
  totalCount: number;
  tenantId: string;
  success: boolean;
  message: string;
}
