export type TaskType = 'AccessRequest' | 'RoleApproval' | 'Certification' | 'Workflow' | 'Delegated';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface TaskBase {
  id: string;
  type: TaskType;
  title: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Expired';
  createdAt: string;
  dueAt?: string;
  risk: RiskLevel;
  requester?: { id: string; name: string; email?: string };
  assignee?: { id: string; name: string };
  sla?: { status: 'ok' | 'dueSoon' | 'overdue'; secondsRemaining?: number };
}

export interface AccessChangeItem {
  subjectId: string;
  subjectName: string;
  additions: { roles: string[]; entitlements: string[] };
  removals: { roles: string[]; entitlements: string[] };
}

export interface SoDFinding {
  id: string;
  policy: string;
  severity: RiskLevel;
  path: string[];
  rationale?: string;
}

export interface TimelineEvent {
  at: string;
  actor: string;
  action: string;
  note?: string;
}

export interface TaskDetails extends TaskBase {
  justification?: string;
  application?: { id: string; name: string };
  role?: { id: string; name: string; type?: string };
  campaign?: { id: string; name: string; period?: string };
  changes?: AccessChangeItem[];
  sodFindings?: SoDFinding[];
  attachments?: { id: string; name: string; url: string }[];
  comments?: { id: string; author: string; text: string; at: string }[];
  timeline?: TimelineEvent[];
  versions?: { before?: any; after?: any };
}

// Extended type for workflow-specific task details
export interface WorkflowTaskDetails extends TaskDetails {
  // === Workflow IAM Context ===
  tileName?: string;                     // Business role/tile being requested
  roleName?: string;                     // Technical role name
  roleDescription?: string;              // Role purpose/description
  targetUsers?: Array<{ id: string; name: string; email?: string }>;
  targetUserCount?: number;              // Number of affected users
  requesterDepartment?: string;          // Requester's org unit
  requesterTitle?: string;               // Requester's job title
  applicationName?: string;              // Target application
  requestType?: string;                  // Type of request (role_assignment, access_grant, etc.)
  
  // === Approval Context ===
  approvalId?: string;                   // WorkflowApproval ID
  workflowName?: string;                 // Workflow template name
  workflowInstanceId?: string;           // Execution instance ID
  approvalPolicy?: 'ALL' | 'ANY' | 'MAJORITY' | 'MINIMUM_N';
  requiredApprovals?: number;            // For MINIMUM_N policy
  
  // === Evidence & Supporting Data ===
  approvalContext?: Record<string, any>; // Full approval context from workflow
  evidenceBundle?: {                     // Supporting data/files from workflow
    // Per-user approval context (for role owner multi-approval)
    targetUserId?: string;
    targetUserName?: string;
    targetUserEmail?: string;
    targetUserFirstName?: string;
    targetUserLastName?: string;
    targetUserDisplayName?: string;
    currentUserName?: string;              // Access Portal manager approvals use this field
    // Other dynamic evidence data
    [key: string]: any;
  }
  
  // === Dynamic Event-Based Content ===
  eventType?: string;                    // Event type for conditional rendering
  permissionList?: PermissionItem[];     // List of permissions (bulk operations)
  singlePermission?: PermissionItem;     // Single permission details
  targetUsersList?: UserInfo[];          // Target users (bulk role assignments)
}

export interface PermissionItem {
  actionId?: string;
  actionName: string;        // e.g., "View", "Edit", "Delete"
  pageName?: string;         // e.g., "Dashboard", "Workflows"
  permissionType?: string;   // e.g., "READ", "WRITE"
  justification?: string;
  conditionScript?: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email?: string;
}
