"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Shield } from 'lucide-react';

interface LifecycleNodeConfigProps {
  config: any;
  onChange: (config: any) => void;
}

export const LifecycleNodeConfig: React.FC<LifecycleNodeConfigProps> = ({
  config,
  onChange
}) => {
  const lifecycleConfig = config.lifecycleConfig || {
    phase: 'onboard',
    rules: {}
  };

  const updateConfig = (updates: any) => {
    onChange({
      ...config,
      lifecycleConfig: {
        ...lifecycleConfig,
        ...updates
      }
    });
  };

  const lifecyclePhases = [
    { value: 'pre-hire', label: 'Pre-Hire', icon: '📋', description: 'Before start date' },
    { value: 'onboard', label: 'Onboarding', icon: '🎉', description: 'First day through probation' },
    { value: 'active', label: 'Active Employee', icon: '💼', description: 'Normal operations' },
    { value: 'transfer', label: 'Transfer/Mover', icon: '🔄', description: 'Department or role change' },
    { value: 'offboard', label: 'Offboarding', icon: '👋', description: 'Notice period through last day' },
    { value: 'post-termination', label: 'Post-Termination', icon: '📦', description: 'After last day' },
  ];

  const templates = {
    'onboard': {
      name: 'Standard Employee Onboarding',
      steps: ['Create AD Account', 'Provision Email', 'Assign Base Roles', 'Setup Hardware', 'Training Enrollment'],
    },
    'transfer': {
      name: 'Department Transfer',
      steps: ['Assess Current Access', 'Calculate Delta', 'Remove Old Roles', 'Add New Roles', 'Update Manager'],
    },
    'offboard': {
      name: 'Employee Termination',
      steps: ['Disable Accounts', 'Revoke Access', 'Archive Data', 'Transfer Ownership', 'Final Audit'],
    },
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Lifecycle Phase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Select Phase</Label>
            <div className="grid grid-cols-2 gap-2">
              {lifecyclePhases.map((phase) => (
                <Card
                  key={phase.value}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    lifecycleConfig.phase === phase.value ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => updateConfig({ phase: phase.value })}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{phase.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{phase.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {lifecycleConfig.phase && templates[lifecycleConfig.phase as keyof typeof templates] && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">
                      Template: {templates[lifecycleConfig.phase as keyof typeof templates].name}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {templates[lifecycleConfig.phase as keyof typeof templates].steps.map((step, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-white">
                          {idx + 1}. {step}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {lifecycleConfig.phase === 'transfer' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Access Management Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Carry Forward Access</Label>
                <p className="text-xs text-muted-foreground">Keep existing access during transfer</p>
              </div>
              <Switch
                checked={lifecycleConfig.rules?.carryForwardAccess || false}
                onCheckedChange={(checked) => updateConfig({ 
                  rules: { 
                    ...lifecycleConfig.rules, 
                    carryForwardAccess: checked,
                    revokeAll: false
                  } 
                })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Reconcile Strategy</Label>
              <Select 
                value={lifecycleConfig.rules?.reconcileStrategy || 'delta'} 
                onValueChange={(value) => updateConfig({ 
                  rules: { ...lifecycleConfig.rules, reconcileStrategy: value } 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delta">Delta (Add missing, keep existing)</SelectItem>
                  <SelectItem value="replace">Replace All</SelectItem>
                  <SelectItem value="additive">Additive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
