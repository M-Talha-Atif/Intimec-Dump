import { Node, Edge, MarkerType } from "@xyflow/react";
import { Entitlement } from "../../data/mock-entitlements";
import { ViewMode } from "../types/graph-types";

export const generateUMLGraph = (
  selectedEntitlement: Entitlement,
  viewMode: ViewMode,
  allEntitlements: Entitlement[],
  onNodeSelect: (entitlementId: string) => void
) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const processedIds = new Set<string>();

  // Node positioning constants
  const levelSpacing = 200;
  const nodeSpacing = 250;

  const addUMLNode = (nodeEntitlement: Entitlement, x: number, y: number) => {
    if (processedIds.has(nodeEntitlement.id)) return;
    processedIds.add(nodeEntitlement.id);

    // Determine node styling based on risk and type
    const riskLevel =
      nodeEntitlement.riskLevel || nodeEntitlement.risk || "Low";
    const hasHighRisk =
      riskLevel.toLowerCase() === "high" ||
      riskLevel.toLowerCase() === "critical";

    nodes.push({
      id: nodeEntitlement.id,
      type: "umlEntitlement",
      position: { x, y },
      draggable: true,
      data: {
        entitlement: nodeEntitlement,
        riskLevel,
        hasHighRisk,
        isSelected: nodeEntitlement.id === selectedEntitlement.id,
        onSelect: onNodeSelect,
      },
    });

    return { width: 220, height: 140 };
  };

  const buildGraph = (
    currentEntitlement: Entitlement,
    x: number,
    y: number
  ) => {
    addUMLNode(currentEntitlement, x, y);

    if (viewMode === "application") {
      buildApplicationGraph(
        currentEntitlement,
        x,
        y,
        allEntitlements,
        addUMLNode,
        edges,
        nodeSpacing,
        levelSpacing
      );
    } else if (viewMode === "dependencies") {
      buildDependenciesGraph(
        currentEntitlement,
        x,
        y,
        allEntitlements,
        addUMLNode,
        edges,
        nodeSpacing,
        levelSpacing
      );
    } else if (viewMode === "direct") {
      buildDirectGraph(
        currentEntitlement,
        x,
        y,
        allEntitlements,
        addUMLNode,
        edges,
        nodeSpacing
      );
    }
  };

  // Start building from selected entitlement
  buildGraph(selectedEntitlement, 0, 0);

  return { nodes, edges };
};

const buildApplicationGraph = (
  currentEntitlement: Entitlement,
  x: number,
  y: number,
  allEntitlements: Entitlement[],
  addUMLNode: (entitlement: Entitlement, x: number, y: number) => void,
  edges: Edge[],
  nodeSpacing: number,
  levelSpacing: number
) => {
  // Show entitlements from the same application
  const sameAppEntitlements = allEntitlements
    .filter(
      (e) =>
        e.application === currentEntitlement.application &&
        e.id !== currentEntitlement.id
    )
    .slice(0, 4); // Limit to avoid overcrowding

  let childX = x - ((sameAppEntitlements.length - 1) * nodeSpacing) / 2;
  sameAppEntitlements.forEach((relatedEnt) => {
    addUMLNode(relatedEnt, childX, y + levelSpacing);

    // Add application relationship edge
    edges.push({
      id: `e-app-${currentEntitlement.id}-${relatedEnt.id}`,
      source: currentEntitlement.id,
      target: relatedEnt.id,
      type: "smoothstep",
      label: "same app",
      style: { stroke: "#3b82f6" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
    });

    childX += nodeSpacing;
  });
};

const buildDependenciesGraph = (
  currentEntitlement: Entitlement,
  x: number,
  y: number,
  allEntitlements: Entitlement[],
  addUMLNode: (entitlement: Entitlement, x: number, y: number) => void,
  edges: Edge[],
  nodeSpacing: number,
  levelSpacing: number
) => {
  // Show potential dependencies (mock based on similar privilege levels)
  const dependencies = allEntitlements
    .filter(
      (e) =>
        e.id !== currentEntitlement.id &&
        e.privilegeLevel === currentEntitlement.privilegeLevel &&
        e.type === currentEntitlement.type
    )
    .slice(0, 3);

  let childX = x - ((dependencies.length - 1) * nodeSpacing) / 2;
  dependencies.forEach((dep) => {
    addUMLNode(dep, childX, y + levelSpacing);

    // Add dependency edge
    edges.push({
      id: `e-dep-${currentEntitlement.id}-${dep.id}`,
      source: currentEntitlement.id,
      target: dep.id,
      type: "smoothstep",
      label: "similar privilege",
      style: { stroke: "#10b981", strokeDasharray: "5,5" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
    });

    childX += nodeSpacing;
  });
};

const buildDirectGraph = (
  currentEntitlement: Entitlement,
  x: number,
  y: number,
  allEntitlements: Entitlement[],
  addUMLNode: (entitlement: Entitlement, x: number, y: number) => void,
  edges: Edge[],
  nodeSpacing: number
) => {
  // Show only the selected entitlement and its immediate high-risk relationships
  const highRiskRelated = allEntitlements
    .filter(
      (e) =>
        e.id !== currentEntitlement.id &&
        (e.riskLevel === "High" || e.risk === "High") &&
        e.application === currentEntitlement.application
    )
    .slice(0, 2);

  let childX = x + nodeSpacing;
  highRiskRelated.forEach((riskEnt) => {
    addUMLNode(riskEnt, childX, y);

    // Add risk relationship edge
    edges.push({
      id: `e-risk-${currentEntitlement.id}-${riskEnt.id}`,
      source: currentEntitlement.id,
      target: riskEnt.id,
      type: "straight",
      label: "high risk cluster",
      style: { stroke: "#ef4444", strokeDasharray: "5,5" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" },
    });

    childX += nodeSpacing;
  });
};
