import { DynamicAssignmentRule } from "@/types/dynamicRules";
import { User, mockUsers } from "../data/mockUsers";
import { UsersApiResponse, ApiUser } from "../types";

interface ProfileData {
  title?: string;
  department?: string;
  manager?: string;
  location?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status?: string;
}

export interface AssignRoleRequest {
  userIds: string[];
  roleId: string;
  sendNotificationOnAssignment?: boolean;
  requireApprovalBeforeAssignment?: boolean;
  workflowId?: string;
  justification?: string;
}

export interface SubmitUserRoleForApprovalRequest {
  userIds: string[];
  roleId: string;
  workflowId: string;
  justification?: string;
  sendNotificationOnCompletion?: boolean;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  tenantId: string;
  roleName: string;
  roleDescription: string;
  roleActive: boolean;
  assignedAt: string;
}

export interface AssignmentSummary {
  totalUsers: number;
  successCount: number;
  failureCount: number;
  roleId: string;
  roleName: string;
}

export interface AssignRoleResponse {
  data: {
    successfulAssignments: RoleAssignment[];
    failedAssignments: Array<{
      userId: string;
      error: string;
    }>;
    summary: AssignmentSummary;
  };
  message: string;
  status: string;
}

export interface RevokeRoleResponse {
  roleId: string;
  roleName: string;
  requestedUsers: string[];
  successfulRevocations: string[];
  failedRevocations: string[];
  totalRequested: number;
  totalSuccessful: number;
  totalFailed: number;
}

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

/**
 * Convert ApiUser to User format for compatibility with existing filtering logic
 */
export const convertApiUserToUser = (apiUser: ApiUser): User => {
  // Try to parse profileData for additional information
  let profileData: ProfileData = {};
  try {
    profileData = apiUser.profileData ? JSON.parse(apiUser.profileData) : {};
  } catch {
    profileData = {};
  }

  return {
    id: apiUser.id,
    name: apiUser.displayName || `${apiUser.firstName} ${apiUser.lastName}`,
    email: apiUser.email,
    title:
      profileData?.title ||
      (apiUser.firstName ? `${apiUser.firstName} ${apiUser.lastName}` : ""),
    department: profileData?.department || "Not specified",
    manager: profileData?.manager || "",
    status: apiUser.status.toLowerCase() as "active" | "inactive",
    lastLogin: apiUser.lastLoginAt || "",
    location: profileData?.location || "",
  };
};

/**
 * Convert array of ApiUsers to User format
 */
export const convertApiUsersToUsers = (apiUsers: ApiUser[]): User[] => {
  return apiUsers.map(convertApiUserToUser);
};

export const formatLastLogin = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

export const filterUsers = (
  users: User[],
  searchTerm: string,
  departmentFilter: string,
  statusFilter: string
): User[] => {
  return users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" || user.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });
};

export const getDepartments = (users: User[]): string[] => {
  return [...new Set(users.map((user) => user.department))];
};

export const testRule = async (
  rule: DynamicAssignmentRule
): Promise<{ matches: number; preview: User[] }> => {
  // Mock test implementation - in real app this would call backend
  const matchingUsers = mockUsers.filter((user) => {
    // Simple test logic for demo - would be more sophisticated in real implementation
    return rule.conditions.conditions.some((condition) => {
      if (condition.field === "department" && condition.operator === "equals") {
        return user.department === condition.value;
      }
      if (condition.field === "status" && condition.operator === "equals") {
        return user.status === condition.value;
      }
      return false;
    });
  });

  return {
    matches: matchingUsers.length,
    preview: matchingUsers,
  };
};

/**
 * Fetch users for a specific role from the API with pagination and filters
 */
export const fetchUsersForRole = async (
  roleId: string,
  page: number = 0,
  size: number = 10,
  status: string = "ALL",
  search: string = "",
  manualOnly: boolean = false
): Promise<UsersApiResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      status: status,
    });
    
    if (search.trim()) {
      params.append("search", search.trim());
    }

    // Use different endpoint for manual-only assignments
    const endpoint = manualOnly 
      ? `/api/roles/${roleId}/manual-users?${params.toString()}`
      : `/api/roles/${roleId}/users?${params.toString()}`;

    console.log('[fetchUsersForRole] manualOnly:', manualOnly);
    console.log('[fetchUsersForRole] endpoint:', endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to fetch users: ${response.status} ${response.statusText}`
      );
    }

    const data: UsersApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users for role:", error);
    throw error;
  }
};

/**
 * Assign users to a role
 */
export const assignUsersToRole = async (
  request: AssignRoleRequest
): Promise<AssignRoleResponse | null> => {
  try {
    console.log("Assign Role Request Body:", JSON.stringify(request, null, 2));

    const response = await fetch("/api/user-roles/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // For 403 errors, let the global interceptor handle the toast
      if (response.status === 403) {
        return null;
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to assign role: ${response.status} ${response.statusText}`
      );
    }

    const data: AssignRoleResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error assigning users to role:", error);
    throw error;
  }
};

/**
 * Revoke role from users
 */
