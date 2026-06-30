import { getCurrentUser } from "@/lib/rbac";

export interface RbacAction {
  action: string;
  resource: string;
}

// Mock RBAC implementation - in production, this would check actual permissions
export const useRbac = () => {
  const user = getCurrentUser();

  const can = (action: string, resource: string): boolean => {
    // For development, return true for most actions
    // In production, this would check actual user permissions against the resource
    return true;
  };

  const canBulk = (action: string, resource: string, count: number): boolean => {
    return can(action, resource);
  };

  return { can, canBulk, user };
};
