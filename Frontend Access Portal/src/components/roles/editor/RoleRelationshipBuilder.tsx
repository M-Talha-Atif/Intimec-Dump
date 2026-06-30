import React, { useState, useCallback, useEffect, useRef } from "react";
import { Role } from "@/types/roles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomPagination from "@/components/applications/common/CustomPagination";
import {
  GitMerge, Plus, Search, Trash2, ExternalLink,
  Network, LoaderCircle, CheckCircle2, X, FolderTree
} from "lucide-react";
import clsx from "clsx";
import { useChildRoles } from "@/hooks/access-catalogue/roles/use-child-roles";
import { useAccessRoles } from "@/hooks/access-catalogue/roles/use-access-roles";
import type { AccessRoleResponse } from "@/types/access-roles";

interface RoleRelationshipBuilderProps {
  role: Role;
  allRoles: Role[];
  isEditing: boolean;
  onChange: (updates: Partial<Role>) => void;
  onSelectRole: (role: Role) => void;
  /** Called once when the original child IDs are loaded from the backend */
  onOriginalChildIdsLoaded?: (ids: string[]) => void;
}

const PICKER_PAGE_SIZE = 10;

/**
 * Maps backend role type to a display label.
 */
const TYPE_LABELS: Record<string, string> = {
  business: "Business Role",
  technical: "Technical Role",
  functional: "Functional Role",
  application: "Application Role",
};

/**
 * Maps backend status to badge styling.
 */
const STATUS_COLORS: Record<string, string> = {
  active: "border-emerald-300 text-emerald-700 bg-emerald-50",
  enabled: "border-emerald-300 text-emerald-700 bg-emerald-50",
  draft: "border-slate-300 text-slate-700 bg-slate-50",
  deprecated: "border-red-300 text-red-700 bg-red-50",
};

