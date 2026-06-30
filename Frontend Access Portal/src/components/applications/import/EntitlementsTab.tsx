
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
  Shield, 
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
  X,
  Users,
  Key,
  Crown,
  Package,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Application } from '@/data/mock-applications';
import { TaskScheduler } from '@/components/scheduling/TaskScheduler';
import { TaskSchedule, TaskContext } from '@/types/scheduling';
import { useTaskScheduling } from '@/hooks/useTaskScheduling';

interface EntitlementsTabProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  application: Application;
  identityType: 'employee' | 'non-employee' | 'non-human';
}

const IDENTITY_SPECIFIC_OPTIONS = {
  employee: {
    statusOptions: ['active', 'inactive', 'request-able', 'non-request-able', 'expired', 'pending'],
    entitlementTypes: ['permission', 'role', 'license', 'group', 'custom'],
    specificFields: [
      { key: 'hr_entitlement_sync', label: 'Sync with HR entitlement catalog', description: 'Cross-reference with HR-managed access definitions' },
      { key: 'business_role_mapping', label: 'Map to business roles', description: 'Connect technical entitlements to business functions' },
      { key: 'job_grade_entitlements', label: 'Filter by job grade requirements', description: 'Show entitlements relevant to role levels' }
    ]
  },
  'non-employee': {
    statusOptions: ['active', 'inactive', 'request-able', 'non-request-able', 'expired', 'pending-approval', 'contractor-only'],
    entitlementTypes: ['permission', 'role', 'license', 'temporary-access', 'project-based', 'custom'],
    specificFields: [
      { key: 'sponsor_approval_req', label: 'Require sponsor approval for requests', description: 'All entitlement requests need sponsor sign-off' },
      { key: 'contract_based_filtering', label: 'Filter by contract type', description: 'Show entitlements based on contractor agreement type' },
      { key: 'time_bound_access', label: 'Enable time-bound access controls', description: 'Set automatic expiration for contractor entitlements' }
    ]
  },
  'non-human': {
    statusOptions: ['active', 'inactive', 'rotational', 'system-managed', 'deprecated', 'api-only'],
    entitlementTypes: ['permission', 'api-key', 'certificate', 'system-role', 'service-account', 'custom'],
    specificFields: [
      { key: 'service_entitlement_ownership', label: 'Validate service entitlement ownership', description: 'Ensure all service entitlements have assigned owners' },
      { key: 'api_scope_validation', label: 'Validate API scopes and permissions', description: 'Check API access scopes against service requirements' },
      { key: 'certificate_expiry_check', label: 'Monitor certificate-based entitlements', description: 'Track certificate expiration for access control' }
    ]
  }
};

