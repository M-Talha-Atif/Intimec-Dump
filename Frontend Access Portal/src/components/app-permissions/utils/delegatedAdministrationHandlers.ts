import { toast } from "sonner";
import { EnhancedDelegationInheritanceEngine } from "@/lib/enhanced-delegation-inheritance";
import { treeFocusManager } from "@/lib/delegation/ui/tree-focus";
import type {
  TreeNode,
  DelegatedAdminAssignment,
} from "@/types/hierarchical-delegation";
import type { DelegatedScope } from "@/lib/delegation/bridge/cards-tree-bridge";

export const findNodeById = (
  nodes: TreeNode[],
  id: string
): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
};

export const updateNodeInTree = (
  nodes: TreeNode[],
  nodeId: string,
  updater: (node: TreeNode) => TreeNode
): TreeNode[] => {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return updater(node);
    }
    return {
      ...node,
      children: updateNodeInTree(node.children, nodeId, updater),
    };
  });
};

export const removeNodeFromTree = (
  nodes: TreeNode[],
  targetId: string
): TreeNode[] => {
  return nodes
    .filter((n) => n.id !== targetId)
    .map((n) => ({
      ...n,
      children: removeNodeFromTree(n.children, targetId),
    }));
};

export const addNodeToTree = (
  nodes: TreeNode[],
  parentId: string,
  nodeToAdd: TreeNode
): TreeNode[] => {
  if (!parentId) {
    // Moving to top level
    return [...nodes, { ...nodeToAdd, parentId: undefined }];
  }

  return nodes.map((n) => {
    if (n.id === parentId) {
      return {
        ...n,
        children: [...n.children, { ...nodeToAdd, parentId: parentId }],
      };
    }
    return {
      ...n,
      children: addNodeToTree(n.children, parentId, nodeToAdd),
    };
  });
};

