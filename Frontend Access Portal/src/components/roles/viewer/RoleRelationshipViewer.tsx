
import React from 'react';
import { Role } from '@/types/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, GitMerge, ArrowRight, Users } from 'lucide-react';

interface RoleRelationshipViewerProps {
  role: Role;
  allRoles: Role[];
  onSelectRole: (role: Role) => void;
}

const RoleRelationshipViewer: React.FC<RoleRelationshipViewerProps> = ({ 
  role, 
  allRoles, 
  onSelectRole 
}) => {
  // Mock relationship data
  const relationships = [
    { id: 1, type: 'inherits', targetRole: 'Base Finance User', direction: 'from' },
    { id: 2, type: 'includes', targetRole: 'Report Viewer', direction: 'to' },
    { id: 3, type: 'conflicts', targetRole: 'Audit Manager', direction: 'with' },
  ];

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'inherits':
        return <ArrowRight className="h-4 w-4 text-blue-600" />;
      case 'includes':
        return <GitMerge className="h-4 w-4 text-green-600" />;
      case 'conflicts':
        return <Users className="h-4 w-4 text-red-600" />;
      default:
        return <Link className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRelationshipBadge = (type: string) => {
    switch (type) {
      case 'inherits':
        return <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">Inherits</Badge>;
      case 'includes':
        return <Badge variant="outline" className="text-xs border-green-300 text-green-700">Includes</Badge>;
      case 'conflicts':
        return <Badge variant="destructive" className="text-xs">Conflicts</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{type}</Badge>;
    }
  };

  const handleRoleClick = (roleName: string) => {
    const targetRole = allRoles.find(r => r.name === roleName);
    if (targetRole) {
      onSelectRole(targetRole);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5" />
            <span>Role Relationships</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {relationships.map((relationship) => (
              <div 
                key={relationship.id}
                className="p-4 border rounded-lg bg-white hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getRelationshipIcon(relationship.type)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{role.name}</span>
                        <span className="text-sm text-slate-600">{relationship.direction}</span>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600 hover:text-blue-800"
                          onClick={() => handleRoleClick(relationship.targetRole)}
                        >
                          {relationship.targetRole}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRelationshipBadge(relationship.type)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitMerge className="h-5 w-5" />
            <span>Relationship Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {relationships.filter(r => r.type === 'inherits').length}
              </div>
              <div className="text-sm text-blue-800">Inherited Roles</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {relationships.filter(r => r.type === 'includes').length}
              </div>
              <div className="text-sm text-green-800">Included Roles</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {relationships.filter(r => r.type === 'conflicts').length}
              </div>
              <div className="text-sm text-red-800">Conflicts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleRelationshipViewer;
