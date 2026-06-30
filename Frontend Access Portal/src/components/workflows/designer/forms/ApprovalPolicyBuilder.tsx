"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Users, Clock, ArrowRight } from 'lucide-react';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';

interface ApprovalPolicyBuilderProps {
  policy?: ExtendedWorkflowNodeData['approvalPolicy'];
  onChange: (policy: ExtendedWorkflowNodeData['approvalPolicy']) => void;
}

export const ApprovalPolicyBuilder: React.FC<ApprovalPolicyBuilderProps> = ({
  policy,
  onChange
}) => {
  const [escalationChain, setEscalationChain] = React.useState<string[]>(
    policy?.escalationChain || ['']
  );

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

  const addEscalationLevel = () => {
    const newChain = [...escalationChain, ''];
    setEscalationChain(newChain);
    updatePolicy({ escalationChain: newChain });
  };

  const removeEscalationLevel = (index: number) => {
    const newChain = escalationChain.filter((_, i) => i !== index);
    setEscalationChain(newChain);
    updatePolicy({ escalationChain: newChain });
  };

  const updateEscalationLevel = (index: number, value: string) => {
    const newChain = [...escalationChain];
    newChain[index] = value;
    setEscalationChain(newChain);
    updatePolicy({ escalationChain: newChain });
  };

  return (
    <div className="space-y-4">
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
              <SelectItem value="quorum">Quorum (Majority)</SelectItem>
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

      {policy?.type === 'quorum' && (
        <div>
          <Label className="text-sm font-medium">Quorum Size</Label>
          <Input
            type="number"
            value={policy?.quorum || 2}
            onChange={(e) => updatePolicy({ quorum: parseInt(e.target.value) })}
            min="2"
            max="10"
            className="mt-1"
          />
        </div>
      )}

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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Escalation Chain</Label>
          <Button variant="outline" size="sm" onClick={addEscalationLevel}>
            <Plus className="h-3 w-3 mr-1" />
            Add Level
          </Button>
        </div>

        {escalationChain.map((level, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            <div className="flex-1">
              <Input
                value={level}
                onChange={(e) => updateEscalationLevel(index, e.target.value)}
                placeholder={`Level ${index + 1} approver(s)`}
                className="text-sm"
              />
            </div>
            {escalationChain.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => removeEscalationLevel(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Delegation Enabled</Label>
            <p className="text-xs text-muted-foreground">Allow approvers to delegate to others</p>
          </div>
          <Switch
            checked={policy?.delegationEnabled ?? true}
            onCheckedChange={(checked) => updatePolicy({ delegationEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Auto-approve Low Risk</Label>
            <p className="text-xs text-muted-foreground">Automatically approve low-risk requests</p>
          </div>
          <Switch
            checked={policy?.autoApproveThreshold === 'low'}
            onCheckedChange={(checked) => updatePolicy({ 
              autoApproveThreshold: checked ? 'low' : undefined 
            })}
          />
        </div>
      </div>

      {policy && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1">
              <Users className="h-3 w-3" />
              Policy Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1 text-xs">
              <Badge variant="outline">{policy.type} approval</Badge>
              <Badge variant="outline">{policy.resolver} resolver</Badge>
              <Badge variant="outline">
                <Clock className="h-2 w-2 mr-1" />
                {policy.timeout}h timeout
              </Badge>
              {policy.delegationEnabled && (
                <Badge variant="outline">delegation ok</Badge>
              )}
              {policy.autoApproveThreshold && (
                <Badge variant="outline">auto-approve {policy.autoApproveThreshold}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
