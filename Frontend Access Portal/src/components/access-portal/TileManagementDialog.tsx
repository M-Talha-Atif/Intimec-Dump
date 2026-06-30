import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoryTileConfig, FilterRule, ObjectTypeFilter } from '@/types/access-portal';
import VisualFilterBuilder from './VisualFilterBuilder';
import ObjectTypeFilterBuilder from './ObjectTypeFilterBuilder';
import { Settings, Shield, Filter, Box } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import RoleSelector from './RoleSelector';
import DepartmentSelector from './DepartmentSelector';
import { Loader2 } from 'lucide-react';
import { fetchActiveWorkflows } from '../app-permissions/role-management/utils/userAssignmentUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TileManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tile?: CategoryTileConfig | null;
  onSave: (tileData: Partial<CategoryTileConfig>) => void;
  mode: 'create' | 'edit';
  isLoading?: boolean;
}

const iconNames = [
  'Briefcase',
  'Shield',
  'Users',
  'Database',
  'MessageSquare',
  'Heart',
  'Calculator',
  'Settings',
  'FileText',
  'Cloud',
  'Network',
  'Laptop',
];

const TileManagementDialog: React.FC<TileManagementDialogProps> = ({
  open,
  onOpenChange,
  tile,
  onSave,
  mode,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Briefcase',
    category: '',
    isActive: true,

    // Access Eligibility
    allowedRoles: [] as string[],
    allowedDepartments: [] as string[],
    requireManagerApproval: true,
    workflowId: '',
    maxRiskLevel: 'low' as 'low' | 'medium' | 'high',

    // Request Type Config
    allowRequestForOthers: true,
    requireJustificationForOthers: true,

    // Object Type Filter
    objectTypeFilter: {
      id: 'filter-new',
      enabled: false,
      objectTypes: [] as Array<'application' | 'role' | 'internal-role' | 'group' | 'entitlement'>,
      specificItems: {
        applications: [],
        roles: [],
        groups: [],
        entitlements: [],
      },
      includeChildItems: true,
    } as ObjectTypeFilter,

    // Visual Filters
    visualFilters: [] as FilterRule[],
  });

  const [workflows, setWorkflows] = useState<Array<{ id: string; name: string; description?: string }>>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [pendingOpenState, setPendingOpenState] = useState<boolean | null>(null);
  const [error, setError] = React.useState<string | null>(null);


  const MAX_LENGTH = 256;

  const getCharacterCounter = (current: string, max: number = MAX_LENGTH) => {
    const remaining = max - current.length;
    const isNearLimit = remaining <= 20;
    const isAtLimit = remaining < 0;

    return (
      <div className={`text-xs text-right mt-1 ${isAtLimit ? 'text-destructive font-bold' : isNearLimit ? 'text-amber-600' : 'text-muted-foreground'}`}>
        {current.length}/{max} characters {remaining < 0 && `(exceeded by ${Math.abs(remaining)})`}
      </div>
    );
  };

  // Initialize form data when tile changes
  useEffect(() => {
    if (tile && mode === 'edit') {
      console.log('Loading tile data for edit:', tile);

      setFormData({
        title: tile.title || '',
        description: tile.description || '',
        icon: tile.icon || 'Briefcase',
        category: tile.category || '',
        isActive: tile.isActive ?? true,

        // Access Eligibility
        allowedRoles: tile.requestEligibility?.allowedRoles || [],
        allowedDepartments: tile.requestEligibility?.allowedDepartments || [],
        requireManagerApproval: tile.requestEligibility?.requireManagerApproval ?? true,
        workflowId: tile.requestEligibility?.workflowId || '',
        maxRiskLevel: tile.requestEligibility?.maxRiskLevel || 'low',

        // Request Type Config
        allowRequestForOthers: tile.requestTypeConfig?.allowRequestForOthers ?? true,
        requireJustificationForOthers: tile.requestTypeConfig?.requireJustificationForOthers ?? true,

        // Object Type Filter
        objectTypeFilter: tile.objectTypeFilter || {
          id: `filter-${Date.now()}`,
          enabled: false,
          objectTypes: [],
          specificItems: {
            applications: [],
            roles: [],
            groups: [],
            entitlements: [],
          },
          includeChildItems: true,
        },

        // Visual Filters
        visualFilters: tile.visualFilters || [],
      });
    } else if (mode === 'create') {
      // Reset to defaults for create mode
      setFormData({
        title: '',
        description: '',
        icon: 'Briefcase',
        category: '',
        isActive: true,
        allowedRoles: [],
        allowedDepartments: [],
        requireManagerApproval: true,
        workflowId: '',
        maxRiskLevel: 'low',
        allowRequestForOthers: true,
        requireJustificationForOthers: true,
        objectTypeFilter: {
          id: `filter-${Date.now()}`,
          enabled: false,
          objectTypes: [] as Array<'application' | 'role' | 'internal-role' | 'entitlement'>,
          specificItems: {
            applications: [],
            roles: [],
            groups: [],
            entitlements: [],
          },
          includeChildItems: true,
        },
        visualFilters: [],
      });
    }
  }, [tile, mode, open]);

  /**
 * Check if there are any unsaved changes
 */
  const hasUnsavedChanges = () => {
    // Check if in create mode and any field has been filled
    if (mode === 'create') {
      return (
        formData.title.trim() !== '' ||
        formData.description.trim() !== '' ||
        formData.category.trim() !== '' ||
        formData.icon !== 'Briefcase' ||
        formData.allowedRoles.length > 0 ||
        formData.allowedDepartments.length > 0 ||
        !formData.requireManagerApproval || // Check if changed from default true
        formData.workflowId !== '' ||
        formData.maxRiskLevel !== 'low' ||
        !formData.allowRequestForOthers || // Check if changed from default true
        formData.objectTypeFilter.enabled || // Check if filter enabled
        formData.objectTypeFilter.objectTypes.length > 0 || // Check if any object types selected
        formData.visualFilters.length > 0 // Check if any visual filters added
      );
    }

    // Check if in edit mode and values differ from original tile
    if (mode === 'edit' && tile) {
      return (
        formData.title !== (tile.title || '') ||
        formData.description !== (tile.description || '') ||
        formData.icon !== (tile.icon || 'Briefcase') ||
        formData.category !== (tile.category || '') ||
        formData.isActive !== (tile.isActive ?? true) ||

        // Access Eligibility changes
        JSON.stringify(formData.allowedRoles) !== JSON.stringify(tile.requestEligibility?.allowedRoles || []) ||
        JSON.stringify(formData.allowedDepartments) !== JSON.stringify(tile.requestEligibility?.allowedDepartments || []) ||
        formData.requireManagerApproval !== (tile.requestEligibility?.requireManagerApproval ?? true) ||
        formData.workflowId !== (tile.requestEligibility?.workflowId || '') ||
        formData.maxRiskLevel !== (tile.requestEligibility?.maxRiskLevel || 'low') ||

        // Request Type Config changes
        formData.allowRequestForOthers !== (tile.requestTypeConfig?.allowRequestForOthers ?? true) ||

        // Object Type Filter changes
        JSON.stringify(formData.objectTypeFilter) !== JSON.stringify(tile.objectTypeFilter || {
          id: expect.any(String),
          enabled: false,
          objectTypes: [],
          specificItems: {
            applications: [],
            roles: [],
            groups: [],
            entitlements: [],
          },
          includeChildItems: true,
        }) ||

        // Visual Filters changes
        JSON.stringify(formData.visualFilters) !== JSON.stringify(tile.visualFilters || [])
      );
    }

    return false;
  };


  // Fetch workflows when requireApproval changes
  useEffect(() => {
    if (formData.requireManagerApproval) {
      const loadWorkflows = async () => {
        setIsLoadingWorkflows(true);
        try {
          const wfs = await fetchActiveWorkflows();
          setWorkflows(wfs);
          // Auto-select first workflow if available and not already selected
          if (wfs.length > 0 && !formData.workflowId) {
            setFormData(prev => ({ ...prev, workflowId: wfs[0].id }));
          }
        } catch (error) {
          console.error("Failed to load workflows:", error);
          // toast.error("Failed to load workflows");
        } finally {
          setIsLoadingWorkflows(false);
        }
      };
      loadWorkflows();
    } else {
      // Clear workflow when approval not required
      setFormData(prev => ({ ...prev, workflowId: '' }));
      setWorkflows([]);
    }
  }, [formData.requireManagerApproval]);

  const isFormInvalid =
    !formData.title.trim() ||
    !formData.description.trim() ||
    !formData.category.trim() ||
    !formData.maxRiskLevel; // safety, even though default is "low"


  const handleSubmit = () => {
    setError(null);
    // Validate required fields
    if (!formData.title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (!formData.category.trim()) {
      setError("Please enter a category");
      return;
    }

    if (formData.requireManagerApproval && !formData.workflowId) {
      setError("Please select a workflow for approval");
      return;
    }

    const tileData: Partial<CategoryTileConfig> = {
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      category: formData.category,
      isActive: formData.isActive,

      requestEligibility: {
        allowedRoles: formData.allowedRoles,
        allowedDepartments: formData.allowedDepartments,
        blockedUsers: [],
        workflowId: formData.workflowId,
        requireManagerApproval: formData.requireManagerApproval,
        maxRiskLevel: formData.maxRiskLevel,
      },

      requestTypeConfig: {
        allowRequestForOthers: formData.allowRequestForOthers,
        requireJustificationForOthers: formData.requireJustificationForOthers,
      },

      objectTypeFilter: formData.objectTypeFilter,
      visualFilters: formData.visualFilters,

      // Preserve existing fields if in edit mode
      ...(tile && mode === 'edit' && {
        id: tile.id,
        visibility: tile.visibility,
        order: tile.order,
        itemCount: tile.itemCount,
        approvalRate: tile.approvalRate,
        avgApprovalTime: tile.avgApprovalTime,
        usageStats: tile.usageStats,
      }),
    };

    console.log('[TileManagementDialog] Submitting with visual filters:', formData.visualFilters);

    console.log('Submitting tile data:', tileData);
    onSave(tileData);
  };


  /**
 * Handle sheet open change with unsaved changes check
 */
  const handleOpenChange = (newOpen: boolean) => {
    // If trying to close and there are unsaved changes
    if (!newOpen && hasUnsavedChanges()) {
      setShowDiscardConfirm(true);
      setPendingOpenState(newOpen);
      return;
    }

    // Otherwise, just close
    onOpenChange(newOpen);
  };

  /**
   * Handle keeping edits when discard dialog is cancelled
   */
  const handleKeepEditing = () => {
    setShowDiscardConfirm(false);
    setPendingOpenState(null);
  };

  /**
   * Handle discarding changes and closing
   */
  const handleDiscardChanges = () => {
    setShowDiscardConfirm(false);

    // Reset form data based on mode
    if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        icon: 'Briefcase',
        category: '',
        isActive: true,
        allowedRoles: [],
        allowedDepartments: [],
        requireManagerApproval: true,
        workflowId: '',
        maxRiskLevel: 'low',
        allowRequestForOthers: true,
        requireJustificationForOthers: true,
        objectTypeFilter: {
          id: `filter-${Date.now()}`,
          enabled: false,
          objectTypes: [],
          specificItems: {
            applications: [],
            roles: [],
            groups: [],
            entitlements: [],
          },
          includeChildItems: true,
        },
        visualFilters: [],
      });
    }

    if (pendingOpenState !== null) {
      onOpenChange(pendingOpenState);
      setPendingOpenState(null);
    }
  };

  // Create stable callback for visual filters with debounce
  const handleVisualFiltersChange = useCallback((newFilters: FilterRule[]) => {
    console.log('[TileManagementDialog] Visual filters changed:', newFilters);
    setFormData(prev => ({
      ...prev,
      visualFilters: newFilters,
    }));
  }, []);



  return (
    <>
      {/* Discard Changes Confirmation */}
      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without saving?
              Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleKeepEditing}>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 h-full">
          <div className="flex flex-col h-full">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-6 py-4">
              <SheetHeader className="p-0">
                <SheetTitle>{mode === 'create' ? 'Create New Tile' : 'Edit Tile'}</SheetTitle>
                <SheetDescription>
                  Configure tile appearance, access control, and navigation settings
                </SheetDescription>
              </SheetHeader>
            </div>

            {/* Fixed Tabs List */}
            <div className="flex-shrink-0 px-6 pt-4">
              <Tabs defaultValue="basic" className="w-full" value={activeTab} onValueChange={setActiveTab} >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">
                    <Settings className="h-4 w-4 mr-2" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="access">
                    <Shield className="h-4 w-4 mr-2" />
                    Access Control
                  </TabsTrigger>
                  <TabsTrigger value="object-filters">
                    <Box className="h-4 w-4 mr-2" />
                    Object Filters
                  </TabsTrigger>
                  <TabsTrigger value="visual-filters">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters (ABAC)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Scrollable Tab Content Area */}
            <div className="flex-1 min-h-0 px-6 overflow-y-auto">
              <Tabs defaultValue="basic" className="h-full" value={activeTab} onValueChange={setActiveTab}>
                {/* Basic Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4 pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Title <span className="text-destructive">*</span>
                      </Label>

                      <Input
                        id="title"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Business Applications"
                        maxLength={MAX_LENGTH}
                      />
                      {getCharacterCounter(formData.title)}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Category <span className="text-destructive">*</span>
                      </Label>

                      <Input
                        id="category"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g., Business Applications"
                        maxLength={MAX_LENGTH}
                      />
                      {getCharacterCounter(formData.category)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>

                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={e => {
                        const value = e.target.value;
                        if (value.length <= MAX_LENGTH) {
                          setFormData({ ...formData, description: value });
                        }
                      }}
                      placeholder="Brief description of this access category"
                      maxLength={MAX_LENGTH}
                    />
                    {getCharacterCounter(formData.description)}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon</Label>
                      <Select value={formData.icon} onValueChange={icon => setFormData({ ...formData, icon })}>
                        <SelectTrigger id="icon">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconNames.map(iconName => {
                            const Icon = (LucideIcons as any)[iconName];
                            return (
                              <SelectItem key={iconName} value={iconName}>
                                <div className="flex items-center gap-2">
                                  {Icon && <Icon className="h-4 w-4" />}
                                  {iconName}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pb-4">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={isActive => setFormData({ ...formData, isActive })}
                    />
                    <Label>Active</Label>
                  </div>
                </TabsContent>

                {/* Access Control Tab */}
                <TabsContent value="access" className="space-y-4 mt-4 pb-4">
                  <div className="space-y-4">
                    <RoleSelector formData={formData} setFormData={setFormData} />
                    <DepartmentSelector formData={formData} setFormData={setFormData} />

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.requireManagerApproval}
                          onCheckedChange={requireManagerApproval =>
                            setFormData({ ...formData, requireManagerApproval })
                          }
                        />
                        <Label>Require Approval</Label>
                      </div>

                      {formData.requireManagerApproval && (
                        <div className="space-y-2 p-4 border rounded-md">
                          <Label htmlFor="workflow">
                            Approval Workflow <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.workflowId}
                            onValueChange={workflowId => setFormData({ ...formData, workflowId })}
                            disabled={isLoadingWorkflows || workflows.length === 0}
                          >
                            <SelectTrigger id="workflow">
                              <SelectValue placeholder={
                                isLoadingWorkflows
                                  ? "Loading workflows..."
                                  : workflows.length === 0
                                    ? "No workflows available"
                                    : "Select a workflow"
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {workflows.map((workflow) => (
                                <SelectItem key={workflow.id} value={workflow.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{workflow.name}</span>
                                    {workflow.description && (
                                      <span className="text-xs text-muted-foreground">
                                        {workflow.description}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!formData.workflowId && (
                            <p className="text-xs text-amber-600 mt-2">
                              ⚠️ Please select a workflow for approval processing
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum Risk Level</Label>
                      <Select
                        value={formData.maxRiskLevel}
                        onValueChange={maxRiskLevel =>
                          setFormData({ ...formData, maxRiskLevel: maxRiskLevel as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Request Type Configuration</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.allowRequestForOthers}
                          onCheckedChange={allowRequestForOthers =>
                            setFormData({ ...formData, allowRequestForOthers })
                          }
                        />
                        <Label>Allow Request for Others</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Object Filters Tab */}
                <TabsContent value="object-filters" className="space-y-4 mt-4 pb-4">
                  <ObjectTypeFilterBuilder
                    filter={formData.objectTypeFilter}
                    category={formData.category}
                    onChange={objectTypeFilter => setFormData({ ...formData, objectTypeFilter })}
                  />
                </TabsContent>

                {/* Visual Filters Tab */}
                <TabsContent value="visual-filters" className="space-y-4 mt-4 pb-4">
                  <VisualFilterBuilder
                    rules={formData.visualFilters}
                    onChange={handleVisualFiltersChange}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Fixed Footer with Buttons */}
            <div className="flex-shrink-0 px-6 py-4">

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || isFormInvalid}
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {mode === 'create' ? 'Create Tile' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </>
  );
};

export default TileManagementDialog;
