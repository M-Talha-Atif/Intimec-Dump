"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface CertificationConfigProps {
  config: any;
  onChange: (config: any) => void;
}

export const CertificationConfig: React.FC<CertificationConfigProps> = ({ config, onChange }) => {
  const certConfig = config.certificationConfig || {
    type: 'access-review',
    scope: 'user',
    schedule: { frequency: 'quarterly', dayOfMonth: 1 },
    reviewers: [],
    autoApprove: { enabled: false, conditions: [] },
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Certification Type</Label>
        <Select 
          value={certConfig.type || 'access-review'} 
          onValueChange={(value) => onChange({ 
            ...config, 
            certificationConfig: { ...certConfig, type: value } 
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="access-review">Access Review</SelectItem>
            <SelectItem value="role-review">Role Review</SelectItem>
            <SelectItem value="entitlement-review">Entitlement Review</SelectItem>
            <SelectItem value="sod-review">SoD Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Review Scope</Label>
        <Select 
          value={certConfig.scope || 'user'} 
          onValueChange={(value) => onChange({ 
            ...config, 
            certificationConfig: { ...certConfig, scope: value } 
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User Access</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="application">Application</SelectItem>
            <SelectItem value="all">All Access</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Frequency</Label>
        <Select 
          value={certConfig.schedule?.frequency || 'quarterly'} 
          onValueChange={(value) => onChange({ 
            ...config, 
            certificationConfig: { 
              ...certConfig, 
              schedule: { ...certConfig.schedule, frequency: value } 
            } 
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="semi-annual">Semi-Annual</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Reviewers (comma-separated)</Label>
        <Input
          value={certConfig.reviewers?.join(', ') || ''}
          onChange={(e) => onChange({
            ...config,
            certificationConfig: {
              ...certConfig,
              reviewers: e.target.value.split(',').map(r => r.trim()).filter(Boolean)
            }
          })}
          placeholder="manager, app-owner, security-team"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Auto-Approve Low Risk</Label>
          <p className="text-xs text-muted-foreground">Automatically approve low-risk certifications</p>
        </div>
        <Switch
          checked={certConfig.autoApprove?.enabled || false}
          onCheckedChange={(checked) => onChange({
            ...config,
            certificationConfig: {
              ...certConfig,
              autoApprove: { ...certConfig.autoApprove, enabled: checked }
            }
          })}
        />
      </div>

      {certConfig.autoApprove?.enabled && (
        <div>
          <Label>Auto-Approve Conditions</Label>
          <Textarea
            value={certConfig.autoApprove.conditions?.join('\n') || ''}
            onChange={(e) => onChange({
              ...config,
              certificationConfig: {
                ...certConfig,
                autoApprove: {
                  ...certConfig.autoApprove,
                  conditions: e.target.value.split('\n').filter(Boolean)
                }
              }
            })}
            placeholder="risk_level == 'low'&#10;last_used_days < 30"
            rows={4}
          />
        </div>
      )}
    </div>
  );
};