export function EntitlementsTab({ filters, onFiltersChange, application, identityType }: EntitlementsTabProps) {
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
        `${application.name} - Entitlements Import (${identityType})`,
        'data-import',
        schedule,
        context
      );
      console.log('Entitlements import task scheduled successfully');
    } catch (error) {
      console.error('Failed to schedule entitlements import task:', error);
    }
  };

  const handleManualRun = () => {
    console.log('Starting manual entitlements import for', application.name);
  };

  const identityConfig = IDENTITY_SPECIFIC_OPTIONS[identityType];
  
  const aggregationOptions = [
    {
      key: 'refresh_entitlement_assignments',
      label: 'Refresh entitlement assignments',
      description: 'Update who has access to what entitlements'
    },
    {
      key: 'check_request_policies',
      label: 'Check request policies',
      description: 'Validate current request and approval policies'
    },
    {
      key: 'correlate_entitlement_usage',
      label: 'Correlate entitlement usage patterns',
      description: 'Analyze how entitlements are actually being used'
    },
    {
      key: 'refresh_entitlement_risk',
      label: 'Refresh the entitlement risk scorecards',
      description: 'Recalculate risk scores based on current usage and assignments'
    },
    {
      key: 'maintain_entitlement_histories',
      label: 'Maintain entitlement histories',
      description: 'Preserve historical assignment and usage data'
    },
    {
      key: 'enable_delta_aggregation',
      label: 'Enable Delta Aggregation',
      description: 'Only process entitlement changes since last aggregation'
    },
    {
      key: 'detect_orphaned_entitlements',
      label: 'Detect orphaned entitlements',
      description: 'Identify entitlements without proper ownership or assignment'
    },
    ...identityConfig.specificFields
  ];

  const advancedOptions = [
    {
      key: 'disable_auto_categorization',
      label: 'Disable auto-categorization of entitlements',
      description: 'Prevent automatic entitlement type classification'
    },
    {
      key: 'disable_unused_optimization',
      label: 'Disable optimization of unused entitlements',
      description: 'Process all entitlements regardless of usage status'
    },
    {
      key: 'promote_high_value_entitlements',
      label: 'Promote high-value entitlements',
      description: 'Prioritize critical business entitlements in processing'
    },
    {
      key: 'enable_cost_tracking',
      label: 'Enable cost tracking for licensed entitlements',
      description: 'Track licensing costs and usage efficiency'
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
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-purple-500" />
              <IdentityIcon className="h-4 w-4 text-purple-500" />
              <div>
                <h3 className="font-medium">
                  {identityType === 'employee' && 'Employee Entitlement Aggregation'}
                  {identityType === 'non-employee' && 'Non-Employee Entitlement Aggregation'}
                  {identityType === 'non-human' && 'Non-Human Entitlement Aggregation'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {identityType === 'employee' && 'Processing employee-specific permissions, roles, and licenses'}
                  {identityType === 'non-employee' && 'Processing contractor and vendor entitlements with sponsor controls'}
                  {identityType === 'non-human' && 'Processing service account and API entitlements with ownership tracking'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Scheduler */}
        <TaskScheduler
          taskType="data-import"
          taskName={`${application.name} - Entitlements Import`}
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
              <span>Entitlement Aggregation Mode</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose between full or incremental entitlement aggregation</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>Choose between full or incremental entitlement processing</CardDescription>
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
                    <div className="font-medium">Full Entitlement Aggregation</div>
                    <div className="text-sm text-muted-foreground">Process all entitlements from source system</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delta" id="delta" />
                <Label htmlFor="delta" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Delta Entitlement Aggregation</div>
                    <div className="text-sm text-muted-foreground">Only process entitlement changes since last sync</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Enhanced Status and Type Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Entitlement Filters</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Multi-select entitlement status and types to include in aggregation</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>Filter entitlements by status and type (multi-select supported)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Entitlement Status</Label>
                <Select onValueChange={(value) => toggleMultiSelectValue('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Add status filters..." />
                  </SelectTrigger>
                  <SelectContent>
                    {identityConfig.statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center space-x-2">
                          {status === 'request-able' && <Package className="h-4 w-4 text-green-500" />}
                          {status === 'non-request-able' && <X className="h-4 w-4 text-red-500" />}
                          {status === 'active' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                          {status === 'inactive' && <Clock className="h-4 w-4 text-gray-500" />}
                          <span className="capitalize">{status.replace('-', ' ')}</span>
                        </div>
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
                <Label htmlFor="entitlementType">Entitlement Type</Label>
                <Select onValueChange={(value) => toggleMultiSelectValue('entitlementType', value)}>
                  <SelectTrigger id="entitlementType">
                    <SelectValue placeholder="Add type filters..." />
                  </SelectTrigger>
                  <SelectContent>
                    {identityConfig.entitlementTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center space-x-2">
                          {type === 'permission' && <Key className="h-4 w-4 text-blue-500" />}
                          {type === 'role' && <Crown className="h-4 w-4 text-purple-500" />}
                          {type === 'license' && <Package className="h-4 w-4 text-green-500" />}
                          {type === 'custom' && <Settings className="h-4 w-4 text-orange-500" />}
                          <span className="capitalize">{type.replace('-', ' ')}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Selected Type Badges */}
                {filters.entitlementType && filters.entitlementType.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.entitlementType.map((type: string) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        <span className="capitalize">{type.replace('-', ' ')}</span>
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => removeMultiSelectValue('entitlementType', type)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="owner">Entitlement Owner</Label>
                <Input 
                  id="owner"
                  placeholder={`Filter by ${identityType === 'non-human' ? 'service owner' : 'entitlement owner'}...`}
                  value={filters.owner || ''}
                  onChange={(e) => updateFilter('owner', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="scope">Entitlement Scope</Label>
                <Select onValueChange={(value) => updateFilter('scope', value)}>
                  <SelectTrigger id="scope">
                    <SelectValue placeholder="Select scope..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="application">Application</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="lastSeen">Last Used After</Label>
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

        {/* Entitlement Aggregation Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Entitlement Aggregation Options</span>
            </CardTitle>
            <CardDescription>
              Configure specific aggregation behaviors for {identityType.replace('-', ' ')} entitlements
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
            <CardDescription>Advanced configuration for entitlement processing</CardDescription>
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
                <Label htmlFor="maxCostThreshold">Maximum cost threshold</Label>
                <Input 
                  id="maxCostThreshold"
                  type="number"
                  placeholder="Enter cost limit..."
                  value={filters.maxCostThreshold || ''}
                  onChange={(e) => updateFilter('maxCostThreshold', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="minUsageThreshold">Minimum usage threshold (%)</Label>
                <Input 
                  id="minUsageThreshold"
                  type="number"
                  placeholder="Enter percentage..."
                  value={filters.minUsageThreshold || ''}
                  onChange={(e) => updateFilter('minUsageThreshold', e.target.value)}
                />
              </div>
            </div>

            {/* Enhanced filter complexity hint */}
            {(filters.status?.length > 2 || filters.entitlementType?.length > 2 || Object.keys(filters).length > 8) && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Complex entitlement filter configuration detected. Results will be highly targeted.
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
