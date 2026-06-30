
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Key, AlertTriangle, Shield, Database, 
  Clock, Tag, Lightbulb, Info
} from 'lucide-react';

interface EntitlementBasicsFormProps {
  entitlementType: 'standard' | 'sensitive' | 'admin';
  data: any;
  onChange: (data: any) => void;
}

// Mock applications data
const mockApplications = [
  { id: 'sap', name: 'SAP Finance', type: 'ERP' },
  { id: 'oracle', name: 'Oracle Database', type: 'Database' },
  { id: 'salesforce', name: 'Salesforce CRM', type: 'CRM' },
  { id: 'github', name: 'GitHub Enterprise', type: 'DevOps' },
  { id: 'ad', name: 'Active Directory', type: 'Identity' },
  { id: 'linux', name: 'Linux Servers', type: 'Infrastructure' }
];

// Mock similar entitlements for suggestions
const mockSimilarEntitlements = [
  'VIEW_FINANCIAL_REPORTS',
  'APPROVE_BUDGET_REQUESTS',
  'MODIFY_USER_ACCOUNTS',
  'DATABASE_READ_ACCESS',
  'SYSTEM_ADMINISTRATION'
];

export function EntitlementBasicsForm({ entitlementType, data, onChange }: EntitlementBasicsFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    application: '',
    entitlementType: 'permission',
    riskLevel: entitlementType === 'standard' ? 'Low' : entitlementType === 'sensitive' ? 'Medium' : 'High',
    tags: [],
    autoAssigned: false,
    timeBound: entitlementType !== 'standard',
    requestable: true,
    defaultRoles: [],
    ...data
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  // Generate suggestions based on name input
  useEffect(() => {
    if (formData.name.length > 2) {
      const filtered = mockSimilarEntitlements.filter(ent => 
        ent.toLowerCase().includes(formData.name.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 3));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [formData.name]);

  // Generate warnings
  useEffect(() => {
    const newWarnings = [];
    
    if (!formData.application) {
      newWarnings.push('No application selected - entitlement will be orphaned');
    }
    
    if (formData.riskLevel === 'High' && !formData.timeBound) {
      newWarnings.push('High-risk entitlements should be time-bound');
    }
    
    if (formData.tags.includes('SOX') && formData.autoAssigned) {
      newWarnings.push('SOX-controlled entitlements should not be auto-assigned');
    }
    
    setWarnings(newWarnings);
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
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

  const getTypeSpecificFields = () => {
    switch (entitlementType) {
      case 'standard':
        return ['Basic permissions', 'Read access', 'Standard operations'];
      case 'sensitive':
        return ['Financial data', 'PII access', 'Approval rights'];
      case 'admin':
        return ['System administration', 'User management', 'Security controls'];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Entitlement Name *</Label>
              <Input
                id="name"
                placeholder="e.g., VIEW_FINANCIAL_REPORTS"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              {showSuggestions && (
                <div className="mt-1">
                  <div className="text-xs text-slate-600 mb-1">Suggestions:</div>
                  {suggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      className="text-xs mr-2 mb-1"
                      onClick={() => handleInputChange('name', suggestion)}
                    >
                      <Lightbulb className="h-3 w-3 mr-1" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Human-readable name"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this entitlement grants access to..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Application *</Label>
              <Select value={formData.application} onValueChange={(value) => handleInputChange('application', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  {mockApplications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4" />
                        <span>{app.name}</span>
                        <Badge variant="outline" className="text-xs">{app.type}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Entitlement Type</Label>
              <Select value={formData.entitlementType} onValueChange={(value) => handleInputChange('entitlementType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permission">Permission</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="attribute">Attribute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Risk Classification</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={formData.riskLevel} onValueChange={(value) => handleInputChange('riskLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low Risk</SelectItem>
                  <SelectItem value="Medium">Medium Risk</SelectItem>
                  <SelectItem value="High">High Risk</SelectItem>
                  <SelectItem value="Critical">Critical Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Badge className={`${getRiskColor(formData.riskLevel)}`}>
                {formData.riskLevel} Risk
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Compliance Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleTagRemove(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {['SOX', 'GDPR', 'HIPAA', 'Production', 'Financial', 'PII'].map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTagAdd(tag)}
                  disabled={formData.tags.includes(tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provisioning Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Provisioning Behavior</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoAssigned"
                  checked={formData.autoAssigned}
                  onCheckedChange={(checked) => handleInputChange('autoAssigned', checked)}
                />
                <Label htmlFor="autoAssigned">Auto-assigned</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="timeBound"
                  checked={formData.timeBound}
                  onCheckedChange={(checked) => handleInputChange('timeBound', checked)}
                />
                <Label htmlFor="timeBound">Time-bound access</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requestable"
                  checked={formData.requestable}
                  onCheckedChange={(checked) => handleInputChange('requestable', checked)}
                />
                <Label htmlFor="requestable">Requestable by users</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Suggested for</Label>
              <div className="text-sm text-slate-600">
                {getTypeSpecificFields().map((field, idx) => (
                  <div key={idx} className="flex items-center space-x-2 py-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>{field}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Recommendations</h4>
                <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