export const revokeUsersFromRole = async (
  request: AssignRoleRequest
): Promise<RevokeRoleResponse | null> => {
  try {
    console.log("Revoke Role Request Body:", JSON.stringify(request, null, 2));

    const response = await fetch("/api/user-roles/revoke", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // For 403 errors, let the global interceptor handle the toast
      if (response.status === 403) {
        return null;
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to revoke role: ${response.status} ${response.statusText}`
      );
    }

    const data: RevokeRoleResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error revoking users from role:", error);
    throw error;
  }
};

/**
 * Fetch all active workflows for user role assignment
 */
export const fetchActiveWorkflows = async (): Promise<Workflow[]> => {
  try {
    const response = await fetch("/api/workflows?size=100", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to fetch workflows: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    // Handle different response formats
    let workflowList = [];
    if (Array.isArray(data)) {
      workflowList = data;
    } else if (data.data && Array.isArray(data.data.content)) {
      workflowList = data.data.content;
    } else if (data.content && Array.isArray(data.content)) {
      workflowList = data.content;
    }
    
    console.log('[fetchActiveWorkflows] Total workflows fetched:', workflowList.length);
    
    // Filter for workflows that can handle user role assignment
    const roleAssignmentWorkflows = workflowList.filter((wf: any) => {
      const status = wf.status?.toUpperCase();
      const isActive = status === 'ACTIVE';
      const triggerType = wf.triggerType?.toUpperCase();
      const isEventBased = triggerType === 'EVENT_BASED' || triggerType === 'EVENT-BASED';
      const eventTypes = wf.eventConfig?.eventTypes || [];
      const hasRoleAssignmentEvent = eventTypes.includes('role.assigned');
      
      return isActive && isEventBased && hasRoleAssignmentEvent;
    });
    
    console.log('[fetchActiveWorkflows] Filtered role assignment workflows:', roleAssignmentWorkflows.length);
    
    return roleAssignmentWorkflows.map((wf: any) => ({
      id: wf.id,
      name: wf.name,
      description: wf.description || "",
      status: wf.status,
    }));
  } catch (error) {
    console.error("Error fetching workflows:", error);
    throw error;
  }
};

/**
 * Fetch all active workflows for user role revocation
 */
export const fetchRevokeWorkflows = async (): Promise<Workflow[]> => {
  try {
    const response = await fetch("/api/workflows?size=100", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to fetch workflows: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    // Handle different response formats
    let workflowList = [];
    if (Array.isArray(data)) {
      workflowList = data;
    } else if (data.data && Array.isArray(data.data.content)) {
      workflowList = data.data.content;
    } else if (data.content && Array.isArray(data.content)) {
      workflowList = data.content;
    }
    
    console.log('[fetchRevokeWorkflows] Total workflows fetched:', workflowList.length);
    
    // Filter for workflows that can handle user role revocation
    const roleRevocationWorkflows = workflowList.filter((wf: any) => {
      const status = wf.status?.toUpperCase();
      const isActive = status === 'ACTIVE';
      const triggerType = wf.triggerType?.toUpperCase();
      const isEventBased = triggerType === 'EVENT_BASED' || triggerType === 'EVENT-BASED';
      const eventTypes = wf.eventConfig?.eventTypes || [];
      const hasRoleRevocationEvent = eventTypes.includes('role.revoked');
      
      return isActive && isEventBased && hasRoleRevocationEvent;
    });
    
    console.log('[fetchRevokeWorkflows] Filtered role revocation workflows:', roleRevocationWorkflows.length);
    
    return roleRevocationWorkflows.map((wf: any) => ({
      id: wf.id,
      name: wf.name,
      description: wf.description || "",
      status: wf.status,
    }));
  } catch (error) {
    console.error("Error fetching revoke workflows:", error);
    throw error;
  }
};

/**
 * Submit user role assignment for approval
 */
export const submitUserRoleAssignmentForApproval = async (
  request: SubmitUserRoleForApprovalRequest
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Submit User Role Assignment for Approval:", JSON.stringify(request, null, 2));

    const response = await fetch("/api/user-roles/submit-assignment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // For 403 errors, let the global interceptor handle the toast
      if (response.status === 403) {
        return { success: false, message: "Access denied" };
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to submit for approval: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return { success: true, message: data.message || "Submitted for approval successfully" };
  } catch (error) {
    console.error("Error submitting user role assignment for approval:", error);
    throw error;
  }
};

/**
 * Submit user role revocation for approval
 */
export const submitUserRoleRevocationForApproval = async (
  request: SubmitUserRoleForApprovalRequest
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Submit User Role Revocation for Approval:", JSON.stringify(request, null, 2));

    const response = await fetch("/api/user-roles/submit-revocation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // For 403 errors, let the global interceptor handle the toast
      if (response.status === 403) {
        return { success: false, message: "Access denied" };
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to submit for approval: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return { success: true, message: data.message || "Submitted for approval successfully" };
  } catch (error) {
    console.error("Error submitting user role revocation for approval:", error);
    throw error;
  }
};
