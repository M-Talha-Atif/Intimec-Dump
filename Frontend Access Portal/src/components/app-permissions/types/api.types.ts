/**
 * Type definitions for the Granular Permissions API responses
 */

export interface ActionResponse {
  id: string;
  name: string;
  apiEndpoint: string | null;
  method: string | null;
  hasRole: boolean;
}

export interface PageResponse {
  id: string;
  name: string;
  actions: ActionResponse[];
}

export interface ModuleResponse {
  id: string;
  name: string;
  pages: PageResponse[];
}

export interface RoleResponse {
  id: string;
  roleName: string;
  role: "ADMINISTRATOR" | "REVIEWER" | "OPERATOR" | "VIEWER";
  userCount: number;
}

export interface HierarchicalPermissionsResponse {
  modules: ModuleResponse[];
  availableModules: string[];
  availableRoles: RoleResponse[];
}
