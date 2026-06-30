import * as React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Edge,
  Node,
  Panel,
  MarkerType,
} from "@xyflow/react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Maximize2,
  Minimize2,
  Zap,
  Network,
  GitMerge,
  Target,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import UMLEntitlementNode from "./UMLEntitlementNode";
import EntitlementPreviewPanel from "./EntitlementPreviewPanel";

interface EntitlementRelationshipGraphProps {
  entitlement: EntitlementResponseDto;
  allEntitlements: EntitlementResponseDto[];
  onSelectEntitlement: (entitlement: EntitlementResponseDto) => void;
}

const nodeTypes = {
  umlEntitlement: UMLEntitlementNode,
};

type ViewMode = "direct" | "application" | "dependencies";

interface GraphState {
  selectedNode: string | null;
  viewMode: ViewMode;
  isExpanded: boolean;
  showPreview: boolean;
  previewData: EntitlementResponseDto | null;
}

const EntitlementRelationshipGraph: React.FC<
  EntitlementRelationshipGraphProps
> = ({ entitlement, allEntitlements, onSelectEntitlement }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [graphState, setGraphState] = React.useState<GraphState>({
    selectedNode: null,
    viewMode: "application",
    isExpanded: false,
    showPreview: false,
    previewData: null,
  });

  const generateUMLGraph = React.useCallback(
    (
      selectedEntitlement: EntitlementResponseDto,
      viewMode: ViewMode
    ) => {
      const graphNodes: Node[] = [];
      const graphEdges: Edge[] = [];
      const processedIds = new Set<string>();

      const levelSpacing = 200;
      const nodeSpacing = 250;

      const addUMLNode = (
        nodeEntitlement: EntitlementResponseDto,
        x: number,
        y: number
      ) => {
        if (processedIds.has(nodeEntitlement.id)) return;
        processedIds.add(nodeEntitlement.id);

        // REAL: riskLevel field; MOCK fallback "Low"
        const riskLevel = nodeEntitlement.riskLevel ?? "Low";
        const hasHighRisk =
          riskLevel.toLowerCase() === "high" ||
          riskLevel.toLowerCase() === "critical";

        graphNodes.push({
          id: nodeEntitlement.id,
          type: "umlEntitlement",
          position: { x, y },
          data: {
            entitlement: nodeEntitlement,
            riskLevel,
            hasHighRisk,
            isSelected: nodeEntitlement.id === selectedEntitlement.id,
            onSelect: (entitlementId: string) => {
              const target = allEntitlements.find(
                (e) => e.id === entitlementId
              );
              if (target) {
                onSelectEntitlement(target);
                setGraphState((prev) => ({
                  ...prev,
                  selectedNode: entitlementId,
                  showPreview: true,
                  previewData: target,
                }));
              }
            },
          },
        });
      };

      const buildGraph = (
        current: EntitlementResponseDto,
        x: number,
        y: number
      ) => {
        addUMLNode(current, x, y);

        if (viewMode === "application") {
          // REAL: related by resourceId (same resource = same app equivalent)
          const related = allEntitlements
            .filter(
              (e) =>
                e.id !== current.id &&
                (e.resourceId === current.resourceId ||
                  (e.resourceName &&
                    e.resourceName === current.resourceName &&
                    e.resourceName !== "Unknown"))
            )
            .slice(0, 4);

          let childX =
            x - ((related.length - 1) * nodeSpacing) / 2;
          related.forEach((relatedEnt) => {
            if (!processedIds.has(relatedEnt.id)) {
              addUMLNode(relatedEnt, childX, y + levelSpacing);
              graphEdges.push({
                id: `e-app-${current.id}-${relatedEnt.id}`,
                source: current.id,
                target: relatedEnt.id,
                type: "smoothstep",
                label: "same resource",
                style: { stroke: "#3b82f6" },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: "#3b82f6",
                },
              });
            }
            childX += nodeSpacing;
          });
        } else if (viewMode === "dependencies") {
          // REAL: similar privilege level + objectClass as proxy for dependencies
          const deps = allEntitlements
            .filter(
              (e) =>
                e.id !== current.id &&
                e.privilegeLevel === current.privilegeLevel &&
                e.objectClass === current.objectClass
            )
            .slice(0, 3);

          let childX = x - ((deps.length - 1) * nodeSpacing) / 2;
          deps.forEach((dep) => {
            if (!processedIds.has(dep.id)) {
              addUMLNode(dep, childX, y + levelSpacing);
              graphEdges.push({
                id: `e-dep-${current.id}-${dep.id}`,
                source: current.id,
                target: dep.id,
                type: "smoothstep",
                label: "similar privilege",
                style: { stroke: "#10b981", strokeDasharray: "5,5" },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: "#10b981",
                },
              });
            }
            childX += nodeSpacing;
          });
        } else if (viewMode === "direct") {
          // REAL: high-risk entitlements in the same resource
          const highRisk = allEntitlements
            .filter(
              (e) =>
                e.id !== current.id &&
                e.riskLevel?.toLowerCase() === "high" &&
                e.resourceId === current.resourceId
            )
            .slice(0, 2);

          let childX = x + nodeSpacing;
          highRisk.forEach((riskEnt) => {
            if (!processedIds.has(riskEnt.id)) {
              addUMLNode(riskEnt, childX, y);
              graphEdges.push({
                id: `e-risk-${current.id}-${riskEnt.id}`,
                source: current.id,
                target: riskEnt.id,
                type: "straight",
                label: "high risk cluster",
                style: { stroke: "#ef4444", strokeDasharray: "5,5" },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: "#ef4444",
                },
              });
            }
            childX += nodeSpacing;
          });
        }
      };

      buildGraph(selectedEntitlement, 0, 0);
      return { nodes: graphNodes, edges: graphEdges };
    },
    [allEntitlements, onSelectEntitlement]
  );

  React.useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateUMLGraph(
      entitlement,
      graphState.viewMode
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [entitlement, graphState.viewMode, generateUMLGraph]);

  const handleViewModeChange = (mode: ViewMode) => {
    setGraphState((prev) => ({ ...prev, viewMode: mode }));
  };

  const toggleExpanded = () => {
    setGraphState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }));
  };

  const closePreview = () => {
    setGraphState((prev) => ({
      ...prev,
      showPreview: false,
      previewData: null,
    }));
  };

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case "direct":
        return <Target className="h-4 w-4" />;
      case "application":
        return <Network className="h-4 w-4" />;
      case "dependencies":
        return <GitMerge className="h-4 w-4" />;
    }
  };

  // REAL: riskLevel for AI alert panel
  const isHighRisk = entitlement.riskLevel?.toLowerCase() === "high";

  return (
    <div
      className={cn(
        "relative transition-all duration-300",
        graphState.isExpanded
          ? "fixed inset-4 z-50 bg-white rounded-lg shadow-2xl"
          : "h-[600px]"
      )}
    >
      <Card className="w-full h-full overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {/* <KeyRound className="h-5 w-5" /> */}
              <span>Entitlement Relationships - UML View</span>
              {/* REAL: displayName in badge */}
              <Badge variant="outline">{entitlement.displayName}</Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={toggleExpanded}>
                {graphState.isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            <div
              className={cn(
                "relative flex-1",
                graphState.showPreview ? "w-2/3" : "w-full"
              )}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                className="bg-slate-50"
              >
                <Background />
                <Controls />

                <Panel
                  position="top-left"
                  className="bg-white rounded-lg shadow-lg p-4 m-4"
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">View Mode</h4>
                      <div className="flex space-x-1">
                        {(
                          ["direct", "application", "dependencies"] as ViewMode[]
                        ).map((mode) => (
                          <Button
                            key={mode}
                            variant={
                              graphState.viewMode === mode
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handleViewModeChange(mode)}
                            className="flex items-center space-x-1"
                          >
                            {getViewModeIcon(mode)}
                            <span className="capitalize">{mode}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-emerald-500 rounded" />
                        <span>Entitlement</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-blue-500 rounded border-solid border-2" />
                        <span>Same Resource</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-red-500 rounded border-dashed border-2" />
                        <span>High Risk</span>
                      </div>
                    </div>
                  </div>
                </Panel>

                {/* REAL: riskLevel drives AI risk alert panel */}
                {isHighRisk && (
                  <Panel
                    position="bottom-left"
                    className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow-lg p-4 m-4 max-w-sm"
                  >
                    <div className="flex items-start space-x-2">
                      <Zap className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">
                          AI Risk Alert
                        </h4>
                        <p className="text-xs text-red-700 mt-1">
                          This high-risk entitlement requires careful monitoring
                          and regular review.
                        </p>
                      </div>
                    </div>
                  </Panel>
                )}
              </ReactFlow>
            </div>

            {graphState.showPreview && graphState.previewData && (
              <div className="w-1/3 border-l bg-gray-50">
                <EntitlementPreviewPanel
                  entitlement={graphState.previewData}
                  onClose={closePreview}
                  onSelectEntitlement={onSelectEntitlement}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntitlementRelationshipGraph;