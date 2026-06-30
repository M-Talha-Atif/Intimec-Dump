import { useState } from "react";
import type { TreeNode } from "@/types/hierarchical-delegation";
import type { DelegatedScope } from "@/lib/delegation/bridge/cards-tree-bridge";
import {
  initialHierarchicalData,
  VIEW_MODES,
} from "../data/delegatedAdministrationData";

export const useDelegatedAdministrationState = () => {
  // Filter and view state
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<"tree" | "legacy">(VIEW_MODES.TREE);

  // Hierarchical data state
  const [hierarchicalNodes, setHierarchicalNodes] = useState<TreeNode[]>(
    initialHierarchicalData
  );

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [createNodeDialogOpen, setCreateNodeDialogOpen] = useState(false);
  const [moveNodeDialogOpen, setMoveNodeDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [nodeDetailsOpen, setNodeDetailsOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [scopeManagerOpen, setScopeManagerOpen] = useState(false);

  // Selection states
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [selectedScopeForLink, setSelectedScopeForLink] =
    useState<DelegatedScope | null>(null);
  const [scopeManagerContext, setScopeManagerContext] = useState<{
    scopeId?: string;
    nodeId?: string;
    defaultTab?: string;
  }>({});

  return {
    // Filter and view state
    filterType,
    setFilterType,
    viewMode,
    setViewMode,

    // Hierarchical data state
    hierarchicalNodes,
    setHierarchicalNodes,

    // Dialog states
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    assignDialogOpen,
    setAssignDialogOpen,
    createNodeDialogOpen,
    setCreateNodeDialogOpen,
    moveNodeDialogOpen,
    setMoveNodeDialogOpen,
    previewDialogOpen,
    setPreviewDialogOpen,
    nodeDetailsOpen,
    setNodeDetailsOpen,
    linkDialogOpen,
    setLinkDialogOpen,
    scopeManagerOpen,
    setScopeManagerOpen,

    // Selection states
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    setSelectedNode,
    selectedScopeForLink,
    setSelectedScopeForLink,
    scopeManagerContext,
    setScopeManagerContext,
  };
};
