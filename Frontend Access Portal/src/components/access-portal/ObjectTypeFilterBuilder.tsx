import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ObjectTypeFilter } from '@/types/access-portal';
import { mockHierarchicalAccessItems } from '@/data/mock-access-hierarchy';
import { getFilteredItemCount } from '@/utils/objectTypeFilterEngine';
import {
  Database,
  Shield,
  Key,
  Info,
  Settings,
  Check,
} from 'lucide-react';
import ObjectItemSelectorModal from './ObjectItemSelectorModal';
import { fetchEntitlements } from '@/hooks/useEntitlements';

interface ObjectTypeFilterBuilderProps {
  filter: ObjectTypeFilter;
  category: string;
  onChange: (filter: ObjectTypeFilter) => void;
}

const OBJECT_TYPES = [
  {
    value: 'application' as const,
    label: 'Applications',
    description: 'System and application level access',
    icon: Database,
  },
  {
    value: 'internal-role' as const,
    label: 'Internal Roles',
    description: 'Collections of internal roles',
    icon: Shield,
  },
  {
    value: 'role' as const,
    label: 'Business Roles',
    description: 'Collections of permissions and entitlements',
    icon: Shield,
  },
  {
    value: 'entitlement' as const,
    label: 'Entitlements',
    description: 'Specific permissions and privileges',
    icon: Key,
  },
];

const ObjectTypeFilterBuilder: React.FC<ObjectTypeFilterBuilderProps> = ({
  filter,
  category,
  onChange,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState<
    'application' | 'role' | 'group' | 'entitlement' | 'internal-role'
  >('application');

  // State for internal roles count
  const [internalRolesCount, setInternalRolesCount] = useState(0);

  // State for entitlements count
  const [entitlementsCount, setEntitlementsCount] = useState(0);

  // Fetch internal roles count
  useEffect(() => {
    const fetchInternalRolesCount = async () => {
      try {
        const res = await fetch('/api/access-portal/roles?page=0&size=1');
        if (res.ok) {
          const json = await res.json();
          setInternalRolesCount(json.totalElements ?? 0);
        }
      } catch (err) {
        console.error('Failed to fetch internal roles count', err);
      }
    };

    fetchInternalRolesCount();
  }, []);

  // Fetch entitlements count (only requestable entitlements)
  useEffect(() => {
    const fetchEntitlementsCount = async () => {
      try {
        const result = await fetchEntitlements({ page: 0, size: 1, requestable: true });
        setEntitlementsCount(result.totalElements ?? 0);
      } catch (err) {
        console.error('Failed to fetch entitlements count', err);
      }
    };

    fetchEntitlementsCount();
  }, []);

  const updateFilter = (updates: Partial<ObjectTypeFilter>) => {
    onChange({ ...filter, ...updates });
  };

  const toggleObjectType = (
    type: 'application' | 'entitlement' | 'internal-role' | 'role'
  ) => {
    const newTypes = filter.objectTypes.includes(type)
      ? filter.objectTypes.filter((t) => t !== type)
      : [...filter.objectTypes, type];
    updateFilter({ objectTypes: newTypes });
  };

  const openItemSelector = (
    type: 'application' | 'entitlement' | 'internal-role' | 'role'
  ) => {
    setSelectedObjectType(type);
    setModalOpen(true);
  };

  const handleSaveSelectedItems = (selectedIds: string[]) => {
    const specificItems = filter.specificItems || {};

    // Map frontend types to storage keys
    const getStorageKey = (
      type: string
    ): 'applications' | 'entitlements' | 'groups' | 'roles' => {
      switch (type) {
        case 'application':
          return 'applications';
        case 'entitlement':
          return 'entitlements';
        case 'internal-role':
          return 'groups';
        case 'role':
          return 'roles';
        default:
          return `${type}s` as any;
      }
    };

    const storageKey = getStorageKey(selectedObjectType);

    updateFilter({
      specificItems: {
        ...specificItems,
        [storageKey]: selectedIds.length > 0 ? selectedIds : undefined,
      },
    });
  };

  const getSpecificItemsForType = (
    type: 'application' | 'entitlement' | 'internal-role' | 'role'
  ): string[] => {
    // Map type to correct storage key
    const typeMap: Record<string, keyof ObjectTypeFilter['specificItems']> = {
      'application': 'applications',
      'entitlement': 'entitlements',
      'internal-role': 'groups',
      'role': 'roles',
    };

    const storageKey = typeMap[type];
    return filter.specificItems?.[storageKey] || [];
  };

  const filterStats = useMemo(() => {
    const baseStats = getFilteredItemCount(mockHierarchicalAccessItems, filter, category);

    // Add internal roles count to the stats
    const internalRoleCount = filter.objectTypes.includes('internal-role')
      ? internalRolesCount
      : 0;

    // Add entitlements count to the stats
    const entitlementCount = filter.objectTypes.includes('entitlement')
      ? entitlementsCount
      : 0;

    return {
      ...baseStats,
      byType: {
        ...baseStats.byType,
        'internal-role': internalRoleCount,
        'entitlement': entitlementCount,
      },
      total: baseStats.total + internalRoleCount + entitlementCount,
    };
  }, [filter, category, internalRolesCount, entitlementsCount]);

  return (
    <div className="space-y-6">
      {/* Enable Filter Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="filter-enabled" className="text-base font-semibold">
                Enable Object Type Filtering
              </Label>
              <p className="text-sm text-muted-foreground">
                Filter which types of access items appear in this tile
              </p>
            </div>
            <Switch
              id="filter-enabled"
              checked={filter.enabled}
              onCheckedChange={(enabled) => updateFilter({ enabled })}
            />
          </div>
        </CardContent>
      </Card>

      {filter.enabled && (
        <>
          {/* Object Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Object Types</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select which types of access objects to include
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {OBJECT_TYPES.map((type) => {
                const Icon = type.icon;
                const isChecked = filter.objectTypes.includes(type.value);
                const count = filterStats.byType[type.value] || 0;
                const specificItems = getSpecificItemsForType(type.value);
                const hasSpecificSelection = specificItems.length > 0;

                return (
                  <div key={type.value} className="border rounded-lg">
                    <div
                      className="flex items-start space-x-3 p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => toggleObjectType(type.value)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleObjectType(type.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-primary" />
                          <Label className="font-semibold cursor-pointer">
                            {type.label}
                          </Label>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>

                    {/* Configure button and selection summary */}
                    {isChecked && (
                      <div className="flex items-center justify-between px-3 pb-3 pl-12 border-t mx-3 pt-3">
                        <div className="flex items-center gap-2">
                          {hasSpecificSelection ? (
                            <>
                              <Badge variant="default" className="gap-1">
                                <Check className="h-3 w-3" />
                                {specificItems.length} selected items
                              </Badge>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              All {type.label.toLowerCase()} included
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openItemSelector(type.value);
                          }}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Filter Preview */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Filter Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <span className="font-semibold">Total Matching Items</span>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {filterStats.total}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {OBJECT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const count = filterStats.byType[type.value] || 0;
                    return (
                      <div
                        key={type.value}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{type.label}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Item Selection Modal */}
      <ObjectItemSelectorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        objectType={selectedObjectType}
        category={category}
        selectedItemIds={getSpecificItemsForType(selectedObjectType)}
        onSave={handleSaveSelectedItems}
        availableItems={mockHierarchicalAccessItems}
      />
    </div>
  );
};

export default ObjectTypeFilterBuilder;