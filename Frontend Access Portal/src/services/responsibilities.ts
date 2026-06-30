// API service for responsibilities data
// In production, these would connect to actual microservices

export interface Task {
  id: string;
  title: string;
  type: "role_approval" | "certification" | "workflow" | "delegation";
  dueDate: string;
  status: "pending" | "approved" | "rejected" | "timeout" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string;
  requester?: {
    id: string;
    name: string;
    email?: string;
    department?: string;
  };
  // Assignee information (who the task is delegated/assigned to)
  assignee?: {
    id: string;
    name: string;
    email?: string;
  };
  // Additional fields for processed approvals
  decision?: string;
  respondedAt?: string;
  createdAt?: string;
  // Filtering fields
  roleName?: string;
  workflowName?: string;
  // Grouping identifier for multi-approval workflows
  workflowInstanceId?: string;
  // Approver type/role: MANAGER, ROLE_OWNER, APP_OWNER, etc.
  approverType?: string;
}

export interface BusinessRole {
  id: string;
  name: string;
  type: "business" | "functional" | "application";
  memberCount: number;
  entitlementCount: number;
  lastModified: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  status: "active" | "inactive" | "pending";
}

export interface InternalRole {
  id: string;
  name: string;
  roleType: "SYSTEM" | "ADMINISTRATOR" | "REVIEWER" | "OPERATOR" | "VIEWER";
  scope: string; // Derived from roleType: "Organization", "System", "Application", or "Custom"
  permissions: string[];
  isCritical: boolean;
  lastModified: string;
  userCount?: number | null;
  permissionCount?: number;
  isActive?: boolean;
  riskLevel?: string;
}

export interface TeamMember {
  userId: string;
  identityId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  employeeId: string;
  jobTitle: string;
  department: string;
  status: "ACTIVE" | "INACTIVE" | "LOCKED" | "PENDING";
  identityStatus: string;
  lastLogin: string;
  createdAt: string;
  hireDate: string;
  terminationDate?: string;
  isDirectReport: boolean;
  riskScore: number;
  roleCount: number;
  permissionCount: number;
  roles?: TeamMemberRole[];
  managerId: string;
  managerName?: string;
  mfaEnabled: boolean;
  daysSinceLastLogin?: number;
  activeSessions: number;
}

export interface TeamMemberRole {
  id: string;
  name: string;
  roleType: string;
  scope: string;
  isCritical: boolean;
  riskLevel: string;
  permissionCount: number;
  assignedAt: string;
  assignedBy?: string;
  isActive: boolean;
}

export interface SoDPolicy {
  id: string;
  name: string;
  violationCount: number;
  affectedRoles: number;
  lastReview: string;
  complianceStatus: "compliant" | "violations" | "review_needed";
  severity: "low" | "medium" | "high" | "critical";
}

export interface Application {
  id: string;
  name: string;
  systemId: string;
  connectorType: "saas" | "on-prem" | "cloud";
  linkedRoles: number;
  activeUsers: number;
  environment: "prod" | "test" | "dev";
  lastSync: string;
}

export interface ResponsibilitiesSummary {
  tasks: number;
  businessRoles: number;
  internalRoles: number;
  teamMembers: number;
  sodPolicies: number;
  applications: number;
}

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { "X-User-ID": userId } : {}),
  };
}

// Real API calls
/**
 * Fetch tasks for the current user.
 * @param status Filter: 'all', 'pending', or 'processed'
 * @param decision Sub-filter for processed: 'approved', 'rejected', 'timeout', or 'all'
 */
export async function fetchMyTasks(
  status?: string,
  decision?: string,
): Promise<Task[]> {
  const statusParam = status && status !== "all" ? status : "all";
  const params = new URLSearchParams({ status: statusParam });

  // Add decision filter for processed approvals
  if (status === "processed" && decision && decision !== "all") {
    params.append("decision", decision);
  }

  console.log("[Responsibilities] Fetching tasks:", {
    status: statusParam,
    decision,
    url: `/api/responsibilities/my-tasks?${params}`,
  });

  const response = await fetch(`/api/responsibilities/my-tasks?${params}`, {
    method: "GET",
    credentials: "include",
  });

  console.log("[Responsibilities] Response received:", {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Responsibilities] API error:", errorText);
    throw new Error("Failed to fetch tasks");
  }

  const tasks = await response.json();
  console.log("[Responsibilities] Tasks received:", {
    count: tasks.length,
    tasks,
  });
  return tasks;
}

/**
 * Approve a task
 */
export async function approveTask(
  taskId: string,
  comment?: string,
): Promise<void> {
  const response = await fetch(
    `/api/responsibilities/my-tasks/${taskId}/approve`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: comment || "" }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to approve task");
  }
}

/**
 * Reject a task
 */
export async function rejectTask(
  taskId: string,
  comment: string,
): Promise<void> {
  if (!comment || comment.trim().length === 0) {
    throw new Error("Comment is required for rejection");
  }

  const response = await fetch(
    `/api/responsibilities/my-tasks/${taskId}/reject`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to reject task");
  }
}

/**
 * Fetch detailed information for a specific task
 */
