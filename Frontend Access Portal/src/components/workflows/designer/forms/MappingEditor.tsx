"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, X, ArrowRight } from 'lucide-react';

interface MappingEditorProps {
  mapping: Record<string, any>;
  onChange: (mapping: Record<string, any>) => void;
  targetSystem?: string;
}

export const MappingEditor: React.FC<MappingEditorProps> = ({
  mapping,
  onChange,
  targetSystem
}) => {
  const [mappings, setMappings] = React.useState<Array<{
    source: string;
    target: string;
    transform?: string;
  }>>(
    Object.entries(mapping).map(([target, config]) => ({
      source: typeof config === 'string' ? config : config.source || '',
      target,
      transform: typeof config === 'object' ? config.transform : undefined
    }))
  );

  const systemAttributes = {
    'active-directory': [
      'samAccountName', 'displayName', 'givenName', 'sn', 'mail', 
      'department', 'title', 'manager', 'userPrincipalName'
    ],
    'sap': [
      'BNAME', 'NAME_FIRST', 'NAME_LAST', 'EMAIL', 'DEPARTMENT', 
      'POSITION', 'SUPERVISOR', 'ROLES'
    ],
    'workday': [
      'Worker_ID', 'First_Name', 'Last_Name', 'Email', 'Job_Title',
      'Organization', 'Manager', 'Location'
    ],
    'salesforce': [
      'Username', 'FirstName', 'LastName', 'Email', 'Department',
      'Title', 'ManagerId', 'ProfileId'
    ]
  };

  const sourceAttributes = [
    'employee.id', 'employee.firstName', 'employee.lastName', 'employee.email',
    'employee.department', 'employee.title', 'employee.manager', 'employee.location',
    'request.requester', 'request.reason', 'workflow.initiator'
  ];

  const transforms = [
    'uppercase', 'lowercase', 'trim', 'format_date', 'concat'
  ];

  const targetAttributes = targetSystem ? systemAttributes[targetSystem as keyof typeof systemAttributes] || [] : [];

  const addMapping = () => {
    setMappings([...mappings, { source: '', target: '' }]);
  };

  const removeMapping = (index: number) => {
    const newMappings = mappings.filter((_, i) => i !== index);
    setMappings(newMappings);
    updateParent(newMappings);
  };

  const updateMapping = (index: number, field: string, value: string) => {
    const newMappings = [...mappings];
    (newMappings[index] as any)[field] = value;
    setMappings(newMappings);
    updateParent(newMappings);
  };

  const updateParent = (mappingsList: Array<{
    source: string;
    target: string;
    transform?: string;
  }>) => {
    const result: Record<string, any> = {};
    mappingsList.forEach(mapping => {
      if (mapping.target && mapping.source) {
        if (mapping.transform) {
          result[mapping.target] = {
            source: mapping.source,
            transform: mapping.transform
          };
        } else {
          result[mapping.target] = mapping.source;
        }
      }
    });
    onChange(result);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Attribute Mappings</Label>
          <p className="text-xs text-muted-foreground">
            Map source data to target system attributes
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addMapping}>
          <Plus className="h-3 w-3 mr-1" />
          Add Mapping
        </Button>
      </div>

      <div className="space-y-3">
        {mappings.map((mapping, index) => (
          <Card key={index} className="border-l-4 border-l-blue-400">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-end">
                <div>
                  <Label className="text-xs font-medium">Source</Label>
                  <Select 
                    value={mapping.source} 
                    onValueChange={(value) => updateMapping(index, 'source', value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceAttributes.map((attr) => (
                        <SelectItem key={attr} value={attr}>
                          {attr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>

                <div>
                  <Label className="text-xs font-medium">Target</Label>
                  {targetAttributes.length > 0 ? (
                    <Select 
                      value={mapping.target} 
                      onValueChange={(value) => updateMapping(index, 'target', value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                      <SelectContent>
                        {targetAttributes.map((attr) => (
                          <SelectItem key={attr} value={attr}>
                            {attr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={mapping.target}
                      onChange={(e) => updateMapping(index, 'target', e.target.value)}
                      placeholder="Target attribute"
                      className="text-sm"
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs font-medium">Transform</Label>
                    <Select 
                      value={mapping.transform || 'none'} 
                      onValueChange={(value) => updateMapping(index, 'transform', value === 'none' ? '' : value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {transforms.map((transform) => (
                          <SelectItem key={transform} value={transform}>
                            {transform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removeMapping(index)}
                    className="mt-5"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
