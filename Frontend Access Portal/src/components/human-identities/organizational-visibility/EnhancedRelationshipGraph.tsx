
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  User, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface GraphNode {
  id: string;
  name: string;
  role: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  accessItems: number;
  reviewsCompleted: number;
  reviewsPending: number;
  type: 'manager' | 'direct' | 'functional';
}

const mockGraphData: GraphNode[] = [
  {
    id: 'mgr_1',
    name: 'David Kim',
    role: 'Engineering Director',
    riskLevel: 'Low',
    accessItems: 35,
    reviewsCompleted: 12,
    reviewsPending: 3,
    type: 'manager'
  },
  {
    id: 'eng_1',
    name: 'Sarah Johnson',
    role: 'Senior Software Engineer',
    riskLevel: 'Medium',
    accessItems: 24,
    reviewsCompleted: 8,
    reviewsPending: 2,
    type: 'direct'
  },
  {
    id: 'eng_2',
    name: 'Mike Chen',
    role: 'Software Engineer',
    riskLevel: 'Low',
    accessItems: 18,
    reviewsCompleted: 10,
    reviewsPending: 1,
    type: 'direct'
  },
  {
    id: 'cross_1',
    name: 'Lisa Wang',
    role: 'DevOps Engineer',
    riskLevel: 'High',
    accessItems: 42,
    reviewsCompleted: 15,
    reviewsPending: 5,
    type: 'functional'
  }
];

export const EnhancedRelationshipGraph = () => {
  const [graphMode, setGraphMode] = useState<'org' | 'functional' | 'projects'>('org');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    console.log(`Node clicked: ${node.name} - Opening detailed view`);
  }, []);

  const NodeCard = ({ node }: { node: GraphNode }) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div 
          className={`p-3 bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
            node.riskLevel === 'High' ? 'border-red-300' :
            node.riskLevel === 'Medium' ? 'border-yellow-300' :
            'border-green-300'
          }`}
          onClick={() => handleNodeClick(node)}
        >
          <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
            node.type === 'manager' ? 'bg-blue-100' :
            node.type === 'direct' ? 'bg-green-100' :
            'bg-purple-100'
          }`}>
            <User className={`h-4 w-4 ${
              node.type === 'manager' ? 'text-blue-600' :
              node.type === 'direct' ? 'text-green-600' :
              'text-purple-600'
            }`} />
          </div>
          <div className="text-xs font-medium text-center">{node.name}</div>
          <div className="text-xs text-gray-500 text-center">{node.role}</div>
          <Badge 
            className={`mt-1 text-xs mx-auto ${
              node.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
              node.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}
          >
            {node.riskLevel}
          </Badge>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold">{node.name}</h4>
          <p className="text-sm text-gray-600">{node.role}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Access Items:</span>
              <p className="font-medium flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                {node.accessItems}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Reviews:</span>
              <p className="font-medium flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                {node.reviewsCompleted}/{node.reviewsCompleted + node.reviewsPending}
              </p>
            </div>
          </div>
          {node.reviewsPending > 0 && (
            <div className="flex items-center text-sm text-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {node.reviewsPending} pending reviews
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div className="space-y-4">
      {/* Graph Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">View Mode:</span>
          <div className="flex space-x-1">
            {[
              { key: 'org', label: 'Org Units' },
              { key: 'functional', label: 'Functions' },
              { key: 'projects', label: 'Projects' }
            ].map(mode => (
              <Button
                key={mode.key}
                variant={graphMode === mode.key ? "default" : "outline"}
                size="sm"
                onClick={() => setGraphMode(mode.key as any)}
              >
                {mode.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-12 text-center">{zoomLevel}%</span>
          <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setZoomLevel(100)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Interactive Graph Canvas */}
      <div className="h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center relative overflow-hidden">
        <div className="text-center" style={{ zoom: `${zoomLevel}%` }}>
          <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Interactive Relationship Graph</h3>
          <p className="text-gray-500 mb-4">
            Showing {graphMode === 'org' ? 'organizational hierarchy' : 
                     graphMode === 'functional' ? 'functional relationships' : 
                     'project-based connections'}
          </p>
          <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
            {mockGraphData.map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      </div>

      {/* Connection Lines Visualization */}
      <div className="text-center text-sm text-gray-500">
        <p>Click on any node to view detailed access and review metrics</p>
        <p>Hover over nodes to see quick summary information</p>
      </div>
    </div>
  );
};
