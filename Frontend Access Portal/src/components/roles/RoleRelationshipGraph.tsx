import * as React from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, Edge, Node, Panel, MarkerType } from '@xyflow/react';
import { Role } from '@/types/roles';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Maximize2, Minimize2, AlertTriangle, Zap, Network,
  GitMerge, Target, LoaderCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import UMLRoleNode from './UMLRoleNode';
import RelationshipPreviewPanel from './RelationshipPreviewPanel';
import { useChildRoles } from '@/hooks/access-catalogue/roles/use-child-roles';
import { useParentRoles } from '@/hooks/access-catalogue/roles/use-parent-roles';
import { useFetchRoleEntitlements, RoleEntitlementDto } from '@/hooks/access-catalogue/roles/entitlements/useFetchRoleEntitlements';
import { apiRoleToUiRole } from '@/lib/role-adapter';
import type { AccessRoleResponse } from '@/types/access-roles';

interface RoleRelationshipGraphProps {
  role: Role;
  allRoles: Role[];
  onSelectRole: (role: Role) => void;
}

const nodeTypes = {
  umlRole: UMLRoleNode,
};

type ViewMode = 'direct' | 'hierarchy' | 'conflicts';

interface GraphState {
  selectedNode: string | null;
  viewMode: ViewMode;
  isExpanded: boolean;
  showPreview: boolean;
  previewData: any;
}

// Layout constants
const NODE_SPACING_X = 300;
const MIN_LEVEL_SPACING_Y = 300;
const NODE_HEIGHT = 220;
const ENT_GRID_START_X = 400;
const ENT_GRID_COLS = 3;
const ENT_GRID_COL_GAP = 280;
const ENT_GRID_ROW_GAP = 240;
// Parent roles are placed above the selected role
const PARENT_ROW_Y = -300;

const FIT_VIEW_OPTIONS = {
  padding: 0.3,
  maxZoom: 1,
};

