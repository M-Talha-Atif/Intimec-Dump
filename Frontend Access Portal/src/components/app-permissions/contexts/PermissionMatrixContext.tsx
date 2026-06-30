"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { usePermissionMatrix } from "../hooks";
import { PermissionCell, SelectedCell, Role } from "../types";

export interface PermissionMatrixContextType {
  // State
  selectedRole: string;
  searchTerm: string;
  filterGroup: string;
  expandedGroups: Set<string>;
  selectedCells: Set<string>;
  selectedCell: SelectedCell | null;
  bulkEditMode: boolean;
  bulkMode: "assign" | "revoke" | "";
  showTemplates: boolean;
  showBulkDialog: boolean;
  permissions: Record<string, Record<string, PermissionCell>>;
  allActions: string[];
  filteredModules: Array<{
    group: string;
    modules: Array<{
      moduleId: string;
      label: string;
      actions: string[];
    }>;
  }>;
  groups: string[];
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  actionNameToIdMap: Map<string, string>;
  modules: any[];

  // Actions
  setSelectedRole: (role: string) => void;
  setSearchTerm: (term: string) => void;
  setFilterGroup: (group: string) => void;
  setBulkEditMode: (mode: boolean) => void;
  setBulkMode: (mode: "assign" | "revoke" | "") => void;
  setShowTemplates: (show: boolean) => void;
  setSelectedCells: (cells: Set<string>) => void;
  toggleGroup: (groupName: string) => void;
  handleCellClick: (moduleId: string, action: string) => void;
  handleSelectAllForModule: (moduleId: string, moduleActions: string[]) => void;
  clearSelectedCells: () => void;
  closeSelectedCell: () => void;
  openBulkDialog: () => void;
  closeBulkDialog: () => void;
  savePermissionRule: (
    rule: import("@/types/permissions").RolePolicyRule
  ) => void;
  applyTemplate: (templateId: string) => void;
  refetch: () => Promise<void>;
  fetchPermissionsForRole: (roleId: string) => Promise<any[]>;
}

const PermissionMatrixContext = createContext<
  PermissionMatrixContextType | undefined
>(undefined);

export interface PermissionMatrixProviderProps {
  children: ReactNode;
}

export const PermissionMatrixProvider: React.FC<
  PermissionMatrixProviderProps
> = ({ children }) => {
  const matrixHook = usePermissionMatrix();

  return (
    <PermissionMatrixContext.Provider
      value={{
        ...matrixHook,
      }}
    >
      {children}
    </PermissionMatrixContext.Provider>
  );
};

export const usePermissionMatrixContext = (): PermissionMatrixContextType => {
  const context = useContext(PermissionMatrixContext);
  if (context === undefined) {
    throw new Error(
      "usePermissionMatrixContext must be used within a PermissionMatrixProvider"
    );
  }
  return context;
};
