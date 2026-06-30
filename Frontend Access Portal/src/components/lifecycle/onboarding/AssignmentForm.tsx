import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, UserCog, Key, Search, Lightbulb, 
  AlertTriangle, CheckCircle, Target, Building
} from 'lucide-react';

interface AssignmentFormProps {
  identityType: 'employee' | 'non-employee' | 'non-human';
  data: any;
  onChange: (data: any) => void;
}

// Mock data for roles and entitlements
const mockRoles = {
  business: [
    { id: 'hr-analyst', name: 'HR Analyst', riskLevel: 'Low', requiresApproval: false, description: 'Standard HR access' },
    { id: 'finance-analyst', name: 'Finance Analyst', riskLevel: 'Medium', requiresApproval: true, description: 'Financial data access' },
    { id: 'sales-rep', name: 'Sales Representative', riskLevel: 'Low', requiresApproval: false, description: 'CRM and sales tools' }
  ],
  technical: [
    { id: 'azure-user', name: 'Azure User Access', riskLevel: 'Medium', requiresApproval: true, description: 'Cloud platform access' },
    { id: 'dev-tools', name: 'Developer Tools', riskLevel: 'Medium', requiresApproval: false, description: 'Development environment' }
  ],
  privileged: [
    { id: 'ad-admin', name: 'Active Directory Admin', riskLevel: 'High', requiresApproval: true, description: 'Directory administration' },
    { id: 'soc-team', name: 'SOC Team Access', riskLevel: 'High', requiresApproval: true, description: 'Security operations' }
  ]
};

const mockEntitlements = [
  { id: 'ent-1', name: 'Slack Workspace Access', application: 'Slack', type: 'Group', requestable: true, riskLevel: 'Low' },
  { id: 'ent-2', name: 'Office 365 License', application: 'Microsoft 365', type: 'License', requestable: false, riskLevel: 'Low' },
  { id: 'ent-3', name: 'Finance Database Read', application: 'SAP', type: 'Permission', requestable: true, riskLevel: 'Medium' },
  { id: 'ent-4', name: 'HR System Access', application: 'Workday', type: 'Role', requestable: true, riskLevel: 'Medium' },
  { id: 'ent-5', name: 'Admin Console Access', application: 'Azure AD', type: 'Permission', requestable: false, riskLevel: 'High' }
];

const mockTemplates = [
  { id: 'new-hire-hr', name: 'Default New Hire (HR)', roles: ['hr-analyst'], entitlements: ['ent-1', 'ent-2', 'ent-4'] },
  { id: 'new-hire-finance', name: 'Default New Hire (Finance)', roles: ['finance-analyst'], entitlements: ['ent-1', 'ent-2', 'ent-3'] },
  { id: 'contractor-basic', name: 'Basic Contractor Access', roles: [], entitlements: ['ent-1', 'ent-2'] }
];

