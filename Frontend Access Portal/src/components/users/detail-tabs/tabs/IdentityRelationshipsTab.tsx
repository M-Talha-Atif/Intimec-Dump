"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  type Connection,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { type User } from "@/data/mock-users";
import { cn } from "@/lib/utils";

// Import shared components
import {
  IdentityRelationshipNode,
  NodeLegend,
  RelationshipLegend,
  GraphControls,
} from "../shared/components";

interface IdentityRelationshipsTabProps {
  user: User;
}

const nodeTypes = {
  identityRelationshipNode: IdentityRelationshipNode,
};

const initialNodes: Node[] = [
  {
    id: "sap-erp-account-1",
    type: "identityRelationshipNode",
    position: { x: 50, y: 50 },
    data: {
      label: "SAP ERP Account",
      type: "account",
      subLabel: "Account",
      riskLevel: "high",
    },
  },
  {
    id: "sap-erp-account-2",
    type: "identityRelationshipNode",
    position: { x: 50, y: 150 },
    data: {
      label: "SAP ERP Account",
      type: "account",
      subLabel: "Account",
      riskLevel: "high",
    },
  },
  {
    id: "sap-erp-app",
    type: "identityRelationshipNode",
    position: { x: 50, y: 250 },
    data: {
      label: "SAP ERP",
      type: "application",
      subLabel: "App",
      riskLevel: "medium",
      conflicts: 1,
    },
  },
  {
    id: "salesforce-account",
    type: "identityRelationshipNode",
    position: { x: 300, y: 50 },
    data: {
      label: "Salesforce Account",
      type: "account",
      subLabel: "Account",
    },
  },
  {
    id: "salesforce-app",
    type: "identityRelationshipNode",
    position: { x: 300, y: 150 },
    data: {
      label: "Salesforce",
      type: "application",
      subLabel: "App",
    },
  },
  {
    id: "office365-account",
    type: "identityRelationshipNode",
    position: { x: 550, y: 50 },
    data: {
      label: "Office 365 Account",
      type: "account",
      subLabel: "Account",
    },
  },
  {
    id: "office365-app",
    type: "identityRelationshipNode",
    position: { x: 550, y: 150 },
    data: {
      label: "Office 365",
      type: "application",
      subLabel: "App",
    },
  },
  {
    id: "aws-console-account",
    type: "identityRelationshipNode",
    position: { x: 800, y: 50 },
    data: {
      label: "AWS Console Account",
      type: "account",
      subLabel: "Account",
    },
  },
  {
    id: "aws-console-app",
    type: "identityRelationshipNode",
    position: { x: 800, y: 150 },
    data: {
      label: "AWS Console",
      type: "application",
      subLabel: "App",
    },
  },
  {
    id: "budget-app",
    type: "identityRelationshipNode",
    position: { x: 800, y: 250 },
    data: {
      label: "Budget Approval",
      type: "role",
      subLabel: "Write",
      riskLevel: "medium",
      conflicts: 1,
    },
  },
  {
    id: "financial-report",
    type: "identityRelationshipNode",
    position: { x: 1050, y: 250 },
    data: {
      label: "Financial Report",
      type: "entitlement",
      subLabel: "Read",
    },
  },
  {
    id: "user-management",
    type: "identityRelationshipNode",
    position: { x: 1300, y: 250 },
    data: {
      label: "User Management",
      type: "role",
      subLabel: "Admin",
      riskLevel: "high",
      conflicts: 1,
    },
  },
  {
    id: "sarah-johnson",
    type: "identityRelationshipNode",
    position: { x: 400, y: 450 },
    data: {
      label: "Sarah Johnson",
      type: "identity",
      subLabel: "Engineering",
      riskLevel: "high",
    },
  },
  {
    id: "finance-manager",
    type: "identityRelationshipNode",
    position: { x: 200, y: 650 },
    data: {
      label: "Finance Manager",
      type: "role",
      subLabel: "Business",
    },
  },
  {
    id: "report-viewer",
    type: "identityRelationshipNode",
    position: { x: 450, y: 650 },
    data: {
      label: "Report Viewer",
      type: "entitlement",
      subLabel: "Functional",
    },
  },
  {
    id: "system-admin",
    type: "identityRelationshipNode",
    position: { x: 700, y: 650 },
    data: {
      label: "System Admin",
      type: "role",
      subLabel: "System",
      riskLevel: "high",
      conflicts: 1,
    },
  },
  {
    id: "sod-conflict",
    type: "identityRelationshipNode",
    position: { x: 800, y: 550 },
    data: {
      label: "SoD Conflict",
      type: "risk",
      subLabel: "Policy",
      riskLevel: "high",
      conflicts: 1,
    },
  },
];

