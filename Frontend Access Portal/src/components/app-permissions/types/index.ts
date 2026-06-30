// Re-export PermissionCell from the main permissions types
export type { PermissionCell } from "@/types/permissions";

// Re-export API types
export * from "./api.types";

export interface Role {
  id: string;
  name: string;
  type: "admin" | "reviewer" | "operator" | "viewer";
  userCount: number;
}

export interface SelectedCell {
  moduleId: string;
  action: string;
  actionId: string; // UUID of the action
}

export interface PermissionMatrixState {
  selectedRole: string;
  searchTerm: string;
  filterGroup: string;
  expandedGroups: Set<string>;
  selectedCells: Set<string>;
  selectedCell: SelectedCell | null;
  bulkEditMode: boolean;
  showTemplates: boolean;
  permissions: Record<
    string,
    Record<string, import("@/types/permissions").PermissionCell>
  >;
}
