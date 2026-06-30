import { CreateRoleData } from "@/types/roleManagement";
import { InternalRole } from "@/types/roleManagement";
import {
  roleTypeDescriptions,
  defaultCreateRoleFormData,
} from "../data/createRoleData";

// API request type
interface CreateRoleRequest {
  roleType: string;
  roleName: string;
  description?: string;
  businessJustification?: string;
  requireOwnerApproval?: boolean;
  workflowId?: string;
  isActive?: boolean;
  tags?: string[];
  riskLevel?: "Low" | "Medium" | "High";
  ownerIds?: string[];
}

// API response type
interface AllUsersApiResponse {
  success: boolean;
  data: any[];
}

/**
 * Get description for a specific role type
 */
export const getRoleTypeDescription = (type: string): string => {
  return roleTypeDescriptions[type as keyof typeof roleTypeDescriptions] || "";
};

/**
 * Toggle scope in the selected scopes array
 */
export const toggleScopeInArray = (
  currentScopes: string[],
  scope: string
): string[] => {
  return currentScopes.includes(scope)
    ? currentScopes.filter((s) => s !== scope)
    : [...currentScopes, scope];
};

/**
 * Toggle tag in the selected tags array
 */
export const toggleTagInArray = (
  currentTags: string[],
  tag: string
): string[] => {
  return currentTags.includes(tag)
    ? currentTags.filter((t) => t !== tag)
    : [...currentTags, tag];
};

/**
 * Validate form data for create role
 */
export const validateCreateRoleForm = (
  formData: Partial<CreateRoleData>,
  hasWorkflowValidationError?: boolean,
  ownerIds?: string[]
): boolean => {
  const MAX_ROLE_NAME_LENGTH = 128;
  const basicValidation = !!(
    formData.name &&
    formData.name.length <= MAX_ROLE_NAME_LENGTH &&
    formData.type &&
    formData.riskLevel &&
    formData.description
  );
  
  // Additional validation: if requireOwnerApproval is true, workflowId must be selected
  if (formData.requireOwnerApproval && !formData.workflowId) {
    return false;
  }
  
  // If requireOwnerApproval is true, ownerIds must not be empty
  // Check both formData.ownerIds and the separate ownerIds parameter
  const actualOwnerIds = ownerIds || formData.ownerIds;
  if (formData.requireOwnerApproval && (!actualOwnerIds || actualOwnerIds.length === 0)) {
    return false;
  }
  
  // If requireOwnerApproval is true, workflow must be valid
  if (formData.requireOwnerApproval && hasWorkflowValidationError) {
    return false;
  }
  
  return basicValidation;
};

/**
 * Reset form data to default values
 */
export const resetCreateRoleForm = () => ({
  formData: { ...defaultCreateRoleFormData },
  selectedScopes: [] as string[],
  selectedTags: [] as string[],
});

/**
 * Prepare form data for submission
 */
export const prepareFormDataForSubmission = (
  formData: Partial<CreateRoleData>,
  selectedScopes: string[],
  selectedTags: string[],
  ownerIds?: string[]
): CreateRoleData => {
  return {
    ...formData,
    scopes: selectedScopes,
    tags: selectedTags,
    ownerIds: ownerIds || [],
  } as CreateRoleData;
};

/**
 * Transform CreateRoleData to API request format
 */
export const transformToCreateRoleRequest = (
  data: CreateRoleData
) => {
  const request = {
    roleType: data.type, // Already in correct format (ADMINISTRATOR, REVIEWER, etc.)
    roleName: data.name,
    description: data.description,
    businessJustification: data.businessJustification || "",
    requireOwnerApproval: data.requireOwnerApproval || false,
    workflowId: data.workflowId,
    isActive: data.isActive ?? true,
    tags: data.tags || [],
    riskLevel: data.riskLevel || "Low",
    ownerIds: data.ownerIds || [],
    submitForApproval: data.requireOwnerApproval || false, // Submit for approval if requireOwnerApproval is true
  };
  
  console.log('[transformToCreateRoleRequest] Input data:', data);
  console.log('[transformToCreateRoleRequest] Output request:', request);
  console.log('[transformToCreateRoleRequest] requireOwnerApproval:', data.requireOwnerApproval, '->', request.requireOwnerApproval);
  
  return request;
};

/**
 * Transform InternalRole updates to UpdateRoleRequest for API
 */
export const transformToUpdateRoleRequest = (
  updates: Partial<InternalRole>,
  currentRole?: InternalRole
): Partial<CreateRoleRequest> => {
  const updateData: Partial<CreateRoleRequest> = {};

  // Always include the role type field (either updated type or current type)
  const roleType = updates.type || currentRole?.type || "VIEWER";
  updateData.roleType = roleType; // Already in correct format (ADMINISTRATOR, REVIEWER, etc.)

  // Only include fields that are being updated
  if (updates.name !== undefined) {
    updateData.roleName = updates.name;
  }

  if (updates.description !== undefined) {
    updateData.description = updates.description;
  }

  if (updates.businessJustification !== undefined) {
    updateData.businessJustification = updates.businessJustification || "";
  }

  if (updates.isActive !== undefined) {
    updateData.isActive = updates.isActive;
  }

  if (updates.tags !== undefined) {
    updateData.tags = updates.tags || [];
  }

  if (updates.ownerIds !== undefined) {
    updateData.ownerIds = updates.ownerIds || [];
  }

  // Map riskLevel to API format if included
  if (updates.riskLevel !== undefined) {
    const riskLevelMap: Record<string, "Low" | "Medium" | "High"> = {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "High",
      Low: "Low",
      Medium: "Medium",
      High: "High",
    };
    updateData.riskLevel = riskLevelMap[updates.riskLevel] || updates.riskLevel as "Low" | "Medium" | "High";
  }

  return updateData;
};

/**
 * Fetch all users from the tenant
 */
export const fetchAllUsers = async (): Promise<AllUsersApiResponse> => {
  try {
    const response = await fetch("/api/users");

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to fetch users: ${response.status}`
      );
    }

    const data: AllUsersApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
