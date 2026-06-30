
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, Search, UserCheck, Calendar, 
  AlertTriangle, CheckCircle, Building
} from 'lucide-react';

interface ManagerAssignmentFormProps {
  identityType: 'employee' | 'non-employee' | 'non-human';
  data: any;
  onChange: (data: any) => void;
}

// Mock data for managers/sponsors/owners
const mockAssignees = [
  {
    id: 'mgr-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Human Resources',
    title: 'HR Director',
    type: 'manager'
  },
  {
    id: 'mgr-002',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    department: 'Engineering',
    title: 'Engineering Manager',
    type: 'manager'
  },
  {
    id: 'spo-001',
    name: 'Lisa Wong',
    email: 'lisa.wong@company.com',
    department: 'Finance',
    title: 'Finance Director',
    type: 'sponsor'
  },
  {
    id: 'own-001',
    name: 'David Smith',
    email: 'david.smith@company.com',
    department: 'IT Operations',
    title: 'IT Operations Manager',
    type: 'owner'
  }
];

export function ManagerAssignmentForm({ identityType, data, onChange }: ManagerAssignmentFormProps) {
  const [formData, setFormData] = useState({
    assigneeId: '',
    assigneeName: '',
    assigneeEmail: '',
    assigneeDepartment: '',
    assigneeTitle: '',
    startDate: '',
    endDate: '',
    ...data
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleFormChange = (newData: any) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const handleAssigneeSelect = (assigneeId: string) => {
    const assignee = mockAssignees.find(a => a.id === assigneeId);
    if (assignee) {
      handleFormChange({
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        assigneeEmail: assignee.email,
        assigneeDepartment: assignee.department,
        assigneeTitle: assignee.title
      });
    }
  };

  const getAssignmentLabel = () => {
    switch (identityType) {
      case 'employee': return 'Manager';
      case 'non-employee': return 'Sponsor';
      case 'non-human': return 'Owner';
      default: return 'Assignee';
    }
  };

  const getAssignmentDescription = () => {
    switch (identityType) {
      case 'employee': return 'Select the direct manager who will be responsible for this employee';
      case 'non-employee': return 'Select the sponsor who will be accountable for this non-employee identity';
      case 'non-human': return 'Select the owner who will be responsible for this non-human identity';
      default: return 'Select the responsible person';
    }
  };

  const getFilteredAssignees = () => {
    const relevantType = identityType === 'employee' ? 'manager' : 
                        identityType === 'non-employee' ? 'sponsor' : 'owner';
    
    return mockAssignees
      .filter(assignee => assignee.type === relevantType || assignee.type === 'manager')
      .filter(assignee => 
        searchTerm === '' || 
        assignee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignee.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const filteredAssignees = getFilteredAssignees();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">{getAssignmentLabel()} Assignment</h2>
        <p className="text-sm text-slate-600">
          {getAssignmentDescription()}
        </p>
      </div>

      {/* Search and Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Select {getAssignmentLabel()}</span>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={`Search for ${getAssignmentLabel().toLowerCase()}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredAssignees.map((assignee) => {
              const isSelected = formData.assigneeId === assignee.id;
              return (
                <div 
                  key={assignee.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-blue-200 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => handleAssigneeSelect(assignee.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{assignee.name}</h4>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{assignee.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {assignee.department}
                        </Badge>
                        <span className="text-xs text-slate-500">{assignee.title}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Duration for Non-Employee */}
      {identityType === 'non-employee' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Assignment Duration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFormChange({ startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleFormChange({ endDate: e.target.value })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Assignment Summary */}
      {formData.assigneeName && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-base text-green-800">
              Selected {getAssignmentLabel()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium text-green-900">{formData.assigneeName}</div>
              <div className="text-sm text-green-800">{formData.assigneeEmail}</div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-200 text-green-800 border-green-300">
                  {formData.assigneeDepartment}
                </Badge>
                <span className="text-sm text-green-700">{formData.assigneeTitle}</span>
              </div>
              {identityType === 'non-employee' && formData.endDate && (
                <div className="text-sm text-green-700">
                  Duration: {formData.startDate || 'Now'} - {formData.endDate}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Alerts */}
      {!formData.assigneeId && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {getAssignmentLabel()} assignment is required to proceed.
          </AlertDescription>
        </Alert>
      )}

      {identityType === 'non-employee' && formData.assigneeId && !formData.endDate && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            End date is required for non-employee identities.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
