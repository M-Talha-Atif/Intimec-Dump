import { Crown, Users, Settings, Eye, Shield } from "lucide-react";
import { InternalRole, RoleFilters } from "@/types/roleManagement";
import {
  ApiRole,
  RolesApiResponse,
  CreateRoleRequest,
  CreateDynamicRuleRequest,
  CreateDynamicRuleResponse,
} from "../types";

//  Create a new dynamic rule using the backend API

export const createDynamicRuleAPI = async (
  ruleData: CreateDynamicRuleRequest
): Promise<CreateDynamicRuleResponse | null> => {
  try {
    const response = await fetch("/api/dynamic-rules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ruleData),
    });

    if (!response.ok) {
      // For 403 errors, let the global interceptor handle the toast
      if (response.status === 403) {
        return null;
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to create dynamic rule: ${response.status} ${response.statusText}`
      );
    }

    const apiResponse = await response.json();
    return apiResponse;
  } catch (error) {
    console.error("Error creating dynamic rule:", error);
    throw error;
  }
};

/**
 * Calculate the number of active filters
 */
export const calculateActiveFilterCount = (filters: RoleFilters): number => {
  return (
    (filters.types.length > 0 ? 1 : 0) +
    (filters.statuses.length > 0 ? 1 : 0) +
    (filters.riskLevels.length > 0 ? 1 : 0) +
    (filters.scopes.length > 0 ? 1 : 0) +
    (filters.owners.length > 0 ? 1 : 0) +
    (filters.tags.length > 0 ? 1 : 0)
  );
};

/**
 * Create an empty filter state
 */
export const createEmptyFilters = (): RoleFilters => ({
  search: "",
  types: [],
  statuses: [],
  riskLevels: [],
  scopes: [],
  owners: [],
  tags: [],
});

/**
 * Generate export filename for roles
 */
export const generateExportFilename = (): string => {
  const date = new Date().toISOString().split("T")[0];
  return `roles-export-${date}.json`;
};

/**
 * Create a download link for blob data
 */
export const downloadBlobAsFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Fetch all unique tags from roles
 */
export const fetchRoleTags = async (): Promise<string[]> => {
  try {
    const response = await fetch("/api/roles/tags");
    if (!response.ok) {
      throw new Error("Failed to fetch tags");
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching role tags:", error);
    return [];
  }
};

/**
 * Format bulk operation success message
 */
export const formatBulkOperationMessage = (
  operation: string,
  count: number
): string => {
  return `${operation} operation completed for ${count} role(s)`;
};

/**
 * Format user assignment success message
 */
export const formatUserAssignmentMessage = (userCount: number): string => {
  return `${userCount} user(s) assigned to role`;
};

/**
 * Format role clone success message
 */
export const formatRoleCloneMessage = (newName: string): string => {
  return `Role cloned as "${newName}"`;
};

/**
 * Format role creation success message
 */
export const formatRoleCreationMessage = (roleName: string): string => {
  return `Role "${roleName}" created successfully`;
};

/**
 * Format dynamic rule creation success message
 */
export const formatRuleCreationMessage = (ruleName: string): string => {
  return `Dynamic assignment rule "${ruleName}" created successfully`;
};

/**
 * Transform API role to internal role format
 */
export const transformApiRoleToInternalRole = (apiRole: ApiRole): InternalRole => {
  return {
    id: apiRole.id,
    name: apiRole.roleName,
    type: (apiRole.roleType || "VIEWER") as InternalRole["type"],
    status: "active", // Default status, you can modify this based on your API
    description: apiRole.description,
    businessJustification: apiRole.businessJustification,
    owner: apiRole.createdByName, // Use actual creator name from API
    approver: undefined,

    // Permissions and access
    permissions: [],
    permissionsCount: apiRole.permissionsCount,
    scopes: [apiRole.tenantId],

    // Users and assignments
    assignments: [],
    userCount: apiRole.userCount || 0,
    activeUserCount: apiRole.userCount || 0,

    // Risk and compliance - use API data
    riskLevel: apiRole.riskLevel,
    riskScore:
      apiRole.riskLevel === "High"
        ? 80
        : apiRole.riskLevel === "Medium"
        ? 50
        : 20,
    violations: [],
    complianceFrameworks: [],
    requireOwnerApproval: apiRole.requireOwnerApproval,
    isActive: apiRole.isActive ?? true,

    // Assignment tracking
    hasManualAssignments: apiRole.hasManualAssignments ?? false,
    hasDynamicRules: apiRole.hasDynamicRules ?? false,

    // Audit and tracking - use API timestamps
    created: new Date(apiRole.createdAt).toISOString(),
    lastModified: new Date(apiRole.updatedAt).toISOString(),
    lastReviewed: undefined,
    nextReviewDate: undefined,
    activityLog: [],
    versions: [],
    createdByName: apiRole.createdByName,
    createdById: apiRole.createdById,
    ownersData: apiRole.ownersData,

    // Metadata
    tags: apiRole.tags,
    customFields: {},
    isArchived: false,
    archiveReason: undefined,
  };
};

/**
 * Fetch roles from the backend API
 */
export const fetchRolesFromAPI = async (): Promise<InternalRole[]> => {
  try {
    const response = await fetch("/api/roles", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to fetch roles: ${response.status} ${response.statusText}`
      );
    }

    const apiResponse: RolesApiResponse = await response.json();
    console.log("API Response:", apiResponse);

    // Transform API roles to internal format
    const internalRoles = apiResponse.data.map(transformApiRoleToInternalRole);

    return internalRoles;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

/**
 * Create a new role using the backend API
 */
export const createRoleAPI = async (
  roleData: CreateRoleRequest
): Promise<{ data: ApiRole; message: string } | null> => {
  try {
    const response = await fetch("/api/roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      // For 403 errors, let the global interceptor handle the toast
      if (response.status === 403) {
        return null;
      }
      
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || 
        `Failed to create role: ${response.status} ${response.statusText}`;
      
      // Return error in a rejected promise to be caught by caller
      return Promise.reject(new Error(errorMessage));
    }

    const apiResponse = await response.json();
    console.log("Create Role API Response:", apiResponse);

    // Return both data and message from backend
    return {
      data: apiResponse.data || apiResponse,
      message: apiResponse.message || "Role created successfully"
    };
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

/**
 * Delete a role using the backend API
 * Returns response data indicating if role was deleted or submitted for approval
 */
export const deleteRoleAPI = async (
  roleId: string,
  workflowId?: string
): Promise<{ deleted: boolean; message: string; status: string } | null> => {
  try {
    const response = await fetch(`/api/roles/${roleId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: workflowId ? JSON.stringify({ workflowId }) : undefined,
    });

    if (!response.ok) {
      // For 403 errors, let the global interceptor handle the toast
      if (response.status === 403) {
        return null;
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to delete role: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`Role ${roleId} deletion response:`, data);
    return {
      deleted: data.deleted || false,
      message: data.message || "Role deleted successfully",
      status: data.status || "200",
    };
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};

/**
 * Bulk delete multiple roles at once
 * @param roleIds Array of role IDs to delete
 * @returns Promise with deletion results
 */
export const bulkDeleteRolesAPI = async (
  roleIds: string[]
): Promise<{
  successCount: number;
  failedCount: number;
  successfulDeletions: Array<{ roleId: string; roleName: string }>;
  failedDeletions: Array<{ roleId: string; error: string }>;
} | null> => {
  try {
    // Use query parameters - send each ID as separate parameter: ?ids=id1&ids=id2&ids=id3
    const params = new URLSearchParams();
    roleIds.forEach(id => params.append("ids", id));
    
    const response = await fetch(`/api/roles/bulk?${params.toString()}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // For 403 errors, let the global interceptor handle the toast
      if (response.status === 403) {
        return null;
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          errorData.error ||
          `Failed to bulk delete roles: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`Bulk delete completed:`, data.result);
    return data.result;
  } catch (error) {
    console.error("Error bulk deleting roles:", error);
    throw error;
  }
};

/**
 * Copy a role using the backend API
 */
export const copyRoleAPI = async (roleId: string): Promise<ApiRole | null> => {
  try {
    const response = await fetch(`/api/roles/${roleId}/copy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // For 403 errors, let the global interceptor handle the toast
      if (response.status === 403) {
        return null;
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to copy role: ${response.status} ${response.statusText}`
      );
    }

    const copiedRole = await response.json();
    console.log(`Role ${roleId} copied successfully:`, copiedRole);
    return copiedRole;
  } catch (error) {
    console.error("Error copying role:", error);
    throw error;
  }
};

/**
 * Update a role using the backend API
 */
export const updateRoleAPI = async (
  roleId: string,
  updateData: Partial<CreateRoleRequest>
): Promise<ApiRole | null> => {
  const response = await fetch(`/api/roles/${roleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    // For 403 errors, let the global interceptor handle the toast
    if (response.status === 403) {
      return null;
    }
    
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || errorData.message || 
      `Failed to update role: ${response.status} ${response.statusText}`;
    
    return Promise.reject(new Error(errorMessage));
  }

  const apiResponse = await response.json();
  return apiResponse.data || apiResponse;
};

/**
 * Get icon component for role type
 */
export const getTypeIcon = (type: InternalRole["type"]) => {
  const icons = {
    SYSTEM: Shield,
    ADMINISTRATOR: Crown,
    REVIEWER: Users,
    OPERATOR: Settings,
    VIEWER: Eye,
  };
  return icons[type] || Eye; // Default to Eye icon if type is undefined or unknown
};

/**
 * Get badge color variant for role type
 */
export const getTypeColor = (type: InternalRole["type"]) => {
  const colors = {
    SYSTEM: "default",
    ADMINISTRATOR: "destructive",
    REVIEWER: "default",
    OPERATOR: "secondary",
    VIEWER: "outline",
  } as const;
  return colors[type];
};

/**
 * Get badge color variant for risk level
 */
export const getRiskColor = (risk: string) => {
  const colors = {
    Low: "default",
    Medium: "secondary",
    High: "destructive",
  } as const;
  return colors[risk as keyof typeof colors] || "default";
};

/**
 * Get badge color variant for risk level
 */
export const getRiskColorForAccessItem = (risk: string) => {
  const colors = {
    low: "risk-low",
    medium: "risk-medium",
    high: "risk-high",
  } as const;
  return colors[risk as keyof typeof colors] || "secondary";
};