export const createDelegatedAdministrationHandlers = (
  hierarchicalNodes: TreeNode[],
  setHierarchicalNodes: React.Dispatch<React.SetStateAction<TreeNode[]>>,
  setSelectedNodeId: (id: string) => void,
  setSelectedNode: (node: TreeNode | null) => void,
  setSelectedScopeForLink: (scope: DelegatedScope | null) => void,
  setScopeManagerContext: (context: {
    scopeId?: string;
    nodeId?: string;
    defaultTab?: string;
  }) => void,
  setAssignDialogOpen: (open: boolean) => void,
  setCreateNodeDialogOpen: (open: boolean) => void,
  setMoveNodeDialogOpen: (open: boolean) => void,
  setPreviewDialogOpen: (open: boolean) => void,
  setNodeDetailsOpen: (open: boolean) => void,
  setLinkDialogOpen: (open: boolean) => void,
  setScopeManagerOpen: (open: boolean) => void,
  setViewMode: (mode: "tree" | "legacy") => void
) => {
  const handleAssignDelegate = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setAssignDialogOpen(true);
  };

  const handleCreateSubNode = (parentId: string) => {
    setSelectedNodeId(parentId);
    setCreateNodeDialogOpen(true);
  };

  const handleMoveNode = (nodeId: string) => {
    const node = findNodeById(hierarchicalNodes, nodeId);
    setSelectedNode(node);
    setMoveNodeDialogOpen(true);
  };

  const handleDeleteNode = (nodeId: string) => {
    const node = findNodeById(hierarchicalNodes, nodeId);
    if (!node) return;

    if (
      confirm(
        `Are you sure you want to delete "${node.name}" and all its children?`
      )
    ) {
      setHierarchicalNodes((prev) => removeNodeFromTree(prev, nodeId));
      toast.success(`Node "${node.name}" deleted successfully`);
    }
  };

  const handlePreviewAccess = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setPreviewDialogOpen(true);
  };

  const handleNodeDetails = (nodeId: string) => {
    const node = findNodeById(hierarchicalNodes, nodeId);
    setSelectedNode(node);
    setNodeDetailsOpen(true);
  };

  const handleDelegateAssignment = (
    assignment: Omit<
      DelegatedAdminAssignment,
      "id" | "assigned" | "assignedBy"
    >,
    selectedNodeId: string
  ) => {
    const newAssignment: DelegatedAdminAssignment = {
      ...assignment,
      id: `del-${Date.now()}`,
      assigned: new Date().toISOString(),
      assignedBy: "current-user", // Would be actual user in real app
    };

    setHierarchicalNodes((prev) =>
      updateNodeInTree(prev, selectedNodeId, (node) => ({
        ...node,
        delegates: [...node.delegates, newAssignment],
      }))
    );

    toast.success(`Delegate "${assignment.userName}" assigned successfully`);
  };

  const handleCreateNode = (nodeData: {
    name: string;
    type: TreeNode["type"];
    parentId: string;
  }) => {
    const newNode: TreeNode = {
      id: `node-${Date.now()}`,
      name: nodeData.name,
      type: nodeData.type,
      parentId: nodeData.parentId,
      children: [],
      status: "active",
      delegates: [],
      created: new Date().toISOString(),
      userCount: 0,
      applicationsCount: 0,
    };

    setHierarchicalNodes((prev) =>
      updateNodeInTree(prev, nodeData.parentId, (node) => ({
        ...node,
        children: [...node.children, newNode],
      }))
    );

    toast.success(`Node "${nodeData.name}" created successfully`);
  };

  const handleMoveNodeConfirm = (nodeId: string, newParentId: string) => {
    const nodeToMove = findNodeById(hierarchicalNodes, nodeId);
    if (!nodeToMove) return;

    let updatedNodes = removeNodeFromTree(hierarchicalNodes, nodeId);
    updatedNodes = addNodeToTree(updatedNodes, newParentId, nodeToMove);

    setHierarchicalNodes(updatedNodes);
    toast.success(`Node "${nodeToMove.name}" moved successfully`);
  };

  const handleExportJSON = () => {
    const engine = new EnhancedDelegationInheritanceEngine(hierarchicalNodes);
    const jsonData = engine.exportToJSON();

    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delegation-hierarchy-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Hierarchy exported successfully");
  };

  const handleLinkScope = (scope: DelegatedScope) => {
    setSelectedScopeForLink(scope);
    setLinkDialogOpen(true);
  };

  const handleOpenInTree = (scopeId: string) => {
    setViewMode("tree");
    setTimeout(() => {
      treeFocusManager.focusNode(scopeId);
    }, 100);
  };

  const handleEditScope = (scope: DelegatedScope) => {
    setScopeManagerContext({
      scopeId: scope.id,
      defaultTab: "settings",
    });
    setScopeManagerOpen(true);
  };

  const handleViewDetails = (scope: DelegatedScope) => {
    setScopeManagerContext({
      scopeId: scope.id,
      defaultTab: "objects",
    });
    setScopeManagerOpen(true);
  };

  const handleScopeLinked = (scopeId: string, nodeId: string) => {
    console.log(`Scope ${scopeId} linked to node ${nodeId}`);
  };

  const handleSwitchToTree = () => {
    setViewMode("tree");
  };

  const handleManageScopeFromTree = (nodeId: string) => {
    setScopeManagerContext({
      nodeId: nodeId,
      defaultTab: "objects",
    });
    setScopeManagerOpen(true);
  };

  return {
    handleAssignDelegate,
    handleCreateSubNode,
    handleMoveNode,
    handleDeleteNode,
    handlePreviewAccess,
    handleNodeDetails,
    handleDelegateAssignment,
    handleCreateNode,
    handleMoveNodeConfirm,
    handleExportJSON,
    handleLinkScope,
    handleOpenInTree,
    handleEditScope,
    handleViewDetails,
    handleScopeLinked,
    handleSwitchToTree,
    handleManageScopeFromTree,
  };
};
