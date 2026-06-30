
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Lightbulb, Shield } from 'lucide-react';

interface RoleBasicsFormProps {
  roleType: 'business' | 'technical' | 'privileged';
  data: any;
  onChange: (data: any) => void;
}

export function RoleBasicsForm({ roleType, data, onChange }: RoleBasicsFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    type: roleType,
    scope: '',
    riskLevel: '',
    businessUnit: '',
    application: '',
    tags: [],
    status: 'active',
    ...data
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  // Auto-suggest role names based on type and scope
  useEffect(() => {
    if (formData.scope && formData.businessUnit) {
      const suggestions = [];
      
      if (roleType === 'business') {
        suggestions.push(`${formData.businessUnit} ${formData.scope}`);
        suggestions.push(`${formData.scope} Manager`);
        suggestions.push(`${formData.businessUnit} ${formData.scope} Lead`);
      } else if (roleType === 'technical') {
        suggestions.push(`${formData.application || formData.scope} User`);
        suggestions.push(`${formData.application || formData.scope} Admin`);
        suggestions.push(`${formData.application || formData.scope} Read-Only`);
      } else if (roleType === 'privileged') {
        suggestions.push(`${formData.scope} Administrator`);
        suggestions.push(`Super ${formData.scope} Admin`);
        suggestions.push(`${formData.businessUnit} Privileged Access`);
      }
      
      setSuggestions(suggestions);
    }
  }, [formData.scope, formData.businessUnit, formData.application, roleType]);

  // Validate form
  useEffect(() => {
    const errors = [];
    
    if (!formData.name) errors.push('Role name is required');
    if (!formData.description) errors.push('Description is required');
    if (!formData.scope && roleType !== 'privileged') errors.push('Scope is required');
    
    // Simulate duplicate check
    if (formData.name === 'Finance Manager' || formData.name === 'IT Admin') {
      setDuplicateWarning(true);
      errors.push('Role with similar name already exists');
    } else {
      setDuplicateWarning(false);
    }
    
    setValidationErrors(errors);
  }, [formData, roleType]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applySuggestion = (suggestion: string) => {
    handleInputChange('name', suggestion);
  };

  const getScopeOptions = () => {
    switch (roleType) {
      case 'business':
        return ['Department', 'Team', 'Project', 'Region', 'Function'];
      case 'technical':
        return ['Application', 'Database', 'Network', 'Security', 'Infrastructure'];
      case 'privileged':
        return ['System Admin', 'Security Admin', 'Database Admin', 'Network Admin'];
      default:
        return [];
    }
  };

  const getBusinessUnitOptions = () => {
    return ['Finance', 'HR', 'Engineering', 'Marketing', 'Sales', 'Operations', 'Legal'];
  };

  const getRiskLevelOptions = () => {
    switch (roleType) {
      case 'privileged':
        return ['High', 'Critical'];
      case 'technical':
        return ['Medium', 'High'];
      case 'business':
        return ['Low', 'Medium', 'High'];
      default:
        return ['Low', 'Medium', 'High'];
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Role Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter role name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Friendly display name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the role's purpose and scope"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessUnit">Business Unit</Label>
              <Select onValueChange={(value) => handleInputChange('businessUnit', value)}>
                <SelectTrigger id="businessUnit">
                  <SelectValue placeholder="Select business unit" />
                </SelectTrigger>
                <SelectContent>
                  {getBusinessUnitOptions().map((option) => (
                    <SelectItem key={option} value={option.toLowerCase()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scope">Scope {roleType !== 'privileged' && '*'}</Label>
              <Select onValueChange={(value) => handleInputChange('scope', value)}>
                <SelectTrigger id="scope">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  {getScopeOptions().map((option) => (
                    <SelectItem key={option} value={option.toLowerCase()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {roleType === 'technical' && (
            <div className="space-y-2">
              <Label htmlFor="application">Application/System</Label>
              <Input
                id="application"
                value={formData.application}
                onChange={(e) => handleInputChange('application', e.target.value)}
                placeholder="Enter application or system name"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select onValueChange={(value) => handleInputChange('riskLevel', value)}>
                <SelectTrigger id="riskLevel">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  {getRiskLevelOptions().map((option) => (
                    <SelectItem key={option} value={option.toLowerCase()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-suggestions */}
      {suggestions.length > 0 && formData.scope && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span>Smart Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => applySuggestion(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Warnings */}
      {(validationErrors.length > 0 || duplicateWarning) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Validation Issues</h4>
                <ul className="text-sm text-red-800 mt-1 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
                {duplicateWarning && (
                  <div className="mt-2 p-2 bg-yellow-100 rounded text-sm text-yellow-800">
                    <strong>Duplicate Warning:</strong> A role with similar details already exists. 
                    Please verify this is not a duplicate before proceeding.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Indicators */}
      {validationErrors.length === 0 && formData.name && formData.description && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-900">Role details look good!</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
