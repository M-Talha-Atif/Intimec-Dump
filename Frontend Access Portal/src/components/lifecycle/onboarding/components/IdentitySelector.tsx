
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, UserCheck, Bot } from 'lucide-react';

interface IdentitySelectorProps {
  selectedIdentities: {
    employee: string[];
    'non-employee': string[];
    'non-human': string[];
  };
  assignmentOptions: {
    autoAssign: boolean;
    requiresReview: boolean;
    scheduleReview: boolean;
  };
  onIdentityToggle: (type: string, identityId: string) => void;
  onAssignmentOptionChange: (option: string, value: boolean) => void;
}

// Mock identities data
const mockIdentities = {
  employee: [
    { id: 'emp-1', name: 'John Smith', department: 'Finance', location: 'New York', jobTitle: 'Analyst', status: 'Active' },
    { id: 'emp-2', name: 'Jane Doe', department: 'HR', location: 'London', jobTitle: 'Manager', status: 'Active' },
    { id: 'emp-3', name: 'Mike Johnson', department: 'IT', location: 'Tokyo', jobTitle: 'Developer', status: 'Active' },
    { id: 'emp-4', name: 'Sarah Wilson', department: 'Finance', location: 'New York', jobTitle: 'Manager', status: 'Active' },
  ],
  'non-employee': [
    { id: 'ne-1', name: 'Contractor Smith', company: 'External Corp', location: 'Remote', type: 'Contractor', status: 'Active' },
    { id: 'ne-2', name: 'Consultant Doe', company: 'Advisory Inc', location: 'New York', type: 'Consultant', status: 'Active' },
    { id: 'ne-3', name: 'Vendor Johnson', company: 'Tech Solutions', location: 'London', type: 'Vendor', status: 'Active' },
  ],
  'non-human': [
    { id: 'nh-1', name: 'API-Service-001', type: 'Service Account', owner: 'IT Team', application: 'CRM', status: 'Active' },
    { id: 'nh-2', name: 'DB-Backup-Service', type: 'System Account', owner: 'DBA Team', application: 'Database', status: 'Active' },
    { id: 'nh-3', name: 'Integration-Bot', type: 'Bot Account', owner: 'Dev Team', application: 'Integration', status: 'Active' },
  ]
};

export function IdentitySelector({ 
  selectedIdentities, 
  assignmentOptions, 
  onIdentityToggle, 
  onAssignmentOptionChange 
}: IdentitySelectorProps) {
  const [activeTab, setActiveTab] = useState('employee');
  const [searchTerms, setSearchTerms] = useState({
    employee: '',
    'non-employee': '',
    'non-human': ''
  });

  const handleSearchChange = (type: string, value: string) => {
    setSearchTerms(prev => ({ ...prev, [type]: value }));
  };

  const getFilteredIdentities = (type: keyof typeof mockIdentities) => {
    const identities = mockIdentities[type];
    const searchTerm = searchTerms[type].toLowerCase();
    
    if (!searchTerm) return identities;
    
    return identities.filter(identity =>
      identity.name.toLowerCase().includes(searchTerm) ||
      (identity as any).department?.toLowerCase().includes(searchTerm) ||
      (identity as any).company?.toLowerCase().includes(searchTerm) ||
      (identity as any).owner?.toLowerCase().includes(searchTerm)
    );
  };

  const getTotalSelected = () => {
    return Object.values(selectedIdentities).reduce((sum, arr) => sum + arr.length, 0);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employee" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Employee ({selectedIdentities.employee.length})</span>
          </TabsTrigger>
          <TabsTrigger value="non-employee" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Non-Employee ({selectedIdentities['non-employee'].length})</span>
          </TabsTrigger>
          <TabsTrigger value="non-human" className="flex items-center space-x-2">
            <Bot className="h-4 w-4" />
            <span>Non-Human ({selectedIdentities['non-human'].length})</span>
          </TabsTrigger>
        </TabsList>

        {Object.entries(mockIdentities).map(([type, identities]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={`Search ${type.replace('-', ' ')} identities...`}
                value={searchTerms[type as keyof typeof searchTerms]}
                onChange={(e) => handleSearchChange(type, e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {getFilteredIdentities(type as keyof typeof mockIdentities).map((identity) => {
                const isSelected = selectedIdentities[type as keyof typeof selectedIdentities].includes(identity.id);
                
                return (
                  <div key={identity.id} className={`p-3 border rounded-lg ${isSelected ? 'border-blue-200 bg-blue-50' : 'border-slate-200'}`}>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onIdentityToggle(type, identity.id)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{identity.name}</h4>
                          <Badge variant={identity.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                            {identity.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-slate-600 mt-1">
                          {type === 'employee' && (
                            <span>{(identity as any).department} • {(identity as any).jobTitle} • {(identity as any).location}</span>
                          )}
                          {type === 'non-employee' && (
                            <span>{(identity as any).company} • {(identity as any).type} • {(identity as any).location}</span>
                          )}
                          {type === 'non-human' && (
                            <span>{(identity as any).type} • Owner: {(identity as any).owner} • {(identity as any).application}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Assignment Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignment Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoAssign"
              checked={assignmentOptions.autoAssign}
              onCheckedChange={(checked) => onAssignmentOptionChange('autoAssign', !!checked)}
            />
            <label htmlFor="autoAssign" className="text-sm">Auto-assign role on creation</label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requiresReview"
              checked={assignmentOptions.requiresReview}
              onCheckedChange={(checked) => onAssignmentOptionChange('requiresReview', !!checked)}
            />
            <label htmlFor="requiresReview" className="text-sm">Require owner approval before assignment</label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="scheduleReview"
              checked={assignmentOptions.scheduleReview}
              onCheckedChange={(checked) => onAssignmentOptionChange('scheduleReview', !!checked)}
            />
            <label htmlFor="scheduleReview" className="text-sm">Schedule for regular review</label>
          </div>
        </CardContent>
      </Card>

      {/* Selected Summary */}
      {getTotalSelected() > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-900 mb-2">
              Selected Identities ({getTotalSelected()})
            </h4>
            <div className="space-y-2">
              {Object.entries(selectedIdentities).map(([type, ids]) => {
                if (ids.length === 0) return null;
                return (
                  <div key={type} className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {type.replace('-', ' ')}: {ids.length}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
