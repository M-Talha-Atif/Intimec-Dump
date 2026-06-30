/**
 * API client for role permission management operations
 */

export interface AssignPermissionRequest {
  actionId: string;
  justification: string;
  conditionScript?: string;
}

export interface UpdatePermissionRequest {
  justification: string;
  conditionScript?: string;
}

export interface PermissionDetailsResponse {
  permissionId: string;
  actionId: string;
  actionName: string | null;
  roleId: string;
  roleName: string;
  justification: string | null;
  conditionScript: string | null;
  hasConditionalRule: boolean;
  conditionalRuleId: string | null;
}

/**
 * Gets permission details for a specific role and action
 */
export async function getPermissionDetails(
  roleId: string,
  actionId: string
): Promise<PermissionDetailsResponse> {
  const response = await fetch(
    `/api/roles/${roleId}/permissions/${actionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    // For 403 errors, let the global interceptor handle the toast notification
    if (response.status === 403) {
      throw new Error('Access denied');
    }
    
    const errorBody = await response.text();
    throw new Error(
      `Failed to get permission details (${response.status}): ${errorBody || response.statusText}`
    );
  }

  const result = await response.json();
  return result.data; // Extract the 'data' field from the backend response
}

/**
 * Assigns a permission to a role
 */
export async function assignPermissionToRole(
  roleId: string,
  request: AssignPermissionRequest
): Promise<any> {
  const response = await fetch(`/api/roles/${roleId}/permissions/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    // For 403 errors, let the global interceptor handle the toast notification
    // and just return null to prevent duplicate error messages
    if (response.status === 403) {
      return null;
    }
    
    // For other errors, throw as usual
    const errorBody = await response.text();
    throw new Error(
      `Failed to assign permission (${response.status}): ${errorBody || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Updates a permission for a role
 */
export async function updatePermissionForRole(
  roleId: string,
  actionId: string,
  request: UpdatePermissionRequest
): Promise<any> {
  const response = await fetch(
    `/api/roles/${roleId}/permissions/update/${actionId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    // For 403 errors, let the global interceptor handle the toast notification
    if (response.status === 403) {
      return null;
    }
    
    const errorBody = await response.text();
    throw new Error(
      `Failed to update permission (${response.status}): ${errorBody || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Deletes a permission from a role
 */
export async function deletePermissionFromRole(
  roleId: string,
  actionId: string
): Promise<any> {
  const response = await fetch(
    `/api/roles/${roleId}/permissions/delete/${actionId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    // For 403 errors, let the global interceptor handle the toast notification
    if (response.status === 403) {
      return null;
    }
    
    const errorBody = await response.text();
    throw new Error(
      `Failed to delete permission (${response.status}): ${errorBody || response.statusText}`
    );
  }

  return response.json();
}
