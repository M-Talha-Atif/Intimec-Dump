import { useState, useCallback, useEffect } from "react";
import { useNodesState, useEdgesState, Node, Edge } from "@xyflow/react";
import {
  RelationshipGraphProps,
  GraphState,
  ViewMode,
} from "../types/graph-types";
import { generateUMLGraph } from "../utils/graph-generator";

export const useRelationshipGraph = (props: RelationshipGraphProps) => {
  const { entitlement, allEntitlements, onSelectEntitlement } = props;

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[]);
  const [graphState, setGraphState] = useState<GraphState>({
    selectedNode: null,
    viewMode: "application",
    isExpanded: false,
    showPreview: false,
    previewData: null,
  });

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setGraphState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const toggleExpanded = useCallback(() => {
    setGraphState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }));
  }, []);

  const closePreview = useCallback(() => {
    setGraphState((prev) => ({
      ...prev,
      showPreview: false,
      previewData: null,
    }));
  }, []);

  const handleNodeSelect = useCallback(
    (entitlementId: string) => {
      const targetEntitlement = allEntitlements.find(
        (e) => e.id === entitlementId
      );
      if (targetEntitlement) {
        onSelectEntitlement(targetEntitlement);
        setGraphState((prev) => ({
          ...prev,
          selectedNode: entitlementId,
          showPreview: true,
          previewData: targetEntitlement,
        }));
      }
    },
    [allEntitlements, onSelectEntitlement]
  );

  // Generate graph when entitlement or view mode changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateUMLGraph(
      entitlement,
      graphState.viewMode,
      allEntitlements,
      handleNodeSelect
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [
    entitlement,
    graphState.viewMode,
    allEntitlements,
    handleNodeSelect,
    setNodes,
    setEdges,
  ]);

  return {
    // State
    nodes,
    edges,
    graphState,

    // Handlers
    onNodesChange,
    onEdgesChange,
    handleViewModeChange,
    toggleExpanded,
    closePreview,
  };
};
