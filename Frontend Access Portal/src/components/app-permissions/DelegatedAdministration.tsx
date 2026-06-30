"use client";
import React from "react";
import { DelegationTree } from "./DelegationTree";
import {
  DelegatedAdministrationProvider,
  useDelegatedAdministrationContext,
} from "./contexts/DelegatedAdministrationContext";
import {
  DelegatedAdministrationHeader,
  DelegatedAdministrationFilters,
  ScopeGrid,
  CreateDelegationDialog,
  DelegatedAdministrationDialogs,
} from "./components";
import { createDelegatedAdministrationHandlers } from "./utils/delegatedAdministrationHandlers";
import { flattenNodes } from "./utils/scopeConverters";
import { FEATURES } from "./data/delegatedAdministrationData";

const DelegatedAdministrationContent: React.FC = () => {
  const context = useDelegatedAdministrationContext();
  const {
    filterType,
    viewMode,
    hierarchicalNodes,
    setHierarchicalNodes,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    selectedNodeId,
    setSelectedNodeId,
    setSelectedNode,
    setSelectedScopeForLink,
    setScopeManagerContext,
    setAssignDialogOpen,
    setCreateNodeDialogOpen,
    setMoveNodeDialogOpen,
    setPreviewDialogOpen,
    setNodeDetailsOpen,
    setLinkDialogOpen,
    setScopeManagerOpen,
    setViewMode,
  } = context;

  // Get delegated scopes from hierarchical data
  const delegatedScopes = flattenNodes(hierarchicalNodes);

  const filteredScopes =
    filterType === "all"
      ? delegatedScopes
      : delegatedScopes.filter((scope) => scope.type === filterType);

  // Create handlers
  const handlers = createDelegatedAdministrationHandlers(
    hierarchicalNodes,
    setHierarchicalNodes,
    setSelectedNodeId,
    setSelectedNode,
    setSelectedScopeForLink,
    setScopeManagerContext,
    setAssignDialogOpen,
    setCreateNodeDialogOpen,
    setMoveNodeDialogOpen,
    setPreviewDialogOpen,
    setNodeDetailsOpen,
    setLinkDialogOpen,
    setScopeManagerOpen,
    setViewMode
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <DelegatedAdministrationHeader
        onExportJSON={handlers.handleExportJSON}
        onCreateDelegate={() => setIsCreateDialogOpen(true)}
      />

      {/* Content based on view mode */}
      {FEATURES.delegation.hierarchical && viewMode === "tree" ? (
        <DelegationTree
          nodes={hierarchicalNodes}
          onAssignDelegate={handlers.handleAssignDelegate}
          onCreateSubNode={handlers.handleCreateSubNode}
          onMoveNode={handlers.handleMoveNode}
          onDeleteNode={handlers.handleDeleteNode}
          onPreviewAccess={handlers.handlePreviewAccess}
          onNodeDetails={handlers.handleNodeDetails}
          onManageScope={handlers.handleManageScopeFromTree}
        />
      ) : (
        <>
          {/* Filter */}
          <DelegatedAdministrationFilters />

          {/* Legacy Delegated Scopes */}
          <ScopeGrid
            scopes={filteredScopes}
            onLinkScope={handlers.handleLinkScope}
            onOpenInTree={handlers.handleOpenInTree}
            onEditScope={handlers.handleEditScope}
            onViewDetails={handlers.handleViewDetails}
          />
        </>
      )}

      {/* Create Delegation Dialog */}
      <CreateDelegationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* All other dialogs */}
      <DelegatedAdministrationDialogs
        onDelegateAssignment={(assignment) =>
          handlers.handleDelegateAssignment(assignment, selectedNodeId)
        }
        onCreateNode={handlers.handleCreateNode}
        onMoveNodeConfirm={handlers.handleMoveNodeConfirm}
        onScopeLinked={handlers.handleScopeLinked}
        onSwitchToTree={handlers.handleSwitchToTree}
        onOpenAssignDelegate={handlers.handleAssignDelegate}
        onOpenPreviewAccess={handlers.handlePreviewAccess}
        delegatedScopes={delegatedScopes}
      />
    </div>
  );
};

// Main component with provider
export const DelegatedAdministration: React.FC = () => {
  return (
    <DelegatedAdministrationProvider>
      <DelegatedAdministrationContent />
    </DelegatedAdministrationProvider>
  );
};
