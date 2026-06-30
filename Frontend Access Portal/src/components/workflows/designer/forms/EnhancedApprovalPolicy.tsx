"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';

interface EnhancedApprovalPolicyProps {
  policy?: ExtendedWorkflowNodeData['approvalPolicy'];
  onChange: (policy: ExtendedWorkflowNodeData['approvalPolicy']) => void;
}

export const EnhancedApprovalPolicy: React.FC<EnhancedApprovalPolicyProps> = ({
  policy,
  onChange
}) => {
  const updatePolicy = (updates: Partial<ExtendedWorkflowNodeData['approvalPolicy']>) => {
    onChange({
      type: 'single',
      resolver: 'manager',
      timeout: 24,
      delegationEnabled: true,
      ...policy,
      ...updates
    });
  };

  return (
    <Tabs defaultValue="basic" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="ooo">OOO & Calendar</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Approval Type</Label>
            <Select 
              value={policy?.type || 'single'} 
              onValueChange={(value: any) => updatePolicy({ type: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Approver</SelectItem>
                <SelectItem value="all">All Must Approve</SelectItem>
                <SelectItem value="any">Any Can Approve</SelectItem>
                <SelectItem value="sequence">Sequential Approval</SelectItem>
                <SelectItem value="quorum">Quorum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Resolver</Label>
            <Select 
              value={policy?.resolver || 'manager'} 
              onValueChange={(value: any) => updatePolicy({ resolver: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Line Manager</SelectItem>
                <SelectItem value="app-owner">Application Owner</SelectItem>
                <SelectItem value="role-owner">Role Owner</SelectItem>
                <SelectItem value="specific">Specific Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Timeout (hours)</Label>
          <Input
            type="number"
            value={policy?.timeout || 24}
            onChange={(e) => updatePolicy({ timeout: parseInt(e.target.value) })}
            min="1"
            max="168"
            className="mt-1"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Delegation Enabled</Label>
            <p className="text-xs text-muted-foreground">Allow approvers to delegate</p>
          </div>
          <Switch
            checked={policy?.delegationEnabled ?? true}
            onCheckedChange={(checked) => updatePolicy({ delegationEnabled: checked })}
          />
        </div>
      </TabsContent>

      <TabsContent value="ooo" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Out-of-Office Handling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enable OOO Detection</Label>
                <p className="text-xs text-muted-foreground">Auto-detect unavailable approvers</p>
              </div>
              <Switch
                checked={policy?.oooHandling?.enabled || false}
                onCheckedChange={(checked) => updatePolicy({ 
                  oooHandling: { 
                    ...policy?.oooHandling, 
                    enabled: checked,
                    fallbackStrategy: 'manager',
                  } 
                })}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
