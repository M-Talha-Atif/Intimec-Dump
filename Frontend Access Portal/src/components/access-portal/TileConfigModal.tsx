import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ObjectTypeFilterBuilder from './ObjectTypeFilterBuilder';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Filter, GitBranch, Box } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { TileConfig, CategoryTileConfig, ObjectTypeFilter, FilterRule } from '@/types/access-portal';



interface TileConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  tile?: TileConfig | null;
  onSave: (config: TileConfig) => void;
  isCreating?: boolean;
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
  'AppWindow',
  'Building',
  'UserCheck',
  'FolderOpen',
  'Plus',
];

const colorOptions = [
  { value: 'from-blue-500 to-blue-600', label: 'Blue', preview: 'bg-gradient-to-r from-blue-500 to-blue-600' },
  { value: 'from-purple-500 to-purple-600', label: 'Purple', preview: 'bg-gradient-to-r from-purple-500 to-purple-600' },
  { value: 'from-green-500 to-green-600', label: 'Green', preview: 'bg-gradient-to-r from-green-500 to-green-600' },
  { value: 'from-red-500 to-red-600', label: 'Red', preview: 'bg-gradient-to-r from-red-500 to-red-600' },
  { value: 'from-orange-500 to-orange-600', label: 'Orange', preview: 'bg-gradient-to-r from-orange-500 to-orange-600' },
  { value: 'from-pink-500 to-pink-600', label: 'Pink', preview: 'bg-gradient-to-r from-pink-500 to-pink-600' },
  { value: 'from-teal-500 to-teal-600', label: 'Teal', preview: 'bg-gradient-to-r from-teal-500 to-teal-600' },
];

