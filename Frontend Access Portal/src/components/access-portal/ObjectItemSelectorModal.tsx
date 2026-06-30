import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AccessItem } from '@/data/mock-access-portal';
import { Search, X, Check, AlertCircle, Database, Shield, Users, Cloud, Key } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { fetchEntitlements } from '@/hooks/useEntitlements';
import type { EntitlementResponseDto } from '@/types/entitlements';
import CustomPagination from '@/components/applications/common/CustomPagination';
import { cn } from '@/lib/utils';

interface ObjectItemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectType: 'application' | 'role' | 'group' | 'entitlement' | 'internal-role';
  category: string;
  selectedItemIds: string[];
  onSave: (selectedIds: string[]) => void;
  availableItems: AccessItem[];
}

// Interface for internal role API response
interface ApiRole {
  id: string;
  roleName: string;
  roleType: string;
  riskLevel: string;
  description?: string;
  isActive: boolean;
  department?: string;
  owner?: string;
}

// API Response interface
interface RolesApiResponse {
  data: ApiRole[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  message: string;
  status: string;
}

const capitalize = (s: string) => {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

const ObjectItemSelectorModal: React.FC<ObjectItemSelectorModalProps> = ({
  isOpen,
  onClose,
  objectType,
  category,
  selectedItemIds,
  onSave,
  availableItems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedItemIds);

  // State for internal roles
  const [internalRoles, setInternalRoles] = useState<ApiRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // State for entitlements
  const [entitlements, setEntitlements] = useState<EntitlementResponseDto[]>([]);
  const [loadingEntitlements, setLoadingEntitlements] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch internal roles when modal opens and type is internal-role
  useEffect(() => {
    if (isOpen && objectType === 'internal-role') {
      fetchInternalRoles();
    }
  }, [isOpen, objectType, page, pageSize, searchQuery, selectedRiskLevel]);

  // Fetch entitlements when modal opens and type is entitlement
  useEffect(() => {
    if (isOpen && objectType === 'entitlement') {
      fetchEntitlementItems();
    }
  }, [isOpen, objectType, page, pageSize, searchQuery, selectedRiskLevel]);

  const fetchInternalRoles = async () => {
    setLoadingRoles(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('size', String(pageSize));

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (selectedRiskLevel !== 'all') {
        params.append('riskLevel', capitalize(selectedRiskLevel));
      }

      const res = await fetch(`/api/access-portal/roles?${params.toString()}`);

      if (!res.ok) {
        throw new Error(`Failed: ${res.status}`);
      }

      const json: RolesApiResponse = await res.json();

      setInternalRoles(json.data ?? []);
      setTotalPages(json.totalPages ?? 0);
      setTotalElements(json.totalElements ?? 0);
    } catch (err) {
      console.error('Failed to fetch internal roles', err);
      setInternalRoles([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchEntitlementItems = async () => {
    setLoadingEntitlements(true);
    try {
      const params: Parameters<typeof fetchEntitlements>[0] = {
        page,
        size: pageSize,
        requestable: true,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedRiskLevel !== 'all') {
        params.riskLevel = capitalize(selectedRiskLevel);
      }

      const result = await fetchEntitlements(params);

      setEntitlements(result.content ?? []);
      setTotalPages(result.totalPages ?? 0);
      setTotalElements(result.totalElements ?? 0);
    } catch (err) {
      console.error('Failed to fetch entitlements', err);
      setEntitlements([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoadingEntitlements(false);
    }
  };

  // Reset page when search or filters change
  useEffect(() => {
    if (objectType === 'internal-role' || objectType === 'entitlement') {
      setPage(0);
    }
  }, [searchQuery, selectedDepartment, selectedRiskLevel, objectType]);

  // Reset local selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIds(selectedItemIds);
    }
  }, [isOpen, selectedItemIds]);

  const getObjectTypeIcon = () => {
    switch (objectType) {
      case 'application':
        return Cloud;
      case 'role':
        return Shield;
      case 'internal-role':
        return Shield;
      case 'group':
        return Users;
      case 'entitlement':
        return Key;
    }
  };

  const getObjectTypeLabel = () => {
    switch (objectType) {
      case 'application':
        return 'Applications';
      case 'role':
        return 'Business Roles';
      case 'internal-role':
        return 'Internal Roles';
      case 'group':
        return 'Groups';
      case 'entitlement':
        return 'Entitlements';
    }
  };

  const filteredItems = useMemo(() => {
    if (objectType === 'internal-role') {
      return internalRoles
        .filter(role => {
          if (activeOnly && !role.isActive) {
            return false;
          }
          return true;
        })
        .map(role => ({
          id: role.id,
          name: role.roleName,
          description: role.description || '',
          type: objectType,
          category: category,
          riskLevel: (role.riskLevel?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high',
          owner: role.owner || 'System',
          department: role.department || 'IT',
          childCount: 0,
          requestCount: 0,
          isActive: role.isActive,
        }));
    }

    if (objectType === 'entitlement') {
      return entitlements.map(ent => ({
        id: ent.id,
        name: ent.displayName,
        description: ent.description || '',
        type: objectType,
        category: category,
        riskLevel: (ent.riskLevel?.toLowerCase() || 'low') as 'low' | 'medium' | 'high' | 'critical',
        owner: ent.ownerId || 'Unowned',
        department: '',
        childCount: ent.assignedUsersCount ?? 0,
        requestCount: 0,
        isActive: ent.lifecycle === 'Active',
        kind: ent.kind || 'entitlement',
        resourceName: ent.resourceName || '',
        classification: ent.classification || [],
        requestable: ent.requestable,
      }));
    }

    return availableItems.filter(item => {
      if (item.type !== objectType) return false;
      if (item.category !== category) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.owner?.toLowerCase().includes(query) ||
          item.department?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (selectedRiskLevel !== 'all' && item.riskLevel !== selectedRiskLevel) {
        return false;
      }

      if (selectedDepartment !== 'all' && item.department !== selectedDepartment) {
        return false;
      }

      return true;
    });
  }, [
    availableItems,
    internalRoles,
    entitlements,
    objectType,
    category,
    searchQuery,
    selectedRiskLevel,
    selectedDepartment,
    activeOnly,
  ]);

  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();

    if (objectType === 'internal-role') {
      internalRoles.forEach(role => {
        if (role.department) depts.add(role.department);
      });
    } else if (objectType === 'entitlement') {
      // Entitlements don't have departments
    } else {
      availableItems.forEach(item => {
        if (item.department) depts.add(item.department);
      });
    }

    return Array.from(depts).sort();
  }, [availableItems, internalRoles, objectType]);

  const toggleItem = (itemId: string) => {
    setLocalSelectedIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAll = () => {
    const currentPageIds = filteredItems.map(item => item.id);
    setLocalSelectedIds(prev => {
      const newSelection = new Set([...prev, ...currentPageIds]);
      return Array.from(newSelection);
    });
  };

  const clearAll = () => {
    setLocalSelectedIds([]);
  };

  const handleSave = () => {
    onSave(localSelectedIds);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedIds(selectedItemIds);
    setSearchQuery('');
    setSelectedRiskLevel('all');
    setSelectedDepartment('all');
    setActiveOnly(false);
    setPage(0);
    setPageSize(10);
    onClose();
  };

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  }, []);

  const Icon = getObjectTypeIcon();
  const selectedCount = localSelectedIds.length;

  const isApiDriven = objectType === 'internal-role' || objectType === 'entitlement';
  const totalCount = isApiDriven ? totalElements : filteredItems.length;
  const isLoadingItems = (objectType === 'internal-role' && loadingRoles) ||
    (objectType === 'entitlement' && loadingEntitlements);

  return (
    <Sheet open={isOpen} onOpenChange={handleCancel}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 h-full">
        <div className="flex flex-col h-full">
          {/* Fixed Header Section */}
          <div className="px-6 py-4">
            <SheetHeader className="p-0">
              <SheetTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                Select {getObjectTypeLabel()}
              </SheetTitle>
              <SheetDescription>
                Choose specific {getObjectTypeLabel().toLowerCase()} to include in this tile. Leave
                empty to include all items of this type.
              </SheetDescription>
            </SheetHeader>

            {/* Search and Filters */}
            <div className="space-y-3 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${getObjectTypeLabel().toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Risk Level Filter */}

                <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>

                {/* Department Filter */}
                {/* {objectType !== 'entitlement' && (
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {availableDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} */}

                {/* Select/Clear All - pushed to right */}
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    <Check className="h-4 w-4 mr-1" />
                    Select Page
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-2">
              {isLoadingItems ? (
                <div className="text-center py-12">
                  <Loader size="lg" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No items found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = localSelectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors hover:bg-accent ${isSelected ? 'bg-accent border-primary' : ''
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleItem(item.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="font-semibold truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {/* Risk level badge - standard styling */}
                              {item.riskLevel && (
                                <Badge className={cn("font-medium", getRiskBadgeClass(item.riskLevel))}>
                                  {capitalize(item.riskLevel)}
                                </Badge>
                              )}
                              {/* Kind badge for entitlements */}
                              {objectType === 'entitlement' && (item as any).kind && (
                                <Badge variant="outline">
                                  {capitalize((item as any).kind)}
                                </Badge>
                              )}
                              {item.childCount > 0 && objectType !== 'entitlement' && (
                                <Badge variant="outline">{item.childCount} items</Badge>
                              )}
                              {objectType === 'entitlement' && item.childCount > 0 && (
                                <Badge variant="outline">{item.childCount} users</Badge>
                              )}
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {objectType === 'entitlement' ? (
                              <>
                                {(item as any).resourceName && (
                                  <span>App: {(item as any).resourceName}</span>
                                )}
                                {(item as any).classification && (item as any).classification.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{(item as any).classification.join(', ')}</span>
                                  </>
                                )}
                                {item.owner && item.owner !== 'Unowned' && (
                                  <>
                                    <span>•</span>
                                    <span>Owner: {item.owner}</span>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <span>Owner: {item.owner}</span>
                                <span>•</span>
                                <span>Dept: {item.department}</span>
                                {item.requestCount > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{item.requestCount} requests</span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Pagination - For API-driven types using CustomPagination */}
          {isApiDriven && !isLoadingItems && totalPages > 0 && (
            <CustomPagination
              useCallbackMode={true}
              totalElements={totalElements}
              totalPages={totalPages}
              page={page}
              size={pageSize}
              defaultSize={10}
              onPageChange={handlePageChange}
              onSizeChange={handlePageSizeChange}
            />
          )}

          {/* Fixed Selection Summary Footer */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedCount > 0 ? (
                <Badge variant="default" className="gap-1">
                  <Check className="h-3 w-3" />
                  {selectedCount} of {totalCount} selected
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">
                  No selection - all {totalCount} items will be included
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Apply Selection</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ObjectItemSelectorModal;