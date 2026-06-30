"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExtendedWorkflowNodeData } from '@/types/workflow-steps';
import { FormFieldWithTooltip } from '../forms/FormFieldWithTooltip';

interface PanelGeneralProps {
  data: ExtendedWorkflowNodeData;
  onChange: (updates: Partial<ExtendedWorkflowNodeData>) => void;
}

export const PanelGeneral: React.FC<PanelGeneralProps> = ({ data, onChange }) => {
  const stepTypes = [
    { value: 'trigger.hr-event', label: '🎯 HR Event Trigger' },
    { value: 'trigger.request', label: '📝 Access Request Trigger' },
    { value: 'trigger.schedule', label: '⏰ Scheduled Trigger' },
    { value: 'condition.expression', label: '🔀 Conditional Branch' },
    { value: 'parallel', label: '🔄 Parallel Processing' },
    { value: 'wait', label: '⏱️ Wait/Timer' },
    { value: 'approval.policy', label: '👤 Policy-based Approval' },
    { value: 'attestation.campaign', label: '📋 Attestation Campaign' },
    { value: 'sod.evaluate', label: '⚖️ SoD Evaluation' },
    { value: 'risk.evaluate', label: '⚠️ Risk Assessment' },
    { value: 'audit.record', label: '📊 Audit Recording' },
    { value: 'provision.account', label: '➕ Account Provisioning' },
    { value: 'deprovision.account', label: '➖ Account Deprovisioning' },
    { value: 'aggregate.reconcile', label: '🔄 Data Reconciliation' },
    { value: 'notify.channel', label: '📧 Channel Notification' },
    { value: 'webhook.call', label: '🔗 Webhook Call' },
    { value: 'script.run', label: '⚙️ Script Execution' },
    { value: 'transform.data', label: '🔄 Data Transformation' }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormFieldWithTooltip fieldKey="label" label="Task Name" required>
            <Input
              id="node-label"
              value={data.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder="Enter descriptive task name"
            />
          </FormFieldWithTooltip>

          <FormFieldWithTooltip fieldKey="description" label="Description">
            <Textarea
              id="node-description"
              value={data.description || ''}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
              placeholder="Describe the purpose and outcome of this step..."
            />
          </FormFieldWithTooltip>

          <FormFieldWithTooltip fieldKey="risk" label="Risk Level" required>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <Button
                  key={level}
                  variant={data.risk === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onChange({ risk: level })}
                  className="text-xs hover-scale"
                >
                  {level}
                </Button>
              ))}
            </div>
          </FormFieldWithTooltip>

          <div>
            <FormFieldWithTooltip fieldKey="slaTimeout" label="SLA Timeout (hours)">
              <Input
                type="number"
                value={data.slaTimeout || 24}
                onChange={(e) => onChange({ slaTimeout: parseInt(e.target.value) })}
                placeholder="24"
                min="1"
              />
            </FormFieldWithTooltip>
          </div>

          <div>
            <FormFieldWithTooltip fieldKey="auditLog" label="Audit Logging">
              <Button
                variant={data.auditLog ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ auditLog: !data.auditLog })}
                className="text-xs hover-scale"
              >
                {data.auditLog ? 'Enabled' : 'Disabled'}
              </Button>
            </FormFieldWithTooltip>
          </div>

          <div>
            <FormFieldWithTooltip fieldKey="notifications" label="Send Notifications">
              <Button
                variant={data.notifications ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ notifications: !data.notifications })}
                className="text-xs hover-scale"
              >
                {data.notifications ? 'Enabled' : 'Disabled'}
              </Button>
            </FormFieldWithTooltip>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormFieldWithTooltip fieldKey="label" label="Estimated Duration">
            <Input
              value={data.metadata?.estimatedDuration || ''}
              onChange={(e) => onChange({ 
                metadata: { 
                  ...data.metadata, 
                  estimatedDuration: e.target.value 
                } 
              })}
              placeholder="e.g., 2-4 hours"
            />
          </FormFieldWithTooltip>

          <div>
            <FormFieldWithTooltip fieldKey="label" label="Role Type">
              <Select 
                value={data.metadata?.roleType || ''} 
                onValueChange={(value) => onChange({ 
                  metadata: { 
                    ...data.metadata, 
                    roleType: value 
                  } 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="joiner">👋 Joiner</SelectItem>
                  <SelectItem value="mover">🔄 Mover</SelectItem>
                  <SelectItem value="leaver">👋 Leaver</SelectItem>
                  <SelectItem value="request">📝 Request</SelectItem>
                  <SelectItem value="review">👀 Review</SelectItem>
                  <SelectItem value="system">⚙️ System</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldWithTooltip>
          </div>

          <FormFieldWithTooltip fieldKey="description" label="Real-world Purpose">
            <Textarea
              value={data.metadata?.realLifePurpose || ''}
              onChange={(e) => onChange({ 
                metadata: { 
                  ...data.metadata, 
                  realLifePurpose: e.target.value 
                } 
              })}
              placeholder="Explain what this step accomplishes in business terms..."
              rows={2}
            />
          </FormFieldWithTooltip>
        </CardContent>
      </Card>
    </div>
  );
};
