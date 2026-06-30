
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Users, Shield, Clock, Workflow, 
  Search, Plus, AlertTriangle 
} from 'lucide-react';

interface RoleGovernanceFormProps {
  roleType: 'business' | 'technical' | 'privileged';
  data: any;
  onChange: (data: any) => void;
}

const mockUsers = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice.johnson@company.com', department: 'Finance' },
  { id: 'u2', name: 'Bob Williams', email: 'bob.williams@company.com', department: 'HR' },
  { id: 'u3', name: 'Carol Davis', email: 'carol.davis@company.com', department: 'IT' },
  { id: 'u4', name: 'David Chen', email: 'david.chen@company.com', department: 'Security' },
  { id: 'u5', name: 'Eve Martinez', email: 'eve.martinez@company.com', department: 'Operations' }
];

const mockWorkflows = [
  { id: 'wf1', name: 'Standard Role Approval', description: 'Basic approval workflow' },
  { id: 'wf2', name: 'High-Risk Role Review', description: 'Enhanced review for privileged roles' },
  { id: 'wf3', name: 'Technical Role Validation', description: 'IT team validation workflow' },
  { id: 'wf4', name: 'Emergency Access Workflow', description: 'Break-glass access process' }
];

export function RoleGovernanceForm({ roleType, data, onChange }: RoleGovernanceFormProps) {
  const [formData, setFormData] = useState({
    owner: '',
    backupOwner: '',
    approvers: [],
    escalationContact: '',
    reviewPolicy: '',
    reviewFrequency: '',
    workflow: '',
    autoProvisioning: false,
    requireApproval: roleType === 'privileged',
    membershipRule: '',
    notes: '',
    ...data
  });

  const [ownerSearch, setOwnerSearch] = useState('');
  const [approverSearch, setApproverSearch] = useState('');
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [showApproverDropdown, setShowApproverDropdown] = useState(false);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOwnerSelect = (user: any) => {
    handleInputChange('owner', user.id);
    setOwnerSearch(user.name);
    setShowOwnerDropdown(false);
  };

  const handleApproverAdd = (user: any) => {
    if (!formData.approvers.includes(user.id)) {
      handleInputChange('approvers', [...formData.approvers, user.id]);
    }
    setApproverSearch('');
    setShowApproverDropdown(false);
  };

  const handleApproverRemove = (userId: string) => {
    handleInputChange('approvers', formData.approvers.filter(id => id !== userId));
  };

  const getFilteredUsers = (searchTerm: string) => {
    return mockUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getUserById = (userId: string) => {
    return mockUsers.find(user => user.id === userId);
  };

  const getRecommendedWorkflow = () => {
    switch (roleType) {
      case 'privileged':
        return 'wf2'; // High-Risk Role Review
      case 'technical':
        return 'wf3'; // Technical Role Validation
      case 'business':
        return 'wf1'; // Standard Role Approval
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Ownership & Responsibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Ownership & Responsibility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Owner */}
          <div className="space-y-2">
            <Label htmlFor="owner">Role Owner *</Label>
            <div className="relative">
              <Input
                id="owner"
                value={ownerSearch}
                onChange={(e) => {
                  setOwnerSearch(e.target.value);
                  setShowOwnerDropdown(true);
                }}
                onFocus={() => setShowOwnerDropdown(true)}
                placeholder="Search for role owner..."
              />
              {showOwnerDropdown && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-50 mt-1 max-h-48 overflow-y-auto">
                  {getFilteredUsers(ownerSearch).map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleOwnerSelect(user)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-slate-600">{user.email}</div>
                      <div className="text-xs text-slate-500">{user.department}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Backup Owner */}
          <div className="space-y-2">
            <Label htmlFor="backupOwner">Backup Owner</Label>
            <Select onValueChange={(value) => handleInputChange('backupOwner', value)}>
              <SelectTrigger id="backupOwner">
                <SelectValue placeholder="Select backup owner" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} - {user.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Approvers */}
          <div className="space-y-2">
            <Label>Approvers {roleType === 'privileged' && '*'}</Label>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  value={approverSearch}
                  onChange={(e) => {
                    setApproverSearch(e.target.value);
                    setShowApproverDropdown(true);
                  }}
                  onFocus={() => setShowApproverDropdown(true)}
                  placeholder="Search and add approvers..."
                />
                {showApproverDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-50 mt-1 max-h-48 overflow-y-auto">
                    {getFilteredUsers(approverSearch).map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleApproverAdd(user)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                        disabled={formData.approvers.includes(user.id)}
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-slate-600">{user.email}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {formData.approvers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.approvers.map(userId => {
                    const user = getUserById(userId);
                    return user ? (
                      <Badge key={userId} variant="secondary" className="flex items-center space-x-1">
                        <span>{user.name}</span>
                        <button
                          onClick={() => handleApproverRemove(userId)}
                          className="text-slate-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Escalation Contact */}
          <div className="space-y-2">
            <Label htmlFor="escalationContact">Escalation Contact</Label>
            <Select onValueChange={(value) => handleInputChange('escalationContact', value)}>
              <SelectTrigger id="escalationContact">
                <SelectValue placeholder="Select escalation contact" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} - {user.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Review Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Review & Compliance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reviewPolicy">Review Policy</Label>
              <Select onValueChange={(value) => handleInputChange('reviewPolicy', value)}>
                <SelectTrigger id="reviewPolicy">
                  <SelectValue placeholder="Select review policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly Review</SelectItem>
                  <SelectItem value="semi-annual">Semi-Annual Review</SelectItem>
                  <SelectItem value="annual">Annual Review</SelectItem>
                  <SelectItem value="on-demand">On-Demand Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewFrequency">Review Frequency</Label>
              <Select onValueChange={(value) => handleInputChange('reviewFrequency', value)}>
                <SelectTrigger id="reviewFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">365 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow & Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Workflow className="h-5 w-5" />
            <span>Workflow & Automation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workflow">Associated Workflow</Label>
            <Select 
              value={formData.workflow || getRecommendedWorkflow()} 
              onValueChange={(value) => handleInputChange('workflow', value)}
            >
              <SelectTrigger id="workflow">
                <SelectValue placeholder="Select workflow" />
              </SelectTrigger>
              <SelectContent>
                {mockWorkflows.map(workflow => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    <div>
                      <div className="font-medium">{workflow.name}</div>
                      <div className="text-xs text-slate-600">{workflow.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!formData.workflow && (
              <p className="text-xs text-blue-600">
                Recommended: {mockWorkflows.find(w => w.id === getRecommendedWorkflow())?.name}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoProvisioning">Auto-Provisioning</Label>
                <p className="text-sm text-slate-600">Automatically provision role assignments</p>
              </div>
              <Switch
                id="autoProvisioning"
                checked={formData.autoProvisioning}
                onCheckedChange={(checked) => handleInputChange('autoProvisioning', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireApproval">Require Approval</Label>
                <p className="text-sm text-slate-600">All assignments require approval</p>
              </div>
              <Switch
                id="requireApproval"
                checked={formData.requireApproval}
                onCheckedChange={(checked) => handleInputChange('requireApproval', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Membership Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Membership Rules</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="membershipRule">Auto-Assignment Rule (Optional)</Label>
            <Textarea
              id="membershipRule"
              value={formData.membershipRule}
              onChange={(e) => handleInputChange('membershipRule', e.target.value)}
              placeholder="e.g., user.department == 'Finance' && user.title.contains('Manager')"
              className="min-h-[80px]"
            />
            <p className="text-xs text-slate-600">
              Define rules for automatic role assignment based on user attributes
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional governance notes or requirements..."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Validation Warnings */}
      {roleType === 'privileged' && (!formData.owner || formData.approvers.length === 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Governance Requirements</h4>
                <ul className="text-sm text-red-800 mt-1 space-y-1">
                  {!formData.owner && <li>• Role owner is required for privileged roles</li>}
                  {formData.approvers.length === 0 && <li>• At least one approver is required for privileged roles</li>}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
