
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronRight, 
  Database, 
  Key, 
  Users, 
  Shield,
  Eye,
  Info
} from 'lucide-react';

type NonEmployeeExplorerTabProps = {
  nonEmployee: any;
};

// Mock tree data
const mockEntitlements = [
  {
    id: 'app_1',
    name: 'Salesforce',
    type: 'application',
    children: [
      {
        id: 'role_1',
        name: 'Standard User',
        type: 'role',
        assignment: 'inherited',
        children: [
          { id: 'perm_1', name: 'View Accounts', type: 'permission', assignment: 'inherited' },
          { id: 'perm_2', name: 'Create Leads', type: 'permission', assignment: 'inherited' },
          { id: 'perm_3', name: 'Edit Opportunities', type: 'permission', assignment: 'inherited' }
        ]
      },
      {
        id: 'role_2',
        name: 'Lead Converter',
        type: 'role',
        assignment: 'manual',
        children: [
          { id: 'perm_4', name: 'Convert Leads', type: 'permission', assignment: 'manual' }
        ]
      }
    ]
  },
  {
    id: 'app_2',
    name: 'Jira',
    type: 'application',
    children: [
      {
        id: 'role_3',
        name: 'Project Member',
        type: 'role',
        assignment: 'inherited',
        children: [
          { id: 'perm_5', name: 'View Issues', type: 'permission', assignment: 'inherited' },
          { id: 'perm_6', name: 'Create Issues', type: 'permission', assignment: 'inherited' }
        ]
      }
    ]
  },
  {
    id: 'app_3',
    name: 'GitHub',
    type: 'application',
    children: [
      {
        id: 'perm_7',
        name: 'Repository Read',
        type: 'permission',
        assignment: 'manual'
      },
      {
        id: 'perm_8',
        name: 'Issue Create',
        type: 'permission',
        assignment: 'manual'
      }
    ]
  }
];

export function NonEmployeeExplorerTab({ nonEmployee }: NonEmployeeExplorerTabProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['app_1', 'app_2']));

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'application': return Database;
      case 'role': return Users;
      case 'permission': return Key;
      default: return Shield;
    }
  };

  const getAssignmentColor = (assignment: string) => {
    switch (assignment) {
      case 'manual': return 'bg-orange-100 text-orange-800';
      case 'inherited': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderNode = (node: any, level = 0) => {
    const Icon = getIcon(node.type);
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id}>
        <div 
          className={`flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer ${
            level > 0 ? `ml-${level * 6}` : ''
          }`}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
          
          <Icon className="h-4 w-4 text-slate-600" />
          
          <span className="flex-1 text-sm font-medium text-slate-900">
            {node.name}
          </span>
          
          {node.assignment && (
            <Badge className={getAssignmentColor(node.assignment)} variant="outline">
              {node.assignment}
            </Badge>
          )}
          
          <Button variant="ghost" size="sm">
            <Eye className="h-3 w-3" />
          </Button>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {node.children.map((child: any) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Explorer Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Access Explorer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-slate-600">Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4</div>
              <div className="text-sm text-slate-600">Roles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">8</div>
              <div className="text-sm text-slate-600">Permissions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800" variant="outline">inherited</Badge>
                <span className="text-sm text-slate-600">Inherited from role</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-orange-100 text-orange-800" variant="outline">manual</Badge>
                <span className="text-sm text-slate-600">Manually assigned</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-slate-500">
              <Info className="h-4 w-4" />
              <span className="text-sm">Click to expand/collapse</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entitlements Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Entitlements by Application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {mockEntitlements.map(node => renderNode(node))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