export async function fetchTaskDetails(taskId: string): Promise<any> {
  const response = await fetch(`/api/responsibilities/my-tasks/${taskId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch task details");
  }

  const details = await response.json();
  console.log("[fetchTaskDetails] Raw API response:", details);
  console.log("[fetchTaskDetails] Keys in response:", Object.keys(details));
  return details;
}

// TODO: Replace mock data with real API calls for other responsibilities
export async function fetchMyBusinessRoles(): Promise<BusinessRole[]> {
  // Simulate API call: GET /roles/owned
  await new Promise((resolve) => setTimeout(resolve, 600));

  return [
    {
      id: "BR001",
      name: "Finance Manager",
      type: "business",
      memberCount: 12,
      entitlementCount: 45,
      lastModified: "2025-10-15T10:30:00Z",
      riskLevel: "medium",
      status: "active",
    },
    {
      id: "BR002",
      name: "Sales Operations",
      type: "functional",
      memberCount: 8,
      entitlementCount: 32,
      lastModified: "2025-10-10T14:20:00Z",
      riskLevel: "low",
      status: "active",
    },
    {
      id: "BR003",
      name: "Salesforce Admin",
      type: "application",
      memberCount: 3,
      entitlementCount: 67,
      lastModified: "2025-10-20T09:15:00Z",
      riskLevel: "high",
      status: "active",
    },
  ];
}

export async function fetchMyInternalRoles(): Promise<InternalRole[]> {
  console.log("[Responsibilities] Fetching my internal roles");

  const response = await fetch("/api/responsibilities/my-internal-roles", {
    method: "GET",
    credentials: "include",
  });

  console.log("[Responsibilities] Internal roles response received:", {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Responsibilities] API error:", errorText);
    throw new Error("Failed to fetch internal roles");
  }

  const data = await response.json();
  console.log("[Responsibilities] Internal roles received:", data);

  // Map the backend response to frontend InternalRole interface
  if (data.roles && Array.isArray(data.roles)) {
    return data.roles.map((role: any) => ({
      id: role.id,
      name: role.name,
      roleType: role.roleType, // SYSTEM, ADMINISTRATOR, REVIEWER, OPERATOR, VIEWER
      scope: role.scope, // "Organization", "System", "Application", or "Custom"
      permissions: role.permissions || [],
      isCritical: role.isCritical || false,
      lastModified: role.lastModified,
      userCount: role.userCount,
      permissionCount: role.permissionCount,
      isActive: role.isActive,
      riskLevel: role.riskLevel,
    }));
  }

  return [];
}

export async function fetchMyTeam(): Promise<TeamMember[]> {
  console.log("[Responsibilities] Fetching my team members");

  const response = await fetch("/api/responsibilities/my-team", {
    method: "GET",
    credentials: "include",
  });

  console.log("[Responsibilities] Team response received:", {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Responsibilities] API error:", errorText);
    throw new Error("Failed to fetch team members");
  }

  const data = await response.json();
  console.log("[Responsibilities] Team members received:", data);

  return data.teamMembers || [];
}

export async function fetchMySoDPolicies(): Promise<SoDPolicy[]> {
  // Simulate API call: GET /sod/policies/owned
  await new Promise((resolve) => setTimeout(resolve, 600));

  return [
    {
      id: "SP001",
      name: "Finance Segregation Policy",
      violationCount: 2,
      affectedRoles: 3,
      lastReview: "2025-09-30T00:00:00Z",
      complianceStatus: "violations",
      severity: "high",
    },
    {
      id: "SP002",
      name: "Procurement Authorization",
      violationCount: 0,
      affectedRoles: 5,
      lastReview: "2025-10-10T00:00:00Z",
      complianceStatus: "compliant",
      severity: "medium",
    },
  ];
}

export async function fetchMyApplications(): Promise<Application[]> {
  // Simulate API call: GET /applications/owned
  await new Promise((resolve) => setTimeout(resolve, 650));

  return [
    {
      id: "APP001",
      name: "Workday",
      systemId: "WD-PROD-001",
      connectorType: "saas",
      linkedRoles: 15,
      activeUsers: 245,
      environment: "prod",
      lastSync: "2025-10-24T06:00:00Z",
    },
    {
      id: "APP002",
      name: "SAP Finance",
      systemId: "SAP-FIN-001",
      connectorType: "on-prem",
      linkedRoles: 22,
      activeUsers: 89,
      environment: "prod",
      lastSync: "2025-10-24T05:30:00Z",
    },
    {
      id: "APP003",
      name: "Salesforce",
      systemId: "SF-CRM-001",
      connectorType: "cloud",
      linkedRoles: 18,
      activeUsers: 156,
      environment: "prod",
      lastSync: "2025-10-24T07:15:00Z",
    },
  ];
}

export async function fetchResponsibilitiesSummary(): Promise<ResponsibilitiesSummary> {
  // Simulate API call: GET /responsibilities/summary
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    tasks: 4,
    businessRoles: 3,
    internalRoles: 2,
    teamMembers: 4,
    sodPolicies: 2,
    applications: 3,
  };
}
