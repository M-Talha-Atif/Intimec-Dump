import React, { createContext, useContext, ReactNode } from "react";
import { useDelegatedAdministrationState } from "../hooks/useDelegatedAdministrationState";
import type { TreeNode } from "@/types/hierarchical-delegation";
import type { DelegatedScope } from "@/lib/delegation/bridge/cards-tree-bridge";

interface DelegatedAdministrationContextType {
  // Filter and view state
  filterType: string;
  setFilterType: (type: string) => void;
  viewMode: "tree" | "legacy";
  setViewMode: (mode: "tree" | "legacy") => void;

  // Hierarchical data state
  hierarchicalNodes: TreeNode[];
  setHierarchicalNodes: React.Dispatch<React.SetStateAction<TreeNode[]>>;

  // Dialog states
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  assignDialogOpen: boolean;
  setAssignDialogOpen: (open: boolean) => void;
  createNodeDialogOpen: boolean;
  setCreateNodeDialogOpen: (open: boolean) => void;
  moveNodeDialogOpen: boolean;
  setMoveNodeDialogOpen: (open: boolean) => void;
  previewDialogOpen: boolean;
  setPreviewDialogOpen: (open: boolean) => void;
  nodeDetailsOpen: boolean;
  setNodeDetailsOpen: (open: boolean) => void;
  linkDialogOpen: boolean;
  setLinkDialogOpen: (open: boolean) => void;
  scopeManagerOpen: boolean;
  setScopeManagerOpen: (open: boolean) => void;

  // Selection states
  selectedNodeId: string;
  setSelectedNodeId: (id: string) => void;
  selectedNode: TreeNode | null;
  setSelectedNode: (node: TreeNode | null) => void;
  selectedScopeForLink: DelegatedScope | null;
  setSelectedScopeForLink: (scope: DelegatedScope | null) => void;
  scopeManagerContext: {
    scopeId?: string;
    nodeId?: string;
    defaultTab?: string;
  };
  setScopeManagerContext: (context: {
    scopeId?: string;
    nodeId?: string;
    defaultTab?: string;
  }) => void;
}

const DelegatedAdministrationContext = createContext<
  DelegatedAdministrationContextType | undefined
>(undefined);

export const useDelegatedAdministrationContext = () => {
  const context = useContext(DelegatedAdministrationContext);
  if (!context) {
    throw new Error(
      "useDelegatedAdministrationContext must be used within a DelegatedAdministrationProvider"
    );
  }
  return context;
};

interface DelegatedAdministrationProviderProps {
  children: ReactNode;
}

export const DelegatedAdministrationProvider: React.FC<
  DelegatedAdministrationProviderProps
> = ({ children }) => {
  const state = useDelegatedAdministrationState();

  return (
    <DelegatedAdministrationContext.Provider value={state}>
      {children}
    </DelegatedAdministrationContext.Provider>
  );
};
