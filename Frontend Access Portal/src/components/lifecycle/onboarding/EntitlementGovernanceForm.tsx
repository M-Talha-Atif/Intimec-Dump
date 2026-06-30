
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Shield, AlertTriangle, Calendar,
  Link, Minus, Plus
} from 'lucide-react';

interface EntitlementGovernanceFormProps {
  entitlementType: 'standard' | 'sensitive' | 'admin';
  data: any;
  onChange: (data: any) => void;
}

// Mock users for owner/approver selection
const mockUsers = [
  { id: 'alice', name: 'Alice Johnson', role: 'Security Manager' },
  { id: 'bob', name: 'Bob Williams', role: 'IT Director' },
  { id: 'carol', name: 'Carol Davis', role: 'Compliance Officer' },
  { id: 'david', name: 'David Chen', role: 'Application Owner' }
];

// Mock entitlements for dependencies
const mockEntitlements = [
  { id: 'ent-1', name: 'BASE_USER_ACCESS', app: 'Active Directory' },
  { id: 'ent-2', name: 'VPN_ACCESS', app: 'Network' },
  { id: 'ent-3', name: 'EMAIL_ACCESS', app: 'Exchange' },
  { id: 'ent-4', name: 'FILE_SHARE_READ', app: 'File Server' }
];

export function EntitlementGovernanceForm({ entitlementType, data, onChange }: EntitlementGovernanceFormProps) {
  const [formData, setFormData] = useState({
    owner: '',
    approvers: [],
    escalationContact: '',
    reviewFrequency: entitlementType === 'admin' ? '90' : '180',
    expiryDate: '',
    dependentEntitlements: [],
    conflictingEntitlements: [],
    requiresJustification: entitlementType !== 'standard',
    ...data
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayAdd = (field: string, value: string) => {
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  };

  const handleArrayRemove = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  const getGovernanceRecommendations = () => {
    switch (entitlementType) {
      case 'standard':
        return [
          'Annual review recommended',
          'Single approver sufficient',
          'Can be auto-assigned for basic roles'
        ];
      case 'sensitive':
        return [
          'Quarterly review required',
          'Dual approval recommended',
          'Justification required for all requests'
        ];
      case 'admin':
        return [
          'Monthly review mandatory',
          'Executive approval required',
          'Emergency access procedures needed'
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Ownership */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Ownership & Accountability</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Entitlement Owner *</Label>
              <Select value={formData.owner} onValueChange={(value) => handleInputChange('owner', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-slate-600">{user.role}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Escalation Contact</Label>
              <Select value={formData.escalationContact} onValueChange={(value) => handleInputChange('escalationContact', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional escalation contact" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-slate-600">{user.role}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Approvers</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.approvers.map((approverId) => {
                const approver = mockUsers.find(u => u.id === approverId);
                return approver ? (
                  <Badge key={approverId} variant="secondary" className="cursor-pointer" onClick={() => handleArrayRemove('approvers', approverId)}>
                    {approver.name} ×
                  </Badge>
                ) : null;
              })}
            </div>
            <Select onValueChange={(value) => handleArrayAdd('approvers', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Add approver" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.filter(user => !formData.approvers.includes(user.id)).map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-slate-600">{user.role}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Review & Expiry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Review & Expiry</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Review Frequency (days)</Label>
              <Select value={formData.reviewFrequency} onValueChange={(value) => handleInputChange('reviewFrequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Monthly (30 days)</SelectItem>
                  <SelectItem value="90">Quarterly (90 days)</SelectItem>
                  <SelectItem value="180">Semi-annually (180 days)</SelectItem>
                  <SelectItem value="365">Annually (365 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expiry Date (Optional)</Label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requiresJustification"
              checked={formData.requiresJustification}
              onCheckedChange={(checked) => handleInputChange('requiresJustification', checked)}
            />
            <Label htmlFor="requiresJustification">Requires business justification for requests</Label>
          </div>
        </CardContent>
      </Card>

      {/* Dependencies & Conflicts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5" />
            <span>Dependencies & Conflicts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label className="flex items-center space-x-2 mb-2">
                <Plus className="h-4 w-4 text-green-600" />
                <span>Dependent Entitlements</span>
              </Label>
              <p className="text-sm text-slate-600 mb-2">Entitlements that must be granted first</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.dependentEntitlements.map((entId) => {
                  const ent = mockEntitlements.find(e => e.id === entId);
                  return ent ? (
                    <Badge key={entId} variant="outline" className="cursor-pointer" onClick={() => handleArrayRemove('dependentEntitlements', entId)}>
                      {ent.name} ({ent.app}) ×
                    </Badge>
                  ) : null;
                })}
              </div>
              <Select onValueChange={(value) => handleArrayAdd('dependentEntitlements', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add dependency" />
                </SelectTrigger>
                <SelectContent>
                  {mockEntitlements.filter(ent => !formData.dependentEntitlements.includes(ent.id)).map((ent) => (
                    <SelectItem key={ent.id} value={ent.id}>
                      <div>
                        <div className="font-medium">{ent.name}</div>
                        <div className="text-xs text-slate-600">{ent.app}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center space-x-2 mb-2">
                <Minus className="h-4 w-4 text-red-600" />
                <span>Conflicting Entitlements</span>
              </Label>
              <p className="text-sm text-slate-600 mb-2">Entitlements that cannot be granted together (SoD)</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.conflictingEntitlements.map((entId) => {
                  const ent = mockEntitlements.find(e => e.id === entId);
                  return ent ? (
                    <Badge key={entId} variant="destructive" className="cursor-pointer" onClick={() => handleArrayRemove('conflictingEntitlements', entId)}>
                      {ent.name} ({ent.app}) ×
                    </Badge>
                  ) : null;
                })}
              </div>
              <Select onValueChange={(value) => handleArrayAdd('conflictingEntitlements', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add conflict" />
                </SelectTrigger>
                <SelectContent>
                  {mockEntitlements.filter(ent => !formData.conflictingEntitlements.includes(ent.id)).map((ent) => (
                    <SelectItem key={ent.id} value={ent.id}>
                      <div>
                        <div className="font-medium">{ent.name}</div>
                        <div className="text-xs text-slate-600">{ent.app}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Governance Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Governance Recommendations</h4>
              <ul className="text-sm text-blue-800 mt-1 space-y-1">
                {getGovernanceRecommendations().map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
