import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import { type User } from "@/data/mock-users";
import { FilterState, ViewMode, NodeDetailsData, NodeType } from "../types";

export const useExpandableRows = <T extends { id: string }>(items: T[]) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isExpanded = (id: string) => expandedRows.has(id);

  const expandAll = () => {
    setExpandedRows(new Set(items.map((item) => item.id)));
  };

  const collapseAll = () => {
    setExpandedRows(new Set());
  };

  return {
    expandedRows,
    toggleRow,
    isExpanded,
    expandAll,
    collapseAll,
  };
};

export const useTabData = <T>(
  data: T[],
  searchTerm?: string,
  filterFn?: (item: T, term: string) => boolean
) => {
  const filteredData = useMemo(() => {
    if (!searchTerm || !filterFn) return data;
    return data.filter((item) => filterFn(item, searchTerm));
  }, [data, searchTerm, filterFn]);

  return {
    data: filteredData,
    count: filteredData.length,
    hasData: filteredData.length > 0,
  };
};

// Identity Relationships Tab Hook
export const useIdentityRelationships = (user: User) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedNodeData, setSelectedNodeData] =
    useState<NodeDetailsData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("hierarchy");
  const [filters, setFilters] = useState<FilterState>({
    applications: true,
    roles: true,
    entitlements: true,
    accounts: true,
    risks: true,
    sodPolicies: true,
    activity: true,
    riskyOnly: false,
  });

  const generateGraphData = useCallback(() => {
    console.log("🔄 Generating graph data with filters:", filters);

    const mockNodes: Node[] = [
      // Central identity node
      {
        id: "identity-main",
        type: "identityRelationshipNode",
        position: { x: 400, y: 300 },
        data: {
          id: "identity-main",
          type: "identity" as NodeType,
          label: user.name,
          subtitle: user.department,
          riskLevel: user.riskLevel?.toLowerCase() || "low",
          isSelected: false,
          onSelect: (
            id: string,
            type: string,
            nodeData: Record<string, unknown>
          ) => {
            console.log("👤 Selected identity node:", id);
            setSelectedNodeData({
              id,
              type: "identity" as NodeType,
              label: nodeData.label as string,
              subtitle: nodeData.subtitle as string,
              riskLevel: nodeData.riskLevel as string,
              riskCount: nodeData.riskCount as number,
              conflictCount: nodeData.conflictCount as number,
              metadata: {
                department: user.department,
                type: user.type,
                status: user.status,
                manager: user.manager || "N/A",
                applicationCount: 4,
                roleCount: 3,
                entitlementCount: 8,
                lastLogin: "2 days ago",
                employeeId: user.id,
              },
            });
          },
        },
      },
    ];

    const mockEdges: Edge[] = [];
    let nodeIndex = 1;

    // Store node IDs for creating relationships
    const appNodeIds: string[] = [];
    // const roleNodeIds: string[] = [];
    // const entitlementNodeIds: string[] = [];
    const accountNodeIds: string[] = [];

    // Add application nodes if filter enabled
    if (filters.applications) {
      const apps = [
        { name: "SAP ERP", risk: "high", accounts: 2 },
        { name: "Salesforce", risk: "low", accounts: 1 },
        { name: "Office 365", risk: "low", accounts: 1 },
        { name: "AWS Console", risk: "medium", accounts: 1 },
      ];

      apps.forEach((app, index) => {
        if (filters.riskyOnly && app.risk === "low") return;

        const nodeId = `app-${nodeIndex++}`;
        appNodeIds.push(nodeId);
        mockNodes.push({
          id: nodeId,
          type: "identityRelationshipNode",
          position: { x: 100 + index * 200, y: 100 },
          data: {
            id: nodeId,
            type: "application" as NodeType,
            label: app.name,
            subtitle: "App",
            riskLevel: app.risk,
            riskCount: app.risk === "high" ? 2 : undefined,
            onSelect: (
              id: string,
              type: string,
              nodeData: Record<string, unknown>
            ) => {
              console.log("🖥️ Selected application node:", id);
              setSelectedNodeData({
                id,
                type: "application" as NodeType,
                label: nodeData.label as string,
                subtitle: nodeData.subtitle as string,
                riskLevel: nodeData.riskLevel as string,
                riskCount: nodeData.riskCount as number,
                metadata: {
                  accountCount: app.accounts,
                  orphanCount: app.risk === "high" ? 1 : 0,
                  lastSync: "1 day ago",
                  owner: "IT Security",
                  riskReason: "Unreviewed privileged access",
                },
              });
            },
          },
        });

        // Edge from identity to application
        mockEdges.push({
          id: `edge-identity-${nodeId}`,
          source: "identity-main",
          target: nodeId,
          type: "smoothstep",
          label: "access",
          style: {
            stroke: "#3b82f6",
            strokeWidth: 2,
            strokeDasharray: undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#3b82f6",
            width: 20,
            height: 20,
          },
          labelStyle: {
            fontSize: "11px",
            fontWeight: "600",
            fill: "#1e40af",
            backgroundColor: "white",
            padding: "2px 4px",
            borderRadius: "4px",
          },
        });

        // Add account nodes if accounts filter is enabled
        if (filters.accounts) {
          for (let i = 0; i < app.accounts; i++) {
            const accountId = `account-${nodeId}-${i}`;
            accountNodeIds.push(accountId);
            mockNodes.push({
              id: accountId,
              type: "identityRelationshipNode",
              position: { x: 100 + index * 200, y: 50 - i * 40 },
              data: {
                id: accountId,
                type: "account" as NodeType,
                label: `${app.name} Acc ${i + 1}`,
                subtitle: "Account",
                riskLevel: app.risk,
                onSelect: (
                  id: string,
                  type: string,
                  nodeData: Record<string, unknown>
                ) => {
                  console.log("👥 Selected account node:", id);
                  setSelectedNodeData({
                    id,
                    type: "account" as NodeType,
                    label: nodeData.label as string,
                    subtitle: nodeData.subtitle as string,
                    riskLevel: nodeData.riskLevel as string,
                    metadata: {
                      application: app.name,
                      username: `${user.name.toLowerCase().replace(" ", ".")}.${
                        i + 1
                      }`,
                      status: "Active",
                      lastLogin: i === 0 ? "1 day ago" : "5 days ago",
                      source: "HR Sync",
                      entitlementCount: 3,
                    },
                  });
                },
              },
            });

            // Edge from application to account
            mockEdges.push({
              id: `edge-${nodeId}-${accountId}`,
              source: nodeId,
              target: accountId,
              type: "smoothstep",
              label: "owns",
              style: {
                stroke: "#8b5cf6",
                strokeWidth: 1.5,
                strokeDasharray: undefined,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#8b5cf6",
                width: 15,
                height: 15,
              },
              labelStyle: {
                fontSize: "10px",
                fill: "#7c3aed",
                fontWeight: "600",
              },
            });
          }
        }
      });
    }

    // Add role nodes if filter enabled
    if (filters.roles) {
      const roles = [
        { name: "Finance Manager", risk: "medium", type: "Business", users: 5 },
        { name: "Report Viewer", risk: "low", type: "Functional", users: 20 },
        { name: "System Admin", risk: "high", type: "System", users: 3 },
      ];

      roles.forEach((role, index) => {
        if (filters.riskyOnly && role.risk === "low") return;

        const nodeId = `role-${nodeIndex++}`;
        // roleNodeIds.push(nodeId);
        mockNodes.push({
          id: nodeId,
          type: "identityRelationshipNode",
          position: { x: 150 + index * 200, y: 500 },
          data: {
            id: nodeId,
            type: "role" as NodeType,
            label: role.name,
            subtitle: role.type,
            riskLevel: role.risk,
            conflictCount: role.name === "System Admin" ? 1 : undefined,
            onSelect: (
              id: string,
              type: string,
              nodeData: Record<string, unknown>
            ) => {
              console.log("🎭 Selected role node:", id);
              setSelectedNodeData({
                id,
                type: "role" as NodeType,
                label: nodeData.label as string,
                subtitle: nodeData.subtitle as string,
                riskLevel: nodeData.riskLevel as string,
                conflictCount: nodeData.conflictCount as number,
                metadata: {
                  roleType: role.type,
                  userCount: role.users,
                  entitlementCount: role.risk === "high" ? 8 : 4,
                  lastReview:
                    role.risk === "high" ? "3 months ago" : "1 month ago",
                  assignmentSource: "HR System",
                },
              });
            },
          },
        });

        // Edge from identity to role
        mockEdges.push({
          id: `edge-identity-${nodeId}`,
          source: "identity-main",
          target: nodeId,
          type: "smoothstep",
          label: index === 0 ? "assigned" : "inherited",
          style: {
            stroke: index === 0 ? "#10b981" : "#8b5cf6",
            strokeWidth: 2,
            strokeDasharray: index === 0 ? undefined : "5,5",
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: index === 0 ? "#10b981" : "#8b5cf6",
            width: 20,
            height: 20,
          },
          labelStyle: {
            fontSize: "11px",
            fontWeight: "600",
            fill: index === 0 ? "#059669" : "#7c3aed",
          },
        });
      });
    }

    // Add entitlement nodes if filter enabled
    if (filters.entitlements) {
      const entitlements = [
        {
          name: "Budget Approval",
          risk: "high",
          privilege: "Write",
          fromRole: true,
        },
        {
          name: "Financial Reports",
          risk: "low",
          privilege: "Read",
          fromRole: false,
        },
        {
          name: "User Management",
          risk: "high",
          privilege: "Admin",
          fromRole: true,
        },
      ];

      entitlements.forEach((entitlement, index) => {
        if (filters.riskyOnly && entitlement.risk === "low") return;

        const nodeId = `ent-${nodeIndex++}`;
        // entitlementNodeIds.push(nodeId);
        mockNodes.push({
          id: nodeId,
          type: "identityRelationshipNode",
          position: { x: 700 + index * 180, y: 150 },
          data: {
            id: nodeId,
            type: "entitlement" as NodeType,
            label: entitlement.name,
            subtitle: entitlement.privilege,
            riskLevel: entitlement.risk,
            riskCount: entitlement.risk === "high" ? 1 : undefined,
            onSelect: (
              id: string,
              type: string,
              nodeData: Record<string, unknown>
            ) => {
              console.log("🔑 Selected entitlement node:", id);
              setSelectedNodeData({
                id,
                type: "entitlement" as NodeType,
                label: nodeData.label as string,
                subtitle: nodeData.subtitle as string,
                riskLevel: nodeData.riskLevel as string,
                riskCount: nodeData.riskCount as number,
                metadata: {
                  privilegeLevel: entitlement.privilege,
                  source: entitlement.fromRole
                    ? "Role Assignment"
                    : "Direct Assignment",
                  userCount: entitlement.risk === "high" ? 3 : 8,
                  appCount: 1,
                  lastUsed:
                    entitlement.risk === "high" ? "1 day ago" : "1 week ago",
                },
              });
            },
          },
        });

        // Edge from identity to entitlement (if direct)
        if (!entitlement.fromRole) {
          mockEdges.push({
            id: `edge-identity-${nodeId}`,
            source: "identity-main",
            target: nodeId,
            type: "smoothstep",
            label: "grants",
            style: {
              stroke: "#10b981",
              strokeWidth: 2,
              strokeDasharray: undefined,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#10b981",
              width: 20,
              height: 20,
            },
            labelStyle: {
              fontSize: "11px",
              fontWeight: "600",
              fill: "#059669",
            },
          });
        }
      });
    }

    // Add risk/SoD conflict nodes if filter enabled
    if (filters.sodPolicies || filters.risks) {
      const riskNodeId = `risk-${nodeIndex++}`;
      mockNodes.push({
        id: riskNodeId,
        type: "identityRelationshipNode",
        position: { x: 700, y: 450 },
        data: {
          id: riskNodeId,
          type: "risk" as NodeType,
          label: "SoD Conflict",
          subtitle: "Policy",
          riskLevel: "high",
          riskCount: 2,
          conflictCount: 1,
          onSelect: (
            id: string,
            type: string,
            nodeData: Record<string, unknown>
          ) => {
            console.log("⚠️ Selected risk node:", id);
            setSelectedNodeData({
              id,
              type: "risk" as NodeType,
              label: nodeData.label as string,
              subtitle: nodeData.subtitle as string,
              riskLevel: nodeData.riskLevel as string,
              riskCount: nodeData.riskCount as number,
              conflictCount: nodeData.conflictCount as number,
              metadata: {
                conflictDescription:
                  "both approve budgets and process payments",
                involvedEntitlements: "Budget Approval + Payment Processing",
                policyName: "Financial SoD Policy",
                remediation:
                  "Remove Budget Approval or implement compensating controls",
                detectedDate: "3 days ago",
              },
            });
          },
        },
      });

      // Edge from identity to risk (conflict) - RED DASHED
      mockEdges.push({
        id: `edge-identity-${riskNodeId}`,
        source: "identity-main",
        target: riskNodeId,
        type: "straight",
        label: "violates",
        style: {
          stroke: "#ef4444",
          strokeWidth: 2,
          strokeDasharray: "8,4",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#ef4444",
          width: 20,
          height: 20,
        },
        labelStyle: {
          fontSize: "11px",
          fontWeight: "600",
          fill: "#dc2626",
        },
      });
    }

    console.log("Generated nodes:", mockNodes.length);
    console.log("Generated edges:", mockEdges.length);
    console.log(
      "Edge details:",
      mockEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
      }))
    );

    // Add a simple test edge to ensure basic connectivity works
    if (mockNodes.length >= 2) {
      const testEdge = {
        id: "test-edge-simple",
        source: mockNodes[0].id,
        target: mockNodes[1].id,
        type: "straight",
        style: {
          stroke: "#ff0000",
          strokeWidth: 4,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#ff0000",
        },
      };
      mockEdges.push(testEdge);
      console.log("Added test edge:", testEdge);
    }

    setNodes(mockNodes);
    setEdges(mockEdges);
  }, [user, filters, setNodes, setEdges]);

  // Auto-generate graph data when component mounts or filters change
  useEffect(() => {
    generateGraphData();
  }, [generateGraphData]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleFilterChange = (filterKey: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const closeNodeDetails = () => {
    setSelectedNodeData(null);
  };

  return {
    // Flow state
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,

    // UI state
    isExpanded,
    selectedNodeData,
    viewMode,
    filters,

    // Actions
    generateGraphData,
    toggleExpanded,
    handleFilterChange,
    setViewMode,
    closeNodeDetails,
  };
};
