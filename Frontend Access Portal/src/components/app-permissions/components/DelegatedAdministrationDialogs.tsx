import React from "react";
import EnhancedAssignDelegateDialog from "../dialogs/EnhancedAssignDelegateDialog";
import CreateNodeDialog from "../dialogs/CreateNodeDialog";
import MoveNodeDialog from "../dialogs/MoveNodeDialog";
import { PreviewAccessDialog } from "../dialogs/PreviewAccessDialog";
import { EnhancedNodeDetailsDrawer } from "../dialogs/EnhancedNodeDetailsDrawer";
import { LinkScopeDialog } from "@/components/delegation/LinkScopeDialog";
import { ScopeManagerPanel } from "@/components/delegation/panels/ScopeManagerPanel";
import { cardsTreeBridge } from "@/lib/delegation/bridge/cards-tree-bridge";
import { useDelegatedAdministrationContext } from "../contexts/DelegatedAdministrationContext";
import { findNodeById } from "../utils/delegatedAdministrationHandlers";
import type { DelegatedScope } from "@/lib/delegation/bridge/cards-tree-bridge";

import type {
  DelegatedAdminAssignment,
  TreeNode,
} from "@/types/hierarchical-delegation";

interface DelegatedAdministrationDialogsProps {
  onDelegateAssignment: (
    assignment: Omit<
      DelegatedAdminAssignment,
      "id" | "assigned" | "assignedBy"
    >,
    selectedNodeId: string
  ) => void;
  onCreateNode: (nodeData: {
    name: string;
    type: TreeNode["type"];
    parentId: string;
  }) => void;
  onMoveNodeConfirm: (nodeId: string, newParentId: string) => void;
  onScopeLinked: (scopeId: string, nodeId: string) => void;
  onSwitchToTree: () => void;
  onOpenAssignDelegate: (nodeId: string) => void;
  onOpenPreviewAccess: (nodeId: string) => void;
  delegatedScopes: DelegatedScope[];
}

export const DelegatedAdministrationDialogs: React.FC<
  DelegatedAdministrationDialogsProps
> = ({
  onDelegateAssignment,
  onCreateNode,
  onMoveNodeConfirm,
  onScopeLinked,
  onSwitchToTree,
  onOpenAssignDelegate,
  onOpenPreviewAccess,
  delegatedScopes,
}) => {
  const {
    hierarchicalNodes,
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
    selectedNodeId,
    selectedNode,
    selectedScopeForLink,
    scopeManagerContext,
  } = useDelegatedAdministrationContext();

  const selectedNodeName = selectedNodeId
    ? findNodeById(hierarchicalNodes, selectedNodeId)?.name || ""
    : "";

  return (
    <>
      <EnhancedAssignDelegateDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        nodeId={selectedNodeId}
        nodeName={selectedNodeName}
        onAssign={(assignment) =>
          onDelegateAssignment(assignment, selectedNodeId)
        }
      />

      <CreateNodeDialog
        open={createNodeDialogOpen}
        onOpenChange={setCreateNodeDialogOpen}
        parentId={selectedNodeId}
        parentName={selectedNodeName}
        onCreateNode={onCreateNode}
      />

      <MoveNodeDialog
        open={moveNodeDialogOpen}
        onOpenChange={setMoveNodeDialogOpen}
        node={selectedNode}
        allNodes={hierarchicalNodes}
        onMoveNode={onMoveNodeConfirm}
      />

      <PreviewAccessDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        nodes={hierarchicalNodes}
      />

      <EnhancedNodeDetailsDrawer
        open={nodeDetailsOpen}
        onOpenChange={setNodeDetailsOpen}
        node={selectedNode}
      />

      {selectedScopeForLink && (
        <LinkScopeDialog
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
          scope={selectedScopeForLink}
          treeNodes={hierarchicalNodes}
          onLink={onScopeLinked}
        />
      )}

      <ScopeManagerPanel
        open={scopeManagerOpen}
        onOpenChange={setScopeManagerOpen}
        scopeId={scopeManagerContext.scopeId}
        nodeId={scopeManagerContext.nodeId}
        linkProvider={cardsTreeBridge}
        treeNodes={hierarchicalNodes}
        delegatedScopes={delegatedScopes}
        defaultTab={scopeManagerContext.defaultTab}
        onSwitchToTree={onSwitchToTree}
        onOpenAssignDelegate={onOpenAssignDelegate}
        onOpenPreviewAccess={onOpenPreviewAccess}
      />
    </>
  );
};
