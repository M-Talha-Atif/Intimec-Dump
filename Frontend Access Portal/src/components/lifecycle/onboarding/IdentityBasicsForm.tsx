
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Lightbulb, User } from 'lucide-react';

interface IdentityBasicsFormProps {
  identityType: 'employee' | 'non-employee' | 'non-human';
  data: any;
  onChange: (data: any) => void;
}

export function IdentityBasicsForm({ identityType, data, onChange }: IdentityBasicsFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    identityId: '',
    type: identityType,
    subtype: '',
    ...data
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  // useEffect(() => {
  //   onChange(formData);
  // }, [formData, onChange]);

  // Auto-suggest username/email based on org format
  useEffect(() => {
    if (formData.firstName && formData.lastName && identityType !== 'non-human') {
      const firstName = formData.firstName.toLowerCase();
      const lastName = formData.lastName.toLowerCase();

      const emailSuggestions = [
        `${firstName}.${lastName}@company.com`,
        `${firstName[0]}${lastName}@company.com`,
        `${firstName}${lastName[0]}@company.com`
      ];

      const usernameSuggestions = [
        `${firstName}.${lastName}`,
        `${firstName[0]}${lastName}`,
        `${firstName}${lastName[0]}`
      ];

      setSuggestions([...emailSuggestions, ...usernameSuggestions]);
    }
  }, [formData.firstName, formData.lastName, identityType]);

  // Validate form and check for duplicates
  useEffect(() => {
    const errors = [];

    if (identityType !== 'non-human') {
      if (!formData.firstName) errors.push('First name is required');
      if (!formData.lastName) errors.push('Last name is required');
    }

    if (!formData.email && identityType !== 'non-human') errors.push('Email is required');
    if (!formData.username) errors.push('Username is required');

    // Simulate duplicate check
    if (formData.email === 'john.doe@company.com' || formData.username === 'john.doe') {
      setDuplicateWarning(true);
      errors.push('Duplicate identity detected');
    } else {
      setDuplicateWarning(false);
    }

    setValidationErrors(errors);
  }, [formData, identityType]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };

      onChange(updated);   // notify parent here
      return updated;
    });
  };

  const applySuggestion = (suggestion: string) => {
    if (suggestion.includes('@')) {
      handleInputChange('email', suggestion);
    } else {
      handleInputChange('username', suggestion);
    }
  };

  const getSubtypeOptions = () => {
    switch (identityType) {
      case 'employee':
        return ['Full-time', 'Part-time', 'Intern', 'Manager', 'Executive'];
      case 'non-employee':
        return ['Contractor', 'Vendor', 'Consultant', 'Temporary', 'Partner'];
      case 'non-human':
        return ['Service Account', 'API Key', 'Bot', 'System Account', 'Integration'];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Identity Basics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {identityType !== 'non-human' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </>
            )}

            {identityType === 'non-human' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Enter service/system name"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter username"
              />
            </div>

            {identityType !== 'non-human' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="identityId">Identity ID</Label>
              <Input
                id="identityId"
                value={formData.identityId}
                onChange={(e) => handleInputChange('identityId', e.target.value)}
                placeholder="Auto-generated if empty"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtype">Type Classification</Label>
              <Select onValueChange={(value) => handleInputChange('subtype', value)}>
                <SelectTrigger id="subtype">
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  {getSubtypeOptions().map((option) => (
                    <SelectItem key={option} value={option.toLowerCase()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-suggestions */}
      {suggestions.length > 0 && (formData.firstName || identityType === 'non-human') && (
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
                    <strong>Duplicate Warning:</strong> An identity with similar details already exists.
                    Please verify this is not a duplicate before proceeding.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Indicators */}
      {validationErrors.length === 0 && formData.username && (identityType === 'non-human' || (formData.firstName && formData.lastName && formData.email)) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-900">Basic information looks good!</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
