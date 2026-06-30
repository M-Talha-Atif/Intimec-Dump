export interface TileConfig {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  visibility: string[];
  isActive: boolean;
  routingLogic?: string;
  filterLogic?: string;
  color?: string;

  // Access Control
  allowedRoles?: string[];
  allowedDepartments?: string[];
  requireManagerApproval?: boolean;
  workflowId?: string; 
  requireTraining?: boolean;
  trainingIds?: string[];
  maxRiskLevel?: 'low' | 'medium' | 'high' | 'critical';

  // Request Type Config
  allowSelfRequest?: boolean;
  allowRequestForOthers?: boolean;
  allowBulkRequest?: boolean;
  maxBulkSize?: number;
  requireJustificationForOthers?: boolean;

  // Object Type Filter
  objectTypeFilter?: ObjectTypeFilter;

  // Visual Filters
  visualFilters?: FilterRule[];

  // Hierarchy Config
  displayMode?: 'grid' | 'list' | 'table';
  sortBy?: string;
  showStats?: boolean;
}

export interface FilterRule {
  id: string;
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'in' | 'notIn' | 'greaterThan' | 'lessThan';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface RequestEligibility {
  allowedRoles: string[];
  allowedDepartments: string[];
  blockedUsers: string[];
  workflowId?: string; 
  requireManagerApproval: boolean;
  maxRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

export interface RequestTypeConfig {
  allowRequestForOthers: boolean;
  requireJustificationForOthers: boolean;
}

// types/access-portal.ts

export interface ObjectTypeFilter {
  id: string;
  enabled: boolean;
  objectTypes: Array<'application' | 'role' | 'internal-role' | 'entitlement'>;
  
  // Fixed: Make all keys optional but specific
  specificItems: {
    applications?: string[];
    roles?: string[];
    groups?: string[]; // Maps to 'internal-role'
    entitlements?: string[];
  };
  
  includeChildItems?: boolean;
}

export interface CategoryTileConfig {
  // Core identity
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  order: number;
  isActive: boolean;

  // Visibility & access
  visibility: string[];

  // Access type toggles (used in Access Types Grid)
  allowApplications: boolean;
  allowInternalRoles: boolean;
  allowBusinessRoles: boolean;
  allowEntitlements: boolean;

  // Risk & inventory
  itemCount: number;
  maximumRiskLevel: 'low' | 'medium' | 'high' | 'critical';

  // Approval metrics
  approvalRate: number;
  avgApprovalTime: number;

  // Enhanced access control
  requestEligibility: RequestEligibility;
  requestTypeConfig: RequestTypeConfig;

  // Object type filtering
  objectTypeFilter: ObjectTypeFilter;

  // Visual filters
  visualFilters: FilterRule[];

  // Tenant & metadata
  tenantId: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp

  // Usage stats
  usageStats: {
    viewCount: number;
    requestCount: number;
    avgResponseTime: number;
  };
}


export interface ApprovalStep {
  stepNumber: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'delegated' | 'skipped';
  respondedAt?: string;
  comments?: string;
  delegatedTo?: string;
  delegatedBy?: string;
  slaHours: number;
  hoursRemaining?: number;
}

export interface ProvisioningStep {
  stepName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp?: string;
  details?: string;
}

export interface ProvisioningDetail {
  accessItemId: string;
  accessItemName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  targetSystem: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  retryCount: number;
  provisioningSteps: ProvisioningStep[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  beforeValue?: any;
  afterValue?: any;
}

export interface RequestComment {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  isApprover: boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  manager: string;
  joinDate: string;
  avatar?: string;
  completedTraining?: string[];
}

export interface PeerData {
  userId: string;
  userName: string;
  department: string;
  role: string;
  accessItems: string[];
  recentRequests: string[];
}

export interface AccessTemplate {
  id: string;
  name: string;
  description: string;
  accessItemIds: string[];
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  usageCount: number;
}
