// Mock RBAC implementation for development
type Permission = 'Forms.Edit' | 'Forms.View' | 'Forms.Archive' | 'Forms.Create';

interface User {
  id: string;
  role: string;
  permissions?: Permission[];
}

// Mock user for development
const mockUser: User = {
  id: 'user_1',
  role: 'admin',
  permissions: ['Forms.Edit', 'Forms.View', 'Forms.Archive', 'Forms.Create']
};

export const can = (user: User | null, permission: Permission): boolean => {
  // For development, return true for all permissions
  // In production, this would check actual user permissions
  return true;
};

export const getCurrentUser = (): User => {
  return mockUser;
};

export const requirePermission = (permission: Permission): void => {
  const user = getCurrentUser();
  if (!can(user, permission)) {
    throw new Error(`Access denied: ${permission} permission required`);
  }
};