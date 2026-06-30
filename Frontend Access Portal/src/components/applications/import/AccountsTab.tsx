
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Users, 
  Bot, 
  RefreshCw, 
  Database, 
  Calendar, 
  Eye, 
  UserCheck,
  Settings,
  Filter,
  Building,
  Info,
  X
} from 'lucide-react';
import { Application } from '@/data/mock-applications';
import { TaskScheduler } from '@/components/scheduling/TaskScheduler';
import { TaskSchedule, TaskContext } from '@/types/scheduling';
import { useTaskScheduling } from '@/hooks/useTaskScheduling';

interface AccountsTabProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  application: Application;
  identityType: 'employee' | 'non-employee' | 'non-human';
}

const IDENTITY_SPECIFIC_OPTIONS = {
  employee: {
    statusOptions: ['active', 'inactive', 'on-leave', 'terminated', 'linked', 'orphan'],
    specificFields: [
      { key: 'hr_source_validation', label: 'Validate against HR master source', description: 'Cross-reference with authoritative HR system' },
      { key: 'business_unit_sync', label: 'Sync business unit assignments', description: 'Update organizational hierarchy data' },
      { key: 'job_grade_refresh', label: 'Refresh job grade classifications', description: 'Update role levels and compensation bands' }
    ]
  },
  'non-employee': {
    statusOptions: ['active', 'inactive', 'pending-approval', 'expired', 'terminated', 'linked', 'orphan'],
    specificFields: [
      { key: 'sponsor_validation', label: 'Validate sponsor relationships', description: 'Ensure all non-employees have valid sponsors' },
      { key: 'contract_expiry_check', label: 'Check contract expiration dates', description: 'Identify accounts nearing expiration' },
      { key: 'offboarding_prep', label: 'Prepare for scheduled offboarding', description: 'Flag accounts for upcoming termination' }
    ]
  },
  'non-human': {
    statusOptions: ['active', 'inactive', 'expired', 'rotational', 'deprecated', 'linked', 'orphan'],
    specificFields: [
      { key: 'token_expiry_check', label: 'Check token/certificate expiry', description: 'Identify credentials nearing expiration' },
      { key: 'service_ownership', label: 'Validate service ownership', description: 'Ensure all service accounts have assigned owners' },
      { key: 'rotation_schedule', label: 'Apply credential rotation schedules', description: 'Update passwords/keys based on policy' }
    ]
  }
};

