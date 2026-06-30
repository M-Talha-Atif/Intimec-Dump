
import { useMemo } from 'react';
import { ReactFlow, Background, Controls, Node, Edge } from '@xyflow/react';
import { OrgNodeData } from '@/types/organization';
import CustomOrgNode from './CustomOrgNode';
import { getLayoutedElements } from '@/lib/layout-utils';

const nodeTypes = {
  custom: CustomOrgNode,
};

const transformDataToFlow = (orgNode: OrgNodeData) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const traverse = (node: OrgNodeData, parentId?: string) => {
    if (!node || !node.id) {
      console.warn('Invalid node data:', node);
      return;
    }

    const nodeId = String(node.id);

    nodes.push({
      id: nodeId,
      type: 'custom',
      data: {
        ...node,
        id: nodeId, // Ensure ID is string
      },
      position: { x: 0, y: 0 },
    });

    if (parentId && nodeId !== parentId) {
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: String(parentId),
        target: nodeId,
        animated: true,
        style: { stroke: '#9ca3af' },
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
    traverse(orgNode);
  } catch (error) {
    console.error('Error transforming data to flow:', error);
  }

  return { nodes, edges };
};

interface GraphViewProps {
  data: OrgNodeData;
}

const GraphView = ({ data }: GraphViewProps) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!data) {
      return { nodes: [], edges: [] };
    }
    return transformDataToFlow(data);
  }, [data]);

  const { nodes, edges } = useMemo(() => {
    try {
      return getLayoutedElements(initialNodes, initialEdges);
    } catch (error) {
      console.error('Error laying out elements:', error);
      return { nodes: initialNodes, edges: initialEdges };
    }
  }, [initialNodes, initialEdges]);

  if (!data || nodes.length === 0) {
    return (
      <div className="w-full h-full rounded-lg border bg-white shadow-sm flex items-center justify-center">
        <div className="text-gray-500">No data to display</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg border bg-white shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50"
        onError={(error) => console.error('ReactFlow error:', error)}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default GraphView;
