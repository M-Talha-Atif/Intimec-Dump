import { ModuleResponse, RoleResponse } from "../types/api.types";

// Use Next.js API routes for authenticated requests
const API_BASE_URL = "/api";

export interface GetHierarchicalPermissionsParams {
  roleFilter?: string;
  moduleFilter?: string;
}

/**
 * Fetches hierarchical permissions modules from the backend API
 * @param params - Optional filters for role and module
 * @returns Promise with array of modules
 */
export async function getHierarchicalPermissions(
  params?: GetHierarchicalPermissionsParams
): Promise<ModuleResponse[]> {
  const queryParams = new URLSearchParams();

  if (params?.roleFilter) {
    queryParams.append("roleFilter", params.roleFilter);
  }
  if (params?.moduleFilter) {
    queryParams.append("moduleFilter", params.moduleFilter);
  }

  const url = `${API_BASE_URL}/granular-permissions/hierarchy${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });


  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to fetch hierarchical permissions (${response.status}): ${errorBody || response.statusText}`
    );
  }

  const data = await response.json();
  // Backend returns an object with modules, availableModules, availableRoles
  // Extract just the modules array
  return data.modules || [];
}

/**
 * Fetches available modules for filtering
 * @returns Promise with array of module names
 */
export async function getAvailableModules(): Promise<string[]> {
  const url = `${API_BASE_URL}/granular-permissions/available-modules`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  console.log("Available modules response status:", response.status);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Error response:", errorBody);
    throw new Error(
      `Failed to fetch available modules (${response.status}): ${errorBody || response.statusText}`
    );
  }

  const data = await response.json();
  console.log("Received available modules:", data);
  return data;
}

/**
 * Fetches available roles with user counts
 * @returns Promise with array of roles
 */
export async function getAvailableRoles(): Promise<RoleResponse[]> {
  // Fetch all roles (use a large page size to get all at once for the hook)
  const url = `${API_BASE_URL}/granular-permissions/available-roles?page=0&size=1000`;

  console.log("Fetching available roles from:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  console.log("Available roles response status:", response.status);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Error response:", errorBody);
    throw new Error(
      `Failed to fetch available roles (${response.status}): ${errorBody || response.statusText}`
    );
  }

  const data = await response.json();
  console.log("Received available roles:", data);
  
  // Extract content from paginated response
  return data.content || [];
}

/**
 * Bulk assign permissions to a role
 * @param roleId - The role ID to assign permissions to
 * @param assignments - Array of permission assignments
 * @returns Promise with bulk assignment result
 */
export interface BulkAssignmentItem {
  actionId: string;
  justification: string;
  conditionScript?: string | null;
}

export interface BulkAssignmentResult {
  success: boolean;
  assignedCount: number;
  totalRequested: number;
  permissionIds: string[];
  errors: string[];
  executionTime: string;
  message: string;
}

export async function bulkAssignPermissions(
  roleId: string,
  assignments: BulkAssignmentItem[]
): Promise<BulkAssignmentResult | null> {
  const url = `${API_BASE_URL}/roles/${roleId}/permissions/bulk`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ assignments }),
  });

  if (!response.ok) {
    // For 403 errors, let the global interceptor handle the toast
    if (response.status === 403) {
      return null;
    }
    
    const errorBody = await response.text();
    throw new Error(
      `Failed to bulk assign permissions (${response.status}): ${errorBody || response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Submit bulk permission assignment for approval
 */
export interface SubmitBulkAssignmentForApprovalRequest {
  assignments: BulkAssignmentItem[];
  workflowId: string;
}

export interface BulkApprovalResponse {
  status: string;
  assignmentCount: number;
  workflowId: string;
  ownerIds: string[];
}

export async function submitBulkAssignmentForApproval(
  roleId: string,
  request: SubmitBulkAssignmentForApprovalRequest
): Promise<BulkApprovalResponse | null> {
  const url = `${API_BASE_URL}/roles/${roleId}/permissions/submit-bulk-assignment-for-approval`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    // For 403 errors, let the global interceptor handle the toast
    if (response.status === 403) {
      return null;
    }
    
    const errorBody = await response.text();
    throw new Error(
      `Failed to submit bulk assignment for approval (${response.status}): ${errorBody || response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Submit bulk permission revocation for approval
 */
export interface SubmitBulkRevocationForApprovalRequest {
  actionIds: string[];
  justification: string;
  workflowId: string;
}

export async function submitBulkRevocationForApproval(
  roleId: string,
  request: SubmitBulkRevocationForApprovalRequest
): Promise<BulkApprovalResponse | null> {
  const url = `${API_BASE_URL}/roles/${roleId}/permissions/submit-bulk-revocation-for-approval`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    // For 403 errors, let the global interceptor handle the toast
    if (response.status === 403) {
      return null;
    }
    
    const errorBody = await response.text();
    throw new Error(
      `Failed to submit bulk revocation for approval (${response.status}): ${errorBody || response.statusText}`
    );
  }

  return await response.json();
}