export function AccountsTab({ filters, onFiltersChange, application, identityType }: AccountsTabProps) {
  const { createScheduledTask } = useTaskScheduling();
  
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleMultiSelectValue = (key: string, value: string) => {
    const currentValues = filters[key] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];
    updateFilter(key, newValues);
  };

  const removeMultiSelectValue = (key: string, value: string) => {
    const currentValues = filters[key] || [];
    updateFilter(key, currentValues.filter((v: string) => v !== value));
  };

  const handleScheduleTask = async (schedule: TaskSchedule) => {
    const context: TaskContext = {
      applicationId: String(application.id),
      identityType: identityType,
      aggregationMode: filters.aggregationMode || 'full'
    };

    try {
      await createScheduledTask(
        `${application.name} - Accounts Import (${identityType})`,
        'data-import',
        schedule,
        context
      );
      console.log('Account import task scheduled successfully');
    } catch (error) {
      console.error('Failed to schedule account import task:', error);
    }
  };

  const handleManualRun = () => {
    console.log('Starting manual account import for', application.name);
  };

  const identityConfig = IDENTITY_SPECIFIC_OPTIONS[identityType];
  
  const aggregationOptions = [
    {
      key: 'refresh_assigned_detected_roles',
      label: 'Refresh assigned and detected roles',
      description: 'Update role assignments and detect new role patterns'
    },
    {
      key: 'check_active_policies',
      label: 'Check active policies',
      description: 'Validate current policy compliance and enforcement'
    },
    {
      key: 'correlate_existing_identity',
      label: 'Only create links if they can be correlated to an existing identity',
      description: 'Prevent orphaned accounts by ensuring correlation exists'
    },
    {
      key: 'refresh_identity_risk',
      label: 'Refresh the identity risk scorecards',
      description: 'Recalculate risk scores based on current access patterns'
    },
    {
      key: 'maintain_identity_histories',
      label: 'Maintain identity histories',
      description: 'Preserve historical data for audit and compliance'
    },
    {
      key: 'enable_delta_aggregation',
      label: 'Enable Delta Aggregation',
      description: 'Only process changes since last aggregation'
    },
    {
      key: 'detect_deleted_accounts',
      label: 'Detect deleted accounts',
      description: 'Identify accounts that no longer exist in source system'
    },
    ...identityConfig.specificFields
  ];

  const advancedOptions = [
    {
      key: 'disable_auto_scope_creation',
      label: 'Disable auto creation of scopes',
      description: 'Prevent automatic scope generation'
    },
    {
      key: 'disable_optimization',
      label: 'Disable optimization of unchanged accounts',
      description: 'Process all accounts regardless of change status'
    },
    {
      key: 'promote_managed_attributes',
      label: 'Promote managed attributes',
      description: 'Elevate managed attributes in processing priority'
    },
    {
      key: 'enable_rename_detection',
      label: 'Enable rename detection on managed attributes',
      description: 'Detect when managed attributes have been renamed'
    }
  ];

  const getIdentityIcon = () => {
    switch (identityType) {
      case 'employee': return Users;
      case 'non-employee': return UserCheck;
      case 'non-human': return Bot;
      default: return Users;
    }
  };

  const IdentityIcon = getIdentityIcon();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Identity Context Banner */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <IdentityIcon className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-medium">
                  {identityType === 'employee' && 'Employee Identity Aggregation'}
                  {identityType === 'non-employee' && 'Non-Employee Identity Aggregation'}
                  {identityType === 'non-human' && 'Non-Human Identity Aggregation'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {identityType === 'employee' && 'Processing regular employee accounts with HR master data integration'}
                  {identityType === 'non-employee' && 'Processing contractor, vendor, and temporary worker accounts'}
                  {identityType === 'non-human' && 'Processing service accounts, APIs, and system identities'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Scheduler */}
        <TaskScheduler
          taskType="data-import"
          taskName={`${application.name} - Accounts Import`}
          context={{
            applicationId: String(application.id),
            identityType: identityType,
            aggregationMode: filters.aggregationMode || 'full'
          }}
          onSchedule={handleScheduleTask}
          onManualRun={handleManualRun}
          disabled={!identityType}
        />

        {/* Aggregation Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>Aggregation Mode</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose between full or incremental aggregation based on your needs</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>Choose between full or incremental aggregation</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={filters.aggregationMode} 
              onValueChange={(value) => updateFilter('aggregationMode', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Full Aggregation</div>
                    <div className="text-sm text-muted-foreground">Process all accounts from source system</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delta" id="delta" />
                <Label htmlFor="delta" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Delta Aggregation</div>
                    <div className="text-sm text-muted-foreground">Only process changes since last sync</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Status Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Account Status Filters</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Multi-select account statuses to include in aggregation</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>Filter accounts by their current status (multi-select)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Account Status</Label>
                <Select onValueChange={(value) => toggleMultiSelectValue('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Add status filters..." />
                  </SelectTrigger>
                  <SelectContent>
                    {identityConfig.statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className="capitalize">{status.replace('-', ' ')}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Selected Status Badges */}
                {filters.status && filters.status.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.status.map((status: string) => (
                      <Badge key={status} variant="secondary" className="text-xs">
                        <span className="capitalize">{status.replace('-', ' ')}</span>
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => removeMultiSelectValue('status', status)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="owner">Owner Filter</Label>
                <Input 
                  id="owner"
                  placeholder={`Filter by ${identityType === 'non-human' ? 'service owner' : 'account owner'}...`}
                  value={filters.owner || ''}
                  onChange={(e) => updateFilter('owner', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="creationDate">Creation Date</Label>
                <Input 
                  id="creationDate"
                  type="date"
                  value={filters.creationDate || ''}
                  onChange={(e) => updateFilter('creationDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lastSeen">Last Seen After</Label>
                <Input 
                  id="lastSeen"
                  type="date"
                  value={filters.lastSeen || ''}
                  onChange={(e) => updateFilter('lastSeen', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Aggregation Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Account Aggregation Options</span>
            </CardTitle>
            <CardDescription>
              Configure specific aggregation behaviors for {identityType.replace('-', ' ')} accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aggregationOptions.map((option) => (
              <div key={option.key} className="flex items-start space-x-3">
                <Checkbox 
                  id={option.key}
                  checked={filters[option.key] || false}
                  onCheckedChange={(checked) => updateFilter(option.key, checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor={option.key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Advanced Options</span>
            </CardTitle>
            <CardDescription>Advanced configuration for power users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {advancedOptions.map((option) => (
              <div key={option.key} className="flex items-start space-x-3">
                <Checkbox 
                  id={option.key}
                  checked={filters[option.key] || false}
                  onCheckedChange={(checked) => updateFilter(option.key, checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor={option.key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxDeletedAccounts">Maximum deleted accounts</Label>
                <Input 
                  id="maxDeletedAccounts"
                  type="number"
                  placeholder="Enter limit..."
                  value={filters.maxDeletedAccounts || ''}
                  onChange={(e) => updateFilter('maxDeletedAccounts', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="objectsPerPartition">Objects per partition</Label>
                <Input 
                  id="objectsPerPartition"
                  type="number"
                  placeholder="Enter count..."
                  value={filters.objectsPerPartition || ''}
                  onChange={(e) => updateFilter('objectsPerPartition', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lossLimit">Loss Limit</Label>
                <Input 
                  id="lossLimit"
                  type="number"
                  placeholder="Enter percentage..."
                  value={filters.lossLimit || ''}
                  onChange={(e) => updateFilter('lossLimit', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maxErrors">Maximum errors before termination</Label>
                <Input 
                  id="maxErrors"
                  type="number"
                  placeholder="Enter count..."
                  value={filters.maxErrors || ''}
                  onChange={(e) => updateFilter('maxErrors', e.target.value)}
                />
              </div>
            </div>

            {/* Hint for complex filters */}
            {(filters.status?.length > 3 || Object.keys(filters).length > 8) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Complex filter configuration detected. Consider using presets for common scenarios.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