const RoleRelationshipBuilder: React.FC<RoleRelationshipBuilderProps> = ({
  role,
  allRoles,
  isEditing,
  onChange,
  onSelectRole,
  onOriginalChildIdsLoaded,
}) => {
  // Fetch real child roles from backend
  const {
    childRoles,
    loading: childrenLoading,
    error: childrenError,
    refresh: refreshChildren,
  } = useChildRoles(role.id);

  // Track original child IDs for diff computation on save
  const originalChildIdsReported = useRef(false);

  // Current child IDs being edited (stored on editedRole)
  const currentChildIds: string[] = (role as any).childRoleIds || [];

  // A name cache so we can display child role names after they are removed from the fetched list
  const childNameCache = useRef<Map<string, AccessRoleResponse>>(new Map());

  // Picker state
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerPage, setPickerPage] = useState(0);
  const [pickerSize, setPickerSize] = useState(PICKER_PAGE_SIZE);

  // Fetch all roles for the picker (paginated, with search)
  const {
    roles: pickerRoles,
    totalElements: pickerTotal,
    totalPages: pickerTotalPages,
    loading: pickerLoading,
    error: pickerError,
    refresh: pickerRefresh,
  } = useAccessRoles({
    page: pickerPage,
    size: pickerSize,
    sort: "name,asc",
  });

    // Track whether the initial fetch has completed at least once
  const hasFetchedOnce = useRef(false);

  /**
   * On initial load: sync fetched child roles into editedRole.childRoleIds
   * and report original IDs to parent for diff computation.
   *
   * Guards:
   *   - Must not be loading (fetch is complete)
   *   - Must not have already reported (prevents re-running on re-renders)
   *   - Must have fetched at least once (prevents running on the initial
   *     render before the fetch even starts)
   */
  useEffect(() => {
    // Mark when loading transitions from true to false (fetch completed)
    if (!childrenLoading && !hasFetchedOnce.current && originalChildIdsReported.current === false) {
      hasFetchedOnce.current = true;
    }

    if (childrenLoading || originalChildIdsReported.current || !hasFetchedOnce.current) return;

    const ids = childRoles.map((c) => c.id);

    // Cache all fetched children for display
    childRoles.forEach((c) => childNameCache.current.set(c.id, c));

    // Set the initial child IDs on the edited role
    onChange({ childRoleIds: ids } as any);

    // Report to parent for diff
    if (onOriginalChildIdsLoaded) {
      onOriginalChildIdsLoaded(ids);
    }
    originalChildIdsReported.current = true;
  }, [childRoles, childrenLoading, onChange, onOriginalChildIdsLoaded]);

  /**
   * Adds a role to the current child IDs list.
   */
  const handleAddChild = useCallback(
    (childRole: AccessRoleResponse) => {
      if (currentChildIds.includes(childRole.id)) return;
      if (childRole.id === role.id) return;

      // Cache for display
      childNameCache.current.set(childRole.id, childRole);

      onChange({ childRoleIds: [...currentChildIds, childRole.id] } as any);
    },
    [currentChildIds, onChange, role.id]
  );

  /**
   * Removes a child role by ID.
   */
  const handleRemoveChild = useCallback(
    (childId: string) => {
      onChange({
        childRoleIds: currentChildIds.filter((id) => id !== childId),
      } as any);
    },
    [currentChildIds, onChange]
  );

  /**
   * Resolves display data for a child role ID.
   * Checks cache first (populated from API), then allRoles, then fallback.
   */
  const resolveChild = (childId: string): { name: string; type: string; status: string; entitlementCount: number } => {
    const cached = childNameCache.current.get(childId);
    if (cached) {
      return {
        name: cached.displayName || cached.name,
        type: cached.type || "business",
        status: cached.status || "active",
        entitlementCount: (cached as any).entitlementCount || 0,
      };
    }

    const fromAll = allRoles.find((r) => r.id === childId);
    if (fromAll) {
      return {
        name: fromAll.name,
        type: fromAll.type,
        status: fromAll.status,
        entitlementCount: fromAll.entitlements?.length || 0,
      };
    }

    return { name: childId, type: "unknown", status: "unknown", entitlementCount: 0 };
  };

  /**
   * Filters picker roles: exclude current role and already-selected children.
   * Also applies client-side search filter.
   */
  const filteredPickerRoles = pickerRoles.filter((r) => {
    if (r.id === role.id) return false;
    if (currentChildIds.includes(r.id)) return false;
    if (pickerSearch.trim()) {
      const term = pickerSearch.toLowerCase();
      return (
        r.name.toLowerCase().includes(term) ||
        (r.displayName || "").toLowerCase().includes(term) ||
        (r.description || "").toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handlePickerSearchChange = (value: string) => {
    setPickerSearch(value);
    setPickerPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Current child roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderTree className="h-5 w-5" />
            <span>Child Roles ({currentChildIds.length})</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Child roles are nested under this role for governance and hierarchy purposes.
            Changes are saved when you click Save.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading state for initial fetch */}
          {childrenLoading && (
            <div className="flex items-center justify-center py-8">
              <LoaderCircle className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Loading child roles...</span>
            </div>
          )}

          {/* Error state */}
          {childrenError && !childrenLoading && (
            <div className="text-center py-6">
              <p className="text-sm text-destructive mb-2">Failed to load child roles</p>
              <p className="text-xs text-muted-foreground mb-4">{childrenError}</p>
              <Button variant="outline" size="sm" onClick={refreshChildren}>
                Retry
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!childrenLoading && !childrenError && currentChildIds.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <GitMerge className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-sm">This role has no child roles</p>
              {isEditing && (
                <p className="text-xs mt-1">Click "Add Child Role" to build the hierarchy</p>
              )}
            </div>
          )}

          {/* Child roles list */}
          {!childrenLoading && currentChildIds.length > 0 && (
            <div className="space-y-2">
              {currentChildIds.map((childId) => {
                const child = resolveChild(childId);
                const typeLabel = TYPE_LABELS[child.type?.toLowerCase()] || child.type;
                const statusColor =
                  STATUS_COLORS[child.status?.toLowerCase()] || "bg-muted text-muted-foreground border";

                return (
                  <div
                    key={childId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <GitMerge className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{child.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">
                            {typeLabel}
                          </Badge>
                          <Badge variant="outline" className={clsx("text-xs", statusColor)}>
                            {child.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {child.entitlementCount} entitlements
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const target = allRoles.find((r) => r.id === childId);
                          if (target) onSelectRole(target);
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveChild(childId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add button */}
          {isEditing && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPicker((prev) => !prev)}
                className="w-full"
              >
                {showPicker ? (
                  <>
                    <X className="h-4 w-4 mr-1" /> Close Picker
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" /> Add Child Role
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role picker */}
      {isEditing && showPicker && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Search className="h-4 w-4" />
              <span>Select Roles to Add</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search roles by name or description..."
                className="pl-10"
                value={pickerSearch}
                onChange={(e) => handlePickerSearchChange(e.target.value)}
              />
            </div>

            {/* Loading */}
            {pickerLoading && (
              <div className="flex items-center justify-center py-8">
                <LoaderCircle className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Error */}
            {pickerError && !pickerLoading && (
              <div className="text-center py-6">
                <p className="text-sm text-destructive mb-2">Failed to load roles</p>
                <Button variant="outline" size="sm" onClick={pickerRefresh}>
                  Retry
                </Button>
              </div>
            )}

            {/* Empty */}
            {!pickerLoading && !pickerError && filteredPickerRoles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">
                  {pickerSearch ? "No roles match the search." : "No available roles to add."}
                </p>
              </div>
            )}

            {/* Role list */}
            {!pickerLoading && !pickerError && filteredPickerRoles.length > 0 && (
              <>
                <ScrollArea className="rounded-md border max-h-[300px]">
                  {filteredPickerRoles.map((pickerRole) => {
                    const typeLabel =
                      TYPE_LABELS[pickerRole.type?.toLowerCase()] || pickerRole.type;
                    const statusColor =
                      STATUS_COLORS[pickerRole.status?.toLowerCase()] ||
                      "bg-muted text-muted-foreground border";

                    return (
                      <div
                        key={pickerRole.id}
                        onClick={() => handleAddChild(pickerRole)}
                        className="flex items-center justify-between p-3 border-b hover:bg-accent cursor-pointer select-none"
                      >
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium truncate">
                            {pickerRole.displayName || pickerRole.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs">
                              {typeLabel}
                            </Badge>
                            <Badge variant="outline" className={clsx("text-xs", statusColor)}>
                              {pickerRole.status}
                            </Badge>
                          </div>
                          {pickerRole.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {pickerRole.description}
                            </p>
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                      </div>
                    );
                  })}
                </ScrollArea>

                <CustomPagination
                  useCallbackMode={true}
                  totalElements={pickerTotal}
                  totalPages={pickerTotalPages}
                  page={pickerPage}
                  size={pickerSize}
                  defaultSize={PICKER_PAGE_SIZE}
                  onPageChange={(newPage) => setPickerPage(newPage)}
                  onSizeChange={(newSize) => {
                    setPickerSize(newSize);
                    setPickerPage(0);
                  }}
                  siblingCount={1}
                  boundaryCount={1}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Relationship summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>Relationship Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {currentChildIds.length}
              </div>
              <div className="text-sm text-blue-800">Child Roles</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {currentChildIds.reduce((sum, id) => {
                  const child = resolveChild(id);
                  return sum + child.entitlementCount;
                }, 0)}
              </div>
              <div className="text-sm text-green-800">Inherited Entitlements</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-purple-800">Conflicts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleRelationshipBuilder;