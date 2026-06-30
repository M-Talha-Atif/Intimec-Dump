"use client";
import React, { useState, useEffect } from "react";
import { TreeNode } from "@/types/hierarchical-delegation";
import { DelegatedScope } from "@/lib/delegation/bridge/cards-tree-bridge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LinkIcon, ExternalLink, Info } from "lucide-react";
import { LinkScopeDialog } from "../LinkScopeDialog";
import { ScopeOverviewTab } from "./tabs/ScopeOverviewTab";
import { ScopeSettingsTab } from "./tabs/ScopeSettingsTab";
import { ScopeObjectsTab } from "./tabs/ScopeObjectsTab";
import { ScopeDelegatesTab } from "./tabs/ScopeDelegatesTab";
import { ScopeAuditTab } from "./tabs/ScopeAuditTab";
import { useNodeContext } from "@/lib/delegation/hooks/useNodeContext";
import { toast } from "sonner";

interface LinkProvider {
  getLinkedNodeId(scopeId: string): string | undefined;
  linkScopeToNode(scopeId: string, nodeId: string): void;
}

interface ScopeManagerPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scopeId?: string;
  nodeId?: string;
  linkProvider: LinkProvider;
  treeNodes: TreeNode[];
  delegatedScopes?: DelegatedScope[];
  defaultTab?: string;
  onSwitchToTree?: () => void;
  onOpenAssignDelegate?: (nodeId: string) => void;
  onOpenPreviewAccess?: (nodeId: string) => void;
}

export function ScopeManagerPanel({
  open,
  onOpenChange,
  scopeId,
  nodeId: initialNodeId,
  linkProvider,
  treeNodes,
  delegatedScopes = [],
  defaultTab = "overview",
  onSwitchToTree,
  onOpenAssignDelegate,
  onOpenPreviewAccess,
}: ScopeManagerPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [effectiveNodeId, setEffectiveNodeId] = useState<string | undefined>(
    initialNodeId
  );

  // Get the scope data if we have a scopeId
  const scope = scopeId
    ? delegatedScopes.find((s) => s.id === scopeId)
    : undefined;

  // Check if scope is linked to a node
  const linkedNodeId = scopeId
    ? linkProvider.getLinkedNodeId(scopeId)
    : undefined;
  const isLinked = Boolean(linkedNodeId);

  // Use linked node if available, otherwise fall back to initial nodeId
  const workingNodeId = linkedNodeId || effectiveNodeId;

  const { node } = useNodeContext(workingNodeId, treeNodes);

  // Update effective node ID when props change
  useEffect(() => {
    if (linkedNodeId) {
      setEffectiveNodeId(linkedNodeId);
    } else if (initialNodeId) {
      setEffectiveNodeId(initialNodeId);
    }
  }, [linkedNodeId, initialNodeId]);

  // Reset tab when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  const handleLinkScope = () => {
    if (!scope) return;
    setLinkDialogOpen(true);
  };

  const handleScopeLinked = (newScopeId: string, newNodeId: string) => {
    setEffectiveNodeId(newNodeId);
    setLinkDialogOpen(false);
    toast.success(`Scope "${scope?.name}" linked to tree node successfully`);
  };

  const handleOpenInTree = () => {
    if (workingNodeId && onSwitchToTree) {
      onSwitchToTree();
      // Focus the node in tree
      setTimeout(() => {
        import("@/lib/delegation/ui/tree-focus").then(
          ({ treeFocusManager }) => {
            treeFocusManager.focusNode(workingNodeId);
          }
        );
      }, 100);
    }
  };

  const getTitle = () => {
    if (scope && node) {
      return `${scope.name} (${node.name})`;
    }
    if (scope) {
      return scope.name;
    }
    if (node) {
      return node.name;
    }
    return "Scope Manager";
  };

  const showLinkBanner = scopeId && !isLinked;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[80vw] max-w-none sm:max-w-none">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>{getTitle()}</SheetTitle>
              <div className="flex items-center gap-2">
                {isLinked && (
                  <Badge variant="secondary" className="text-xs">
                    <LinkIcon className="h-3 w-3 mr-1" />
                    Linked to Tree
                  </Badge>
                )}
                {workingNodeId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenInTree}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in Tree
                  </Button>
                )}
              </div>
            </div>
          </SheetHeader>

          {showLinkBanner && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Link this scope to a Tree node to manage objects and settings
                </span>
                <Button variant="outline" size="sm" onClick={handleLinkScope}>
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Link to Tree
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="settings" disabled={!workingNodeId}>
                  Settings
                </TabsTrigger>
                <TabsTrigger value="objects" disabled={!workingNodeId}>
                  Objects
                </TabsTrigger>
                <TabsTrigger value="delegates" disabled={!workingNodeId}>
                  Delegates
                </TabsTrigger>
                <TabsTrigger value="audit" disabled={!workingNodeId}>
                  Audit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <ScopeOverviewTab
                  scope={scope}
                  node={node}
                  isLinked={isLinked}
                  onOpenInTree={handleOpenInTree}
                  onLinkScope={handleLinkScope}
                />
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                {workingNodeId && (
                  <ScopeSettingsTab
                    nodeId={workingNodeId}
                    node={node}
                    treeNodes={treeNodes}
                  />
                )}
              </TabsContent>

              <TabsContent value="objects" className="mt-4">
                {workingNodeId && (
                  <ScopeObjectsTab nodeId={workingNodeId} node={node} />
                )}
              </TabsContent>

              <TabsContent value="delegates" className="mt-4">
                {workingNodeId && (
                  <ScopeDelegatesTab
                    nodeId={workingNodeId}
                    node={node}
                    onAssignDelegate={onOpenAssignDelegate}
                    onPreviewAccess={onOpenPreviewAccess}
                  />
                )}
              </TabsContent>

              <TabsContent value="audit" className="mt-4">
                {workingNodeId && (
                  <ScopeAuditTab nodeId={workingNodeId} node={node} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {scope && (
        <LinkScopeDialog
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
          scope={scope}
          treeNodes={treeNodes}
          onLink={handleScopeLinked}
        />
      )}
    </>
  );
}