const TileConfigModal: React.FC<TileConfigModalProps> = ({
  isOpen,
  onClose,
  tile,
  onSave,
  isCreating = false
}) => {

  const defaultConfig: TileConfig = {
    id: `tile-${Date.now()}`,
    title: '',
    description: '',
    category: 'applications',
    icon: 'AppWindow',
    color: 'from-blue-500 to-blue-600',
    visibility: ['all-users'],
    isActive: true,
    routingLogic: '',
    filterLogic: '',
    allowedRoles: [],
    allowedDepartments: [],
    requireManagerApproval: true,
    requireTraining: false,
    trainingIds: [],
    maxRiskLevel: 'critical',
    allowSelfRequest: true,
    allowRequestForOthers: true,
    allowBulkRequest: false,
    maxBulkSize: 10,
    requireJustificationForOthers: true,
    displayMode: 'grid',
    sortBy: 'name',
    showStats: true,
    // Object Type Filter
    objectTypeFilter: {
      id: 'filter-new',
      enabled: false,
      objectTypes: [],
      specificItems: {
        applications: [],
        roles: [],
        groups: [],
        entitlements: [],
      },
      includeChildItems: true,
    } as ObjectTypeFilter,
    visualFilters: [] as FilterRule[],
  };

  const [config, setConfig] = useState<TileConfig>(defaultConfig);

  const [selectedVisibility, setSelectedVisibility] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');
  const [trainingInput, setTrainingInput] = useState('');


  const categoryOptions = [
    { value: 'applications', label: 'Business Applications' },
    { value: 'directories', label: 'Directories' },
    { value: 'roles', label: 'Roles' },
    { value: 'peers', label: 'Peers Access' },
    { value: 'shared-folders', label: 'Shared Folders' },
    { value: 'catalog', label: 'Full Catalog' },
    { value: 'oracle', label: 'Oracle Applications' }
  ];

  useEffect(() => {
    if (tile && !isCreating) {
      setConfig({
        ...tile,
        allowedRoles: tile.allowedRoles || [],
        allowedDepartments: tile.allowedDepartments || [],
        requireManagerApproval: tile.requireManagerApproval ?? true,
        requireTraining: tile.requireTraining ?? false,
        trainingIds: tile.trainingIds || [],
        maxRiskLevel: tile.maxRiskLevel || 'critical',
        allowSelfRequest: tile.allowSelfRequest ?? true,
        allowRequestForOthers: tile.allowRequestForOthers ?? true,
        allowBulkRequest: tile.allowBulkRequest ?? false,
        maxBulkSize: tile.maxBulkSize || 10,
        requireJustificationForOthers: tile.requireJustificationForOthers ?? true,
        displayMode: tile.displayMode || 'grid',
        sortBy: tile.sortBy || 'name',
        showStats: tile.showStats ?? true,
        color: tile.color || 'from-blue-500 to-blue-600',
        objectTypeFilter: {
          id: tile.objectTypeFilter?.id || 'filter-new',
          enabled: tile.objectTypeFilter?.enabled ?? false,
          objectTypes: tile.objectTypeFilter?.objectTypes || [],
          specificItems: {
            applications: tile.objectTypeFilter?.specificItems?.applications || [],
            roles: tile.objectTypeFilter?.specificItems?.roles || [],
            groups: tile.objectTypeFilter?.specificItems?.groups || [],
            entitlements: tile.objectTypeFilter?.specificItems?.entitlements || [],
          },
          includeChildItems: tile.objectTypeFilter?.includeChildItems ?? true,
          hierarchyLevels: tile.objectTypeFilter?.hierarchyLevels || [],
          maxHierarchyDepth: tile.objectTypeFilter?.maxHierarchyDepth,
          specificApplications: tile.objectTypeFilter?.specificApplications,
          specificDepartments: tile.objectTypeFilter?.specificDepartments,
        } as ObjectTypeFilter,
      });
      setSelectedVisibility(tile.visibility);
    } else if (isCreating) {
      setConfig({
        id: `tile-${Date.now()}`,
        title: '',
        description: '',
        category: 'applications',
        icon: 'AppWindow',
        color: 'from-blue-500 to-blue-600',
        visibility: ['all-users'],
        isActive: true,
        routingLogic: '',
        filterLogic: '',
        allowedRoles: [],
        allowedDepartments: [],
        requireManagerApproval: true,
        requireTraining: false,
        trainingIds: [],
        maxRiskLevel: 'critical',
        allowSelfRequest: true,
        allowRequestForOthers: true,
        allowBulkRequest: false,
        maxBulkSize: 10,
        requireJustificationForOthers: true,
        displayMode: 'grid',
        sortBy: 'name',
        showStats: true,
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
      setSelectedVisibility(['all-users']);
    }
  }, [tile, isCreating, isOpen]);

  const addRole = () => {
    if (roleInput && !config.allowedRoles?.includes(roleInput)) {
      setConfig({ ...config, allowedRoles: [...(config.allowedRoles || []), roleInput] });
      setRoleInput('');
    }
  };

  const removeRole = (role: string) => {
    setConfig({ ...config, allowedRoles: config.allowedRoles?.filter(r => r !== role) });
  };

  const addDepartment = () => {
    if (departmentInput && !config.allowedDepartments?.includes(departmentInput)) {
      setConfig({ ...config, allowedDepartments: [...(config.allowedDepartments || []), departmentInput] });
      setDepartmentInput('');
    }
  };

  const removeDepartment = (dept: string) => {
    setConfig({ ...config, allowedDepartments: config.allowedDepartments?.filter(d => d !== dept) });
  };

  const addTraining = () => {
    if (trainingInput && !config.trainingIds?.includes(trainingInput)) {
      setConfig({ ...config, trainingIds: [...(config.trainingIds || []), trainingInput] });
      setTrainingInput('');
    }
  };

  const removeTraining = (training: string) => {
    setConfig({ ...config, trainingIds: config.trainingIds?.filter(t => t !== training) });
  };

  const handleSave = () => {
    const updatedConfig = {
      ...config,
      visibility: selectedVisibility
    };
    onSave(updatedConfig);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl sm:max-w-6xl md:max-w-4xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Create New Tile' : 'Edit Tile Configuration'}
          </DialogTitle>
          <DialogDescription>
            Configure tile appearance, access control, and navigation settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="!text-gray-500 data-[state=active]:!text-black">
              <Settings className="h-4 w-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="access" className="!text-gray-500 data-[state=active]:!text-black">
              <Shield className="h-4 w-4 mr-2" />
              Access Control
            </TabsTrigger>
            <TabsTrigger value="object-filters" className="!text-gray-500 data-[state=active]:!text-black">
              <Box className="h-4 w-4 mr-2" />
              Object Filters
            </TabsTrigger>
            <TabsTrigger value="visual-filters" className="!text-gray-500 data-[state=active]:!text-black">
              <Filter className="h-4 w-4 mr-2" />
              Filters (ABAC)
            </TabsTrigger>
            <TabsTrigger value="hierarchy" className="!text-gray-500 data-[state=active]:!text-black">
              <GitBranch className="h-4 w-4 mr-2" />
              Hierarchy
            </TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={e => setConfig({ ...config, title: e.target.value })}
                  placeholder="e.g., Business Applications"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={config.category}
                  onValueChange={value => setConfig({ ...config, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={e => setConfig({ ...config, description: e.target.value })}
                placeholder="Brief description of this access category"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select value={config.icon} onValueChange={icon => setConfig({ ...config, icon })}>
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

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select value={config.color} onValueChange={color => setConfig({ ...config, color })}>
                  <SelectTrigger id="color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${option.preview}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterLogic">Filter Logic</Label>
              <Input
                id="filterLogic"
                value={config.filterLogic || ''}
                onChange={e => setConfig({ ...config, filterLogic: e.target.value })}
                placeholder="e.g., category:Business Applications"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={config.isActive}
                onCheckedChange={isActive => setConfig({ ...config, isActive })}
              />
              <Label>Active</Label>
            </div>
          </TabsContent>


          {/* Access Control Tab */}
          <TabsContent value="access" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Allowed Roles</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Leave empty to allow all roles
                </p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={roleInput}
                    onChange={e => setRoleInput(e.target.value)}
                    placeholder="Enter role name"
                    onKeyPress={e => e.key === 'Enter' && addRole()}
                  />
                  <Button onClick={addRole} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.allowedRoles?.map(role => (
                    <Badge key={role} variant="secondary">
                      {role}
                      <button onClick={() => removeRole(role)} className="ml-2">×</button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Allowed Departments</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Leave empty to allow all departments
                </p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={departmentInput}
                    onChange={e => setDepartmentInput(e.target.value)}
                    placeholder="Enter department name"
                    onKeyPress={e => e.key === 'Enter' && addDepartment()}
                  />
                  <Button onClick={addDepartment} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.allowedDepartments?.map(dept => (
                    <Badge key={dept} variant="secondary">
                      {dept}
                      <button onClick={() => removeDepartment(dept)} className="ml-2">×</button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.requireManagerApproval}
                    onCheckedChange={requireManagerApproval =>
                      setConfig({ ...config, requireManagerApproval })
                    }
                  />
                  <Label>Require Manager Approval</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.requireTraining}
                    onCheckedChange={requireTraining =>
                      setConfig({ ...config, requireTraining })
                    }
                  />
                  <Label>Require Training</Label>
                </div>

                {config.requireTraining && (
                  <div>
                    <Label>Required Training IDs</Label>
                    <div className="flex gap-2 mb-2 mt-2">
                      <Input
                        value={trainingInput}
                        onChange={e => setTrainingInput(e.target.value)}
                        placeholder="Enter training ID"
                        onKeyPress={e => e.key === 'Enter' && addTraining()}
                      />
                      <Button onClick={addTraining} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {config.trainingIds?.map(training => (
                        <Badge key={training} variant="secondary">
                          {training}
                          <button onClick={() => removeTraining(training)} className="ml-2">×</button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Maximum Risk Level</Label>
                  <Select
                    value={config.maxRiskLevel}
                    onValueChange={maxRiskLevel =>
                      setConfig({ ...config, maxRiskLevel: maxRiskLevel as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Request Type Configuration</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.allowSelfRequest}
                      onCheckedChange={allowSelfRequest =>
                        setConfig({ ...config, allowSelfRequest })
                      }
                    />
                    <Label>Allow Self Request</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.allowRequestForOthers}
                      onCheckedChange={allowRequestForOthers =>
                        setConfig({ ...config, allowRequestForOthers })
                      }
                    />
                    <Label>Allow Request for Others</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.allowBulkRequest}
                      onCheckedChange={allowBulkRequest =>
                        setConfig({ ...config, allowBulkRequest })
                      }
                    />
                    <Label>Allow Bulk Request</Label>
                  </div>

                  {config.allowBulkRequest && (
                    <div className="space-y-2">
                      <Label>Max Bulk Size</Label>
                      <Input
                        type="number"
                        value={config.maxBulkSize}
                        onChange={e =>
                          setConfig({ ...config, maxBulkSize: parseInt(e.target.value) || 10 })
                        }
                      />
                    </div>
                  )}

                  {config.allowRequestForOthers && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.requireJustificationForOthers}
                        onCheckedChange={requireJustificationForOthers =>
                          setConfig({ ...config, requireJustificationForOthers })
                        }
                      />
                      <Label>Require Justification for Others</Label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Object Filters Tab */}
          <TabsContent value="object-filters" className="space-y-4 mt-4">
            <ObjectTypeFilterBuilder
              filter={config.objectTypeFilter!} // non-null assertion is safe because defaultConfig sets it
              category={config.category}
              onChange={(objectTypeFilter) =>
                setConfig({ ...config, objectTypeFilter })
              }
            />
          </TabsContent>

          {/* Visual Filters Tab */}
          <TabsContent value="visual-filters" className="space-y-4 mt-4">
            <div className="text-center py-12 text-gray-500">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Visual filters configuration coming soon</p>
            </div>
          </TabsContent>

          {/* Hierarchy Tab */}
          <TabsContent value="hierarchy" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Display Mode</Label>
                <Select
                  value={config.displayMode}
                  onValueChange={displayMode =>
                    setConfig({ ...config, displayMode: displayMode as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={config.sortBy}
                  onValueChange={sortBy => setConfig({ ...config, sortBy })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="riskLevel">Risk Level</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="requestCount">Request Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.showStats}
                  onCheckedChange={showStats => setConfig({ ...config, showStats })}
                />
                <Label>Show Statistics</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isCreating ? 'Create Tile' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TileConfigModal;