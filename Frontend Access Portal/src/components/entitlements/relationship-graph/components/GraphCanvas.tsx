import * as React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import UMLEntitlementNode from "../../UMLEntitlementNode";
import GraphControlPanel from "./GraphControlPanel";
import GraphAIInsights from "./GraphAIInsights";
import { Entitlement } from "../../data/mock-entitlements";
import { ViewMode } from "../types/graph-types";

const nodeTypes = {
  umlEntitlement: UMLEntitlementNode,
};

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  entitlement: Entitlement;
  showPreview: boolean;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  viewMode,
  onViewModeChange,
  entitlement,
  showPreview,
}) => {
  return (
    <div className={cn("relative flex-1", showPreview ? "w-2/3" : "w-full")}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        panOnScroll={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        selectNodesOnDrag={false}
        fitView
        attributionPosition="bottom-left"
        className="bg-slate-50"
      >
        <Background />
        <Controls />

        <GraphControlPanel
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />

        <GraphAIInsights entitlement={entitlement} />
      </ReactFlow>
    </div>
  );
};

export default GraphCanvas;
