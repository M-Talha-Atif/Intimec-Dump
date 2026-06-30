"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Settings, Link } from 'lucide-react';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';

interface PanelTargetProps {
  data: ExtendedWorkflowNodeData;
  onChange: (updates: Partial<ExtendedWorkflowNodeData>) => void;
}

export const PanelTarget: React.FC<PanelTargetProps> = ({ data, onChange }) => {
  const isProvisioningType = data.stepType?.includes('provision') || data.stepType?.includes('aggregate');
  
  const targetSystems = [
    { 
      value: 'active-directory', 
      label: 'Active Directory', 
      icon: '🏢',
      operations: ['create', 'enable', 'disable', 'assign', 'remove', 'modify']
    },
    { 
      value: 'sap', 
      label: 'SAP', 
      icon: '💼',
      operations: ['create', 'enable', 'disable', 'assign', 'remove']
    },
    { 
      value: 'workday', 
      label: 'Workday', 
      icon: '👥',
      operations: ['create', 'enable', 'disable', 'modify']
    },
    { 
      value: 'salesforce', 
      label: 'Salesforce', 
      icon: '☁️',
      operations: ['create', 'enable', 'disable', 'assign', 'remove']
    },
    { 
      value: 'servicenow', 
      label: 'ServiceNow', 
      icon: '🎫',
      operations: ['create', 'assign', 'remove']
    },
    { 
      value: 'custom', 
      label: 'Custom Application', 
      icon: '⚙️',
      operations: ['create', 'enable', 'disable', 'assign', 'remove', 'modify']
    }
  ];

  const selectedSystem = targetSystems.find(sys => sys.value === data.targetSystem?.type);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" />
            Target System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">System Type</Label>
            <Select 
              value={data.targetSystem?.type || data.appTarget || ''} 
              onValueChange={(value) => onChange({ 
                targetSystem: { 
                  ...data.targetSystem, 
                  type: value as any,
                  operation: data.targetSystem?.operation || 'create'
                },
                appTarget: value
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select target system" />
              </SelectTrigger>
              <SelectContent>
                {targetSystems.map((system) => (
                  <SelectItem key={system.value} value={system.value}>
                    <span className="flex items-center gap-2">
                      <span>{system.icon}</span>
                      {system.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.targetSystem?.type && (
            <>
              <div>
                <Label className="text-sm font-medium">Operation</Label>
                <Select 
                  value={data.targetSystem?.operation || ''} 
                  onValueChange={(value) => onChange({ 
                    targetSystem: { 
                      ...data.targetSystem, 
                      type: data.targetSystem?.type || 'custom',
                      operation: value as any 
                    } as any
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSystem?.operations.map((op) => (
                      <SelectItem key={op} value={op}>
                        <span className="capitalize">{op} Account/Entitlement</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Connection Endpoint</Label>
                <Input
                  value={data.targetSystem?.endpoint || ''}
                  onChange={(e) => onChange({ 
                    targetSystem: { 
                      ...data.targetSystem, 
                      type: data.targetSystem?.type || 'custom',
                      operation: data.targetSystem?.operation || 'create',
                      endpoint: e.target.value 
                    } as any
                  })}
                  placeholder="ldap://domain.com:389 or https://api.system.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Correlation Rule</Label>
                <Input
                  value={data.targetSystem?.correlationRule || ''}
                  onChange={(e) => onChange({ 
                    targetSystem: { 
                      ...data.targetSystem, 
                      type: data.targetSystem?.type || 'custom',
                      operation: data.targetSystem?.operation || 'create',
                      correlationRule: e.target.value 
                    } as any
                  })}
                  placeholder="e.g., employeeId, email, samAccountName"
                  className="mt-1"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Not Connected
              </Badge>
              <span className="text-sm text-muted-foreground">
                {data.targetSystem?.type ? 'Click to test connection' : 'Select system first'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={!data.targetSystem?.type}
            >
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