const initialEdges: Edge[] = [
  // Account to App connections
  {
    id: "e-sap-account1-app",
    source: "sap-erp-account-1",
    target: "sap-erp-app",
    type: "smoothstep",
    animated: false,
    style: { strokeWidth: 2, stroke: "#10b981" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
  },
  {
    id: "e-sap-account2-app",
    source: "sap-erp-account-2",
    target: "sap-erp-app",
    type: "smoothstep",
    animated: false,
    style: { strokeWidth: 2, stroke: "#10b981" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
  },
  {
    id: "e-salesforce-account-app",
    source: "salesforce-account",
    target: "salesforce-app",
    type: "smoothstep",
    animated: false,
    style: { strokeWidth: 2, stroke: "#10b981" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
  },
  {
    id: "e-office365-account-app",
    source: "office365-account",
    target: "office365-app",
    type: "smoothstep",
    animated: false,
    style: { strokeWidth: 2, stroke: "#10b981" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
  },
  {
    id: "e-aws-account-app",
    source: "aws-console-account",
    target: "aws-console-app",
    type: "smoothstep",
    animated: false,
    style: { strokeWidth: 2, stroke: "#10b981" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
  },
  // App to Role/Entitlement connections
  {
    id: "e-aws-app-budget",
    source: "aws-console-app",
    target: "budget-app",
    type: "smoothstep",
    animated: false,
    style: { strokeWidth: 2, stroke: "#3b82f6" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
  },
  {
    id: "e-budget-financial",
    source: "budget-app",
    target: "financial-report",
    type: "smoothstep",
    animated: false,
    style: { strokeWidth: 2, stroke: "#8b5cf6" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
  },
  {
    id: "e-financial-user-mgmt",
    source: "financial-report",
    target: "user-management",
    type: "smoothstep",
    animated: false,
    style: { strokeWidth: 2, stroke: "#3b82f6" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
  },
  // Identity connections
  {
    id: "e-sarah-finance",
    source: "sarah-johnson",
    target: "finance-manager",
    type: "smoothstep",
    animated: false,
    style: { strokeWidth: 2, stroke: "#10b981" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
  },
  {
    id: "e-sarah-report",
    source: "sarah-johnson",
    target: "report-viewer",
    type: "smoothstep",
    animated: false,
    style: { strokeWidth: 2, stroke: "#10b981" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
  },
  {
    id: "e-sarah-admin",
    source: "sarah-johnson",
    target: "system-admin",
    type: "smoothstep",
    animated: false,
    style: { strokeWidth: 2, stroke: "#10b981" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
  },
  // Conflict connections
  {
    id: "e-admin-conflict",
    source: "system-admin",
    target: "sod-conflict",
    type: "smoothstep",
    animated: true,
    style: { strokeWidth: 2, stroke: "#ef4444", strokeDasharray: "5,5" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" },
  },
  {
    id: "e-budget-conflict",
    source: "budget-app",
    target: "sod-conflict",
    type: "smoothstep",
    animated: true,
    style: { strokeWidth: 2, stroke: "#ef4444", strokeDasharray: "5,5" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" },
  },
];

const IdentityRelationshipsTab: React.FC<IdentityRelationshipsTabProps> = ({
  user,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<
    "hierarchy" | "direct" | "conflicts"
  >("hierarchy");
  const [filters, setFilters] = useState({
    applications: true,
    roles: true,
    accounts: true,
    entitlements: true,
    sodPolicies: true,
    risks: true,
    activity: true,
    riskyOnly: false,
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleFilterChange = (filterKey: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey as keyof typeof prev],
    }));
  };

  const handleExport = (format: "png" | "json") => {
    if (format === "json") {
      const data = { nodes, edges };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "graph-data.json";
      a.click();
    }
  };

  return (
    <div
      className={cn(
        "relative", // Add relative positioning to contain absolutely positioned children
        isExpanded
          ? "fixed inset-4 z-50 bg-background border rounded-lg shadow-2xl"
          : "h-[600px] w-full"
      )}
    >
      <GraphControls
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(!isExpanded)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
      />

      <div className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-muted/30"
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
            style: {
              strokeWidth: 2,
              stroke: "#3b82f6",
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#3b82f6",
            },
          }}
        >
          <Controls position="bottom-right" />
          <Background color="#e2e8f0" gap={20} size={1} />
        </ReactFlow>

        <div className="absolute bottom-16 left-4 bg-card border rounded-lg shadow-lg p-4 space-y-4 max-w-xs">
          <div>
            <h4 className="font-medium text-sm mb-2">Node Types</h4>
            <NodeLegend />
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">Relationships</h4>
            <RelationshipLegend />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityRelationshipsTab;
