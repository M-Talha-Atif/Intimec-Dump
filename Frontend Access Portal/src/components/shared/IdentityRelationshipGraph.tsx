
import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, Edge, Node, Panel, MarkerType, useReactFlow, ReactFlowProvider, Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Network, Maximize2, Minimize2, AlertTriangle, Users, Shield, Bot, Target, Settings, Sparkles, Download, Filter, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import NodeDetailsPanel from './NodeDetailsPanel';

import '@xyflow/react/dist/style.css';

type NodeType = 'identity' | 'application' | 'role' | 'entitlement' | 'account' | 'risk';

interface NodeDetailsData {
  id: string;
  type: NodeType;
  label: string;
  subtitle?: string;
  riskLevel?: string;
  riskCount?: number;
  conflictCount?: number;
  metadata: Record<string, any>;
}

export interface IdentityRelationshipGraphProps {
  identityName: string;
  identitySubtitle: string;
  identityType: 'employee' | 'nhi' | 'non-employee' | 'group';
  riskLevel?: string;
  applications: Array<{ name: string; risk: string; accounts: number }>;
  accounts: Array<{ id: string; name: string; application: string; risk?: string }>;
  roles: Array<{ name: string; risk: string; type: string; users: number }>;
  entitlements: Array<{ name: string; risk: string; privilege: string; fromRole: boolean }>;
  riskIndicators: Array<{ label: string; subtitle: string; riskLevel: string; count?: number; conflictCount?: number; metadata: Record<string, any> }>;
  sponsor?: { name: string; title?: string };
}

