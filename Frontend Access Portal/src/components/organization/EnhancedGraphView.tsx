
import { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, Node, Edge } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import CustomOrgNode from './CustomOrgNode';
import { getLayoutedElements } from '@/lib/layout-utils';
import { Palette, Brain } from 'lucide-react';
import { OrgNodeData } from '@/types/organization';
import OrgDetailsPanel from './OrgDetailsPanel';

const nodeTypes = {
  custom: CustomOrgNode,
};

interface EnhancedGraphViewProps {
  data: OrgNodeData;
  onAIAnalysis?: () => void;
}

const EnhancedGraphView = ({ data, onAIAnalysis }: EnhancedGraphViewProps) => {
  const [riskHeatView, setRiskHeatView] = useState(false);
  const [selectedNode, setSelectedNode] = useState<OrgNodeData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const traverse = (node: OrgNodeData, parentId?: string) => {
      if (!node || !node.id) {
        console.warn('Invalid node data:', node);
        return;
      }

      const nodeId = String(node.id);

      // Enhanced node with risk heat coloring
      nodes.push({
        id: nodeId,
        type: 'custom',
        data: { 
          ...node,
          id: nodeId, // Ensure ID is string
          showRiskHeat: riskHeatView,
          onClick: (nodeData: OrgNodeData) => {
            setSelectedNode(nodeData);
            setShowDetails(true);
          }
        },
        position: { x: 0, y: 0 },
      });

      if (parentId && nodeId !== parentId) {
        // Enhanced edges with relationship data
        const relationshipStrength = Math.floor(Math.random() * 50) + 10;
        const hasConflicts = Math.random() > 0.7;
        
        edges.push({
          id: `${parentId}-${nodeId}`,
          source: String(parentId),
          target: nodeId,
          animated: true,
          style: { 
            stroke: hasConflicts ? '#ef4444' : '#9ca3af',
            strokeWidth: Math.max(1, relationshipStrength / 20)
          },
          label: hasConflicts ? 'Conflicts' : undefined,
          labelStyle: { fill: '#ef4444', fontSize: 10 },
        });
      }

      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child) => {
          if (child && child.id) {
            traverse(child, nodeId);
          }
        });
      }
    };

    try {
      traverse(data);
    } catch (error) {
      console.error('Error traversing node data:', error);
    }
    
    return { nodes, edges };
  }, [data, riskHeatView]);

  const { nodes, edges } = useMemo(() => {
    try {
      return getLayoutedElements(initialNodes, initialEdges);
    } catch (error) {
      console.error('Error laying out elements:', error);
      return { nodes: initialNodes, edges: initialEdges };
    }
  }, [initialNodes, initialEdges]);

  return (
    <div className="w-full h-full flex">
      <div className="flex-1 relative rounded-lg border bg-white shadow-sm">
        {/* Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <Button
            variant={riskHeatView ? "default" : "outline"}
            size="sm"
            onClick={() => setRiskHeatView(!riskHeatView)}
          >
            <Palette className="h-4 w-4 mr-2" />
            Risk Heat View
          </Button>
          
          {onAIAnalysis && (
            <Button variant="outline" size="sm" onClick={onAIAnalysis}>
              <Brain className="h-4 w-4 mr-2" />
              AI Analysis
            </Button>
          )}
        </div>

        {/* Legend */}
        {riskHeatView && (
          <div className="absolute top-4 right-4 z-10 bg-white p-3 rounded-lg shadow-md border">
            <div className="text-sm font-medium mb-2">Risk Levels</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs">High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-xs">Medium Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs">Low Risk</span>
              </div>
            </div>
          </div>
        )}

        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-50"
            minZoom={0.5}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            onError={(error) => console.error('ReactFlow error:', error)}
          >
            <Controls />
            <Background />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">No data to display</div>
          </div>
        )}
      </div>

      <OrgDetailsPanel
        node={selectedNode}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
};

export default EnhancedGraphView;
