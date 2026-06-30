
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Shield, Bot, Link, AlertTriangle, 
  Plus, Minus, Search, UserCheck
} from 'lucide-react';

interface EntitlementAssignmentFormProps {
  entitlementType: 'standard' | 'sensitive' | 'admin';
  data: any;
  onChange: (data: any) => void;
}

// Mock data for roles
const mockRoles = [
  { id: 'role-1', name: 'HR Manager', type: 'Business', riskLevel: 'Medium', owner: 'Alice Johnson' },
  { id: 'role-2', name: 'System Administrator', type: 'Technical', riskLevel: 'High', owner: 'Bob Williams' },
  { id: 'role-3', name: 'Database Admin', type: 'Privileged', riskLevel: 'Critical', owner: 'Carol Davis' },
  { id: 'role-4', name: 'Finance Analyst', type: 'Business', riskLevel: 'Medium', owner: 'David Chen' },
  { id: 'role-5', name: 'Application Owner', type: 'Technical', riskLevel: 'High', owner: 'Eve Martinez' }
];

// Mock data for identities
const mockIdentities = {
  employee: [
    { id: 'emp-1', name: 'John Smith', department: 'Finance', location: 'New York', status: 'Active' },
    { id: 'emp-2', name: 'Jane Doe', department: 'HR', location: 'London', status: 'Active' },
    { id: 'emp-3', name: 'Mike Johnson', department: 'IT', location: 'Tokyo', status: 'Active' }
  ],
  'non-employee': [
    { id: 'ne-1', name: 'Contractor Smith', company: 'External Corp', location: 'Remote', status: 'Active' },
    { id: 'ne-2', name: 'Consultant Doe', company: 'Advisory Inc', location: 'New York', status: 'Active' }
  ],
  'non-human': [
    { id: 'nh-1', name: 'API-Service-001', type: 'Service Account', owner: 'IT Team', status: 'Active' },
    { id: 'nh-2', name: 'DB-Backup-Service', type: 'System Account', owner: 'DBA Team', status: 'Active' }
  ]
};

// Mock data for entitlements
const mockEntitlements = [
  { id: 'ent-1', name: 'READ_ONLY_ACCESS', app: 'CRM System', riskLevel: 'Low' },
  { id: 'ent-2', name: 'WRITE_ACCESS', app: 'CRM System', riskLevel: 'Medium' },
  { id: 'ent-3', name: 'ADMIN_ACCESS', app: 'Active Directory', riskLevel: 'High' },
  { id: 'ent-4', name: 'FILE_SHARE_ACCESS', app: 'File Server', riskLevel: 'Low' }
];