export function AssignmentForm({ identityType, data, onChange }: AssignmentFormProps) {
  // Debug logging
  useEffect(() => {
    console.log('AssignmentForm mounted with data:', data);
    console.log('Identity type:', identityType);
  }, [data, identityType]);

  // Safe initialization with fallbacks
  const [formData, setFormData] = useState(() => {
    const initialData = {
      selectedRoles: [],
      selectedEntitlements: [],
      template: '',
      showImpactPreview: false,
      ...(data || {})
    };
    console.log('AssignmentForm initialized with:', initialData);
    return initialData;
  });

  const [searchTerms, setSearchTerms] = useState({
    roles: '',
    entitlements: ''
  });

  const [activeTab, setActiveTab] = useState('roles');

  const handleFormChange = (newData: any) => {
    try {
      const updatedData = { ...formData, ...newData };
      console.log('AssignmentForm updating data:', updatedData);
      setFormData(updatedData);
      onChange(updatedData);
    } catch (error) {
      console.error('Error in handleFormChange:', error);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    try {
      const selectedRoles = Array.isArray(formData.selectedRoles) ? formData.selectedRoles : [];
      const updated = selectedRoles.includes(roleId)
        ? selectedRoles.filter(id => id !== roleId)
        : [...selectedRoles, roleId];
      handleFormChange({ selectedRoles: updated });
    } catch (error) {
      console.error('Error in handleRoleToggle:', error);
    }
  };

  const handleEntitlementToggle = (entitlementId: string) => {
    try {
      const selectedEntitlements = Array.isArray(formData.selectedEntitlements) ? formData.selectedEntitlements : [];
      const updated = selectedEntitlements.includes(entitlementId)
        ? selectedEntitlements.filter(id => id !== entitlementId)
        : [...selectedEntitlements, entitlementId];
      handleFormChange({ selectedEntitlements: updated });
    } catch (error) {
      console.error('Error in handleEntitlementToggle:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    try {
      if (templateId === 'custom') {
        // Handle custom assignment - clear template but keep current selections
        handleFormChange({ template: 'custom' });
        return;
      }
      
      const template = mockTemplates.find(t => t.id === templateId);
      if (template) {
        handleFormChange({
          template: templateId,
          selectedRoles: template.roles,
          selectedEntitlements: template.entitlements
        });
      }
    } catch (error) {
      console.error('Error in handleTemplateSelect:', error);
    }
  };

  const getFilteredRoles = () => {
    try {
      const allRoles = [...mockRoles.business, ...mockRoles.technical, ...mockRoles.privileged];
      const searchTerm = searchTerms.roles?.toLowerCase() || '';
      return searchTerm 
        ? allRoles.filter(role => role.name.toLowerCase().includes(searchTerm))
        : allRoles;
    } catch (error) {
      console.error('Error in getFilteredRoles:', error);
      return [];
    }
  };

  const getFilteredEntitlements = () => {
    try {
      const searchTerm = searchTerms.entitlements?.toLowerCase() || '';
      return searchTerm
        ? mockEntitlements.filter(ent => 
            ent.name.toLowerCase().includes(searchTerm) || 
            ent.application.toLowerCase().includes(searchTerm)
          )
        : mockEntitlements;
    } catch (error) {
      console.error('Error in getFilteredEntitlements:', error);
      return [];
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Safe array access with fallbacks
  const selectedRoles = Array.isArray(formData.selectedRoles) ? formData.selectedRoles : [];
  const selectedEntitlements = Array.isArray(formData.selectedEntitlements) ? formData.selectedEntitlements : [];
  const totalAssignments = selectedRoles.length + selectedEntitlements.length;

  // Error boundary fallback
  if (!identityType) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load assignment form. Identity type is missing.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Assignments</h2>
          <p className="text-sm text-slate-600">
            Assign roles and entitlements to this {identityType.replace('-', ' ')} identity at creation time.
          </p>
        </div>

        {/* Assignment Templates */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Quick Start Templates</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={formData.template || ''} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template to get started" />
              </SelectTrigger>
              <SelectContent>
                {mockTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Assignment</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">AI Suggestion</div>
            <p className="text-sm">
              Users with similar department and job title usually get: HR Analyst role, Slack access, and Office 365 license.
            </p>
          </AlertDescription>
        </Alert>

        {/* Assignment Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles" className="flex items-center space-x-2">
              <UserCog className="h-4 w-4" />
              <span>Assign Roles ({selectedRoles.length})</span>
            </TabsTrigger>
            <TabsTrigger value="entitlements" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Assign Entitlements ({selectedEntitlements.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Role Assignment</span>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search roles..."
                    value={searchTerms.roles}
                    onChange={(e) => setSearchTerms({ ...searchTerms, roles: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {getFilteredRoles().map((role) => {
                    const isSelected = selectedRoles.includes(role.id);
                    return (
                      <div key={role.id} className={`p-3 border rounded-lg ${isSelected ? 'border-blue-200 bg-blue-50' : 'border-slate-200'}`}>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleRoleToggle(role.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{role.name}</h4>
                              <Badge className={`text-xs ${getRiskColor(role.riskLevel)}`}>
                                {role.riskLevel}
                              </Badge>
                              {role.requiresApproval && (
                                <Badge variant="outline" className="text-xs">
                                  Approval Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entitlements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Entitlement Assignment</span>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search entitlements..."
                    value={searchTerms.entitlements}
                    onChange={(e) => setSearchTerms({ ...searchTerms, entitlements: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {getFilteredEntitlements().map((entitlement) => {
                    const isSelected = selectedEntitlements.includes(entitlement.id);
                    return (
                      <div key={entitlement.id} className={`p-3 border rounded-lg ${isSelected ? 'border-blue-200 bg-blue-50' : 'border-slate-200'}`}>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleEntitlementToggle(entitlement.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{entitlement.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {entitlement.application}
                              </Badge>
                              <Badge className={`text-xs ${getRiskColor(entitlement.riskLevel)}`}>
                                {entitlement.riskLevel}
                              </Badge>
                              {!entitlement.requestable && (
                                <Badge variant="secondary" className="text-xs">
                                  Auto-Assigned
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              {entitlement.type} • {entitlement.requestable ? 'Requestable' : 'Non-requestable'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Impact Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Assignment Summary</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleFormChange({ showImpactPreview: !formData.showImpactPreview })}
              >
                {formData.showImpactPreview ? 'Hide' : 'Show'} Impact Preview
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Badge variant="secondary">
                {selectedRoles.length} Roles Selected
              </Badge>
              <Badge variant="secondary">
                {selectedEntitlements.length} Entitlements Selected
              </Badge>
            </div>

            {formData.showImpactPreview && totalAssignments > 0 && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium">Impact Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Provisioning Events:</span>
                    <span className="ml-2 font-medium">{totalAssignments}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Approvals Required:</span>
                    <span className="ml-2 font-medium">
                      {getFilteredRoles().filter(r => selectedRoles.includes(r.id) && r.requiresApproval).length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {totalAssignments === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No assignments selected. The identity will be created without any initial roles or entitlements.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error rendering AssignmentForm:', error);
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            There was an error loading the assignment form. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