const RoleRelationshipGraph: React.FC<RoleRelationshipGraphProps> = ({ role, allRoles, onSelectRole }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [graphState, setGraphState] = React.useState<GraphState>({
    selectedNode: null,
    viewMode: 'hierarchy',
    isExpanded: false,
    showPreview: false,
    previewData: null
  });

  // Fetch real data from the backend
  const { childRoles, loading: childrenLoading, error: childrenError, refresh: refreshChildren } = useChildRoles(role.id);
  const { parentRoles, loading: parentsLoading, error: parentsError } = useParentRoles(role.id);
  const {
    entitlements: roleEntitlements,
    totalElements: entitlementCount,
    loading: entitlementsLoading,
  } = useFetchRoleEntitlements(role.id, { size: 50 });

  const isLoading = childrenLoading || entitlementsLoading || parentsLoading;

  /**
   * Resolves an AccessRoleResponse to a UI Role.
   * Checks allRoles first (already loaded in sidebar), falls back to adapter conversion.
   */
  const resolveRole = React.useCallback((apiRole: AccessRoleResponse): Role => {
    const existing = allRoles.find((r) => r.id === apiRole.id);
    return existing || apiRoleToUiRole(apiRole);
  }, [allRoles]);

  /**
   * Builds the UML graph using real parent roles, child roles, and entitlements.
   *
   * Layout zones:
   *
   *   [Parent1]  [Parent2]                           <- PARENT_ROW_Y (above)
   *        \       /
   *     composed of
   *        \     /
   *      [Selected Role]  ---grants--->  [Ent grid]  <- Y = 0
   *            |
   *       composed of
   *            |
   *   [Child1]  [Child2]  [Child3]                   <- below entitlement grid
   *
   *   [Conflict Role]                                <- far right of parent row
   */
  const generateUMLGraph = React.useCallback((
    selectedRole: Role,
    parents: AccessRoleResponse[],
    children: AccessRoleResponse[],
    entitlements: RoleEntitlementDto[],
    viewMode: ViewMode
  ) => {
    const graphNodes: Node[] = [];
    const graphEdges: Edge[] = [];
    const processedIds = new Set<string>();

    let entitlementMaxY = 0;

    // Helper: adds a UML role node
    const addUMLNode = (nodeRole: Role, x: number, y: number) => {
      if (processedIds.has(nodeRole.id)) return;
      processedIds.add(nodeRole.id);

      let nodeType = 'business';
      const riskLevel = nodeRole.risk?.score || (nodeRole as any).riskLevel || 'Low';

      if (nodeRole.type === 'Technical Role') nodeType = 'technical';
      else if (nodeRole.type === 'Application Role') nodeType = 'application';
      else if (nodeRole.type === 'Functional Role') nodeType = 'functional';

      const hasConflicts = nodeRole.risk?.conflict && nodeRole.risk.conflict.overlap > 70;

      graphNodes.push({
        id: nodeRole.id,
        type: 'umlRole',
        position: { x, y },
        data: {
          role: nodeRole,
          nodeType,
          riskLevel,
          hasConflicts,
          isSelected: nodeRole.id === selectedRole.id,
          entitlementCount: nodeRole.id === selectedRole.id
            ? entitlementCount
            : ((nodeRole as any).entitlementCount || 0),
          onSelect: (roleId: string) => {
            const targetRole = allRoles.find(r => r.id === roleId);
            if (targetRole) {
              onSelectRole(targetRole);
              setGraphState(prev => ({
                ...prev,
                selectedNode: roleId,
                showPreview: true,
                previewData: targetRole
              }));
            }
          }
        }
      });
    };

    // Helper: adds entitlement nodes in a grid
    const addEntitlementGrid = (
      parentRoleId: string,
      ents: RoleEntitlementDto[],
      gridStartX: number,
      gridStartY: number
    ): number => {
      let maxY = gridStartY;

      ents.forEach((ent, index) => {
        const entId = `ent-${parentRoleId}-${ent.id}`;
        if (processedIds.has(entId)) return;
        processedIds.add(entId);

        const isRisky = ent.riskLevel === 'high' || ent.riskLevel === 'critical';
        const col = index % ENT_GRID_COLS;
        const row = Math.floor(index / ENT_GRID_COLS);
        const entX = gridStartX + col * ENT_GRID_COL_GAP;
        const entY = gridStartY + row * ENT_GRID_ROW_GAP;

        if (entY > maxY) maxY = entY;

        graphNodes.push({
          id: entId,
          type: 'umlRole',
          position: { x: entX, y: entY },
          data: {
            entitlement: {
              id: ent.id,
              name: ent.displayName || ent.name,
              description: ent.description || '',
              application: ent.resourceName || 'Unknown',
              isRisky,
            },
            nodeType: 'entitlement',
            riskLevel: isRisky ? 'High' : 'Low',
            hasConflicts: false,
            isSelected: false,
            onSelect: () => {
              setGraphState(prev => ({
                ...prev,
                selectedNode: entId,
                showPreview: true,
                previewData: {
                  type: 'entitlement',
                  data: {
                    id: ent.id,
                    name: ent.displayName || ent.name,
                    description: ent.description || '',
                    application: ent.resourceName || 'Unknown',
                    isRisky,
                    riskLevel: ent.riskLevel,
                    assignmentCount: ent.assignmentCount,
                  }
                }
              }));
            }
          }
        });

        graphEdges.push({
          id: `e-${parentRoleId}-${entId}`,
          source: parentRoleId,
          target: entId,
          type: 'smoothstep',
          label: 'grants',
          style: { stroke: '#10b981' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
        });
      });

      return maxY + NODE_HEIGHT;
    };

    // Step 1: Add parent roles above the selected role
    const parentUiRoles = parents.map(resolveRole);
    const totalParentWidth = (parentUiRoles.length - 1) * NODE_SPACING_X;
    const parentStartX = -totalParentWidth / 2;

    parentUiRoles.forEach((parentRole, index) => {
      const parentX = parentStartX + index * NODE_SPACING_X;

      addUMLNode(parentRole, parentX, PARENT_ROW_Y);

      // Edge from parent to selected role (parent is source, selected is target)
      graphEdges.push({
        id: `e-parent-${parentRole.id}-${selectedRole.id}`,
        source: parentRole.id,
        target: selectedRole.id,
        type: 'smoothstep',
        label: 'parent of',
        style: { stroke: '#8b5cf6' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' }
      });
    });

    // Step 2: Add the selected role at origin
    addUMLNode(selectedRole, 0, 0);

    // Step 3: Add entitlements to the right
    if (viewMode !== 'conflicts' && entitlements.length > 0) {
      entitlementMaxY = addEntitlementGrid(selectedRole.id, entitlements, ENT_GRID_START_X, 0);
    }

    // Step 4: Add child roles below (Y is below both parent node and entitlement grid)
    const childRowY = Math.max(MIN_LEVEL_SPACING_Y, entitlementMaxY + 60);
    const childUiRoles = children.map(resolveRole);
    const totalChildWidth = (childUiRoles.length - 1) * NODE_SPACING_X;
    const childStartX = -totalChildWidth / 2;

    childUiRoles.forEach((childRole, index) => {
      const childX = childStartX + index * NODE_SPACING_X;

      addUMLNode(childRole, childX, childRowY);

      graphEdges.push({
        id: `e-${selectedRole.id}-${childRole.id}`,
        source: selectedRole.id,
        target: childRole.id,
        type: 'smoothstep',
        label: 'composed of',
        style: { stroke: '#3b82f6' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
      });
    });

    // Step 5: Add conflict relationships
    if (viewMode === 'conflicts' || viewMode === 'hierarchy') {
      if (selectedRole.risk?.conflict) {
        const entGridWidth = Math.min(entitlements.length, ENT_GRID_COLS) * ENT_GRID_COL_GAP;
        const conflictX = ENT_GRID_START_X + entGridWidth + 100;

        const conflictRole = allRoles.find(r => r.name === selectedRole.risk!.conflict!.roleName);
        if (conflictRole && !processedIds.has(conflictRole.id)) {
          addUMLNode(conflictRole, conflictX, 0);
          graphEdges.push({
            id: `e-conflict-${selectedRole.id}-${conflictRole.id}`,
            source: selectedRole.id,
            target: conflictRole.id,
            type: 'straight',
            label: `${selectedRole.risk.conflict.overlap}% overlap`,
            style: { stroke: '#ef4444', strokeDasharray: '5,5' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
          });
        }
      }
    }

    return { nodes: graphNodes, edges: graphEdges };
  }, [allRoles, onSelectRole, resolveRole, entitlementCount]);

  // Rebuild graph when data changes
  React.useEffect(() => {
    if (isLoading) return;
    const { nodes: newNodes, edges: newEdges } = generateUMLGraph(
      role, parentRoles, childRoles, roleEntitlements, graphState.viewMode
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [role, parentRoles, childRoles, roleEntitlements, isLoading, graphState.viewMode, generateUMLGraph, setNodes, setEdges]);

  const handleViewModeChange = (mode: ViewMode) => {
    setGraphState(prev => ({ ...prev, viewMode: mode }));
  };

  const toggleExpanded = () => {
    setGraphState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
  };

  const closePreview = () => {
    setGraphState(prev => ({ ...prev, showPreview: false, previewData: null }));
  };

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'direct': return <Target className="h-4 w-4" />;
      case 'hierarchy': return <Network className="h-4 w-4" />;
      case 'conflicts': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const flowKey = `${role.id}-${graphState.viewMode}`;

  return (
    <div className={cn(
      "relative transition-all duration-300",
      graphState.isExpanded ? "fixed inset-4 z-50 bg-white rounded-lg shadow-2xl" : "h-[600px]"
    )}>
      <Card className="w-full h-full overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <GitMerge className="h-5 w-5" />
              <span>Role Relationships - UML View</span>
              <Badge variant="outline">{role.name}</Badge>
              {parentRoles.length > 0 && (
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  {parentRoles.length} parent{parentRoles.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {childRoles.length > 0 && (
                <Badge variant="secondary">{childRoles.length} children</Badge>
              )}
              {entitlementCount > 0 && (
                <Badge variant="secondary">{entitlementCount} entitlements</Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleExpanded}
              >
                {graphState.isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-full">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <div className="flex items-center gap-2">
                <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading relationships...</span>
              </div>
            </div>
          )}

          {childrenError && !childrenLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
              <div className="text-center">
                <p className="text-sm text-destructive mb-2">Failed to load child roles</p>
                <p className="text-xs text-muted-foreground mb-3">{childrenError}</p>
                <Button variant="outline" size="sm" onClick={refreshChildren}>Retry</Button>
              </div>
            </div>
          )}

          <div className="flex h-full">
            <div className={cn(
              "relative flex-1",
              graphState.showPreview ? "w-2/3" : "w-full"
            )}>
              <ReactFlow
                key={flowKey}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={FIT_VIEW_OPTIONS}
                minZoom={0.1}
                maxZoom={1.5}
                defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
                className="bg-slate-50"
              >
                <Background />
                <Controls />

                <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-4 m-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">View Mode</h4>
                      <div className="flex space-x-1">
                        {(['direct', 'hierarchy', 'conflicts'] as ViewMode[]).map((mode) => (
                          <Button
                            key={mode}
                            variant={graphState.viewMode === mode ? "default" : "outline"}
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
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span>Parent Role</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>Child Role (Composed Of)</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Entitlement Grant</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-3 h-3 bg-red-500 rounded border-dashed border-2"></div>
                        <span>SoD Conflict</span>
                      </div>
                    </div>
                  </div>
                </Panel>

                {role.risk?.peerBenchmark && (
                  <Panel position="bottom-left" className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-4 m-4 max-w-sm">
                    <div className="flex items-start space-x-2">
                      <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">AI Insight</h4>
                        <p className="text-xs text-blue-700 mt-1">{role.risk.peerBenchmark}</p>
                      </div>
                    </div>
                  </Panel>
                )}
              </ReactFlow>
            </div>

            {graphState.showPreview && graphState.previewData && (
              <div className="w-1/3 border-l bg-gray-50">
                <RelationshipPreviewPanel
                  data={graphState.previewData}
                  onClose={closePreview}
                  onSelectRole={onSelectRole}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleRelationshipGraph;