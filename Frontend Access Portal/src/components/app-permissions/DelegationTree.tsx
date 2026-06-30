"use client";
import React, { useState, useEffect, useCallback } from "react";
import { TreeNode } from "@/types/hierarchical-delegation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MoreVertical,
  Info,
  Settings,
  ChevronRight,
  ChevronDown,
  Users,
  Shield,
  Building,
  Globe,
  MapPin,
  Layers,
} from "lucide-react";
import { treeFocusManager } from "@/lib/delegation/ui/tree-focus";
import { cn } from "@/lib/utils";

interface DelegationTreeProps {
  nodes: TreeNode[];
  onAssignDelegate: (nodeId: string) => void;
  onCreateSubNode: (parentId: string) => void;
  onMoveNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onPreviewAccess: (nodeId: string) => void;
  onNodeDetails: (nodeId: string) => void;
  onManageScope?: (nodeId: string) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "organizational":
      return Building;
    case "geographical":
      return Globe;
    case "application":
      return Layers;
    case "identity":
      return Users;
    default:
      return Building;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "organizational":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "geographical":
      return "bg-green-100 text-green-800 border-green-200";
    case "application":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "identity":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "expired":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const DelegationTree = ({
  nodes,
  onAssignDelegate,
  onCreateSubNode,
  onMoveNode,
  onDeleteNode,
  onPreviewAccess,
  onNodeDetails,
  onManageScope,
}: DelegationTreeProps) => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = treeFocusManager.subscribe((nodeId) => {
      setFocusedNodeId(nodeId);
    });

    return () => unsubscribe();
  }, []);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prevExpanded) =>
      prevExpanded.includes(nodeId)
        ? prevExpanded.filter((id) => id !== nodeId)
        : [...prevExpanded, nodeId]
    );
  };

  const isNodeExpanded = useCallback(
    (nodeId: string) => {
      return expandedNodes.includes(nodeId);
    },
    [expandedNodes]
  );

  const handleFocusNode = (nodeId: string) => {
    treeFocusManager.focusNode(nodeId);
  };

  const TreeNodeComponent = ({
    node,
    level = 0,
  }: {
    node: TreeNode;
    level?: number;
  }) => {
    const isExpanded = isNodeExpanded(node.id);
    const hasChildren = node.children.length > 0;
    const TypeIcon = getTypeIcon(node.type);
    const typeColor = getTypeColor(node.type);
    const statusColor = getStatusColor(node.status);

    return (
      <div className={`${level > 0 ? "ml-6" : ""}`}>
        <div
          className={cn(
            "group flex items-center justify-between py-2 px-3 rounded-lg border transition-all duration-200 mb-1",
            " dark:hover:bg-slate-900 hover:border-slate-300",
            focusedNodeId === node.id
              ? "ring-2 ring-blue-500  border-blue-300"
              : "border-slate-200"
          )}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Expand/Collapse Button */}
            <div className="flex-shrink-0">
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 "
                  onClick={() => toggleNode(node.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                </div>
              )}
            </div>

            {/* Node Icon */}
            <div className="flex-shrink-0">
              <div className={cn("p-1.5 rounded", typeColor)}>
                <TypeIcon className="h-4 w-4" />
              </div>
            </div>

            {/* Node Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <button
                  className="font-semibold  hover:text-blue-600 transition-colors text-left truncate"
                  onClick={() => handleFocusNode(node.id)}
                  title={node.name}
                >
                  {node.name}
                </button>
                <Badge
                  variant="outline"
                  className={cn("text-xs px-2 py-0.5 font-medium", typeColor)}
                >
                  {node.type}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("text-xs px-2 py-0.5 font-medium", statusColor)}
                >
                  {node.status}
                </Badge>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{node.delegates?.length || 0} delegates</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>{node.userCount || 0} users</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Layers className="h-3 w-3" />
                  <span>{node.applicationsCount || 0} apps</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onNodeDetails(node.id)}>
                  <Info className="mr-2 h-4 w-4" />
                  Node Details
                </DropdownMenuItem>
                {onManageScope && (
                  <DropdownMenuItem onClick={() => onManageScope(node.id)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Scope
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAssignDelegate(node.id)}>
                  <Users className="mr-2 h-4 w-4" />
                  Assign Delegate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCreateSubNode(node.id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Sub Node
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveNode(node.id)}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Move Node
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteNode(node.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  Delete Node
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onPreviewAccess(node.id)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Preview Access
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="mt-1 border-l-2 border-slate-200 ml-3">
            {node.children.map((child) => (
              <TreeNodeComponent
                key={child.id}
                node={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1 p-2">
      {nodes.map((node) => (
        <TreeNodeComponent key={node.id} node={node} />
      ))}
    </div>
  );
};
