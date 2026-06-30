import { ApiUser } from "@/components/app-permissions/role-management/types";

export type RoleType = "SYSTEM" | "ADMINISTRATOR" | "REVIEWER" | "OPERATOR" | "VIEWER";
export type RoleStatus = "active" | "inactive" | "archived";
export type RiskLevel = "Low" | "Medium" | "High";
export type PermissionLevel = "read" | "write" | "admin" | "owner";

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  level: PermissionLevel;
  isRisky?: boolean;
}

export interface RolePermission extends Permission {
  inherited?: boolean;
  grantedBy?: string;
  grantedDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  manager?: string;
  lastLogin?: string;
  status: "active" | "inactive";
  avatar?: string;
}

export interface RoleAssignment {
  userId: string;
  assignedBy: string;
  assignedDate: string;
  expiryDate?: string;
  status: "active" | "pending" | "expired";
  justification?: string;
}

export interface RiskViolation {
  type: "sod" | "privilege_escalation" | "excessive_permissions";
  severity: RiskLevel;
  description: string;
  conflictingRole?: string;
  conflictingPermission?: string;
  recommendation?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action:
    | "created"
    | "updated"
    | "deleted"
    | "assigned"
    | "unassigned"
    | "approved"
    | "rejected";
  actor: string;
  target?: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface RoleVersion {
  version: number;
  timestamp: string;
  changes: string[];
  changedBy: string;
  rollbackable: boolean;
}

export interface InternalRole {
  id: string;
  name: string;
  type: RoleType;
  status: RoleStatus;
  description: string;
  businessJustification?: string;
  owner: string;
  approver?: string;

  // Approval behavior
  requireOwnerApproval?: boolean;

  // Permissions and access
  permissions: RolePermission[];
  permissionsCount: number;
  scopes: string[];

  // Users and assignments
  assignments: RoleAssignment[];
  userCount: number;
  activeUserCount: number;

  // Risk and compliance
  riskLevel: RiskLevel;
  riskScore: number;
  violations: RiskViolation[];
  complianceFrameworks: string[];
  isActive: boolean;

  // Assignment tracking
  hasManualAssignments: boolean;
  hasDynamicRules: boolean;

  // Audit and tracking
  created: string;
  lastModified: string;
  lastReviewed?: string;
  nextReviewDate?: string;
  activityLog: ActivityLog[];
  versions: RoleVersion[];
  createdByName: string;
  createdById: string;
  // Metadata
  tags: string[];
  ownerIds?: string[];
  ownersData?: ApiUser[];
  customFields?: Record<string, any>;
  isArchived: boolean;
  archiveReason?: string;
}

export interface RoleFilters {
  search: string;
  types: RoleType[];
  statuses: RoleStatus[];
  riskLevels: RiskLevel[];
  scopes: string[];
  owners: string[];
  tags: string[];
}

export interface RoleSortConfig {
  field: keyof InternalRole | "userCount" | "riskScore" | "lastModified";
  direction: "asc" | "desc";
}

export interface CreateRoleData {
  name: string;
  type: RoleType;
  riskLevel: RiskLevel;
  description: string;
  businessJustification?: string;
  owner: string;
  approver?: string;
  permissions: string[];
  scopes: string[];
  users: string[];
  requireOwnerApproval?: boolean;
  workflowId?: string;
  isActive: boolean;
  complianceFrameworks: string[];
  tags: string[];
  customFields?: Record<string, any>;
  ownerIds?: string[];
}

export interface BulkRoleOperation {
  roleIds: string[];
  operation: "archive" | "delete" | "activate" | "export" | "clone";
  options?: Record<string, any>;
}

export interface RoleStats {
  inactive: number;
  active: number;
  archived: number;
  highRisk: number;
  withViolations: number;
  recentlyModified: number;
}
