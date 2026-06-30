"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Shield, AlertTriangle } from 'lucide-react';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';
import { EnhancedApprovalPolicy } from '../forms/EnhancedApprovalPolicy';

interface PanelPolicyProps {
  data: ExtendedWorkflowNodeData;
  onChange: (updates: Partial<ExtendedWorkflowNodeData>) => void;
}

export const PanelPolicy: React.FC<PanelPolicyProps> = ({ data, onChange }) => {
  const isApprovalType = data.stepType?.includes('approval') || data.stepType?.includes('attestation');
  const isGovernanceType = data.stepType?.includes('sod') || data.stepType?.includes('risk');

  return (
    <div className="space-y-4">
      {isApprovalType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Approval Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedApprovalPolicy
              policy={data.approvalPolicy}
              onChange={(policy) => onChange({ approvalPolicy: policy })}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Compliance Frameworks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {data.metadata?.complianceFramework?.map((framework: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {framework}
                <X className="ml-1 h-3 w-3 cursor-pointer" />
              </Badge>
            ))}
            <Button variant="outline" size="sm" className="text-xs h-6">
              <Plus className="h-3 w-3 mr-1" />
              Add Framework
            </Button>
          </div>
          
          <Select 
            onValueChange={(value) => {
              const frameworks = (data.metadata?.complianceFramework as string[]) || [];
              if (!frameworks.includes(value)) {
                onChange({ 
                  metadata: { 
                    ...data.metadata, 
                    complianceFramework: [...frameworks, value] 
                  } 
                });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select compliance framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SOX">Sarbanes-Oxley (SOX)</SelectItem>
              <SelectItem value="PCI-DSS">PCI DSS</SelectItem>
              <SelectItem value="HIPAA">HIPAA</SelectItem>
              <SelectItem value="GDPR">GDPR</SelectItem>
              <SelectItem value="ISO27001">ISO 27001</SelectItem>
              <SelectItem value="NIST">NIST Cybersecurity Framework</SelectItem>
              <SelectItem value="CIS">CIS Controls</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Risk Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">High-Risk Validation</Label>
              <p className="text-xs text-muted-foreground">Require additional approval for high-risk operations</p>
            </div>
            <Switch
              checked={data.riskFlag || false}
              onCheckedChange={(checked) => onChange({ riskFlag: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enhanced Audit Trail</Label>
              <p className="text-xs text-muted-foreground">Create detailed audit logs</p>
            </div>
            <Switch
              checked={data.auditLog || false}
              onCheckedChange={(checked) => onChange({ auditLog: checked })}
            />
          </div>

          {data.riskFlag && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">High-Risk Controls Active</p>
                  <p className="text-xs text-amber-700 mt-1">
                    This step will require minimum 2 approvers and enhanced monitoring
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