export function EntitlementAssignmentForm({ entitlementType, data, onChange }: EntitlementAssignmentFormProps) {
  const [formData, setFormData] = useState({
    assignToRoles: [],
    assignToIdentities: {
      employee: [],
      'non-employee': [],
      'non-human': []
    },
    relatedEntitlements: {
      dependent: [],
      mutuallyExclusive: [],
      inherited: []
    },
    assignmentOptions: {
      immediateAssignment: false,
      requiresReview: true,
      partOfCampaign: false
    },
    ...data
  });

  const [activeIdentityTab, setActiveIdentityTab] = useState('employee');

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleRoleAssignment = (roleId: string, isDefault = false, condition = '') => {
    const existingIndex = formData.assignToRoles.findIndex(r => r.roleId === roleId);
    if (existingIndex >= 0) {
      // Update existing assignment
      const updated = [...formData.assignToRoles];
      updated[existingIndex] = { roleId, isDefault, condition };
      setFormData(prev => ({ ...prev, assignToRoles: updated }));
    } else {
      // Add new assignment
      setFormData(prev => ({
        ...prev,
        assignToRoles: [...prev.assignToRoles, { roleId, isDefault, condition }]
      }));
    }
  };

  const handleRemoveRoleAssignment = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      assignToRoles: prev.assignToRoles.filter(r => r.roleId !== roleId)
    }));
  };

  const handleIdentityAssignment = (identityType: string, identityId: string) => {
    const current = formData.assignToIdentities[identityType] || [];
    if (current.includes(identityId)) {
      setFormData(prev => ({
        ...prev,
        assignToIdentities: {
          ...prev.assignToIdentities,
          [identityType]: current.filter(id => id !== identityId)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assignToIdentities: {
          ...prev.assignToIdentities,
          [identityType]: [...current, identityId]
        }
      }));
    }
  };

  const handleEntitlementRelationship = (relationshipType: string, entitlementId: string) => {
    const current = formData.relatedEntitlements[relationshipType] || [];
    if (current.includes(entitlementId)) {
      setFormData(prev => ({
        ...prev,
        relatedEntitlements: {
          ...prev.relatedEntitlements,
          [relationshipType]: current.filter(id => id !== entitlementId)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        relatedEntitlements: {
          ...prev.relatedEntitlements,
          [relationshipType]: [...current, entitlementId]
        }
      }));
    }
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

  const getSmartSuggestions = () => {
    const suggestions = [];
    
    if (entitlementType === 'admin' && formData.assignToRoles.length === 0) {
      suggestions.push({
        type: 'warning',
        message: 'Administrative entitlements should typically be assigned to privileged roles'
      });
    }

    if (formData.relatedEntitlements.mutuallyExclusive.length > 0) {
      suggestions.push({
        type: 'info',
        message: `SoD check: This entitlement conflicts with ${formData.relatedEntitlements.mutuallyExclusive.length} other entitlement(s)`
      });
    }

    return suggestions;
  };

  const suggestions = getSmartSuggestions();

  return (
    <div className="space-y-6">
      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Smart Suggestions</h4>
                <ul className="text-sm text-blue-800 mt-1 space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Assign to Roles</span>
          </TabsTrigger>
          <TabsTrigger value="identities" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Assign to Identities</span>
          </TabsTrigger>
          <TabsTrigger value="entitlements" className="flex items-center space-x-2">
            {/* <Link className="h-4 w-4" /> */}
            <span>Related Entitlements</span>
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Role Assignments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Assignments */}
              {formData.assignToRoles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Assigned Roles</h4>
                  {formData.assignToRoles.map((assignment) => {
                    const role = mockRoles.find(r => r.id === assignment.roleId);
                    return role ? (
                      <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className={getRiskColor(role.riskLevel)}>
                            {role.riskLevel}
                          </Badge>
                          <div>
                            <div className="font-medium">{role.name}</div>
                            <div className="text-xs text-slate-600">{role.type} • Owner: {role.owner}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {assignment.isDefault && <Badge variant="secondary">Default</Badge>}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveRoleAssignment(role.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {/* Available Roles */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Available Roles</h4>
                {mockRoles
                  .filter(role => !formData.assignToRoles.find(a => a.roleId === role.id))
                  .map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className={getRiskColor(role.riskLevel)}>
                          {role.riskLevel}
                        </Badge>
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-xs text-slate-600">{role.type} • Owner: {role.owner}</div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRoleAssignment(role.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Assign
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Identities Tab */}
        <TabsContent value="identities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identity Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeIdentityTab} onValueChange={setActiveIdentityTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="employee">
                    <Users className="h-4 w-4 mr-2" />
                    Employee
                  </TabsTrigger>
                  <TabsTrigger value="non-employee">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Non-Employee
                  </TabsTrigger>
                  <TabsTrigger value="non-human">
                    <Bot className="h-4 w-4 mr-2" />
                    Non-Human
                  </TabsTrigger>
                </TabsList>

                {Object.entries(mockIdentities).map(([type, identities]) => (
                  <TabsContent key={type} value={type} className="space-y-3 mt-4">
                    {identities.map((identity) => (
                      <div key={identity.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={formData.assignToIdentities[type]?.includes(identity.id)}
                            onCheckedChange={() => handleIdentityAssignment(type, identity.id)}
                          />
                          <div>
                            <div className="font-medium">{identity.name}</div>
                            <div className="text-xs text-slate-600">
                              {type === 'employee' && `${identity.department} • ${identity.location}`}
                              {type === 'non-employee' && `${identity.company} • ${identity.location}`}
                              {type === 'non-human' && `${identity.type} • Owner: ${identity.owner}`}
                            </div>
                          </div>
                        </div>
                        <Badge variant={identity.status === 'Active' ? 'default' : 'secondary'}>
                          {identity.status}
                        </Badge>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>

              {/* Assignment Options */}
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium">Assignment Options</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="immediateAssignment"
                      checked={formData.assignmentOptions.immediateAssignment}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          assignmentOptions: { ...prev.assignmentOptions, immediateAssignment: checked }
                        }))
                      }
                    />
                    <label htmlFor="immediateAssignment" className="text-sm">Assign immediately upon creation</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresReview"
                      checked={formData.assignmentOptions.requiresReview}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          assignmentOptions: { ...prev.assignmentOptions, requiresReview: checked }
                        }))
                      }
                    />
                    <label htmlFor="requiresReview" className="text-sm">Require review before assignment</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="partOfCampaign"
                      checked={formData.assignmentOptions.partOfCampaign}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          assignmentOptions: { ...prev.assignmentOptions, partOfCampaign: checked }
                        }))
                      }
                    />
                    <label htmlFor="partOfCampaign" className="text-sm">Include in access request campaign</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Related Entitlements Tab */}
        <TabsContent value="entitlements" className="space-y-4">
          <div className="grid gap-4">
            {/* Dependent Entitlements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Plus className="h-4 w-4 text-green-600" />
                  <span>Dependent Entitlements</span>
                </CardTitle>
                <p className="text-sm text-slate-600">Entitlements that must exist before this one can be granted</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockEntitlements.map((ent) => (
                  <div key={`dep-${ent.id}`} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.relatedEntitlements.dependent.includes(ent.id)}
                        onCheckedChange={() => handleEntitlementRelationship('dependent', ent.id)}
                      />
                      <div>
                        <div className="text-sm font-medium">{ent.name}</div>
                        <div className="text-xs text-slate-600">{ent.app}</div>
                      </div>
                    </div>
                    <Badge className={getRiskColor(ent.riskLevel)}>{ent.riskLevel}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mutually Exclusive */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Minus className="h-4 w-4 text-red-600" />
                  <span>Mutually Exclusive</span>
                </CardTitle>
                <p className="text-sm text-slate-600">Entitlements that cannot exist together (SoD)</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockEntitlements.map((ent) => (
                  <div key={`mut-${ent.id}`} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.relatedEntitlements.mutuallyExclusive.includes(ent.id)}
                        onCheckedChange={() => handleEntitlementRelationship('mutuallyExclusive', ent.id)}
                      />
                      <div>
                        <div className="text-sm font-medium">{ent.name}</div>
                        <div className="text-xs text-slate-600">{ent.app}</div>
                      </div>
                    </div>
                    <Badge className={getRiskColor(ent.riskLevel)}>{ent.riskLevel}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Inherited Entitlements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2">
                  <Link className="h-4 w-4 text-blue-600" />
                  <span>Inherited Entitlements</span>
                </CardTitle>
                <p className="text-sm text-slate-600">Entitlements automatically granted when this one is assigned</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockEntitlements.map((ent) => (
                  <div key={`inh-${ent.id}`} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.relatedEntitlements.inherited.includes(ent.id)}
                        onCheckedChange={() => handleEntitlementRelationship('inherited', ent.id)}
                      />
                      <div>
                        <div className="text-sm font-medium">{ent.name}</div>
                        <div className="text-xs text-slate-600">{ent.app}</div>
                      </div>
                    </div>
                    <Badge className={getRiskColor(ent.riskLevel)}>{ent.riskLevel}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
