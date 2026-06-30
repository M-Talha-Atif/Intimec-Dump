
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Shield, Building, Crown, Plus } from 'lucide-react';

interface RoleSelectorProps {
  currentRoleType: 'business' | 'technical' | 'privileged';
  selectedRoles: Array<{ roleId: string; relationshipType: string }>;
  onRoleToggle: (roleId: string, relationshipType: string) => void;
}

// Mock roles data
const mockRoles = [
  { id: 'role-1', name: 'HR Manager', type: 'business', riskLevel: 'Medium', owner: 'Alice Johnson' },
  { id: 'role-2', name: 'System Administrator', type: 'technical', riskLevel: 'High', owner: 'Bob Williams' },
  { id: 'role-3', name: 'Database Admin', type: 'privileged', riskLevel: 'Critical', owner: 'Carol Davis' },
  { id: 'role-4', name: 'Finance Analyst', type: 'business', riskLevel: 'Medium', owner: 'David Chen' },
  { id: 'role-5', name: 'Application Owner', type: 'technical', riskLevel: 'High', owner: 'Eve Martinez' },
  { id: 'role-6', name: 'Security Admin', type: 'privileged', riskLevel: 'Critical', owner: 'Frank Wilson' }
];

export function RoleSelector({ currentRoleType, selectedRoles, onRoleToggle }: RoleSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const getFilteredRoles = () => {
    let filtered = mockRoles;

    // Apply search and filters
    if (searchTerm) {
      filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType && filterType !== 'all') {
      filtered = filtered.filter(role => role.type === filterType);
    }

    return filtered;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-red-600 bg-red-50';
      case 'Critical': return 'text-red-800 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'business': return Building;
      case 'technical': return Shield;
      case 'privileged': return Crown;
      default: return Shield;
    }
  };

  const filteredRoles = getFilteredRoles();
  const selectedCount = selectedRoles.length;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Role Types</SelectItem>
            <SelectItem value="business">Business Roles</SelectItem>
            <SelectItem value="technical">Technical Roles</SelectItem>
            <SelectItem value="privileged">Privileged Roles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Roles List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredRoles.map((role) => {
          const TypeIcon = getTypeIcon(role.type);
          const selectedRole = selectedRoles.find(r => r.roleId === role.id);
          const isSelected = !!selectedRole;
          
          return (
            <div key={role.id} className={`p-4 border rounded-lg ${isSelected ? 'border-blue-200 bg-blue-50' : 'border-slate-200'}`}>
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onRoleToggle(role.id, selectedRole?.relationshipType || 'inherited')}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="h-4 w-4 text-slate-500" />
                    <h4 className="font-medium">{role.name}</h4>
                    <Badge className={`text-xs ${getRiskColor(role.riskLevel)}`}>
                      {role.riskLevel}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {role.type}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-slate-600 mt-1">Owner: {role.owner}</p>
                  
                  {isSelected && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs">Relationship:</span>
                      <Select 
                        value={selectedRole?.relationshipType || 'inherited'} 
                        onValueChange={(value) => onRoleToggle(role.id, value)}
                      >
                        <SelectTrigger className="w-32 h-7">
                          <SelectValue placeholder="Inherited" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inherited">Inherited</SelectItem>
                          <SelectItem value="supplemental">Supplemental</SelectItem>
                          <SelectItem value="scoped">Scoped</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Summary */}
      {selectedCount > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-900 mb-2">Selected Role Relationships ({selectedCount})</h4>
            <div className="flex flex-wrap gap-2">
              {selectedRoles.map(({ roleId, relationshipType }) => {
                const role = mockRoles.find(r => r.id === roleId);
                return role ? (
                  <Badge key={roleId} variant="outline" className="text-xs">
                    {role.name} ({relationshipType})
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