// Custom node component
const IdentityRelationshipNode = ({ data }: { data: any }) => {
  const getNodeIcon = () => {
    switch (data.type) {
      case 'identity': return <Users className="h-4 w-4" />;
      case 'sponsor': return <Shield className="h-4 w-4" />;
      case 'application': return <Shield className="h-4 w-4" />;
      case 'role': return <Bot className="h-4 w-4" />;
      case 'entitlement': return <Shield className="h-4 w-4" />;
      case 'account': return <Settings className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getNodeColor = () => {
    switch (data.riskLevel) {
      case 'critical':
      case 'high': return 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-300';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300';
      default:
        switch (data.type) {
          case 'identity': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-300';
          case 'sponsor': return 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-800 dark:text-purple-300';
          case 'application': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-300';
          case 'role': return 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-800 dark:text-purple-300';
          case 'entitlement': return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-300';
          case 'account': return 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-800 dark:text-orange-300';
          default: return 'bg-muted border-border text-foreground';
        }
    }
  };

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg border-2 min-w-40 cursor-pointer shadow-sm transition-shadow hover:shadow-md relative",
        getNodeColor(),
        data.isSelected && "ring-2 ring-primary"
      )}
      onClick={() => data.onSelect?.(data.id, data.type, data)}
      title={`Click to view details for ${data.label}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-transparent !border-0 !w-3 !h-3" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-transparent !border-0 !w-3 !h-3" />
      <div className="flex items-center space-x-2">
        {getNodeIcon()}
        <div className="flex-1">
          <div className="font-medium text-sm truncate">{data.label}</div>
          <div className="text-xs opacity-75 truncate">{data.subtitle}</div>
        </div>
      </div>
      {data.riskCount && (
        <Badge variant="destructive" className="mt-2 text-xs">
          {data.riskCount} risks
        </Badge>
      )}
      {data.conflictCount && (
        <Badge variant="outline" className="mt-1 text-xs border-red-400 text-red-600">
          {data.conflictCount} conflicts
        </Badge>
      )}
    </div>
  );
};

const nodeTypes = {
  identityRelationshipNode: IdentityRelationshipNode,
};

type ViewMode = 'hierarchy' | 'direct' | 'conflicts';

interface FilterState {
  applications: boolean;
  roles: boolean;
  entitlements: boolean;
  accounts: boolean;
  risks: boolean;
  riskyOnly: boolean;
}

const NodeLegend = ({ showSponsor }: { showSponsor?: boolean }) => {
  const legendItems = [
    { label: 'Identity', color: 'bg-blue-100 border-blue-500', icon: Users },
    ...(showSponsor ? [{ label: 'Sponsor', color: 'bg-purple-100 border-purple-500', icon: Shield }] : []),
    { label: 'Application', color: 'bg-yellow-100 border-yellow-500', icon: Shield },
    { label: 'Account', color: 'bg-orange-100 border-orange-500', icon: Settings },
    { label: 'Role', color: 'bg-purple-100 border-purple-500', icon: Bot },
    { label: 'Entitlement', color: 'bg-emerald-100 border-emerald-500', icon: Shield },
    { label: 'Risk/Conflict', color: 'bg-red-100 border-red-500', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-1 text-xs">
      {legendItems.map(({ label, color, icon: Icon }) => (
        <div key={label} className="flex items-center space-x-2">
          <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center", color)}>
            <Icon className="h-2 w-2" />
          </div>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

const edgeLabelBgStyle = { fill: '#ffffff', fillOpacity: 0.9, rx: 4, ry: 4 };
const edgeLabelBgPadding: [number, number] = [6, 3];

function InnerGraph(props: IdentityRelationshipGraphProps) {
  const { identityName, identitySubtitle, identityType, riskLevel, applications, accounts, roles, entitlements, riskIndicators, sponsor } = props;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState<NodeDetailsData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('hierarchy');
  const [filters, setFilters] = useState<FilterState>({
    applications: true,
    roles: true,
    entitlements: true,
    accounts: true,
    risks: true,
    riskyOnly: false,
  });
  const { fitView } = useReactFlow();

  const createSelectHandler = useCallback((type: NodeType, extraMeta: Record<string, any>) => {
    return (id: string, _type: string, nodeData: any) => {
      setSelectedNodeData({
        id,
        type,
        label: nodeData.label,
        subtitle: nodeData.subtitle,
        riskLevel: nodeData.riskLevel,
        riskCount: nodeData.riskCount,
        conflictCount: nodeData.conflictCount,
        metadata: extraMeta
      });
    };
  }, []);

  const generateGraphData = useCallback(() => {
    const graphNodes: Node[] = [];
    const graphEdges: Edge[] = [];
    let nodeIndex = 1;
    const appNodeIds: string[] = [];
    const roleNodeIds: string[] = [];
    const entitlementNodeIds: string[] = [];

    // Sponsor node (for non-employee)
    if (sponsor) {
      graphNodes.push({
        id: 'sponsor-main',
        type: 'identityRelationshipNode',
        position: { x: 400, y: 200 },
        data: {
          id: 'sponsor-main',
          type: 'sponsor',
          label: sponsor.name,
          subtitle: sponsor.title || 'Sponsor',
          onSelect: createSelectHandler('identity', { role: 'Sponsor', title: sponsor.title || 'N/A' })
        }
      });
    }

    // Main identity node
    graphNodes.push({
      id: 'identity-main',
      type: 'identityRelationshipNode',
      position: { x: 400, y: sponsor ? 380 : 350 },
      data: {
        id: 'identity-main',
        type: 'identity' as NodeType,
        label: identityName,
        subtitle: identitySubtitle,
        riskLevel: riskLevel?.toLowerCase() || 'low',
        isSelected: false,
        onSelect: createSelectHandler('identity', {
          identityType,
          riskLevel: riskLevel || 'Low',
        })
      }
    });

    // Sponsor → Identity edge
    if (sponsor) {
      graphEdges.push({
        id: 'edge-sponsor-identity',
        source: 'sponsor-main',
        target: 'identity-main',
        type: 'smoothstep',
        label: 'sponsors',
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6', width: 20, height: 20 },
        labelStyle: { fontSize: '10px', fontWeight: 600 },
        labelBgStyle: edgeLabelBgStyle,
        labelBgPadding: edgeLabelBgPadding,
        labelBgBorderRadius: 4,
      });
    }

    // Applications
    if (filters.applications) {
      applications.forEach((app, index) => {
        if (filters.riskyOnly && app.risk === 'low') return;
        const nodeId = `app-${nodeIndex++}`;
        appNodeIds.push(nodeId);
        graphNodes.push({
          id: nodeId,
          type: 'identityRelationshipNode',
          position: { x: 80 + index * 220, y: 80 },
          data: {
            id: nodeId,
            type: 'application' as NodeType,
            label: app.name,
            subtitle: 'Application',
            riskLevel: app.risk,
            riskCount: app.risk === 'high' ? 2 : undefined,
            onSelect: createSelectHandler('application', {
              accountCount: app.accounts,
              orphanCount: app.risk === 'high' ? 1 : 0,
              lastSync: '1 day ago',
              owner: 'IT Security',
            })
          }
        });

        graphEdges.push({
          id: `edge-identity-${nodeId}`,
          source: 'identity-main',
          target: nodeId,
          type: 'smoothstep',
          label: 'has account in',
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 },
          labelStyle: { fontSize: '10px', fontWeight: 600 },
          labelBgStyle: edgeLabelBgStyle,
          labelBgPadding: edgeLabelBgPadding,
          labelBgBorderRadius: 4,
        });

        // Account nodes
        if (filters.accounts) {
          const appAccounts = accounts.filter(a => a.application === app.name);
          const accsToShow = appAccounts.length > 0 ? appAccounts : Array.from({ length: app.accounts }, (_, i) => ({
            id: `${app.name}-acct-${i}`,
            name: `${app.name} Acct ${i + 1}`,
            application: app.name,
            risk: app.risk
          }));
          accsToShow.forEach((acc, i) => {
            const accountId = `account-${nodeId}-${i}`;
            graphNodes.push({
              id: accountId,
              type: 'identityRelationshipNode',
              position: { x: 80 + index * 220 + (i * 30), y: -60 - (i * 70) },
              data: {
                id: accountId,
                type: 'account' as NodeType,
                label: acc.name,
                subtitle: 'Account',
                riskLevel: acc.risk || app.risk,
                onSelect: createSelectHandler('account', {
                  application: app.name,
                  username: acc.id,
                  status: 'Active',
                })
              }
            });
            graphEdges.push({
              id: `edge-${nodeId}-${accountId}`,
              source: nodeId,
              target: accountId,
              type: 'smoothstep',
              label: 'contains',
              style: { stroke: '#8b5cf6', strokeWidth: 1.5 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6', width: 15, height: 15 },
              labelStyle: { fontSize: '9px' },
              labelBgStyle: edgeLabelBgStyle,
              labelBgPadding: edgeLabelBgPadding,
              labelBgBorderRadius: 4,
            });
          });
        }
      });
    }

    // Roles
    if (filters.roles) {
      roles.forEach((role, index) => {
        if (filters.riskyOnly && role.risk === 'low') return;
        const nodeId = `role-${nodeIndex++}`;
        roleNodeIds.push(nodeId);
        graphNodes.push({
          id: nodeId,
          type: 'identityRelationshipNode',
          position: { x: 100 + index * 220, y: 620 },
          data: {
            id: nodeId,
            type: 'role' as NodeType,
            label: role.name,
            subtitle: `${role.type} Role`,
            riskLevel: role.risk,
            conflictCount: role.risk === 'high' ? 1 : undefined,
            onSelect: createSelectHandler('role', {
              roleType: role.type,
              userCount: role.users,
              entitlementCount: role.risk === 'high' ? 8 : 4,
              lastReview: role.risk === 'high' ? '3 months ago' : '1 month ago',
            })
          }
        });
        graphEdges.push({
          id: `edge-identity-${nodeId}`,
          source: 'identity-main',
          target: nodeId,
          type: 'smoothstep',
          label: index === 0 ? 'directly assigned' : 'inherited',
          style: {
            stroke: index === 0 ? '#10b981' : '#8b5cf6',
            strokeWidth: 2,
            strokeDasharray: index === 0 ? undefined : '5,5'
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: index === 0 ? '#10b981' : '#8b5cf6', width: 20, height: 20 },
          labelStyle: { fontSize: '10px', fontWeight: 600 },
          labelBgStyle: edgeLabelBgStyle,
          labelBgPadding: edgeLabelBgPadding,
          labelBgBorderRadius: 4,
        });
      });
    }

    // Entitlements
    if (filters.entitlements) {
      entitlements.forEach((ent, index) => {
        if (filters.riskyOnly && ent.risk === 'low') return;
        const nodeId = `ent-${nodeIndex++}`;
        entitlementNodeIds.push(nodeId);
        graphNodes.push({
          id: nodeId,
          type: 'identityRelationshipNode',
          position: { x: 750, y: 150 + index * 130 },
          data: {
            id: nodeId,
            type: 'entitlement' as NodeType,
            label: ent.name,
            subtitle: `${ent.privilege} Permission`,
            riskLevel: ent.risk,
            riskCount: ent.risk === 'high' ? 1 : undefined,
            onSelect: createSelectHandler('entitlement', {
              privilegeLevel: ent.privilege,
              source: ent.fromRole ? 'Role Assignment' : 'Direct Assignment',
            })
          }
        });

        if (!ent.fromRole) {
          graphEdges.push({
            id: `edge-identity-${nodeId}`,
            source: 'identity-main',
            target: nodeId,
            type: 'smoothstep',
            label: 'directly grants',
            style: { stroke: '#10b981', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981', width: 20, height: 20 },
            labelStyle: { fontSize: '10px', fontWeight: 600 },
            labelBgStyle: edgeLabelBgStyle,
            labelBgPadding: edgeLabelBgPadding,
            labelBgBorderRadius: 4,
          });
        }
      });

      // Role → Entitlement edges
      if (roleNodeIds.length > 0 && entitlementNodeIds.length > 0) {
        roleNodeIds.forEach((roleId, roleIndex) => {
          entitlementNodeIds.forEach((entId, entIndex) => {
            if ((roleIndex === 0 && entIndex === 0) || (roleIndex === 2 && entIndex === 2) || (roleIndex === entIndex)) {
              graphEdges.push({
                id: `edge-${roleId}-${entId}`,
                source: roleId,
                target: entId,
                type: 'smoothstep',
                label: 'grants',
                style: { stroke: '#10b981', strokeWidth: 1.5 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981', width: 15, height: 15 },
                labelStyle: { fontSize: '9px' },
                labelBgStyle: edgeLabelBgStyle,
                labelBgPadding: edgeLabelBgPadding,
                labelBgBorderRadius: 4,
              });
            }
          });
        });
      }
    }

    // App → Role connections
    if (appNodeIds.length > 0 && roleNodeIds.length > 0) {
      appNodeIds.forEach((appId, appIndex) => {
        if (appIndex < roleNodeIds.length) {
          graphEdges.push({
            id: `edge-${appId}-${roleNodeIds[appIndex]}`,
            source: appId,
            target: roleNodeIds[appIndex],
            type: 'smoothstep',
            label: 'defines role',
            style: { stroke: '#f59e0b', strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b', width: 15, height: 15 },
            labelStyle: { fontSize: '9px' },
            labelBgStyle: edgeLabelBgStyle,
            labelBgPadding: edgeLabelBgPadding,
            labelBgBorderRadius: 4,
          });
        }
      });
    }

    // Risk indicators
    if (filters.risks) {
      riskIndicators.forEach((risk, index) => {
        const riskNodeId = `risk-${nodeIndex++}`;
        graphNodes.push({
          id: riskNodeId,
          type: 'identityRelationshipNode',
          position: { x: 780, y: 520 + index * 120 },
          data: {
            id: riskNodeId,
            type: 'risk' as NodeType,
            label: risk.label,
            subtitle: risk.subtitle,
            riskLevel: risk.riskLevel.toLowerCase(),
            riskCount: risk.count,
            conflictCount: risk.conflictCount,
            onSelect: createSelectHandler('risk', risk.metadata)
          }
        });
        graphEdges.push({
          id: `edge-identity-${riskNodeId}`,
          source: 'identity-main',
          target: riskNodeId,
          type: 'smoothstep',
          label: 'violates policy',
          animated: true,
          style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '8,4' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444', width: 20, height: 20 },
          labelStyle: { fontSize: '10px', fontWeight: 600, fill: '#ef4444' },
          labelBgStyle: { ...edgeLabelBgStyle, fill: '#fef2f2' },
          labelBgPadding: edgeLabelBgPadding,
          labelBgBorderRadius: 4,
        });
      });
    }

    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [identityName, identitySubtitle, identityType, riskLevel, applications, accounts, roles, entitlements, riskIndicators, sponsor, filters, viewMode, createSelectHandler]);

  useEffect(() => {
    generateGraphData();
  }, [generateGraphData]);

  // Fix edge rendering: fitView after nodes are set
  useEffect(() => {
    if (nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.15, duration: 300 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nodes, fitView]);

  const handleFilterChange = (filterKey: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };

  const generateAISummary = () => {
    const visibleNodes = nodes.filter(node => node.data.type !== 'identity' && node.data.type !== 'sponsor');
    const riskNodes = visibleNodes.filter(node => node.data.riskLevel === 'high');
    const conflictNodes = visibleNodes.filter(node => node.data.conflictCount);
    return `${identityName} has ${visibleNodes.length} connected relationships including ${riskNodes.length} high-risk items and ${conflictNodes.length} SoD conflicts. ${riskNodes.length > 0 ? 'Review high-risk entitlements immediately.' : 'Access levels appear appropriate.'}`;
  };

  const exportGraph = (format: 'png' | 'json') => {
    if (format === 'json') {
      const exportData = {
        identity: identityName,
        type: identityType,
        relationships: nodes.length - 1,
        riskLevel,
        aiInsights: generateAISummary(),
        nodes: nodes.map(node => ({ id: node.id, type: node.data.type, label: node.data.label, riskLevel: node.data.riskLevel })),
        timestamp: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${identityName.replace(/\s/g, '_')}_relationships.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'direct': return <Target className="h-4 w-4" />;
      case 'hierarchy': return <Network className="h-4 w-4" />;
      case 'conflicts': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn(
      "relative transition-all duration-300 flex pt-4",
      isExpanded ? "fixed inset-4 z-50 bg-background rounded-lg shadow-2xl" : "h-[600px]"
    )}>
      <div className={cn("flex-1", selectedNodeData ? "w-2/3" : "w-full")}>
        <Card className="w-full h-full overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5 text-primary" />
                <span>Identity Relationships</span>
                <Badge variant="outline">{identityName}</Badge>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-60px)]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.3}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
              className="bg-muted/30"
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: false,
                style: { strokeWidth: 2 }
              }}
            >
              <Background />
              <Controls />

              <Panel position="top-left" className="bg-background rounded-lg shadow-lg p-3 m-4 border">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium mb-1.5">View Mode</h4>
                    <div className="flex space-x-1">
                      {(['hierarchy', 'direct', 'conflicts'] as ViewMode[]).map((mode) => (
                        <Button key={mode} variant={viewMode === mode ? "default" : "outline"} size="sm" onClick={() => setViewMode(mode)} className="flex items-center space-x-1 h-7 text-xs">
                          {getViewModeIcon(mode)}
                          <span className="capitalize">{mode}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-xs font-medium mb-1.5">Filters</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Filter className="h-3 w-3 mr-1" />Show/Hide
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {(['applications', 'accounts', 'roles', 'entitlements', 'risks'] as (keyof FilterState)[]).map(key => (
                          <DropdownMenuCheckboxItem key={key} checked={filters[key]} onCheckedChange={() => handleFilterChange(key)}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked={filters.riskyOnly} onCheckedChange={() => handleFilterChange('riskyOnly')}>
                          Show Risky Only
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Separator />
                  <NodeLegend showSponsor={!!sponsor} />
                </div>
              </Panel>

              <Panel position="bottom-left" className="bg-primary/5 rounded-lg shadow-lg p-3 m-4 max-w-xs border">
                <div className="flex items-start space-x-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <h4 className="text-xs font-medium">AI Summary</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{generateAISummary()}</p>
                  </div>
                </div>
              </Panel>

              <Panel position="top-right" className="bg-background rounded-lg shadow-lg p-2 m-4 border">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Download className="h-3 w-3 mr-1" />Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportGraph('png')}>Export as PNG</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportGraph('json')}>Export with AI Insights</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Panel>

              {!selectedNodeData && (
                <Panel position="bottom-right" className="bg-background rounded-lg shadow-lg p-3 m-4 max-w-xs border">
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>Interactive</span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      Click nodes for details · Use filters to focus · Animated edges = risk connections
                    </p>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </CardContent>
        </Card>
      </div>

      {selectedNodeData && (
        <div className="w-1/3 min-w-80">
          <NodeDetailsPanel
            nodeData={selectedNodeData}
            onClose={() => setSelectedNodeData(null)}
          />
        </div>
      )}
    </div>
  );
}

export default function IdentityRelationshipGraph(props: IdentityRelationshipGraphProps) {
  return (
    <ReactFlowProvider>
      <InnerGraph {...props} />
    </ReactFlowProvider>
  );
}
