
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Plus, Trash2, AlertTriangle, Shield, 
  Database, Key, Eye, Filter 
} from 'lucide-react';

interface RoleEntitlementsFormProps {
  roleType: 'business' | 'technical' | 'privileged';
  data: any;
  onChange: (data: any) => void;
}

// Mock entitlements data
const mockEntitlements = [
  { id: 'ent-1', name: 'View Financial Reports', application: 'SAP', type: 'Read', risk: 'Low', description: 'Access to financial reporting dashboards' },
  { id: 'ent-2', name: 'Approve Budgets', application: 'Oracle', type: 'Write', risk: 'High', description: 'Budget approval capabilities up to $50K' },
  { id: 'ent-3', name: 'User Management', application: 'Active Directory', type: 'Admin', risk: 'High', description: 'Create, modify, and delete user accounts' },
  { id: 'ent-4', name: 'Database Read Access', application: 'PostgreSQL', type: 'Read', risk: 'Medium', description: 'Read-only access to production database' },
  { id: 'ent-5', name: 'System Administration', application: 'Linux Servers', type: 'Admin', risk: 'Critical', description: 'Root access to production servers' },
  { id: 'ent-6', name: 'CRM Access', application: 'Salesforce', type: 'Write', risk: 'Low', description: 'Access to customer relationship management' },
  { id: 'ent-7', name: 'HR Data Access', application: 'Workday', type: 'Read', risk: 'Medium', description: 'Employee data and payroll information' },
  { id: 'ent-8', name: 'Code Repository Admin', application: 'GitHub', type: 'Admin', risk: 'High', description: 'Administrative access to code repositories' }
];

export function RoleEntitlementsForm({ roleType, data, onChange }: RoleEntitlementsFormProps) {
  const [formData, setFormData] = useState({
    selectedEntitlements: [],
    entitlementTags: {},
    ...data
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterApplication, setFilterApplication] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [conflicts, setConflicts] = useState<string[]>([]);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  // Filter entitlements based on role type and search criteria
  const getFilteredEntitlements = () => {
    let filtered = mockEntitlements;

    // Filter by role type
    if (roleType === 'business') {
      filtered = filtered.filter(ent => 
        ['SAP', 'Oracle', 'Salesforce', 'Workday'].includes(ent.application)
      );
    } else if (roleType === 'technical') {
      filtered = filtered.filter(ent => 
        ['PostgreSQL', 'GitHub', 'Linux Servers'].includes(ent.application)
      );
    } else if (roleType === 'privileged') {
      filtered = filtered.filter(ent => 
        ent.risk === 'High' || ent.risk === 'Critical'
      );
    }

    // Apply search and filters
    if (searchTerm) {
      filtered = filtered.filter(ent =>
        ent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ent.application.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterApplication && filterApplication !== 'all') {
      filtered = filtered.filter(ent => ent.application === filterApplication);
    }

    if (filterRisk && filterRisk !== 'all') {
      filtered = filtered.filter(ent => ent.risk === filterRisk);
    }

    if (filterType && filterType !== 'all') {
      filtered = filtered.filter(ent => ent.type === filterType);
    }

    return filtered;
  };

  // Check for SoD conflicts
  useEffect(() => {
    const selectedIds = formData.selectedEntitlements;
    const newConflicts = [];

    // Simulate SoD conflict detection
    if (selectedIds.includes('ent-2') && selectedIds.includes('ent-1')) {
      newConflicts.push('Budget approval and financial reporting access may create SoD conflict');
    }
    if (selectedIds.includes('ent-3') && selectedIds.includes('ent-5')) {
      newConflicts.push('User management and system admin access creates high-risk combination');
    }

    setConflicts(newConflicts);
  }, [formData.selectedEntitlements]);

  const handleEntitlementToggle = (entitlementId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedEntitlements: prev.selectedEntitlements.includes(entitlementId)
        ? prev.selectedEntitlements.filter(id => id !== entitlementId)
        : [...prev.selectedEntitlements, entitlementId]
    }));
  };

  const handleEntitlementTag = (entitlementId: string, tag: string) => {
    setFormData(prev => ({
      ...prev,
      entitlementTags: {
        ...prev.entitlementTags,
        [entitlementId]: tag
      }
    }));
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
      case 'Read': return Eye;
      case 'Write': return Database;
      case 'Admin': return Shield;
      default: return Key;
    }
  };

  const filteredEntitlements = getFilteredEntitlements();
  const selectedCount = formData.selectedEntitlements.length;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Entitlements Assignment</span>
            {selectedCount > 0 && (
              <Badge variant="secondary">{selectedCount} selected</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search entitlements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filterApplication} onValueChange={setFilterApplication}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                {Array.from(new Set(mockEntitlements.map(e => e.application))).map(app => (
                  <SelectItem key={app} value={app}>{app}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Read">Read</SelectItem>
                <SelectItem value="Write">Write</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Entitlements List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Entitlements</CardTitle>
          <p className="text-sm text-slate-600">
            Select the entitlements to include in this role. {roleType === 'privileged' && 'High-risk entitlements are pre-filtered for privileged roles.'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredEntitlements.map((entitlement) => {
              const TypeIcon = getTypeIcon(entitlement.type);
              const isSelected = formData.selectedEntitlements.includes(entitlement.id);
              
              return (
                <div key={entitlement.id} className={`p-4 border rounded-lg ${isSelected ? 'border-blue-200 bg-blue-50' : 'border-slate-200'}`}>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleEntitlementToggle(entitlement.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="h-4 w-4 text-slate-500" />
                        <h4 className="font-medium">{entitlement.name}</h4>
                        <Badge className={`text-xs ${getRiskColor(entitlement.risk)}`}>
                          {entitlement.risk}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {entitlement.application}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 mt-1">{entitlement.description}</p>
                      
                      {isSelected && (
                        <div className="mt-2 flex items-center space-x-2">
                          <Label className="text-xs">Tag:</Label>
                          <Select 
                            value={formData.entitlementTags[entitlement.id] || 'optional'} 
                            onValueChange={(value) => handleEntitlementTag(entitlement.id, value)}
                          >
                            <SelectTrigger className="w-32 h-7">
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="core">Core</SelectItem>
                              <SelectItem value="optional">Optional</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
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
        </CardContent>
      </Card>

      {/* Conflicts Warning */}
      {conflicts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Potential Conflicts Detected</h4>
                <ul className="text-sm text-red-800 mt-1 space-y-1">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>• {conflict}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Summary */}
      {selectedCount > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-900 mb-2">Selected Entitlements Summary</h4>
            <div className="flex flex-wrap gap-2">
              {formData.selectedEntitlements.map(id => {
                const ent = mockEntitlements.find(e => e.id === id);
                return ent ? (
                  <Badge key={id} variant="outline" className="text-xs">
                    {ent.name}
                    {formData.entitlementTags[id] && ` (${formData.entitlementTags[id]})`}
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
