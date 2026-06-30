
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  TreePine,
  Users, 
  User,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface OrgNode {
  id: string;
  name: string;
  title: string;
  department: string;
  directReports: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  hasIssues: boolean;
  children?: OrgNode[];
}

const mockOrgData: OrgNode = {
  id: 'ceo',
  name: 'Tony Stark',
  title: 'Chief Executive Officer',
  department: 'Executive',
  directReports: 4,
  riskLevel: 'Low',
  hasIssues: false,
  children: [
    {
      id: 'cto',
      name: 'Bruce Banner',
      title: 'Chief Technology Officer',
      department: 'Engineering',
      directReports: 15,
      riskLevel: 'Medium',
      hasIssues: true,
      children: [
        {
          id: 'eng_mgr_1',
          name: 'David Kim',
          title: 'Engineering Manager',
          department: 'Engineering',
          directReports: 8,
          riskLevel: 'Low',
          hasIssues: false,
          children: [
            {
              id: 'emp_1',
              name: 'Sarah Johnson',
              title: 'Senior Software Engineer',
              department: 'Engineering',
              directReports: 0,
              riskLevel: 'Low',
              hasIssues: false
            },
            {
              id: 'emp_3',
              name: 'Emily Davis',
              title: 'Software Engineering Intern',
              department: 'Engineering',
              directReports: 0,
              riskLevel: 'Low',
              hasIssues: false
            }
          ]
        }
      ]
    },
    {
      id: 'cfo',
      name: 'Pepper Potts',
      title: 'Chief Financial Officer',
      department: 'Finance',
      directReports: 12,
      riskLevel: 'High',
      hasIssues: true,
      children: [
        {
          id: 'fin_mgr_1',
          name: 'Lisa Rodriguez',
          title: 'Finance Manager',
          department: 'Finance',
          directReports: 6,
          riskLevel: 'Medium',
          hasIssues: false,
          children: [
            {
              id: 'emp_2',
              name: 'Mike Chen',
              title: 'Financial Analyst',
              department: 'Finance',
              directReports: 0,
              riskLevel: 'Medium',
              hasIssues: true
            }
          ]
        }
      ]
    }
  ]
};

const OrgNodeComponent = ({ 
  node, 
  level = 0, 
  isExpanded, 
  onToggle, 
  onNodeClick 
}: { 
  node: OrgNode;
  level?: number;
  isExpanded: boolean;
  onToggle: () => void;
  onNodeClick: (node: OrgNode) => void;
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const indentClass = level > 0 ? `ml-${level * 6}` : '';

  return (
    <div className={`${indentClass}`}>
      <div 
        className={`border rounded-lg p-4 mb-3 cursor-pointer transition-all hover:shadow-md ${
          node.riskLevel === 'High' ? 'border-red-300 bg-red-50' :
          node.riskLevel === 'Medium' ? 'border-yellow-300 bg-yellow-50' :
          'border-slate-200 bg-white'
        }`}
        onClick={() => onNodeClick(node)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {hasChildren && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h4 className="font-medium text-slate-800">{node.name}</h4>
              <p className="text-sm text-slate-600">{node.title}</p>
              <p className="text-xs text-slate-500">{node.department}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {node.hasIssues && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
            <Badge className={
              node.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
              node.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }>
              {node.riskLevel} Risk
            </Badge>
            <div className="text-right">
              <div className="text-sm font-medium">{node.directReports}</div>
              <div className="text-xs text-slate-500">reports</div>
            </div>
          </div>
        </div>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="ml-6 border-l-2 border-slate-200 pl-4">
          {node.children!.map((child) => (
            <OrgNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={false}
              onToggle={() => {}}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function OrganizationChart() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['ceo', 'cto', 'cfo']));
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (node: OrgNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="space-y-6 mt-2">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TreePine className="h-5 w-5" />
            <span>Interactive Organization Chart</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search organization..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{zoomLevel}%</span>
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Organizational Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2" style={{ zoom: `${zoomLevel}%` }}>
                <OrgNodeComponent
                  node={mockOrgData}
                  isExpanded={expandedNodes.has(mockOrgData.id)}
                  onToggle={() => toggleNode(mockOrgData.id)}
                  onNodeClick={handleNodeClick}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Node Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Node Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{selectedNode.name}</h4>
                      <p className="text-sm text-slate-600">{selectedNode.title}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-slate-600">Department:</span>
                      <p className="text-sm">{selectedNode.department}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-slate-600">Direct Reports:</span>
                      <p className="text-sm">{selectedNode.directReports} employees</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-slate-600">Risk Level:</span>
                      <Badge className={
                        selectedNode.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                        selectedNode.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {selectedNode.riskLevel} Risk
                      </Badge>
                    </div>

                    {selectedNode.hasIssues && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium text-orange-800">Issues Detected</span>
                        </div>
                        <p className="text-sm text-orange-700 mt-1">
                          This manager has pending reviews or access issues requiring attention.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      <Shield className="h-4 w-4 mr-1" />
                      View Access Details
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Users className="h-4 w-4 mr-1" />
                      Manage Team
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <TreePine className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Click on a node to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
