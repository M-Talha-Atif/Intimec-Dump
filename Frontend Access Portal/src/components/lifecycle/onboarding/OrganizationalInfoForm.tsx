
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Tag, X } from 'lucide-react';

interface OrganizationalInfoFormProps {
  identityType: 'employee' | 'non-employee' | 'non-human';
  data: any;
  onChange: (data: any) => void;
}

export function OrganizationalInfoForm({ identityType, data, onChange }: OrganizationalInfoFormProps) {
  const [formData, setFormData] = useState({
    department: '',
    division: '',
    costCenter: '',
    location: '',
    region: '',
    jobTitle: '',
    employmentType: '',
    contractType: '',
    systemType: '',
    tags: [],
    customAttributes: {},
    ...data
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const getDepartmentOptions = () => [
    'Engineering', 'Human Resources', 'Finance', 'Marketing', 'Sales', 
    'Operations', 'IT', 'Security', 'Legal', 'Customer Success'
  ];

  const getLocationOptions = () => [
    'New York - HQ', 'San Francisco - West', 'Austin - Central', 'Remote', 
    'London - EMEA', 'Singapore - APAC', 'Toronto - Americas'
  ];

  const getRegionOptions = () => [
    'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'
  ];

  const getEmploymentTypeOptions = () => {
    switch (identityType) {
      case 'employee':
        return ['Full-time', 'Part-time', 'Contract', 'Intern', 'Temporary'];
      case 'non-employee':
        return ['Contractor', 'Vendor', 'Consultant', 'Partner', 'Temporary Staff'];
      case 'non-human':
        return ['Production System', 'Development System', 'Test System', 'Integration', 'Monitoring'];
      default:
        return [];
    }
  };

  const getCommonTags = () => {
    switch (identityType) {
      case 'employee':
        return ['new-hire', 'manager', 'remote', 'full-time', 'part-time', 'leadership'];
      case 'non-employee':
        return ['contractor', 'vendor', 'temporary', 'consultant', 'partner', 'short-term'];
      case 'non-human':
        return ['production', 'development', 'testing', 'integration', 'monitoring', 'automation'];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Organizational Information</span>
          </CardTitle>
          <p className="text-sm text-slate-600">
            Define the organizational context and hierarchy for this identity
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Department and Division */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {getDepartmentOptions().map((dept) => (
                    <SelectItem key={dept} value={dept.toLowerCase()}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="division">Division/Business Unit</Label>
              <Input
                id="division"
                value={formData.division}
                onChange={(e) => handleInputChange('division', e.target.value)}
                placeholder="Enter division or business unit"
              />
            </div>
          </div>

          {/* Job Title and Employment Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">
                {identityType === 'non-human' ? 'System Purpose' : 'Job Title'}
              </Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder={
                  identityType === 'non-human' 
                    ? "e.g., Database Service, API Gateway" 
                    : "Enter job title"
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentType">
                {identityType === 'non-human' ? 'System Type' : 'Employment Type'}
              </Label>
              <Select onValueChange={(value) => handleInputChange('employmentType', value)}>
                <SelectTrigger id="employmentType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {getEmploymentTypeOptions().map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cost Center */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costCenter">Cost Center</Label>
              <Input
                id="costCenter"
                value={formData.costCenter}
                onChange={(e) => handleInputChange('costCenter', e.target.value)}
                placeholder="Enter cost center code"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Location Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Primary Location</Label>
              <Select onValueChange={(value) => handleInputChange('location', value)}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {getLocationOptions().map((location) => (
                    <SelectItem key={location} value={location.toLowerCase()}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select onValueChange={(value) => handleInputChange('region', value)}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {getRegionOptions().map((region) => (
                    <SelectItem key={region} value={region.toLowerCase()}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>Tags & Labels</span>
          </CardTitle>
          <p className="text-sm text-slate-600">
            Add tags to help categorize and organize this identity
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tag Input */}
          <div className="flex space-x-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
              className="flex-1"
            />
            <button
              onClick={addTag}
              disabled={!newTag.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Common Tags */}
          <div>
            <Label className="text-sm font-medium">Common Tags:</Label>
            <div className="flex flex-wrap gap-1 mt-2">
              {getCommonTags().map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => {
                    if (!formData.tags.includes(tag)) {
                      setFormData(prev => ({
                        ...prev,
                        tags: [...prev.tags, tag]
                      }));
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Selected Tags */}
          {formData.tags.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Selected Tags:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="default" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-black/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
